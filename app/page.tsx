"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
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
import TopicContent from "@/components/views/TopicContent";
import SubtopicContent from "@/components/views/SubtopicContent";
import Modal from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { mockTopics, Topic, Subtopic } from "@/lib/mockData";
import { topicAPI, searchAPI, ApiTopic, SearchResults } from "@/lib/api";
import SearchBox from "@/components/ui/SearchBox";
import { useNavigation } from "@/hooks/useNavigation";
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
    navigateToTopic,
    navigateToSubtopic,
    navigateToSubtopicPath,
  } = useNavigation();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null,
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const resultItemRefs = useRef<Array<HTMLLIElement | null>>([]);

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

  // Fetch topics on mount
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchTopics();
    }
  }, [authLoading, isAuthenticated]);

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

  const searchItems = useMemo(() => {
    if (!searchResults) return [] as Array<{
      kind: "topic" | "note" | "flashcard" | "quiz";
      id: string;
      topicId: string;
      tab: string;
      extra?: Record<string, string>;
      label: string;
    }>;

    const items: Array<{
      kind: "topic" | "note" | "flashcard" | "quiz";
      id: string;
      topicId: string;
      tab: string;
      extra?: Record<string, string>;
      label: string;
    }> = [];

    (searchResults.topics || []).forEach(item => {
      items.push({
        kind: "topic",
        id: toId(item._id),
        topicId: toId(item.slug || item._id),
        tab: "overview",
        label: item.name || "Untitled topic",
      });
    });

    (searchResults.notes || []).forEach(item => {
      items.push({
        kind: "note",
        id: toId(item._id),
        topicId: toId(item.topicId),
        tab: "notes",
        extra: { note: toId(item._id) },
        label: item.title || item.content?.slice(0, 40) || "Untitled note",
      });
    });

    (searchResults.flashcards || []).forEach(item => {
      items.push({
        kind: "flashcard",
        id: toId(item._id),
        topicId: toId(item.topicId),
        tab: "flashcards",
        extra: { flashcard: toId(item._id) },
        label: item.front || "Untitled flashcard",
      });
    });

    (searchResults.quizzes || []).forEach(item => {
      items.push({
        kind: "quiz",
        id: toId(item._id),
        topicId: toId(item.topicId),
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

  const fetchTopics = async () => {
    try {
      if (!isAuthenticated) {
        setTopics([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      // First fetch only top-level topics (parentId = null)
      const response = await topicAPI.getAll("null");

      if (response.success) {
        // Map API response to match UI structure
        const apiTopics = await Promise.all(
          response.data.map(async (topic: ApiTopic) => {
            // Fetch subtopics for each topic
            const subtopicsResponse = await topicAPI.getAll(topic._id);
            const subtopics = subtopicsResponse.success
              ? await Promise.all(
                  subtopicsResponse.data.map(async (sub: ApiTopic) => {
                    // Fetch nested subtopics (level 2)
                    const nestedSubtopicsResponse = await topicAPI.getAll(
                      sub._id,
                    );
                    const nestedSubtopics = nestedSubtopicsResponse.success
                      ? nestedSubtopicsResponse.data.map((nested: ApiTopic) => ({
                          id: nested._id,
                          name: nested.name,
                          slug: nested.slug,
                          description: nested.description,
                          status: nested.status,
                          notesCount: nested.stats?.notesCount || 0,
                          flashcardsCount: nested.stats?.flashcardsCount || 0,
                          quizzesCount: nested.stats?.quizzesCount || 0,
                          subtopics: [], // Level 3 not yet loaded
                        }))
                      : [];

                    return {
                      id: sub._id, // MongoDB ObjectId as string
                      name: sub.name,
                      slug: sub.slug,
                      description: sub.description,
                      status: sub.status,
                      notesCount: sub.stats?.notesCount || 0,
                      flashcardsCount: sub.stats?.flashcardsCount || 0,
                      quizzesCount: sub.stats?.quizzesCount || 0,
                      count:
                        (sub.stats?.notesCount || 0) +
                        (sub.stats?.flashcardsCount || 0) +
                        (sub.stats?.quizzesCount || 0),
                      subtopics: nestedSubtopics,
                    };
                  }),
                )
              : [];

            return {
              id: topic._id, // MongoDB ObjectId as string
              name: topic.name,
              slug: topic.slug,
              description: topic.description,
              status: topic.status,
              progress: topic.stats?.completionPercentage || 0,
              notesCount: topic.stats?.notesCount || 0,
              flashcardsCount: topic.stats?.flashcardsCount || 0,
              quizzesCount: topic.stats?.quizzesCount || 0,
              subtopics,
            };
          }),
        );
        setTopics(apiTopics);
      }
    } catch (err) {
      console.error("Failed to fetch topics:", err);
      setError(err instanceof Error ? err.message : "Failed to load topics");
      // Fallback to mock data on error
      setTopics(mockTopics);
    } finally {
      setIsLoading(false);
    }
  };

  const currentTopic = topics.find(
    (t) => t.slug === activeTopic || t.id === activeTopic,
  );

  // Navigate through subtopic path to find current subtopic
  const getCurrentSubtopic = () => {
    if (!currentTopic || subtopicPath.length === 0) return null;

    let current: Topic | Subtopic = currentTopic;
    for (const subtopicId of subtopicPath) {
      const found = (current.subtopics || []).find(
        (s) => s.slug === subtopicId || s.id === subtopicId,
      );
      if (!found) return null;
      current = found;
    }
    return current;
  };

  const currentSubtopic = getCurrentSubtopic();

  const navigateToTopicTab = (
    topicId: string,
    tab: string,
    extra?: Record<string, string>,
  ) => {
    if (!topicId) return;
    const params = new URLSearchParams({ topic: topicId, tab });
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
  ) => {
    navigateToTopicTab(topicId, tab, extra);
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
      handleSearchNavigate(target.topicId, target.tab, target.extra);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      handleSearchClear();
    }
  };

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
    ? [{ label: "Dashboard" }]
    : subtopicPath.length > 0
      ? [
          {
            label: currentTopic?.name || "Topic",
            onClick: () => navigateToTopic(activeTopic),
          },
          ...subtopicPath.map((_, index) => {
            // Navigate through path to get subtopic name
            let current: Topic | Subtopic | undefined = currentTopic;
            for (let i = 0; i <= index; i++) {
              current = (current?.subtopics || []).find(
                (s) =>
                  s.slug === subtopicPath[i] || s.id === subtopicPath[i],
              );
            }

            return {
              label: current?.name || "Subtopic",
              onClick:
                index < subtopicPath.length - 1
                  ? () =>
                      navigateToSubtopicPath(
                        activeTopic,
                        subtopicPath.slice(0, index + 1),
                      )
                  : undefined,
            };
          }),
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
            onDashboardSelect={navigateToDashboard}
            onPinnedNotesSelect={navigateToPinnedNotes}
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
              placeholder="Search topics, notes, flashcards, quizzes..."
              onClear={handleSearchClear}
              onKeyDown={handleSearchKeyDown}
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
                          onClick={() =>
                            handleSearchNavigate(
                              toId(item.slug || item._id),
                              "overview",
                            )
                          }
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
                          onClick={() =>
                            handleSearchNavigate(toId(item.topicId), "notes", {
                              note: toId(item._id),
                            })
                          }
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
                          onClick={() =>
                            handleSearchNavigate(
                              toId(item.topicId),
                              "flashcards",
                              { flashcard: toId(item._id) },
                            )
                          }
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
                          onClick={() =>
                            handleSearchNavigate(
                              toId(item.topicId),
                              "quizzes",
                              {
                                quiz: toId(item._id),
                              },
                            )
                          }
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

          {!activeTopic && view === "pinned" ? (
            <PinnedNotes
              onOpenNote={(topicId, noteId) =>
                navigateToTopicTab(topicId, "notes", { note: noteId })
              }
            />
          ) : !activeTopic ? (
            <Dashboard />
          ) : subtopicPath.length > 0 && currentSubtopic ? (
            <SubtopicContent
              subtopic={currentSubtopic}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onSubtopicSelect={(id) =>
                navigateToSubtopicPath(activeTopic, [...subtopicPath, id])
              }
              onSubtopicAdded={fetchTopics}
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
