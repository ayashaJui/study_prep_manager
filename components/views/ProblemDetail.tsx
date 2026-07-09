"use client";

import { useState } from "react";
import { ExternalLink, X, Pencil, Trash2, RotateCcw } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card, CardTitle } from "@/components/ui/Card";
import TagInput from "@/components/ui/TagInput";
import { ApiProblem, ProblemCreateInput } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

type Difficulty = "easy" | "medium" | "hard";
type Status = "unsolved" | "attempted" | "solved";
type Confidence = "easy" | "medium" | "hard" | "again";

interface Topic {
  id: string;
  name: string;
}

interface ProblemDetailProps {
  problem: ApiProblem;
  topics: Topic[];
  onUpdate: (updated: ApiProblem) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onReview: (id: string, confidence: Confidence) => Promise<ApiProblem>;
  onSave: (id: string, data: Partial<ProblemCreateInput>) => Promise<ApiProblem>;
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "#22c55e",
  medium: "#f59e0b",
  hard: "#ef4444",
};

const STATUS_COLORS: Record<Status, string> = {
  unsolved: "#64748b",
  attempted: "#f59e0b",
  solved: "#22c55e",
};

const REVIEW_BUTTONS: { label: string; value: Confidence; days: string }[] = [
  { label: "Again", value: "again", days: "now" },
  { label: "Hard",  value: "hard",  days: "+1d" },
  { label: "Med",   value: "medium",days: "+3d" },
  { label: "Easy",  value: "easy",  days: "+7d" },
];

