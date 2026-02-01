import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function useNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTopic, setActiveTopic] = useState<string | undefined>();
  const [subtopicPath, setSubtopicPath] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Sync state with URL params
  useEffect(() => {
    const topic = searchParams.get("topic");
    const subtopicsParam = searchParams.get("subtopics");
    const tab = searchParams.get("tab");

    if (topic) setActiveTopic(topic);
    if (subtopicsParam) {
      setSubtopicPath(subtopicsParam.split(","));
    } else {
      setSubtopicPath([]);
    }
    if (tab) setActiveTab(tab);
  }, [searchParams]);

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
    setActiveTab,
    navigateToDashboard,
    navigateToTopic,
    navigateToSubtopic,
    navigateToSubtopicPath,
  };
}
