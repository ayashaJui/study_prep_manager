"use client";

import { useState, useEffect } from "react";
import Tabs from "@/components/ui/Tabs";
import SubtopicDetail from "@/components/views/SubtopicDetail";
import TopicNotes from "@/components/views/TopicNotes";
import TopicFlashcards from "@/components/views/TopicFlashcards";
import TopicQuizzes from "@/components/views/TopicQuizzes";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
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

type SubtopicStatus = "not-started" | "in-progress" | "review" | "mastered";

interface SubtopicContentProps {
  subtopic: {
    id: string; // MongoDB ObjectId as string
    name: string;
    description?: string;
    notes?: number;
    flashcards?: number;
    quizzes?: number;
    subtopics?: SubtopicSummary[]; // Nested subtopics
    status?: SubtopicStatus;
    flashcardsCount?: number;
    quizzesCount?: number;
    notesCount?: number;
    isPublic?: boolean;
    shareId?: string | null;
  };
  level?: number; // depth of this subtopic (1 = direct child of a root topic)
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSubtopicSelect?: (id: string) => void;
  onSubtopicAdded?: () => void;
  onSubtopicDeleted?: () => void;
  onSubtopicRenamed?: (name: string) => void;
}

export default function SubtopicContent({
  subtopic,
  level = 1,
  activeTab,
  onTabChange,
  onSubtopicSelect,
  onSubtopicAdded,
  onSubtopicDeleted,
  onSubtopicRenamed,
}: SubtopicContentProps) {
  const { showSuccess, showError } = useToast();
  const [isAddSubtopicModalOpen, setIsAddSubtopicModalOpen] = useState(false);
  const [newSubtopicName, setNewSubtopicName] = useState("");
  const [newSubtopicDescription, setNewSubtopicDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [localStatus, setLocalStatus] = useState<SubtopicStatus>(subtopic.status || "not-started");
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameDesc, setRenameDesc] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    if (subtopic.status) setLocalStatus(subtopic.status);
  }, [subtopic.shareId, subtopic.isPublic, subtopic.status]);

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

  const handleOpenRename = () => {
    setRenameValue(subtopic.name);
    setRenameDesc(subtopic.description || "");
    setIsRenameOpen(true);
  };

  const handleRename = async () => {
    if (!renameValue.trim()) return;
    setIsRenaming(true);
    try {
      await topicAPI.update(subtopic.id, {
        name: renameValue.trim(),
        description: renameDesc.trim() || undefined,
      });
      setIsRenameOpen(false);
      onSubtopicRenamed?.(renameValue.trim());
      showSuccess("Subtopic renamed.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to rename subtopic.");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await topicAPI.delete(subtopic.id);
      setIsDeleteOpen(false);
      showSuccess("Subtopic deleted.");
      onSubtopicDeleted?.();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to delete subtopic.");
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (status: SubtopicStatus) => {
    const prev = localStatus;
    setLocalStatus(status);
    try {
      await topicAPI.update(subtopic.id, { status });
      showSuccess("Status updated.");
    } catch (err) {
      setLocalStatus(prev);
      showError(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  const handleAddSubtopic = async () => {
    if (!newSubtopicName.trim()) return;

    try {
      setIsCreating(true);

      // Create subtopic with parent reference
      const response = await topicAPI.create({
        name: newSubtopicName.trim(),
        description: newSubtopicDescription.trim() || undefined,
        parentId: subtopic.id,
        level: level + 1,
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
            status: localStatus,
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
          onRename={handleOpenRename}
          onDelete={() => setIsDeleteOpen(true)}
          onStatusChange={handleStatusChange}
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

      <Modal
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        title="Rename Subtopic"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleRename(); }}>
          <Input
            label="Subtopic Name"
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
        title="Delete Subtopic"
      >
        <p className="text-sm text-slate-300 !mb-6">
          Are you sure you want to delete <strong>{subtopic.name}</strong>? This cannot be undone. All sub-subtopics must be deleted first.
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
