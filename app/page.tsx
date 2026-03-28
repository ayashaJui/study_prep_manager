"use client";

import { useState, useEffect, Suspense } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MainContent from "@/components/layout/MainContent";
import Breadcrumb from "@/components/layout/Breadcrumb";
import MobileMenu from "@/components/layout/MobileMenu";
import Dashboard from "@/components/views/Dashboard";
import TopicContent from "@/components/views/TopicContent";
import SubtopicContent from "@/components/views/SubtopicContent";
import Modal from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { mockTopics, Topic } from "@/lib/mockData";
import { topicAPI } from "@/lib/api";
import { useNavigation } from "@/hooks/useNavigation";

function HomeContent() {
  const {
    activeTopic,
    activeSubtopic,
    subtopicPath,
    activeTab,
    setActiveTab,
    navigateToDashboard,
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
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First fetch only top-level topics (parentId = null)
      const response = await topicAPI.getAll("null");

      if (response.success) {
        // Map API response to match UI structure
        const apiTopics = await Promise.all(
          response.data.map(async (topic: any) => {
            // Fetch subtopics for each topic
            const subtopicsResponse = await topicAPI.getAll(topic._id);
            const subtopics = subtopicsResponse.success
              ? await Promise.all(
                  subtopicsResponse.data.map(async (sub: any) => {
                    // Fetch nested subtopics (level 2)
                    const nestedSubtopicsResponse = await topicAPI.getAll(
                      sub._id,
                    );
                    const nestedSubtopics = nestedSubtopicsResponse.success
                      ? nestedSubtopicsResponse.data.map((nested: any) => ({
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
    } catch (err: any) {
      console.error("Failed to fetch topics:", err);
      setError(err.message || "Failed to load topics");
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

    let current: any = currentTopic;
    for (const subtopicId of subtopicPath) {
      const found = (current.subtopics || []).find(
        (s: any) => s.slug === subtopicId || s.id === subtopicId,
      );
      if (!found) return null;
      current = found;
    }
    return current;
  };

  const currentSubtopic = getCurrentSubtopic();

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
    } catch (err: any) {
      console.error("Failed to create topic:", err);
      alert(err.message || "Failed to create topic. Please try again.");
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
            let current: any = currentTopic;
            for (let i = 0; i <= index; i++) {
              current = (current?.subtopics || []).find(
                (s: any) =>
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
            onDashboardSelect={navigateToDashboard}
            onTopicSelect={navigateToTopic}
            onSubtopicSelect={navigateToSubtopic}
            onAddTopic={() => setIsAddTopicModalOpen(true)}
          />
        </MobileMenu>
        <MainContent>
          <Breadcrumb items={breadcrumbItems} />

          {!activeTopic ? (
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
