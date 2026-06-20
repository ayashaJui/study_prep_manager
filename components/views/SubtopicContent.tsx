"use client";

import { useState, useEffect } from "react";
import Tabs from "@/components/ui/Tabs";
import SubtopicDetail from "@/components/views/SubtopicDetail";
import TopicNotes from "@/components/views/TopicNotes";
import TopicFlashcards from "@/components/views/TopicFlashcards";
import TopicQuizzes from "@/components/views/TopicQuizzes";
import TakeQuiz from "@/components/views/TakeQuiz";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { mockNotes, mockFlashcards, mockQuizzes } from "@/lib/mockData";
import { topicAPI } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

interface SubtopicSummary {
  id: string;
  name: string;
  description?: string;
  flashcardsCount?: number;
  quizzesCount?: number;
  notesCount?: number;
}

interface SubtopicContentProps {
  subtopic: {
    id: string; // MongoDB ObjectId as string
    name: string;
    description?: string;
    notes?: number;
    flashcards?: number;
    quizzes?: number;
    subtopics?: SubtopicSummary[]; // Nested subtopics
    status?: "not-started" | "in-progress" | "review" | "mastered";
    flashcardsCount?: number;
    quizzesCount?: number;
    notesCount?: number;
    isPublic?: boolean;
    shareId?: string | null;
  };
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSubtopicSelect?: (id: string) => void;
  onSubtopicAdded?: () => void; // Callback to refresh parent data
}

export default function SubtopicContent({
  subtopic,
  activeTab,
  onTabChange,
  onSubtopicSelect,
  onSubtopicAdded,
}: SubtopicContentProps) {
  const { showSuccess, showError } = useToast();
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [isAddSubtopicModalOpen, setIsAddSubtopicModalOpen] = useState(false);
  const [newSubtopicName, setNewSubtopicName] = useState("");
  const [newSubtopicDescription, setNewSubtopicDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
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
    const nextShareId = subtopic.shareId || null;
    const nextIsPublic = Boolean(subtopic.isPublic && nextShareId);
    setShareId(nextShareId);
    setIsPublic(nextIsPublic);
    setShareUrl(nextShareId ? buildShareUrl(nextShareId) : null);
  }, [subtopic.shareId, subtopic.isPublic]);

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const response = await topicAPI.publish(subtopic.id);
      const data = response.data || response;
      const nextShareId = data.shareId || null;
      const nextShareUrl =
        data.publicUrl || (nextShareId ? buildShareUrl(nextShareId) : null);

      setShareId(nextShareId);
      setShareUrl(nextShareUrl);
      setIsPublic(Boolean(nextShareId));
      showSuccess("Subtopic published. Share link is ready.");
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to publish subtopic",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      setIsPublishing(true);
      await topicAPI.unpublish(subtopic.id);
      setShareId(null);
      setShareUrl(null);
      setIsPublic(false);
      showSuccess("Subtopic unpublished.");
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to unpublish subtopic",
      );
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

  const handleTakeQuiz = (quizId: string) => {
    setActiveQuizId(quizId);
  };

  const handleQuizComplete = (score: number) => {
    console.log("Quiz completed with score:", score);
    // In real implementation, update quiz with:
    // - lastScore: score
    // - lastAttemptDate: new Date().toLocaleDateString()
    // - attempts: attempts + 1
    // Keep modal open to show results - user will close it manually
  };

  const handleAddSubtopic = async () => {
    if (!newSubtopicName.trim()) return;

    try {
      setIsCreating(true);

      // Create subtopic with parent reference
      const response = await topicAPI.create({
        name: newSubtopicName.trim(),
        description: newSubtopicDescription.trim() || undefined,
        parentId: subtopic.id, // This subtopic becomes the parent
        level: 2, // Increment from parent level
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
      setIsCreating(false);
    }
  };

  // Support both old and new data structure
  const notesCount = subtopic.notes ?? subtopic.notesCount ?? 0;
  const flashcardsCount = subtopic.flashcards ?? subtopic.flashcardsCount ?? 0;
  const quizzesCount = subtopic.quizzes ?? subtopic.quizzesCount ?? 0;
  const subSubtopics = subtopic.subtopics || [];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "notes", label: "Notes", count: notesCount },
    { id: "flashcards", label: "Flashcards", count: flashcardsCount },
    { id: "quizzes", label: "Quizzes", count: quizzesCount },
  ];

  return (
    <>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />

      {activeTab === "overview" && (
        <SubtopicDetail
          subtopic={{
            id: subtopic.id,
            name: subtopic.name,
            status: subtopic.status || "in-progress",
            summary: subtopic.description || "",
            isPublic,
            shareId,
          }}
          subSubtopics={subSubtopics.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description || "",
            flashcards: s.flashcardsCount || 0,
            quizzes: s.quizzesCount || 0,
            notes: s.notesCount || 0,
          }))}
          stats={{
            notes: notesCount,
            flashcards: flashcardsCount,
            quizzes: quizzesCount,
          }}
          onSubSubtopicSelect={onSubtopicSelect}
          onAddSubtopic={() => setIsAddSubtopicModalOpen(true)}
          shareUrl={shareUrl}
          isPublishing={isPublishing}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onCopyShareUrl={handleCopyShareUrl}
        />
      )}

      {activeTab === "notes" && (
        <TopicNotes topicId={subtopic.id} topicName={subtopic.name} />
      )}

      {activeTab === "flashcards" && (
        <TopicFlashcards topicId={subtopic.id} topicName={subtopic.name} />
      )}

      {activeTab === "quizzes" && (
        <TopicQuizzes topicId={subtopic.id} topicName={subtopic.name} />
      )}

      {activeQuizId && (
        <TakeQuiz
          quiz={mockQuizzes.find((q) => q.id === activeQuizId)!}
          onClose={() => setActiveQuizId(null)}
          onComplete={handleQuizComplete}
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
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!newSubtopicName.trim() || isCreating}
            >
              {isCreating ? "Adding..." : "Add Subtopic"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
