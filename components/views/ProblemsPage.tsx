"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ExternalLink, Filter, RotateCcw } from "lucide-react";
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
type SubView = "all" | "review";

interface Topic {
  id: string;
  name: string;
}

interface ProblemsPageProps {
  topics: Topic[];
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

const EMPTY_FORM: ProblemCreateInput = {
  topicId: null,
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

export default function ProblemsPage({ topics }: ProblemsPageProps) {
  const { showSuccess, showError } = useToast();
  const [problems, setProblems] = useState<ApiProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subView, setSubView] = useState<SubView>("all");
  const [selectedProblem, setSelectedProblem] = useState<ApiProblem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<ProblemCreateInput>({ ...EMPTY_FORM });

  const [filterTopic, setFilterTopic] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");

  const topicMap = Object.fromEntries(topics.map((t) => [t.id, t.name]));

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const filters =
        subView === "review"
          ? { due: true }
          : {
              topicId: filterTopic || undefined,
              difficulty: filterDifficulty || undefined,
              status: filterStatus || undefined,
              platform: filterPlatform || undefined,
            };
      const res = await problemsAPI.getAll(filters);
      setProblems(res.data ?? []);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to load problems");
    } finally {
      setLoading(false);
    }
  }, [subView, filterTopic, filterDifficulty, filterStatus, filterPlatform, showError]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const handleAdd = async () => {
    if (!form.title.trim() || !form.platform.trim()) {
      showError("Title and platform are required.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await problemsAPI.create(form);
      setProblems((prev) => [res.data, ...prev]);
      setIsAddOpen(false);
      setForm({ ...EMPTY_FORM });
      showSuccess("Problem added.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to add problem.");
    } finally {
      setIsSaving(false);
    }
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

  const handleSave = async (id: string, data: Partial<ProblemCreateInput>) => {
    const res = await problemsAPI.update(id, data);
    return res.data;
  };

  const handleReview = async (
    id: string,
    confidence: "easy" | "medium" | "hard" | "again",
  ) => {
    const res = await problemsAPI.review(id, confidence);
    return res.data;
  };

  const dueCount = problems.filter(
    (p) =>
      p.nextReview &&
      new Date(p.nextReview) <= new Date() &&
      (p.status === "solved" || p.status === "attempted"),
  ).length;

  const hasFilters = !!(filterTopic || filterDifficulty || filterStatus || filterPlatform);

  return (
    <div className="flex gap-4 items-start">
      {/* Main panel */}
      <div className={selectedProblem ? "flex-1 min-w-0" : "w-full"}>
        <Card>
          {/* Title row */}
          <CardTitle
            action={
              <Button onClick={() => setIsAddOpen(true)}>
                <Plus size={16} />
                Add Problem
              </Button>
            }
          >
            Problems
            <span className="text-sm font-normal text-slate-400 ml-2">
              {problems.length}
            </span>
          </CardTitle>

          {/* Sub-view toggles */}
          <div className="flex gap-2 !mb-4">
            <button
              onClick={() => setSubView("all")}
              className={`text-sm px-3 py-1 rounded-md border transition-all ${
                subView === "all"
                  ? "border-purple-500 bg-purple-500/20 text-purple-300"
                  : "border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300"
              }`}
            >
              All Problems
            </button>
            <button
              onClick={() => setSubView("review")}
              className={`text-sm px-3 py-1 rounded-md border transition-all flex items-center gap-1.5 ${
                subView === "review"
                  ? "border-amber-500 bg-amber-500/20 text-amber-300"
                  : "border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300"
              }`}
            >
              <RotateCcw size={13} />
              Review Queue
              {dueCount > 0 && subView !== "review" && (
                <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                  {dueCount}
                </span>
              )}
            </button>
          </div>

          {/* Filters */}
          {subView === "all" && (
            <div className="flex flex-wrap gap-2 items-center !mb-4 !pb-4 border-b border-slate-700/50">
              <Filter size={13} className="text-slate-500" />
              <select
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
                className="text-xs rounded-md px-2 py-1.5 border border-slate-600 bg-slate-800 text-slate-300 focus:outline-none"
              >
                <option value="">All topics</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="text-xs rounded-md px-2 py-1.5 border border-slate-600 bg-slate-800 text-slate-300 focus:outline-none"
              >
                <option value="">Any difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs rounded-md px-2 py-1.5 border border-slate-600 bg-slate-800 text-slate-300 focus:outline-none"
              >
                <option value="">Any status</option>
                <option value="unsolved">Unsolved</option>
                <option value="attempted">Attempted</option>
                <option value="solved">Solved</option>
              </select>
              <input
                type="text"
                placeholder="Platform..."
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="text-xs rounded-md px-2 py-1.5 border border-slate-600 bg-slate-800 text-slate-300 focus:outline-none w-28"
              />
              {hasFilters && (
                <button
                  onClick={() => {
                    setFilterTopic("");
                    setFilterDifficulty("");
                    setFilterStatus("");
                    setFilterPlatform("");
                  }}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* List */}
          {loading ? (
            <p className="text-slate-400 text-sm py-8 text-center">Loading...</p>
          ) : problems.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              {subView === "review" ? (
                <>
                  <RotateCcw size={28} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No problems due for review.</p>
                  <p className="text-xs mt-1 text-slate-500">
                    Use the review buttons on a solved or attempted problem to schedule it.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm mb-4">No problems yet. Start tracking your practice.</p>
                  <Button onClick={() => setIsAddOpen(true)}>
                    <Plus size={16} />
                    Add Problem
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-0.5">
              {problems.map((p) => {
                const isDue =
                  p.nextReview &&
                  new Date(p.nextReview) <= new Date() &&
                  (p.status === "solved" || p.status === "attempted");
                return (
                  <div
                    key={p._id}
                    onClick={() =>
                      setSelectedProblem(
                        selectedProblem?._id === p._id ? null : p,
                      )
                    }
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all border ${
                      selectedProblem?._id === p._id
                        ? "border-purple-500/50 bg-purple-500/10"
                        : "border-transparent hover:border-slate-600/60 hover:bg-slate-700/40"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: DIFFICULTY_COLORS[p.difficulty] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 font-medium truncate">
                        {p.platform}
                        {p.problemNumber ? ` #${p.problemNumber}` : ""} —{" "}
                        {p.title}
                      </p>
                      {topicMap[p.topicId ?? ""] && (
                        <p className="text-xs text-slate-500 truncate">
                          {topicMap[p.topicId!]}
                        </p>
                      )}
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: STATUS_COLORS[p.status] + "22",
                        color: STATUS_COLORS[p.status],
                      }}
                    >
                      {p.status}
                    </span>
                    {isDue && (
                      <span className="text-xs text-amber-400 flex-shrink-0 flex items-center gap-1">
                        <RotateCcw size={11} />
                        due
                      </span>
                    )}
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-500 hover:text-purple-400 flex-shrink-0"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Detail panel */}
      {selectedProblem && (
        <div className="w-[400px] flex-shrink-0">
          <ProblemDetail
            problem={selectedProblem}
            topics={topics}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onClose={() => setSelectedProblem(null)}
            onReview={handleReview}
            onSave={handleSave}
          />
        </div>
      )}

      {/* Add Problem Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setForm({ ...EMPTY_FORM });
        }}
        title="Add Problem"
      >
        <div className="space-y-3">
          <Input
            label="Title *"
            placeholder="Two Sum"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Platform *"
              placeholder="LeetCode"
              value={form.platform}
              onChange={(e) =>
                setForm((f) => ({ ...f, platform: e.target.value }))
              }
            />
            <Input
              label="Problem #"
              placeholder="1"
              value={form.problemNumber ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, problemNumber: e.target.value }))
              }
            />
          </div>
          <Input
            label="URL"
            placeholder="https://leetcode.com/problems/two-sum"
            value={form.url ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Difficulty
              </label>
              <select
                value={form.difficulty}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    difficulty: e.target.value as Difficulty,
                  }))
                }
                className="w-full text-sm rounded-md px-3 py-2 border border-slate-600 bg-slate-800 text-slate-200 focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as Status }))
                }
                className="w-full text-sm rounded-md px-3 py-2 border border-slate-600 bg-slate-800 text-slate-200 focus:outline-none"
              >
                <option value="unsolved">Unsolved</option>
                <option value="attempted">Attempted</option>
                <option value="solved">Solved</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Topic (optional)
            </label>
            <select
              value={form.topicId ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, topicId: e.target.value || null }))
              }
              className="w-full text-sm rounded-md px-3 py-2 border border-slate-600 bg-slate-800 text-slate-200 focus:outline-none"
            >
              <option value="">No topic</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Time Complexity"
              placeholder="O(n)"
              value={form.timeComplexity ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, timeComplexity: e.target.value }))
              }
            />
            <Input
              label="Space Complexity"
              placeholder="O(1)"
              value={form.spaceComplexity ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, spaceComplexity: e.target.value }))
              }
            />
          </div>
          <Input
            label="Language"
            placeholder="Python"
            value={form.language ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, language: e.target.value }))
            }
          />
          <div>
            <label className="block text-xs text-slate-400 mb-1">Tags</label>
            <TagInput
              tags={form.tags ?? []}
              onChange={(tags) => setForm((f) => ({ ...f, tags }))}
            />
          </div>
          <Textarea
            label="Notes / Approach / Intuition"
            rows={4}
            value={form.notes ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, notes: e.target.value }))
            }
          />
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setIsAddOpen(false);
              setForm({ ...EMPTY_FORM });
            }}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={isSaving}>
            {isSaving ? "Adding..." : "Add Problem"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
