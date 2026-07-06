"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ExternalLink, Filter, RotateCcw, X, CheckCircle2, Clock, Circle } from "lucide-react";
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

interface Topic { id: string; name: string; }
interface ProblemsPageProps { topics: Topic[]; }

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

const EMPTY_FORM: ProblemCreateInput = {
  topicId: null, title: "", platform: "", problemNumber: "", url: "",
  difficulty: "medium", status: "unsolved", tags: [], notes: "",
  timeComplexity: "", spaceComplexity: "", language: "",
};

export default function ProblemsPage({ topics }: ProblemsPageProps) {
  const { showSuccess, showError } = useToast();
  const [problems, setProblems]   = useState<ApiProblem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [subView, setSubView]     = useState<SubView>("all");
  const [selected, setSelected]   = useState<ApiProblem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving]   = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [form, setForm]           = useState<ProblemCreateInput>({ ...EMPTY_FORM });

  const [filterTopic,      setFilterTopic]      = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterStatus,     setFilterStatus]     = useState("");
  const [filterPlatform,   setFilterPlatform]   = useState("");

  const topicMap       = Object.fromEntries(topics.map((t) => [t.id, t.name]));
  const activeFilters  = [filterTopic, filterDifficulty, filterStatus, filterPlatform].filter(Boolean).length;
  const hasFilters     = activeFilters > 0;

  const clearFilters = () => {
    setFilterTopic(""); setFilterDifficulty(""); setFilterStatus(""); setFilterPlatform("");
  };

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const filters = subView === "review"
        ? { due: true }
        : {
            topicId:    filterTopic      || undefined,
            difficulty: filterDifficulty || undefined,
            status:     filterStatus     || undefined,
            platform:   filterPlatform   || undefined,
          };
      const res = await problemsAPI.getAll(filters);
      setProblems(res.data ?? []);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to load problems");
    } finally {
      setLoading(false);
    }
  }, [subView, filterTopic, filterDifficulty, filterStatus, filterPlatform, showError]);

  useEffect(() => { fetchProblems(); }, [fetchProblems]);

  const handleAdd = async () => {
    if (!form.title.trim() || !form.platform.trim()) { showError("Title and platform are required."); return; }
    setIsSaving(true);
    try {
      const res = await problemsAPI.create(form);
      setProblems((prev) => [res.data, ...prev]);
      setIsAddOpen(false);
      setForm({ ...EMPTY_FORM });
      showSuccess("Problem added.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to add problem.");
    } finally { setIsSaving(false); }
  };

  const handleUpdate = (updated: ApiProblem) => {
    setProblems((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    if (selected?._id === updated._id) setSelected(updated);
  };

  const handleDelete = async (id: string) => {
    try {
      await problemsAPI.delete(id);
      setProblems((prev) => prev.filter((p) => p._id !== id));
      setSelected(null);
      showSuccess("Problem deleted.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to delete.");
    }
  };

  const handleSave   = async (id: string, data: Partial<ProblemCreateInput>) => (await problemsAPI.update(id, data)).data;
  const handleReview = async (id: string, c: "easy"|"medium"|"hard"|"again")  => (await problemsAPI.review(id, c)).data;

  const dueCount = problems.filter(
    (p) => p.nextReview && new Date(p.nextReview) <= new Date() &&
           (p.status === "solved" || p.status === "attempted"),
  ).length;

  const selectCls = "w-full text-sm rounded-lg !px-3 !py-2 border border-slate-600 bg-slate-900 text-slate-200 focus:outline-none focus:border-purple-500";

  return (
    <div className="flex !gap-5 items-start">
      {/* ── Main column ── */}
      <div className={selected ? "flex-1 min-w-0" : "w-full"}>
        <Card>
          {/* Header */}
          <div className="flex items-start justify-between !mb-5">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#f8fafc" }}>Problems</h1>
              <p className="!mt-1 text-sm" style={{ color: "#94a3b8" }}>
                {loading ? "Loading…" : `${problems.length} problem${problems.length !== 1 ? "s" : ""} tracked`}
                {dueCount > 0 && (
                  <span style={{ color: "#f59e0b" }}> · {dueCount} due for review</span>
                )}
              </p>
            </div>
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus size={15} /> Add Problem
            </Button>
          </div>

          {/* Toolbar: tabs + filter toggle */}
          <div className="flex items-center justify-between !mb-5">
            {/* Segmented control */}
            <div
              className="flex items-center !gap-1 !p-1 rounded-xl"
              style={{ background: "rgba(30,41,66,0.8)", border: "1px solid rgba(71,85,105,0.5)" }}
            >
              <button
                onClick={() => setSubView("all")}
                className="!px-4 !py-1.5 rounded-lg text-sm font-medium transition-all"
                style={
                  subView === "all"
                    ? { background: "#7c3aed", color: "#fff" }
                    : { color: "#94a3b8" }
                }
              >
                All Problems
              </button>
              <button
                onClick={() => setSubView("review")}
                className="flex items-center !gap-2 !px-4 !py-1.5 rounded-lg text-sm font-medium transition-all"
                style={
                  subView === "review"
                    ? { background: "#d97706", color: "#fff" }
                    : { color: "#94a3b8" }
                }
              >
                <RotateCcw size={13} />
                Review Queue
                {dueCount > 0 && (
                  <span
                    className="text-xs font-bold rounded-full !px-1.5 !py-0.5 leading-none"
                    style={
                      subView === "review"
                        ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                        : { background: "#d97706", color: "#fff" }
                    }
                  >
                    {dueCount}
                  </span>
                )}
              </button>
            </div>

            {/* Filter button */}
            {subView === "all" && (
              <button
                onClick={() => setShowFilters((v) => !v)}
                className="flex items-center !gap-2 !px-3 !py-1.5 rounded-lg text-sm font-medium transition-all"
                style={
                  showFilters || hasFilters
                    ? { background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.4)", color: "#c4b5fd" }
                    : { background: "rgba(30,41,66,0.6)", border: "1px solid rgba(71,85,105,0.5)", color: "#94a3b8" }
                }
              >
                <Filter size={14} />
                Filters
                {hasFilters && (
                  <span
                    className="text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none"
                    style={{ background: "#7c3aed", color: "#fff" }}
                  >
                    {activeFilters}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Filter panel */}
          {subView === "all" && showFilters && (
            <div
              className="!mb-5 !p-4 rounded-xl"
              style={{ background: "rgba(30,41,66,0.7)", border: "1px solid rgba(71,85,105,0.4)" }}
            >
              <div className="grid grid-cols-2 !gap-3">
                {[
                  { label: "Topic", content: (
                    <select value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)} className={selectCls}>
                      <option value="">All topics</option>
                      {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  )},
                  { label: "Difficulty", content: (
                    <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} className={selectCls}>
                      <option value="">All</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  )},
                  { label: "Status", content: (
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectCls}>
                      <option value="">All</option>
                      <option value="unsolved">Unsolved</option>
                      <option value="attempted">Attempted</option>
                      <option value="solved">Solved</option>
                    </select>
                  )},
                  { label: "Platform", content: (
                    <input type="text" placeholder="e.g. LeetCode" value={filterPlatform}
                      onChange={(e) => setFilterPlatform(e.target.value)} className={selectCls}
                      style={{ color: "#e2e8f0" }} />
                  )},
                ].map(({ label, content }) => (
                  <div key={label}>
                    <p className="text-xs font-semibold !mb-1.5 uppercase tracking-wider" style={{ color: "#64748b" }}>{label}</p>
                    {content}
                  </div>
                ))}
              </div>
              {hasFilters && (
                <div className="!mt-3 !pt-3" style={{ borderTop: "1px solid rgba(71,85,105,0.4)" }}>
                  <button
                    onClick={clearFilters}
                    className="flex items-center !gap-1 text-xs transition-colors"
                    style={{ color: "#64748b" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                  >
                    <X size={12} /> Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Problem list */}
          {loading ? (
            <div className="!space-y-2">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "rgba(45,55,72,0.4)" }} />
              ))}
            </div>
          ) : problems.length === 0 ? (
            <div className="text-center !py-16">
              {subView === "review" ? (
                <>
                  <RotateCcw size={40} className="!mx-auto !mb-4" style={{ color: "#334155" }} />
                  <p className="text-lg font-semibold !mb-2" style={{ color: "#e2e8f0" }}>All caught up!</p>
                  <p className="text-sm" style={{ color: "#64748b" }}>No problems due for review right now.</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold !mb-2" style={{ color: "#e2e8f0" }}>No problems yet</p>
                  <p className="text-sm !mb-6" style={{ color: "#64748b" }}>Add your first problem to start tracking.</p>
                  <Button onClick={() => setIsAddOpen(true)}><Plus size={15} /> Add Problem</Button>
                </>
              )}
            </div>
          ) : (
            <div className="!space-y-2">
              {problems.map((p) => {
                const isDue = p.nextReview && new Date(p.nextReview) <= new Date() &&
                              (p.status === "solved" || p.status === "attempted");
                const isSelected = selected?._id === p._id;
                const diffColor   = DIFF_COLOR[p.difficulty];
                const statusColor = STATUS_COLOR[p.status];
                const StatusIcon  = p.status === "solved" ? CheckCircle2 : p.status === "attempted" ? Clock : Circle;

                return (
                  <div
                    key={p._id}
                    onClick={() => setSelected(isSelected ? null : p)}
                    className="flex items-center !gap-4 !px-4 !py-3.5 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: isSelected
                        ? "rgba(124,58,237,0.15)"
                        : "rgba(45,55,72,0.4)",
                      border: isSelected
                        ? "1px solid rgba(124,58,237,0.35)"
                        : "1px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "rgba(55,65,82,0.6)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "rgba(45,55,72,0.4)";
                    }}
                  >
                    {/* Status icon */}
                    <StatusIcon size={18} className="flex-shrink-0" style={{ color: statusColor }} />

                    {/* Title + meta */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold truncate" style={{ color: "#f1f5f9" }}>
                        {p.title}
                      </p>
                      <p className="text-xs !mt-0.5 truncate" style={{ color: "#64748b" }}>
                        {p.platform}{p.problemNumber ? ` #${p.problemNumber}` : ""}
                        {topicMap[p.topicId ?? ""] ? ` · ${topicMap[p.topicId!]}` : ""}
                      </p>
                    </div>

                    {/* Right: due + difficulty + link */}
                    <div className="flex items-center !gap-3 flex-shrink-0">
                      {isDue && (
                        <span className="flex items-center !gap-1 text-xs font-semibold" style={{ color: "#f59e0b" }}>
                          <RotateCcw size={11} /> Due
                        </span>
                      )}
                      <span
                        className="text-xs font-bold !px-2.5 !py-0.5 rounded-md"
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
                          <ExternalLink size={14} />
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

      {/* ── Detail panel ── */}
      {selected && (
        <div className="w-[380px] flex-shrink-0">
          <ProblemDetail
            problem={selected}
            topics={topics}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onClose={() => setSelected(null)}
            onReview={handleReview}
            onSave={handleSave}
          />
        </div>
      )}

      {/* ── Add Problem Modal ── */}
      <Modal isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); setForm({ ...EMPTY_FORM }); }} title="Add Problem">
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
              <select value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as Difficulty }))}
                className="w-full text-sm rounded-md !px-3 !py-2 border border-slate-600 bg-slate-800 focus:outline-none" style={{ color: "#e2e8f0" }}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-xs !mb-1" style={{ color: "#94a3b8" }}>Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))}
                className="w-full text-sm rounded-md !px-3 !py-2 border border-slate-600 bg-slate-800 focus:outline-none" style={{ color: "#e2e8f0" }}>
                <option value="unsolved">Unsolved</option>
                <option value="attempted">Attempted</option>
                <option value="solved">Solved</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs !mb-1" style={{ color: "#94a3b8" }}>Topic (optional)</label>
            <select value={form.topicId ?? ""} onChange={(e) => setForm((f) => ({ ...f, topicId: e.target.value || null }))}
              className="w-full text-sm rounded-md !px-3 !py-2 border border-slate-600 bg-slate-800 focus:outline-none" style={{ color: "#e2e8f0" }}>
              <option value="">No topic</option>
              {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
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
          <Button variant="secondary" onClick={() => { setIsAddOpen(false); setForm({ ...EMPTY_FORM }); }} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleAdd} disabled={isSaving}>{isSaving ? "Adding…" : "Add Problem"}</Button>
        </div>
      </Modal>
    </div>
  );
}
