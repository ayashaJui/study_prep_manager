"use client";

import { useState, useEffect } from "react";
import Tabs from "@/components/ui/Tabs";
import TopicOverview from "@/components/views/TopicOverview";
import TopicNotes from "@/components/views/TopicNotes";
import TopicFlashcards from "@/components/views/TopicFlashcards";
import TopicQuizzes from "@/components/views/TopicQuizzes";
import Modal from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { topicAPI } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

type TopicStatus = "not-started" | "in-progress" | "review" | "mastered";

interface TopicSubtopic {
  id?: string;
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  status?: TopicStatus;
  flashcardsCount?: number;
  quizzesCount?: number;
  notesCount?: number;
}

interface TopicData {
  id?: string;
  _id?: string;
  name?: string;
  status?: TopicStatus;
  progress?: number;
  shareId?: string | null;
  isPublic?: boolean;
  notesCount?: number;
  flashcardsCount?: number;
  quizzesCount?: number;
  subtopics?: TopicSubtopic[];
}

interface TopicContentProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSubtopicSelect: (id: string) => void;
  topicId?: string; // Current topic ID
  onSubtopicAdded?: () => void; // Callback to refresh parent data
  topic?: TopicData; // Current topic data from API
  selectedNoteId?: string;
  selectedFlashcardId?: string;
  selectedQuizId?: string;
}

export default function TopicContent({
  activeTab,
  onTabChange,
  onSubtopicSelect,
  topicId,
  onSubtopicAdded,
  topic,
  selectedNoteId,
  selectedFlashcardId,
  selectedQuizId,
}: TopicContentProps) {
  const { showSuccess, showError } = useToast();
  const [isAddSubtopicModalOpen, setIsAddSubtopicModalOpen] = useState(false);
  const [newSubtopicName, setNewSubtopicName] = useState("");
  const [newSubtopicDescription, setNewSubtopicDescription] = useState("");
  const [isCreatingSubtopic, setIsCreatingSubtopic] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const buildShareUrl = (id: string) => {
    if (typeof window === "undefined") {
      return `/public/topic/${id}`;
    }
    return `${window.location.origin}/public/topic/${id}`;
  };

  useEffect(() => {
    if (!topic) return;
    const nextShareId = topic.shareId || null;
    const nextIsPublic = Boolean(topic.isPublic && nextShareId);
    setShareId(nextShareId);
    setIsPublic(nextIsPublic);
    setShareUrl(nextShareId ? buildShareUrl(nextShareId) : null);
  }, [topic]);

  const handleAddSubtopic = async () => {
    if (!newSubtopicName.trim() || !topicId) return;

    try {
      setIsCreatingSubtopic(true);

      const response = await topicAPI.create({
        name: newSubtopicName.trim(),
        description: newSubtopicDescription.trim() || undefined,
        parentId: topicId,
        level: 1,
        status: "not-started",
        tags: [],
        favorite: false,
      });

      if (response.success) {
        console.log("Subtopic created:", response.data);

        setNewSubtopicName("");
        setNewSubtopicDescription("");
        setIsAddSubtopicModalOpen(false);

        // Notify parent to refresh data
        if (onSubtopicAdded) {
          onSubtopicAdded();
        }
      }
    } catch (err) {
      console.error("Failed to create subtopic:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to create subtopic. Please try again.",
      );
    } finally {
      setIsCreatingSubtopic(false);
    }
  };

  const handlePublish = async () => {
    if (!topicId) return;
    try {
      setIsPublishing(true);
      const response = await topicAPI.publish(topicId);
      const data = response.data || response;
      const nextShareId = data.shareId || null;
      const nextShareUrl =
        data.publicUrl || (nextShareId ? buildShareUrl(nextShareId) : null);

      setShareId(nextShareId);
      setShareUrl(nextShareUrl);
      setIsPublic(Boolean(nextShareId));
      showSuccess("Topic published. Share link is ready.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to publish topic");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!topicId) return;
    try {
      setIsPublishing(true);
      await topicAPI.unpublish(topicId);
      setShareId(null);
      setShareUrl(null);
      setIsPublic(false);
      showSuccess("Topic unpublished.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to unpublish topic");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyShareUrl = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showSuccess("Share link copied to clipboard.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to copy link");
    }
  };

  // Calculate stats from topic data
  const subtopics = topic?.subtopics || [];
  const stats = {
    notes: topic?.notesCount || 0,
    flashcards: topic?.flashcardsCount || 0,
    quizzes: topic?.quizzesCount || 0,
  };

  const topicOverviewData = {
    id: topic?.id || topic?._id || "",
    name: topic?.name || "Topic",
    status: topic?.status || "not-started",
    progress: topic?.progress || 0,
    completedSubtopics: subtopics.filter(
      (s: TopicSubtopic) => s.status === "mastered",
    ).length,
    totalSubtopics: subtopics.length,
    isPublic,
    shareId,
  };

  const formattedSubtopics = subtopics.map((sub: TopicSubtopic) => ({
    id: sub.id || sub._id || "",
    name: sub.name,
    slug: sub.slug,
    description: sub.description || "",
    flashcards: sub.flashcardsCount || 0,
    quizzes: sub.quizzesCount || 0,
    notes: sub.notesCount || 0,
  }));

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "notes", label: "Notes", count: stats.notes },
    { id: "flashcards", label: "Flashcards", count: stats.flashcards },
    { id: "quizzes", label: "Quizzes", count: stats.quizzes },
  ];

  return (
    <>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />

      {activeTab === "overview" && (
        <TopicOverview
          topic={topicOverviewData}
          subtopics={formattedSubtopics}
          stats={stats}
          onSubtopicSelect={onSubtopicSelect}
          onAddSubtopic={() => setIsAddSubtopicModalOpen(true)}
          shareUrl={shareUrl}
          isPublishing={isPublishing}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onCopyShareUrl={handleCopyShareUrl}
        />
      )}

      {activeTab === "notes" && (
        <TopicNotes
          topicId={topicId || ""}
          topicName={topic?.name || "Topic"}
          initialNoteId={selectedNoteId}
        />
      )}

      {activeTab === "flashcards" && (
        <TopicFlashcards
          topicId={topicId || ""}
          topicName={topic?.name || "Topic"}
          initialFlashcardId={selectedFlashcardId}
        />
      )}

      {activeTab === "quizzes" && topicId && (
        <TopicQuizzes
          topicId={topicId}
          topicName={topic?.name || "Topic"}
          initialQuizId={selectedQuizId}
        />
      )}

      <Modal
        isOpen={isAddSubtopicModalOpen}
        onClose={() => {
          setIsAddSubtopicModalOpen(false);
          setNewSubtopicName("");
          setNewSubtopicDescription("");
        }}
        title="Add New Subtopic"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddSubtopic();
          }}
        >
          <Input
            label="Subtopic Name"
            placeholder="e.g., Arrays, Linked Lists, etc."
            value={newSubtopicName}
            onChange={(e) => setNewSubtopicName(e.target.value)}
            required
          />
          <Textarea
            label="Description (Optional)"
            placeholder="Brief description of this subtopic..."
            value={newSubtopicDescription}
            onChange={(e) => setNewSubtopicDescription(e.target.value)}
          />
          <div className="flex gap-3 justify-end !mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAddSubtopicModalOpen(false);
                setNewSubtopicName("");
                setNewSubtopicDescription("");
              }}
              disabled={isCreatingSubtopic}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!newSubtopicName.trim() || isCreatingSubtopic}
            >
              {isCreatingSubtopic ? "Adding..." : "Add Subtopic"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
