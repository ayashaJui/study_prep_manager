"use client";

import { useState } from "react";
import { Edit2, Plus } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card, CardTitle, CardSection } from "@/components/ui/Card";
import SubtopicGrid from "@/components/features/SubtopicGrid";
import StatCard from "@/components/ui/StatCard";
import { FileText, Inbox, HelpCircle } from "lucide-react";
import { Textarea } from "@/components/ui/Input";
import { topicAPI } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

interface SubtopicDetailProps {
  subtopic: {
    id: string; // MongoDB ObjectId as string
    name: string;
    status: "not-started" | "in-progress" | "review" | "mastered";
    summary: string;
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
}

export default function SubtopicDetail({
  subtopic,
  subSubtopics,
  stats,
  onSubSubtopicSelect,
  onAddSubtopic,
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
    } catch (err: any) {
      // Global error handler already logged the error
      showError(err.message);
      
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
        action={<Badge variant={subtopic.status}>{subtopic.status}</Badge>}
      >
        {subtopic.name}
      </CardTitle>

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
            <p>No subtopics yet. Click "Add Subtopic" to create one.</p>
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
