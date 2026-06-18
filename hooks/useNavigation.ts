import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function useNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTopic, setActiveTopic] = useState<string | undefined>();
  const [subtopicPath, setSubtopicPath] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
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

    if (topic) setActiveTopic(topic);
    setSubtopicPath(subtopicsParam ? subtopicsParam.split(",") : []);
    if (tab) setActiveTab(tab);
    setSelectedNoteId(noteId || undefined);
    setSelectedFlashcardId(flashcardId || undefined);
    setSelectedQuizId(quizId || undefined);
  }

  const navigateToDashboard = () => {
    router.push("/");
    setActiveTopic(undefined);
    setSubtopicPath([]);
    setActiveTab("overview");
  };

  const navigateToTopic = (slug: string) => {
    router.push(`/?topic=${slug}`);
    setActiveTopic(slug);
    setSubtopicPath([]);
    setActiveTab("overview");
  };

  const navigateToSubtopic = (topicSlug: string, subtopicSlug: string) => {
    router.push(`/?topic=${topicSlug}&subtopics=${subtopicSlug}`);
    setActiveTopic(topicSlug);
    setSubtopicPath([subtopicSlug]);
    setActiveTab("overview");
  };

  const navigateToSubtopicPath = (topicSlug: string, path: string[]) => {
    router.push(`/?topic=${topicSlug}&subtopics=${path.join(",")}`);
    setActiveTopic(topicSlug);
    setSubtopicPath(path);
    setActiveTab("overview");
  };

  return {
    activeTopic,
    activeSubtopic: subtopicPath[0], // For backward compatibility
    subtopicPath,
    activeTab,
    selectedNoteId,
    selectedFlashcardId,
    selectedQuizId,
    setActiveTab,
    navigateToDashboard,
    navigateToTopic,
    navigateToSubtopic,
    navigateToSubtopicPath,
  };
}
