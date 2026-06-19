import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function useNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTopic, setActiveTopic] = useState<string | undefined>();
  const [subtopicPath, setSubtopicPath] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [view, setView] = useState<"dashboard" | "pinned">("dashboard");
  const [selectedNoteId, setSelectedNoteId] = useState<string | undefined>();
  const [selectedFlashcardId, setSelectedFlashcardId] = useState<
    string | undefined
  >();
  const [selectedQuizId, setSelectedQuizId] = useState<string | undefined>();

  // Sync state with URL params (adjusting state during render, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
  const searchParamsKey = searchParams.toString();
  const [lastSyncedKey, setLastSyncedKey] = useState<string | null>(null);
  if (lastSyncedKey !== searchParamsKey) {
    setLastSyncedKey(searchParamsKey);

    const topic = searchParams.get("topic");
    const subtopicsParam = searchParams.get("subtopics");
    const tab = searchParams.get("tab");
    const noteId = searchParams.get("note");
    const flashcardId = searchParams.get("flashcard");
    const quizId = searchParams.get("quiz");
    const viewParam = searchParams.get("view");

    if (topic) setActiveTopic(topic);
    setSubtopicPath(subtopicsParam ? subtopicsParam.split(",") : []);
    if (tab) setActiveTab(tab);
    setSelectedNoteId(noteId || undefined);
    setSelectedFlashcardId(flashcardId || undefined);
    setSelectedQuizId(quizId || undefined);
    setView(viewParam === "pinned" ? "pinned" : "dashboard");
  }

  const navigateToDashboard = () => {
    router.push("/");
    setActiveTopic(undefined);
    setSubtopicPath([]);
    setActiveTab("overview");
    setView("dashboard");
  };

  const navigateToPinnedNotes = () => {
    router.push("/?view=pinned");
    setActiveTopic(undefined);
    setSubtopicPath([]);
    setActiveTab("overview");
    setView("pinned");
  };

  const navigateToTopic = (slug: string) => {
    router.push(`/?topic=${slug}`);
    setActiveTopic(slug);
    setSubtopicPath([]);
    setActiveTab("overview");
    setView("dashboard");
  };

  const navigateToSubtopic = (topicSlug: string, subtopicSlug: string) => {
    router.push(`/?topic=${topicSlug}&subtopics=${subtopicSlug}`);
    setActiveTopic(topicSlug);
    setSubtopicPath([subtopicSlug]);
    setActiveTab("overview");
    setView("dashboard");
  };

  const navigateToSubtopicPath = (topicSlug: string, path: string[]) => {
    router.push(`/?topic=${topicSlug}&subtopics=${path.join(",")}`);
    setActiveTopic(topicSlug);
    setSubtopicPath(path);
    setActiveTab("overview");
    setView("dashboard");
  };

  return {
    activeTopic,
    activeSubtopic: subtopicPath[0], // For backward compatibility
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
  };
}
