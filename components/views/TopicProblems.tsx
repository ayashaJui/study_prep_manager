"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ExternalLink, CheckCircle2, Clock, Circle } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import TagInput from "@/components/ui/TagInput";
import ProblemDetail from "@/components/views/ProblemDetail";
import { problemsAPI, ApiProblem, ProblemCreateInput } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

type Difficulty = "easy" | "medium" | "hard";
type Status = "unsolved" | "attempted" | "solved";

const DIFF_COLOR: Record<Difficulty, string> = {
  easy: "#22c55e",
  medium: "#f59e0b",
  hard: "#ef4444",
};
const STATUS_COLOR: Record<Status, string> = {
  unsolved: "#64748b",
  attempted: "#f59e0b",
  solved: "#22c55e",
};

interface TopicProblemsProps {
  topicId: string;
  topicName: string;
}

const EMPTY_FORM: ProblemCreateInput = {
  topicId: "",
  title: "",
  platform: "",
  problemNumber: "",
  url: "",
  difficulty: "medium",
  status: "unsolved",
  tags: [],
  notes: "",
  timeComplexity: "",
  spaceComplexity: "",
  language: "",
};

export default function TopicProblems({ topicId, topicName }: TopicProblemsProps) {
  const { showSuccess, showError } = useToast();
  const [problems, setProblems]         = useState<ApiProblem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selectedProblem, setSelectedProblem] = useState<ApiProblem | null>(null);
  const [isAddOpen, setIsAddOpen]       = useState(false);
  const [isSaving, setIsSaving]         = useState(false);
  const [form, setForm]                 = useState<ProblemCreateInput>({ ...EMPTY_FORM, topicId });

  const fetchProblems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await problemsAPI.getAll({ topicId });
      setProblems(res.data ?? []);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to load problems");
    } finally {
      setLoading(false);
    }
  }, [topicId, showError]);

  useEffect(() => { fetchProblems(); }, [fetchProblems]);

  const handleAdd = async () => {
    if (!form.title.trim() || !form.platform.trim()) {
      showError("Title and platform are required.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await problemsAPI.create({ ...form, topicId });
      setProblems((prev) => [res.data, ...prev]);
      setIsAddOpen(false);
      setForm({ ...EMPTY_FORM, topicId });
      showSuccess("Problem added.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to add problem.");
    } finally { setIsSaving(false); }
  };

  const handleUpdate = (updated: ApiProblem) => {
    setProblems((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    if (selectedProblem?._id === updated._id) setSelectedProblem(updated);
  };

  const handleDelete = async (id: string) => {
    try {
      await problemsAPI.delete(id);
      setProblems((prev) => prev.filter((p) => p._id !== id));
      setSelectedProblem(null);
      showSuccess("Problem deleted.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to delete.");
    }
  };

  const handleSave   = async (id: string, data: Partial<ProblemCreateInput>) => (await problemsAPI.update(id, data)).data;
  const handleReview = async (id: string, confidence: "easy"|"medium"|"hard"|"again") => (await problemsAPI.review(id, confidence)).data;

  return (
    <>
      <div className="flex !gap-5 items-start">
        {/* List panel */}
        <div className={selectedProblem ? "flex-1 min-w-0" : "w-full"}>
          <Card>
            <CardTitle
              action={
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus size={16} /> Add Problem
                </Button>
              }
            >
              Problems
              <span className="text-sm font-normal !ml-2" style={{ color: "#94a3b8" }}>
                {problems.length}
              </span>
            </CardTitle>

            {loading ? (
              <div className="!space-y-2">
                {[1,2,3].map((i) => (
                  <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "rgba(45,55,72,0.4)" }} />
                ))}
              </div>
            ) : problems.length === 0 ? (
              <div className="text-center !py-12">
                <p className="text-sm !mb-4" style={{ color: "#94a3b8" }}>
                  No problems for {topicName} yet.
                </p>
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus size={16} /> Add Problem
                </Button>
              </div>
            ) : (
              <div className="!space-y-2">
                {problems.map((p) => {
                  const isSelected = selectedProblem?._id === p._id;
                  const diffColor   = DIFF_COLOR[p.difficulty];
                  const statusColor = STATUS_COLOR[p.status];
                  const StatusIcon  = p.status === "solved" ? CheckCircle2 : p.status === "attempted" ? Clock : Circle;

                  return (
                    <div
                      key={p._id}
                      onClick={() => setSelectedProblem(isSelected ? null : p)}
                      className="flex items-center !gap-4 !px-4 !py-3.5 rounded-xl cursor-pointer transition-all"
                      style={{
                        background: isSelected ? "rgba(124,58,237,0.15)" : "rgba(45,55,72,0.4)",
                        border: isSelected ? "1px solid rgba(124,58,237,0.35)" : "1px solid transparent",
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(55,65,82,0.6)"; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(45,55,72,0.4)"; }}
                    >
                      {/* Status icon */}
                      <StatusIcon size={17} className="flex-shrink-0" style={{ color: statusColor }} />

                      {/* Title + meta */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "#f1f5f9" }}>
                          {p.title}
                        </p>
                        <p className="text-xs !mt-0.5 truncate" style={{ color: "#64748b" }}>
                          {p.platform}{p.problemNumber ? ` #${p.problemNumber}` : ""}
                        </p>
                      </div>

                      {/* Difficulty + link */}
                      <div className="flex items-center !gap-2 flex-shrink-0">
                        <span
                          className="text-xs font-bold !px-2 !py-0.5 rounded-md"
                          style={{
                            color: diffColor,
                            background: diffColor + "20",
                            border: `1px solid ${diffColor}50`,
                          }}
                        >
                          {p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1)}
                        </span>
                        {p.url && (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: "#475569" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Detail panel */}
        {selectedProblem && (
          <div className="w-[380px] flex-shrink-0">
            <ProblemDetail
              problem={selectedProblem}
              topics={[{ id: topicId, name: topicName }]}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onClose={() => setSelectedProblem(null)}
              onReview={handleReview}
              onSave={handleSave}
            />
          </div>
        )}
      </div>

      {/* Add Problem Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => { setIsAddOpen(false); setForm({ ...EMPTY_FORM, topicId }); }}
        title="Add Problem"
      >
        <div className="!space-y-3">
          <Input label="Title *" placeholder="Two Sum" value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <div className="grid grid-cols-2 !gap-3">
            <Input label="Platform *" placeholder="LeetCode" value={form.platform}
              onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))} />
            <Input label="Problem #" placeholder="1" value={form.problemNumber ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, problemNumber: e.target.value }))} />
          </div>
          <Input label="URL" placeholder="https://leetcode.com/problems/two-sum" value={form.url ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />
          <div className="grid grid-cols-2 !gap-3">
            <div>
              <label className="block text-xs !mb-1" style={{ color: "#94a3b8" }}>Difficulty</label>
              <select value={form.difficulty}
                onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as Difficulty }))}
                className="w-full text-sm rounded-md !px-3 !py-2 border border-slate-600 bg-slate-800 focus:outline-none"
                style={{ color: "#e2e8f0" }}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-xs !mb-1" style={{ color: "#94a3b8" }}>Status</label>
              <select value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))}
                className="w-full text-sm rounded-md !px-3 !py-2 border border-slate-600 bg-slate-800 focus:outline-none"
                style={{ color: "#e2e8f0" }}>
                <option value="unsolved">Unsolved</option>
                <option value="attempted">Attempted</option>
                <option value="solved">Solved</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 !gap-3">
            <Input label="Time Complexity" placeholder="O(n)" value={form.timeComplexity ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, timeComplexity: e.target.value }))} />
            <Input label="Space Complexity" placeholder="O(1)" value={form.spaceComplexity ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, spaceComplexity: e.target.value }))} />
          </div>
          <Input label="Language" placeholder="Python" value={form.language ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))} />
          <div>
            <label className="block text-xs !mb-1" style={{ color: "#94a3b8" }}>Tags</label>
            <TagInput tags={form.tags ?? []} onChange={(tags) => setForm((f) => ({ ...f, tags }))} />
          </div>
          <Textarea label="Notes / Approach / Intuition" rows={4} value={form.notes ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </div>
        <div className="flex !gap-3 justify-end !mt-6">
          <Button variant="secondary" disabled={isSaving}
            onClick={() => { setIsAddOpen(false); setForm({ ...EMPTY_FORM, topicId }); }}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={isSaving}>
            {isSaving ? "Adding…" : "Add Problem"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