export default function ProblemDetail({
  problem,
  topics,
  onUpdate,
  onDelete,
  onClose,
  onReview,
  onSave,
}: ProblemDetailProps) {
  const { showSuccess, showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [form, setForm] = useState<ProblemCreateInput>({
    topicId: problem.topicId ?? null,
    title: problem.title,
    platform: problem.platform,
    problemNumber: problem.problemNumber ?? "",
    url: problem.url ?? "",
    difficulty: problem.difficulty,
    status: problem.status,
    tags: problem.tags ?? [],
    notes: problem.notes ?? "",
    timeComplexity: problem.timeComplexity ?? "",
    spaceComplexity: problem.spaceComplexity ?? "",
    language: problem.language ?? "",
  });

  const handleSave = async () => {
    if (!form.title.trim() || !form.platform.trim()) {
      showError("Title and platform are required.");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await onSave(problem._id, form);
      onUpdate(updated);
      setIsEditing(false);
      showSuccess("Problem updated.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to update problem.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReview = async (confidence: Confidence) => {
    setIsReviewing(true);
    try {
      const updated = await onReview(problem._id, confidence);
      onUpdate(updated);
      const label =
        confidence === "again"  ? "due now"  :
        confidence === "easy"   ? "+7 days"  :
        confidence === "medium" ? "+3 days"  : "+1 day";
      showSuccess(`Scheduled: ${label}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to submit review.");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      onDelete(problem._id);
    } catch {
      setIsDeleting(false);
    }
  };

  const topicName    = topics.find((t) => t.id === problem.topicId)?.name;
  const nextReviewText = problem.nextReview
    ? new Date(problem.nextReview) <= new Date()
      ? "Due now"
      : new Date(problem.nextReview).toLocaleDateString()
    : null;
  const canReview = problem.status === "solved" || problem.status === "attempted";

  const selectCls = "w-full text-sm rounded-md !px-3 !py-2 border border-slate-600 bg-slate-800 text-slate-200 focus:outline-none";

  /* ── Edit form ── */
  if (isEditing) {
    return (
      <Card>
        <CardTitle
          action={
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-200">
              <X size={18} />
            </button>
          }
        >
          Edit Problem
        </CardTitle>

        <div className="!space-y-4">
          <Input
            label="Title *"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <div className="grid grid-cols-2 !gap-3">
            <Input
              label="Platform *"
              placeholder="LeetCode"
              value={form.platform}
              onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
            />
            <Input
              label="Problem #"
              placeholder="42"
              value={form.problemNumber ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, problemNumber: e.target.value }))}
            />
          </div>
          <Input
            label="URL"
            placeholder="https://leetcode.com/problems/..."
            value={form.url ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          />
          <div className="grid grid-cols-2 !gap-3">
            <div>
              <label className="block text-xs text-slate-400 !mb-1.5">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as Difficulty }))}
                className={selectCls}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 !mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))}
                className={selectCls}
              >
                <option value="unsolved">Unsolved</option>
                <option value="attempted">Attempted</option>
                <option value="solved">Solved</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 !mb-1.5">Topic</label>
            <select
              value={form.topicId ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, topicId: e.target.value || null }))}
              className={selectCls}
            >
              <option value="">No topic</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 !gap-3">
            <Input
              label="Time Complexity"
              placeholder="O(n)"
              value={form.timeComplexity ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, timeComplexity: e.target.value }))}
            />
            <Input
              label="Space Complexity"
              placeholder="O(1)"
              value={form.spaceComplexity ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, spaceComplexity: e.target.value }))}
            />
          </div>
          <Input
            label="Language"
            placeholder="Python"
            value={form.language ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
          />
          <div>
            <label className="block text-xs text-slate-400 !mb-1.5">Tags</label>
            <TagInput tags={form.tags ?? []} onChange={(tags) => setForm((f) => ({ ...f, tags }))} />
          </div>
          <Textarea
            label="Notes / Approach / Intuition"
            rows={6}
            value={form.notes ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </div>

        <div className="flex !gap-3 justify-end !mt-6">
          <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </Card>
    );
  }

  /* ── Detail view ── */
  return (
    <Card>
      <CardTitle
        action={
          <div className="flex items-center !gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="!p-1.5 text-slate-400 hover:text-purple-400 transition-colors rounded"
              title="Edit"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm((v) => !v)}
              className="!p-1.5 text-slate-400 hover:text-red-400 transition-colors rounded"
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={onClose}
              className="!p-1.5 text-slate-400 hover:text-slate-200 transition-colors rounded"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>
        }
      >
        <span className="flex items-center !gap-2 flex-wrap text-base leading-snug">
          {problem.title}
          {problem.url && (
            <a href={problem.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-purple-400 flex-shrink-0">
              <ExternalLink size={14} />
            </a>
          )}
        </span>
      </CardTitle>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="!mb-4 !p-3 rounded-lg border border-red-500/30 bg-red-500/10">
          <p className="text-sm text-slate-300 !mb-3">
            Delete <strong>{problem.title}</strong>? This cannot be undone.
          </p>
          <div className="flex !gap-2">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={isDeleting} style={{ background: "#ef4444", color: "#fff" }}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      )}

      {/* Meta badges */}
      <div className="flex flex-wrap !gap-2 items-center !mb-4">
        <span
          className="text-xs font-semibold !px-2.5 !py-1 rounded-full"
          style={{
            background: DIFFICULTY_COLORS[problem.difficulty] + "22",
            color: DIFFICULTY_COLORS[problem.difficulty],
          }}
        >
          {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
        </span>
        <span
          className="text-xs font-semibold !px-2.5 !py-1 rounded-full"
          style={{
            background: STATUS_COLORS[problem.status] + "22",
            color: STATUS_COLORS[problem.status],
          }}
        >
          {problem.status.charAt(0).toUpperCase() + problem.status.slice(1)}
        </span>
        <span className="text-xs text-slate-400">
          {problem.platform}{problem.problemNumber ? ` #${problem.problemNumber}` : ""}
        </span>
        {topicName && (
          <span className="text-xs text-slate-500">· {topicName}</span>
        )}
      </div>

      {/* Complexity + language */}
      {(problem.timeComplexity || problem.spaceComplexity || problem.language) && (
        <div className="flex flex-wrap !gap-4 text-xs text-slate-400 !mb-4 !p-3 rounded-lg" style={{ background: "rgba(30,41,59,0.5)" }}>
          {problem.timeComplexity && (
            <span>Time: <span className="text-slate-200 font-medium">{problem.timeComplexity}</span></span>
          )}
          {problem.spaceComplexity && (
            <span>Space: <span className="text-slate-200 font-medium">{problem.spaceComplexity}</span></span>
          )}
          {problem.language && (
            <span>Lang: <span className="text-slate-200 font-medium">{problem.language}</span></span>
          )}
        </div>
      )}

      {/* Tags */}
      {problem.tags?.length > 0 && (
        <div className="flex flex-wrap !gap-1.5 !mb-4">
          {problem.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs !px-2.5 !py-1 rounded-full border border-slate-600 text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Notes */}
      {problem.notes ? (
        <div className="!mb-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide !mb-2">Notes</p>
          <div className="rounded-lg !p-3 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed" style={{ background: "rgba(15,23,42,0.5)" }}>
            {problem.notes}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs text-slate-500 hover:text-purple-400 transition-colors !mb-4 block"
        >
          + Add notes, approach, intuition...
        </button>
      )}

      {/* Review section */}
      {canReview && (
        <div className="border-t border-slate-700/60 !pt-4">
          <div className="flex items-center justify-between !mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center !gap-1.5">
              <RotateCcw size={12} /> Review
            </p>
            {nextReviewText && (
              <span className={`text-xs ${nextReviewText === "Due now" ? "text-amber-400" : "text-slate-500"}`}>
                Next: {nextReviewText}
              </span>
            )}
          </div>
          {problem.reviewCount > 0 && (
            <p className="text-xs text-slate-500 !mb-3">
              Reviewed {problem.reviewCount} time{problem.reviewCount !== 1 ? "s" : ""}
            </p>
          )}
          <div className="grid grid-cols-4 !gap-2">
            {REVIEW_BUTTONS.map(({ label, value, days }) => (
              <button
                key={value}
                onClick={() => handleReview(value)}
                disabled={isReviewing}
                className="flex flex-col items-center !gap-1 !py-2.5 rounded-lg border border-slate-600 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all disabled:opacity-50"
              >
                <span className="text-xs font-semibold text-slate-200">{label}</span>
                <span className="text-[10px] text-slate-500">{days}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
