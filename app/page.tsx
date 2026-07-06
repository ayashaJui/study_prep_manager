"use client";

import { useState, useEffect, useMemo, useRef, useCallback, Suspense } from "react";
import type { KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MainContent from "@/components/layout/MainContent";
import Breadcrumb from "@/components/layout/Breadcrumb";
import MobileMenu from "@/components/layout/MobileMenu";
import Dashboard from "@/components/views/Dashboard";
import PinnedNotes from "@/components/views/PinnedNotes";
import StudySessionHistory from "@/components/views/StudySessionHistory";
import FavoriteTopics from "@/components/views/FavoriteTopics";
import ProblemsPage from "@/components/views/ProblemsPage";
import TopicContent from "@/components/views/TopicContent";
import SubtopicContent from "@/components/views/SubtopicContent";
import Modal from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Topic, Subtopic } from "@/lib/mockData";
import { topicAPI, searchAPI, problemsAPI, ApiTopic, SearchResults } from "@/lib/api";
import SearchBox from "@/components/ui/SearchBox";
import { useNavigation } from "@/hooks/useNavigation";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useAuth } from "@/contexts/AuthContext";

function HomeContent() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    activeTopic,
    activeSubtopic,
    subtopicPath,
    activeTab,
    view,
    selectedNoteId,
    selectedFlashcardId,
    selectedQuizId,
    setActiveTab,
    navigateToDashboard,
    navigateToPinnedNotes,
    navigateToSessionHistory,
    navigateToFavorites,
    navigateToProblems,
    navigateToTopic,
    navigateToSubtopic,
    navigateToSubtopicPath,
  } = useNavigation();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoaded, setTopicsLoaded] = useState(false);
  const [fetchedSubtopic, setFetchedSubtopic] = useState<import("@/lib/mockData").Subtopic | null>(null);
  const [subtopicLoading, setSubtopicLoading] = useState(false);
  const [subtopicFetchFailed, setSubtopicFetchFailed] = useState(false);
  const [subtopicRefreshKey, setSubtopicRefreshKey] = useState(0);
  // id → name cache so breadcrumb labels work at any depth
  const [subtopicNames, setSubtopicNames] = useState<Record<string, string>>({});
  const [dueProblemsCount, setDueProblemsCount] = useState(0);
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null,
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const resultItemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toId = (value: unknown) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return String(value);
  };

  // Initialize sidebar visibility based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(true); // Desktop: show by default
      } else {
        setIsMobileMenuOpen(false); // Mobile: hide by default
      }
    };

    // Set initial state
    handleResize();

    // Listen for window resize
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (searchQuery.trim().length < 2) {
      setSearchResults(null);
      setSearchError(null);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    const handle = window.setTimeout(async () => {
      try {
        const response = await searchAPI.search(searchQuery.trim(), 10);
        setSearchResults(response.data);
      } catch (err) {
        setSearchError(err instanceof Error ? err.message : "Search failed");
        setSearchResults(null);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(handle);
  }, [searchQuery, isAuthenticated]);

  const getNavParams = (topicId: string): { rootTopicId: string; subtopics: string[] } => {
    const info = searchResults?.topicMap?.[topicId];
    if (!info || info.level === 0 || !info.path.length) {
      return { rootTopicId: topicId, subtopics: [] };
    }
    return {
      rootTopicId: info.path[0],
      subtopics: [...info.path.slice(1), topicId],
    };
  };

  const searchItems = useMemo(() => {
    if (!searchResults) return [] as Array<{
      kind: "topic" | "note" | "flashcard" | "quiz";
      id: string;
      rootTopicId: string;
      subtopics: string[];
      tab: string;
      extra?: Record<string, string>;
      label: string;
    }>;

    const resolveNav = (topicId: string) => {
      const info = searchResults.topicMap?.[topicId];
      if (!info || info.level === 0 || !info.path.length) {
        return { rootTopicId: topicId, subtopics: [] as string[] };
      }
      return {
        rootTopicId: info.path[0],
        subtopics: [...info.path.slice(1), topicId],
      };
    };

    const items: Array<{
      kind: "topic" | "note" | "flashcard" | "quiz";
      id: string;
      rootTopicId: string;
      subtopics: string[];
      tab: string;
      extra?: Record<string, string>;
      label: string;
    }> = [];

    (searchResults.topics || []).forEach(item => {
      const { rootTopicId, subtopics } = resolveNav(toId(item._id));
      items.push({
        kind: "topic",
        id: toId(item._id),
        rootTopicId,
        subtopics,
        tab: "overview",
        label: item.name || "Untitled topic",
      });
    });

    (searchResults.notes || []).forEach(item => {
      const { rootTopicId, subtopics } = resolveNav(toId(item.topicId));
      items.push({
        kind: "note",
        id: toId(item._id),
        rootTopicId,
        subtopics,
        tab: "notes",
        extra: { note: toId(item._id) },
        label: item.title || item.content?.slice(0, 40) || "Untitled note",
      });
    });

    (searchResults.flashcards || []).forEach(item => {
      const { rootTopicId, subtopics } = resolveNav(toId(item.topicId));
      items.push({
        kind: "flashcard",
        id: toId(item._id),
        rootTopicId,
        subtopics,
        tab: "flashcards",
        extra: { flashcard: toId(item._id) },
        label: item.front || "Untitled flashcard",
      });
    });

    (searchResults.quizzes || []).forEach(item => {
      const { rootTopicId, subtopics } = resolveNav(toId(item.topicId));
      items.push({
        kind: "quiz",
        id: toId(item._id),
        rootTopicId,
        subtopics,
        tab: "quizzes",
        extra: { quiz: toId(item._id) },
        label: item.title || "Untitled quiz",
      });
    });

    return items;
  }, [searchResults]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setHighlightIndex(-1);
      return;
    }

    if (searchItems.length === 0) {
      setHighlightIndex(-1);
      return;
    }

    setHighlightIndex((current) =>
      current >= 0 && current < searchItems.length ? current : 0,
    );
  }, [searchItems, searchQuery]);

  useEffect(() => {
    if (highlightIndex < 0) return;
    const target = resultItemRefs.current[highlightIndex];
    if (!target) return;
    target.scrollIntoView({ block: "nearest" });
  }, [highlightIndex, searchItems.length]);

  const fetchTopics = useCallback(async () => {
    if (!isAuthenticated) { setTopics([]); return; }
    setError(null);
    try {
      // Single request for all topics; tree is built client-side
      const response = await topicAPI.getAll();
      if (!response.success) return;

      const all: ApiTopic[] = response.data;

      // Group by parentId for O(n) tree construction
      const byParent = new Map<string, ApiTopic[]>();
      all.forEach((t) => {
        const key = t.parentId ? String(t.parentId) : "root";
        if (!byParent.has(key)) byParent.set(key, []);
        byParent.get(key)!.push(t);
      });

      const toNested = (t: ApiTopic) => ({
        id: t._id,
        name: t.name,
        slug: t.slug,
        description: t.description,
        status: t.status,
        notesCount: t.stats?.notesCount || 0,
        flashcardsCount: t.stats?.flashcardsCount || 0,
        quizzesCount: t.stats?.quizzesCount || 0,
        isPublic: t.isPublic,
        shareId: t.shareId,
        subtopics: (byParent.get(t._id) || []).map((child) => ({
          id: child._id,
          name: child.name,
          slug: child.slug,
          description: child.description,
          status: child.status,
          notesCount: child.stats?.notesCount || 0,
          flashcardsCount: child.stats?.flashcardsCount || 0,
          quizzesCount: child.stats?.quizzesCount || 0,
          isPublic: child.isPublic,
          shareId: child.shareId,
          subtopics: [],
        })),
      });

      const roots = (byParent.get("root") || []).map((topic) => ({
        id: topic._id,
        name: topic.name,
        slug: topic.slug,
        description: topic.description,
        status: topic.status,
        progress: topic.stats?.completionPercentage || 0,
        notesCount: topic.stats?.notesCount || 0,
        flashcardsCount: topic.stats?.flashcardsCount || 0,
        quizzesCount: topic.stats?.quizzesCount || 0,
        favorite: topic.favorite ?? false,
        createdAt: topic.createdAt,
        subtopics: (byParent.get(topic._id) || []).map((sub) => ({
          ...toNested(sub),
          count:
            (sub.stats?.notesCount || 0) +
            (sub.stats?.flashcardsCount || 0) +
            (sub.stats?.quizzesCount || 0),
        })),
      }));

      setTopics(roots);
    } catch (err) {
      console.error("Failed to fetch topics:", err);
      setError(err instanceof Error ? err.message : "Failed to load topics");
    } finally {
      setTopicsLoaded(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchTopics();
      problemsAPI.getAll({ due: true }).then((res) => {
        setDueProblemsCount(res.data?.length ?? 0);
      }).catch(() => {});
    }
  }, [authLoading, isAuthenticated, fetchTopics]);

  // Lazy-fetch the current subtopic + its children whenever the path changes.
  // This replaces tree-traversal and works at any nesting depth.
  useEffect(() => {
    if (!subtopicPath.length || !activeTopic) {
      setFetchedSubtopic(null);
      setSubtopicFetchFailed(false);
      return;
    }

    const currentId = subtopicPath[subtopicPath.length - 1];
    setSubtopicLoading(true);
    setSubtopicFetchFailed(false);
    setFetchedSubtopic(null);

    Promise.all([
      topicAPI.getById(currentId),
      topicAPI.getAll(currentId),
    ]).then(([nodeRes, childrenRes]) => {
      if (!nodeRes.success) {
        setSubtopicFetchFailed(true);
        return;
      }
      const node = nodeRes.data;
      const children = childrenRes.success
        ? childrenRes.data.map((c: ApiTopic) => ({
            id: c._id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            status: c.status,
            notesCount: c.stats?.notesCount || 0,
            flashcardsCount: c.stats?.flashcardsCount || 0,
            quizzesCount: c.stats?.quizzesCount || 0,
            subtopics: [],
          }))
        : [];

      const subtopic: import("@/lib/mockData").Subtopic = {
        id: node._id,
        name: node.name,
        slug: node.slug,
        description: node.description,
        status: node.status,
        notesCount: node.stats?.notesCount || 0,
        flashcardsCount: node.stats?.flashcardsCount || 0,
        quizzesCount: node.stats?.quizzesCount || 0,
        isPublic: node.isPublic,
        shareId: node.shareId,
        subtopics: children,
      };

      setFetchedSubtopic(subtopic);
      setSubtopicNames((prev) => ({ ...prev, [currentId]: node.name }));
    }).catch(() => {
      setSubtopicFetchFailed(true);
    }).finally(() => {
      setSubtopicLoading(false);
    });
  }, [subtopicPath, activeTopic, subtopicRefreshKey]);

  const currentTopic = topics.find(
    (t) => t.slug === activeTopic || t.id === activeTopic,
  );

  const currentSubtopic = fetchedSubtopic;

  const navigateToTopicTab = (
    topicId: string,
    tab: string,
    extra?: Record<string, string>,
    subtopics?: string[],
  ) => {
    if (!topicId) return;
    const params = new URLSearchParams({ topic: topicId, tab });
    if (subtopics?.length) params.set("subtopics", subtopics.join(","));
    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
    }
    router.push(`/?${params.toString()}`);
    setActiveTab(tab);
  };

  const handleSearchNavigate = (
    topicId: string,
    tab: string,
    extra?: Record<string, string>,
    subtopics?: string[],
  ) => {
    navigateToTopicTab(topicId, tab, extra, subtopics);
    handleSearchClear();
  };

  const handleSearchClear = () => {
    setSearchQuery("");
    setSearchResults(null);
    setSearchError(null);
    setSearchLoading(false);
    setHighlightIndex(-1);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (searchItems.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((current) => (current + 1) % searchItems.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((current) =>
        current <= 0 ? searchItems.length - 1 : current - 1,
      );
      return;
    }

    if (event.key === "Enter") {
      if (highlightIndex < 0) return;
      event.preventDefault();
      const target = searchItems[highlightIndex];
      if (!target) return;
      handleSearchNavigate(target.rootTopicId, target.tab, target.extra, target.subtopics.length ? target.subtopics : undefined);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      handleSearchClear();
    }
  };

  useKeyboardShortcuts({
    "ctrl+f": (e) => {
      e.preventDefault();
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    },
    "ctrl+n": (e) => {
      e.preventDefault();
      setIsAddTopicModalOpen(true);
    },
    escape: () => {
      if (searchResults) {
        handleSearchClear();
      } else if (isAddTopicModalOpen) {
        setIsAddTopicModalOpen(false);
      }
    },
  });

  const topicCount = (searchResults?.topics || []).length;
  const noteCount = (searchResults?.notes || []).length;
  const flashcardCount = (searchResults?.flashcards || []).length;
  const setResultItemRef = (index: number) => (element: HTMLLIElement | null) => {
    resultItemRefs.current[index] = element;
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div
        className="min-h-screen w-full flex flex-col overflow-x-hidden"
        style={{
          background:
            "radial-gradient(circle at 10% 10%, rgba(14,165,233,0.15), transparent 40%), radial-gradient(circle at 90% 0%, rgba(99,102,241,0.2), transparent 40%), #0b1120",
          fontFamily: '"Space Grotesk", "DM Sans", sans-serif',
        }}
      >
        <div className="flex-1 w-full max-w-6xl !mx-auto !px-6 md:!px-12 !py-12 md:!py-20">
          <div className="flex items-center justify-between">
            <div className="text-slate-100 text-lg font-semibold">
              StudyNest
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/public"
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors !px-3 !py-2"
              >
                Explore
              </Link>
              <Link href="/auth/login">
                <Button
                  variant="secondary"
                  style={{
                    borderColor: "rgba(148,163,184,0.35)",
                    color: "#e2e8f0",
                    background: "rgba(15,23,42,0.4)",
                  }}
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button style={{ background: "#6366f1", color: "#ffffff" }}>
                  Create account
                </Button>
              </Link>
            </div>
          </div>

          <div className="!mt-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="text-center lg:text-left">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                Focused Study Hub
              </p>
              <h1 className="!mt-4 text-4xl md:text-5xl font-semibold text-white leading-tight">
                Organize your study flow with notes, quizzes, and flashcards.
              </h1>
              <p className="!mt-4 text-base md:text-lg text-slate-300">
                Keep all your interview prep in one place. Track progress,
                revisit weak topics, and stay consistent.
              </p>

              <div className="!mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link href="/auth/register">
                  <Button style={{ background: "#6366f1", color: "#ffffff" }}>
                    Get started
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    variant="secondary"
                    style={{
                      borderColor: "rgba(148,163,184,0.35)",
                      color: "#e2e8f0",
                      background: "rgba(15,23,42,0.4)",
                    }}
                  >
                    I already have an account
                  </Button>
                </Link>
                <Link href="/public">
                  <Button
                    variant="secondary"
                    style={{
                      borderColor: "rgba(148,163,184,0.2)",
                      color: "#94a3b8",
                      background: "transparent",
                    }}
                  >
                    Browse shared topics
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70 backdrop-blur-xl shadow-[0_30px_80px_rgba(15,23,42,0.6)] !p-6 md:!p-8">
              <div className="grid grid-cols-2 gap-4">
                {[
                  "Track progress",
                  "Import notes",
                  "Quiz yourself",
                  "Daily streaks",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 !p-4 text-sm text-slate-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="!mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 !p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Why it works
                </p>
                <p className="!mt-2 text-sm text-slate-300">
                  Structured focus keeps you consistent and confident before
                  interviews.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleToggleFavorite = async (topicId: string, current: boolean) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, favorite: !current } : t)),
    );
    try {
      await topicAPI.update(topicId, { favorite: !current });
    } catch {
      setTopics((prev) =>
        prev.map((t) => (t.id === topicId ? { ...t, favorite: current } : t)),
      );
    }
  };

  const handleAddTopic = async () => {
    if (!newTopicName.trim()) return;

    try {
      const response = await topicAPI.create({
        name: newTopicName.trim(),
        description: newTopicDescription.trim() || undefined,
        status: "not-started",
        tags: [],
        favorite: false,
      });

      if (response.success) {
        // Add the new topic to the list
        const newTopic: Topic = {
          id: response.data._id,
          name: response.data.name,
          slug: response.data.slug,
          subtopics: [],
        };

        setTopics([newTopic, ...topics]);
        setNewTopicName("");
        setNewTopicDescription("");
        setIsAddTopicModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to create topic:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to create topic. Please try again.",
      );
    }
  };

  const breadcrumbItems = !activeTopic
    ? [
        {
          label:
            view === "pinned"
              ? "Pinned Notes"
              : view === "sessions"
                ? "Session History"
                : view === "favorites"
                  ? "Favorites"
                  : view === "problems"
                    ? "Problems"
                    : "Dashboard",
        },
      ]
    : subtopicPath.length > 0
      ? [
          {
            label: currentTopic?.name || "Topic",
            onClick: () => navigateToTopic(activeTopic),
          },
          ...subtopicPath.map((id, index) => ({
            label: subtopicNames[id] || "Subtopic",
            onClick:
              index < subtopicPath.length - 1
                ? () => navigateToSubtopicPath(activeTopic, subtopicPath.slice(0, index + 1))
                : undefined,
          })),
        ]
      : [{ label: currentTopic?.name || "Topic" }];

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden"
      style={{ background: "#0f1419" }}
    >
      <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          <Sidebar
            topics={topics}
            activeTopic={activeTopic}
            activeSubtopic={activeSubtopic}
            activeView={view}
            dueProblemsCount={dueProblemsCount}
            onDashboardSelect={navigateToDashboard}
            onPinnedNotesSelect={navigateToPinnedNotes}
            onSessionHistorySelect={navigateToSessionHistory}
            onFavoritesSelect={navigateToFavorites}
            onProblemsSelect={navigateToProblems}
            onToggleFavorite={handleToggleFavorite}
            onTopicSelect={navigateToTopic}
            onSubtopicSelect={navigateToSubtopic}
            onAddTopic={() => setIsAddTopicModalOpen(true)}
          />
        </MobileMenu>
        <MainContent>
          <div className="!mb-6">
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search topics, notes, flashcards, quizzes... (Ctrl+F)"
              onClear={handleSearchClear}
              onKeyDown={handleSearchKeyDown}
              inputRef={searchInputRef}
            />

            {searchLoading && (
              <p className="text-xs" style={{ color: "#a0aec0" }}>
                Searching...
              </p>
            )}

            {searchError && (
              <p className="text-xs" style={{ color: "#fc8181" }}>
                {searchError}
              </p>
            )}

            {searchResults && !searchLoading && !searchError && (
              <div
                className="rounded-lg border !p-3 !mt-3 max-h-[420px] overflow-y-auto"
                style={{ borderColor: "#334155", background: "#0f172a" }}
              >
                <p className="text-xs uppercase" style={{ color: "#94a3b8" }}>
                  Search results
                </p>
                <div className="!mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#e2e8f0" }}
                    >
                      Topics
                    </p>
                    <ul className="!mt-2 !space-y-2">
                      {(searchResults.topics || []).map(
                        (item, idx) => (
                        <li
                          key={item._id}
                          className="text-sm cursor-pointer"
                          ref={setResultItemRef(idx)}
                          style={{
                            color: "#cbd5e0",
                            background:
                              highlightIndex === idx
                                ? "rgba(148, 163, 184, 0.15)"
                                : "transparent",
                            borderRadius: "6px",
                            padding: "4px 6px",
                          }}
                          onMouseEnter={() => setHighlightIndex(idx)}
                          onClick={() => {
                            const { rootTopicId, subtopics } = getNavParams(toId(item._id));
                            handleSearchNavigate(rootTopicId, "overview", undefined, subtopics.length ? subtopics : undefined);
                          }}
                        >
                          {item.name}
                        </li>
                      ),
                      )}
                      {(searchResults.topics || []).length === 0 && (
                        <li className="text-xs" style={{ color: "#64748b" }}>
                          No topics
                        </li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#e2e8f0" }}
                    >
                      Notes
                    </p>
                    <ul className="!mt-2 !space-y-2">
                      {(searchResults.notes || []).map(
                        (item, idx) => (
                        <li
                          key={item._id}
                          className="text-sm cursor-pointer"
                          ref={setResultItemRef(topicCount + idx)}
                          style={{
                            color: "#cbd5e0",
                            background:
                              selectedNoteId === toId(item._id)
                                ? "rgba(148, 163, 184, 0.15)"
                                : highlightIndex === topicCount + idx
                                  ? "rgba(148, 163, 184, 0.15)"
                                  : "transparent",
                            borderRadius: "6px",
                            padding: "4px 6px",
                          }}
                          onMouseEnter={() =>
                            setHighlightIndex(topicCount + idx)
                          }
                          onClick={() => {
                            const { rootTopicId, subtopics } = getNavParams(toId(item.topicId));
                            handleSearchNavigate(rootTopicId, "notes", { note: toId(item._id) }, subtopics.length ? subtopics : undefined);
                          }}
                        >
                          {item.title || item.content?.slice(0, 40)}
                        </li>
                      ),
                      )}
                      {(searchResults.notes || []).length === 0 && (
                        <li className="text-xs" style={{ color: "#64748b" }}>
                          No notes
                        </li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#e2e8f0" }}
                    >
                      Flashcards
                    </p>
                    <ul className="!mt-2 !space-y-2">
                      {(searchResults.flashcards || []).map(
                        (item, idx) => (
                        <li
                          key={item._id}
                          className="text-sm cursor-pointer"
                          ref={setResultItemRef(topicCount + noteCount + idx)}
                          style={{
                            color: "#cbd5e0",
                            background:
                              selectedFlashcardId === toId(item._id)
                                ? "rgba(148, 163, 184, 0.15)"
                                : highlightIndex ===
                                    topicCount + noteCount + idx
                                  ? "rgba(148, 163, 184, 0.15)"
                                  : "transparent",
                            borderRadius: "6px",
                            padding: "4px 6px",
                          }}
                          onMouseEnter={() =>
                            setHighlightIndex(topicCount + noteCount + idx)
                          }
                          onClick={() => {
                            const { rootTopicId, subtopics } = getNavParams(toId(item.topicId));
                            handleSearchNavigate(rootTopicId, "flashcards", { flashcard: toId(item._id) }, subtopics.length ? subtopics : undefined);
                          }}
                        >
                          {item.front}
                        </li>
                      ),
                      )}
                      {(searchResults.flashcards || []).length === 0 && (
                        <li className="text-xs" style={{ color: "#64748b" }}>
                          No flashcards
                        </li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#e2e8f0" }}
                    >
                      Quizzes
                    </p>
                    <ul className="!mt-2 !space-y-2">
                      {(searchResults.quizzes || []).map(
                        (item, idx) => (
                        <li
                          key={item._id}
                          className="text-sm cursor-pointer"
                          ref={setResultItemRef(
                            topicCount + noteCount + flashcardCount + idx,
                          )}
                          style={{
                            color: "#cbd5e0",
                            background:
                              selectedQuizId === toId(item._id)
                                ? "rgba(148, 163, 184, 0.15)"
                                : highlightIndex ===
                                    topicCount + noteCount + flashcardCount + idx
                                  ? "rgba(148, 163, 184, 0.15)"
                                  : "transparent",
                            borderRadius: "6px",
                            padding: "4px 6px",
                          }}
                          onMouseEnter={() =>
                            setHighlightIndex(
                              topicCount + noteCount + flashcardCount + idx,
                            )
                          }
                          onClick={() => {
                            const { rootTopicId, subtopics } = getNavParams(toId(item.topicId));
                            handleSearchNavigate(rootTopicId, "quizzes", { quiz: toId(item._id) }, subtopics.length ? subtopics : undefined);
                          }}
                        >
                          {item.title}
                        </li>
                      ),
                      )}
                      {(searchResults.quizzes || []).length === 0 && (
                        <li className="text-xs" style={{ color: "#64748b" }}>
                          No quizzes
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Breadcrumb items={breadcrumbItems} />

          {error && topics.length === 0 && (
            <div
              className="rounded-xl border !px-5 !py-4 !mb-4 flex items-center justify-between gap-4"
              style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)" }}
            >
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={fetchTopics}
                className="text-xs text-red-300 hover:text-red-200 underline shrink-0 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!activeTopic && view === "pinned" ? (
            <PinnedNotes
              onOpenNote={(topicId, noteId) =>
                navigateToTopicTab(topicId, "notes", { note: noteId })
              }
            />
          ) : !activeTopic && view === "favorites" ? (
            <FavoriteTopics
              topics={topics.filter((t) => t.favorite)}
              onTopicSelect={navigateToTopic}
              onUnfavorite={(topicId) => handleToggleFavorite(topicId, true)}
            />
          ) : !activeTopic && view === "problems" ? (
            <ProblemsPage
              topics={topics.map((t) => ({ id: t.id, name: t.name }))}
            />
          ) : !activeTopic && view === "sessions" ? (
            <StudySessionHistory />
          ) : !activeTopic ? (
            topicsLoaded && topics.length === 0 ? (
              <div className="flex flex-col items-center justify-center !py-24 text-center">
                <div
                  className="rounded-2xl border !p-10 max-w-md w-full"
                  style={{ background: "rgba(30,41,59,0.5)", borderColor: "rgba(71,85,105,0.4)" }}
                >
                  <div className="text-5xl !mb-4">📚</div>
                  <h2 className="text-xl font-semibold text-slate-100 !mb-2">Welcome to StudyNest</h2>
                  <p className="text-sm text-slate-400 !mb-6">
                    Create your first topic to start organizing notes, flashcards, and quizzes.
                  </p>
                  <Button onClick={() => setIsAddTopicModalOpen(true)}>
                    Add your first topic
                  </Button>
                </div>
              </div>
            ) : (
              <Dashboard />
            )
          ) : subtopicPath.length > 0 && subtopicLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
              Loading...
            </div>
          ) : subtopicPath.length > 0 && subtopicFetchFailed ? (
            <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
              Failed to load subtopic.
            </div>
          ) : subtopicPath.length > 0 && currentSubtopic ? (
            <SubtopicContent
              subtopic={currentSubtopic}
              level={subtopicPath.length}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onSubtopicSelect={(id) =>
                navigateToSubtopicPath(activeTopic, [...subtopicPath, id])
              }
              onSubtopicAdded={() => {
                fetchTopics();
                setSubtopicRefreshKey((k) => k + 1);
              }}
              onSubtopicDeleted={() => {
                fetchTopics();
                if (subtopicPath.length <= 1) {
                  navigateToTopic(activeTopic);
                } else {
                  navigateToSubtopicPath(activeTopic, subtopicPath.slice(0, -1));
                }
              }}
              onSubtopicRenamed={(name) => {
                const currentId = subtopicPath[subtopicPath.length - 1];
                setSubtopicNames((prev) => ({ ...prev, [currentId]: name }));
                setSubtopicRefreshKey((k) => k + 1);
                fetchTopics();
              }}
            />
          ) : (
            <TopicContent
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onSubtopicSelect={(id) => navigateToSubtopic(activeTopic, id)}
              topicId={currentTopic?.id}
              onSubtopicAdded={fetchTopics}
              topic={currentTopic}
              selectedNoteId={selectedNoteId}
              selectedFlashcardId={selectedFlashcardId}
              selectedQuizId={selectedQuizId}
              onTopicDeleted={() => {
                navigateToDashboard();
                fetchTopics();
              }}
              onTopicRenamed={(name) => {
                setTopics((prev) =>
                  prev.map((t) =>
                    t.id === currentTopic?.id ? { ...t, name } : t,
                  ),
                );
                fetchTopics();
              }}
            />
          )}
        </MainContent>
      </div>

      <Modal
        isOpen={isAddTopicModalOpen}
        onClose={() => {
          setIsAddTopicModalOpen(false);
          setNewTopicName("");
          setNewTopicDescription("");
        }}
        title="Add New Topic"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddTopic();
          }}
        >
          <Input
            label="Topic Name"
            placeholder="e.g., System Design, React Patterns, etc."
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            required
          />
          <Textarea
            label="Description (Optional)"
            placeholder="Brief description of this topic..."
            value={newTopicDescription}
            onChange={(e) => setNewTopicDescription(e.target.value)}
          />
          <div className="flex gap-3 justify-end !mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAddTopicModalOpen(false);
                setNewTopicName("");
                setNewTopicDescription("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!newTopicName.trim()}>
              Add Topic
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div
          className="h-screen w-screen flex flex-col overflow-hidden items-center justify-center"
          style={{ background: "#0f1419" }}
        >
          <p style={{ color: "#cbd5e0" }}>Loading...</p>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
