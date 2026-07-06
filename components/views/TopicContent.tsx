"use client";

import { useState, useEffect } from "react";
import Tabs from "@/components/ui/Tabs";
import TopicOverview from "@/components/views/TopicOverview";
import TopicNotes from "@/components/views/TopicNotes";
import TopicFlashcards from "@/components/views/TopicFlashcards";
import TopicQuizzes from "@/components/views/TopicQuizzes";
import TopicProblems from "@/components/views/TopicProblems";
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
  description?: string;
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
  topicId?: string;
  onSubtopicAdded?: () => void;
  topic?: TopicData;
  selectedNoteId?: string;
  selectedFlashcardId?: string;
  selectedQuizId?: string;
  onTopicDeleted?: () => void;
  onTopicRenamed?: (name: string) => void;
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
  onTopicDeleted,
  onTopicRenamed,
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
  const [localStatus, setLocalStatus] = useState<TopicStatus>(topic?.status || "not-started");
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameDesc, setRenameDesc] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRecursiveDeleting, setIsRecursiveDeleting] = useState(false);

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
    if (topic.status) setLocalStatus(topic.status);
  }, [topic]);

  const handleOpenRename = () => {
    setRenameValue(topic?.name || "");
    setRenameDesc(topic?.description || "");
    setIsRenameOpen(true);
  };

  const handleRename = async () => {
    if (!topicId || !renameValue.trim()) return;
    setIsRenaming(true);
    try {
      await topicAPI.update(topicId, {
        name: renameValue.trim(),
        description: renameDesc.trim() || undefined,
      });
      setIsRenameOpen(false);
      onTopicRenamed?.(renameValue.trim());
      showSuccess("Topic renamed.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to rename topic.");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    if (!topicId) return;
    setIsDeleting(true);
    try {
      await topicAPI.delete(topicId);
      setIsDeleteOpen(false);
      showSuccess("Topic deleted.");
      onTopicDeleted?.();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to delete topic.");
      setIsDeleting(false);
    }
  };

  const handleDeleteRecursive = async () => {
    if (!topicId) return;
    setIsRecursiveDeleting(true);
    try {
      await topicAPI.deleteRecursive(topicId);
      setIsDeleteOpen(false);
      showSuccess("Topic and all subtopics deleted.");
      onTopicDeleted?.();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to delete topic.");
      setIsRecursiveDeleting(false);
    }
  };

  const handleStatusChange = async (status: TopicStatus) => {
    if (!topicId) return;
    const prev = localStatus;
    setLocalStatus(status);
    try {
      await topicAPI.update(topicId, { status });
      showSuccess("Status updated.");
    } catch (err) {
      setLocalStatus(prev);
      showError(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

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
    status: localStatus,
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
    { id: "problems", label: "Problems" },
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
          onRename={handleOpenRename}
          onDelete={() => setIsDeleteOpen(true)}
          onStatusChange={handleStatusChange}
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

      {activeTab === "problems" && topicId && (
        <TopicProblems topicId={topicId} topicName={topic?.name || "Topic"} />
      )}

      <Modal
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        title="Rename Topic"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleRename(); }}>
          <Input
            label="Topic Name"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            required
          />
          <Textarea
            label="Description (Optional)"
            value={renameDesc}
            onChange={(e) => setRenameDesc(e.target.value)}
          />
          <div className="flex gap-3 justify-end !mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsRenameOpen(false)} disabled={isRenaming}>
              Cancel
            </Button>
            <Button type="submit" disabled={!renameValue.trim() || isRenaming}>
              {isRenaming ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Topic"
      >
        {subtopics.length > 0 ? (
          <>
            <p className="text-sm text-amber-400 !mb-6">
              <strong>{topic?.name}</strong> has {subtopics.length} subtopic{subtopics.length !== 1 ? "s" : ""}. You can delete just this topic after removing subtopics, or delete everything at once.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setIsDeleteOpen(false)} disabled={isRecursiveDeleting}>
                Cancel
              </Button>
              <Button
                onClick={handleDeleteRecursive}
                disabled={isRecursiveDeleting}
                style={{ background: "#ef4444", color: "#fff" }}
              >
                {isRecursiveDeleting ? "Deleting..." : `Delete topic + ${subtopics.length} subtopic${subtopics.length !== 1 ? "s" : ""}`}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-300 !mb-6">
              Are you sure you want to delete <strong>{topic?.name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{ background: "#ef4444", color: "#fff" }}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </>
        )}
      </Modal>

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
