"use client";

import { useState } from "react";
import { Edit2, Plus, Pencil, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardTitle, CardSection } from "@/components/ui/Card";
import SubtopicGrid from "@/components/features/SubtopicGrid";
import StatCard from "@/components/ui/StatCard";
import { FileText, Inbox, HelpCircle } from "lucide-react";
import { Textarea } from "@/components/ui/Input";
import { topicAPI } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

type SubtopicStatus = "not-started" | "in-progress" | "review" | "mastered";

interface SubtopicDetailProps {
  subtopic: {
    id: string; // MongoDB ObjectId as string
    name: string;
    status: SubtopicStatus;
    summary: string;
    isPublic?: boolean;
    shareId?: string | null;
  };
  subSubtopics: Array<{
    id: string;
    name: string;
    description: string;
    flashcards: number;
    quizzes: number;
    notes: number;
  }>;
  stats: {
    notes: number;
    flashcards: number;
    quizzes: number;
  };
  onSubSubtopicSelect?: (id: string) => void;
  onAddSubtopic?: () => void;
  shareUrl?: string | null;
  isPublishing?: boolean;
  onPublish?: () => void;
  onUnpublish?: () => void;
  onCopyShareUrl?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: SubtopicStatus) => void;
}

export default function SubtopicDetail({
  subtopic,
  subSubtopics,
  stats,
  onSubSubtopicSelect,
  onAddSubtopic,
  shareUrl,
  isPublishing,
  onPublish,
  onUnpublish,
  onCopyShareUrl,
  onRename,
  onDelete,
  onStatusChange,
}: SubtopicDetailProps) {
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState(subtopic.summary);
  const [isSaving, setIsSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSave = async () => {
    if (!editedSummary.trim()) {
      showError("Summary cannot be empty");
      return;
    }

    if (editedSummary.trim() === subtopic.summary) {
      // No changes made
      setIsEditingSummary(false);
      return;
    }

    try {
      setIsSaving(true);
      
      const response = await topicAPI.update(subtopic.id, {
        description: editedSummary.trim(),
      });

      if (response.success) {
        setIsEditingSummary(false);
        // Update local state to reflect the change
        subtopic.summary = editedSummary.trim();
        showSuccess("Summary updated successfully!");
      } else {
        throw new Error(response.message || "Failed to update summary");
      }
    } catch (err) {
      // Global error handler already logged the error
      showError(err instanceof Error ? err.message : "Failed to update summary");

      // Reset to original value on error
      setEditedSummary(subtopic.summary);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedSummary(subtopic.summary);
    setIsEditingSummary(false);
  };

  return (
    <Card>
      <CardTitle
        action={
          <div className="flex items-center gap-2">
            <select
              value={subtopic.status}
              onChange={(e) => onStatusChange?.(e.target.value as SubtopicStatus)}
              className="text-xs rounded-md !px-2 !py-1 border border-slate-600 bg-slate-800 text-slate-300 cursor-pointer focus:outline-none focus:border-slate-500"
            >
              <option value="not-started">Not started</option>
              <option value="in-progress">In progress</option>
              <option value="review">Review</option>
              <option value="mastered">Mastered</option>
            </select>
            {onRename && (
              <button
                onClick={onRename}
                className="!p-1.5 text-slate-400 hover:text-purple-400 transition-colors rounded"
                title="Rename"
              >
                <Pencil size={15} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="!p-1.5 text-slate-400 hover:text-red-400 transition-colors rounded"
                title="Delete"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        }
      >
        {subtopic.name}
      </CardTitle>

      {subtopic.isPublic && shareUrl ? (
        <div className="!mt-4 !mb-2 flex flex-col gap-2">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            Public Link
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="w-full flex-1 rounded-md border border-slate-700 bg-slate-900/60 !px-3 !py-2 text-sm text-slate-200"
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={onCopyShareUrl}
                disabled={!onCopyShareUrl}
              >
                Copy
              </Button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-slate-600 !px-3 !py-2 text-sm text-slate-200 hover:bg-slate-700/50"
              >
                Open
              </a>
              {onUnpublish && (
                <Button
                  variant="secondary"
                  onClick={onUnpublish}
                  disabled={isPublishing}
                >
                  {isPublishing ? "Working..." : "Unpublish"}
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="!mt-4 !mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            Publish this subtopic to generate a public link.
          </p>
          {onPublish && (
            <Button onClick={onPublish} disabled={isPublishing}>
              {isPublishing ? "Working..." : "Publish"}
            </Button>
          )}
        </div>
      )}

      <CardSection
        title="Summary"
        action={
          <button
            onClick={() => setIsEditingSummary(!isEditingSummary)}
            className="!p-2 text-slate-400 hover:text-purple-400 transition-colors"
          >
            <Edit2 size={18} />
          </button>
        }
      >
        {!isEditingSummary ? (
          <div className="bg-slate-700/50 !p-4 rounded-lg !mb-5">
            <p className="text-sm leading-relaxed text-slate-200">
              {subtopic.summary}
            </p>
          </div>
        ) : (
          <div className="!mb-5">
            <Textarea
              rows={5}
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
              className="!p-2"
              disabled={isSaving}
            />
            <div className="flex gap-3 !mt-3">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardSection>

      <CardSection
        title="Subtopics"
        action={
          onAddSubtopic && (
            <Button onClick={onAddSubtopic}>
              <Plus size={16} />
              Add Subtopic
            </Button>
          )
        }
      >
        {subSubtopics.length > 0 ? (
          <SubtopicGrid
            subtopics={subSubtopics}
            onSelect={onSubSubtopicSelect}
          />
        ) : (
          <div className="text-center !py-8 text-slate-400">
            <p>No subtopics yet. Click &quot;Add Subtopic&quot; to create one.</p>
          </div>
        )}
      </CardSection>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 !mt-6">
        <StatCard
          icon={<FileText size={20} />}
          value={stats.notes}
          label="Notes"
          variant="blue"
        />
        <StatCard
          icon={<Inbox size={20} />}
          value={stats.flashcards}
          label="Flashcards"
          variant="green"
        />
        <StatCard
          icon={<HelpCircle size={20} />}
          value={stats.quizzes}
          label="Quizzes"
          variant="purple"
        />
      </div>
    </Card>
  );
}
