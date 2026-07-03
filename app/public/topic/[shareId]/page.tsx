"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  FileText,
  Layers,
  HelpCircle,
  ArrowLeft,
  Pin,
  Shuffle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Check,
  BookOpen,
  Trophy,
  RefreshCw,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface PublicNote {
  id: string;
  content: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
}

interface PublicFlashcard {
  id: string;
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number | number[];
  explanation: string | null;
}

interface PublicQuiz {
  id: string;
  title: string;
  description: string | null;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  timeLimit: number | null;
  questions: QuizQuestion[];
}

interface PublicTopicData {
  topic: { name: string; description?: string; tags: string[] };
  notes: PublicNote[];
  flashcards: PublicFlashcard[];
  quizzes: PublicQuiz[];
}

type Tab = "notes" | "flashcards" | "quizzes";

// ── Shared helpers ────────────────────────────────────────────────────────────

const diffColor = {
  easy:   { bg: "rgba(16,185,129,0.15)", text: "#6ee7b7", label: "Easy" },
  medium: { bg: "rgba(245,158,11,0.15)", text: "#fcd34d", label: "Medium" },
  hard:   { bg: "rgba(239,68,68,0.15)",  text: "#fca5a5", label: "Hard"  },
};

function DiffBadge({ level }: { level: "easy" | "medium" | "hard" }) {
  const c = diffColor[level];
  return (
    <span
      className="text-xs font-semibold uppercase !px-2.5 !py-1 rounded-full"
      style={{ background: c.bg, color: c.text }}
    >
      {c.label}
    </span>
  );
}

function TagPill({ tag }: { tag: string }) {
  return (
    <span
      className="text-xs !px-2.5 !py-1 rounded-full font-medium"
      style={{ background: "rgba(139,92,246,0.15)", color: "#c4b5fd" }}
    >
      {tag}
    </span>
  );
}

function arraysEqual(a: number[], b: number[]) {
  if (a.length !== b.length) return false;
  return [...a].sort((x, y) => x - y).every((v, i) => v === [...b].sort((x, y) => x - y)[i]);
}

// ── Notes ─────────────────────────────────────────────────────────────────────

function NoteCard({ note }: { note: PublicNote }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = note.content.length > 400;

  return (
    <div
      className="rounded-2xl border border-slate-700/50 !p-6 transition-all hover:border-slate-600/60"
    >
      <div className="flex items-center gap-2 !mb-3">
        {note.pinned && <Pin size={13} className="text-violet-400 shrink-0" />}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 ml-auto">
            {note.tags.map((t) => <TagPill key={t} tag={t} />)}
          </div>
        )}
      </div>

      <div
        className={`prose prose-invert prose-sm max-w-none text-slate-300 ${!expanded && isLong ? "line-clamp-5" : ""}`}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
      </div>

      {isLong && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="!mt-3 text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
        >
          {expanded ? "Show less ↑" : "Read more ↓"}
        </button>
      )}
    </div>
  );
}

function NotesTab({ notes }: { notes: PublicNote[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return notes;
    return notes.filter(
      (n) => n.content.toLowerCase().includes(q) || n.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [notes, query]);

  return (
    <div>
      {notes.length > 2 && (
        <div className="relative !mb-5">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            className="w-full !pl-9 !pr-4 !py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      )}
      {filtered.length === 0 ? (
        <Empty icon={<FileText size={36} />} text={query ? "No notes match your search." : "No notes shared."} />
      ) : (
        <div className="flex flex-col gap-5">
          {filtered.map((n) => <NoteCard key={n.id} note={n} />)}
        </div>
      )}
    </div>
  );
}

// ── Flashcards ────────────────────────────────────────────────────────────────

function FlashcardsTab({ flashcards }: { flashcards: PublicFlashcard[] }) {
  const [deck, setDeck] = useState(flashcards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());

  const current = deck[index];
  const knownCount = known.size;

  const goTo = (next: number) => {
    setFlipped(false);
    setTimeout(() => setIndex(next), 160);
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setIndex(0);
    setFlipped(false);
  };

  const toggleKnown = () => {
    setKnown((prev) => {
      const next = new Set(prev);
      next.has(current.id) ? next.delete(current.id) : next.add(current.id);
      return next;
    });
  };

  const resetProgress = () => {
    setKnown(new Set());
    setIndex(0);
    setFlipped(false);
    setDeck(flashcards);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Stats bar */}
      <div className="w-full max-w-xl flex items-center justify-between">
        <span className="text-sm text-slate-400">
          {index + 1} <span className="text-slate-600">/</span> {deck.length}
        </span>
        <div className="flex items-center gap-2">
          {knownCount > 0 && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <Check size={12} /> {knownCount} known
            </span>
          )}
          <button
            onClick={handleShuffle}
            title="Shuffle"
            className="!p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
          >
            <Shuffle size={15} />
          </button>
          {knownCount > 0 && (
            <button
              onClick={resetProgress}
              title="Reset progress"
              className="!p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
            >
              <RefreshCw size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xl">
        <div className="h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
          <div
            className="h-full rounded-full bg-violet-500 transition-all duration-300"
            style={{ width: `${((index + 1) / deck.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Flip card */}
      <div
        className="w-full max-w-xl cursor-pointer select-none"
        style={{ perspective: "1200px", height: "300px" }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl border flex flex-col items-center justify-center !p-8 text-center"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              background: known.has(current.id) ? "rgba(16,185,129,0.06)" : "rgba(30,41,66,0.65)",
              borderColor: known.has(current.id) ? "rgba(16,185,129,0.3)" : "rgba(100,116,139,0.3)",
            }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-400 !mb-5">
              Question
            </span>
            <p className="text-xl font-semibold text-slate-100 leading-snug !mb-6">
              {current.front}
            </p>
            <div className="flex items-center gap-3">
              <DiffBadge level={current.difficulty} />
              <span className="text-xs text-slate-500">Tap to flip</span>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl border border-violet-500/30 flex flex-col items-center justify-center !p-8 text-center"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "rgba(109,40,217,0.12)",
            }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-400 !mb-5">
              Answer
            </span>
            <p className="text-lg text-slate-100 leading-relaxed">{current.back}</p>
          </div>
        </div>
      </div>

      {/* Tags */}
      {current.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {current.tags.map((t) => <TagPill key={t} tag={t} />)}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => goTo(Math.max(0, index - 1))}
          disabled={index === 0}
          className="flex items-center gap-1.5 !px-4 !py-2 rounded-xl text-sm border disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-violet-500"
          style={{ background: "rgba(30,41,66,0.6)", borderColor: "rgba(100,116,139,0.4)", color: "#cbd5e1" }}
        >
          <ChevronLeft size={16} /> Prev
        </button>

        <button
          onClick={toggleKnown}
          className="flex items-center gap-1.5 !px-4 !py-2 rounded-xl text-sm font-medium border transition-all"
          style={
            known.has(current.id)
              ? { background: "rgba(16,185,129,0.15)", borderColor: "rgba(16,185,129,0.4)", color: "#6ee7b7" }
              : { background: "rgba(30,41,66,0.6)", borderColor: "rgba(100,116,139,0.4)", color: "#94a3b8" }
          }
        >
          <Check size={14} />
          {known.has(current.id) ? "Known" : "Mark known"}
        </button>

        <button
          onClick={() => setFlipped((f) => !f)}
          className="flex items-center gap-1.5 !px-4 !py-2 rounded-xl text-sm border transition-all"
          style={{ background: "rgba(109,40,217,0.12)", borderColor: "rgba(139,92,246,0.35)", color: "#c4b5fd" }}
        >
          <RotateCcw size={13} /> Flip
        </button>

        <button
          onClick={() => goTo(Math.min(deck.length - 1, index + 1))}
          disabled={index === deck.length - 1}
          className="flex items-center gap-1.5 !px-4 !py-2 rounded-xl text-sm border disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-violet-500"
          style={{ background: "rgba(30,41,66,0.6)", borderColor: "rgba(100,116,139,0.4)", color: "#cbd5e1" }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>

      {/* Dot nav */}
      {deck.length > 1 && (
        <div className="flex flex-wrap gap-2 justify-center max-w-xl">
          {deck.map((card, i) => (
            <button
              key={card.id}
              onClick={() => goTo(i)}
              className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
              style={{
                background: i === index ? "#8b5cf6" : known.has(card.id) ? "rgba(16,185,129,0.25)" : "rgba(30,41,66,0.6)",
                border: `1px solid ${i === index ? "#8b5cf6" : known.has(card.id) ? "rgba(16,185,129,0.4)" : "rgba(100,116,139,0.3)"}`,
                color: i === index ? "#fff" : known.has(card.id) ? "#6ee7b7" : "#94a3b8",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Completion banner */}
      {knownCount === deck.length && (
        <div
          className="w-full max-w-xl rounded-2xl border border-emerald-500/30 !p-4 flex items-center gap-3 text-emerald-300"
          style={{ background: "rgba(16,185,129,0.1)" }}
        >
          <Trophy size={20} className="shrink-0" />
          <div>
            <p className="font-semibold text-sm">All cards marked as known!</p>
            <button onClick={resetProgress} className="text-xs text-emerald-400 hover:underline">
              Reset and practice again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Quiz player ───────────────────────────────────────────────────────────────

function QuizPlayer({ quiz, onBack }: { quiz: PublicQuiz; onBack: () => void }) {
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<(number[] | null)[]>(
    Array(quiz.questions.length).fill(null),
  );
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : null);

  const current = quiz.questions[qIndex];
  const correctArr = (ca: number | number[]) => (Array.isArray(ca) ? ca : [ca]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted) return;
    const t = setInterval(() => setTimeLeft((p) => (p !== null && p > 1 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [timeLeft, submitted]);

  useEffect(() => {
    if (timeLeft === 0 && !submitted) handleSubmit();
  }, [timeLeft]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const toggle = (optIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => {
      const next = [...prev];
      const cur = next[qIndex] || [];
      next[qIndex] = cur.includes(optIdx) ? cur.filter((x) => x !== optIdx) : [...cur, optIdx];
      if (next[qIndex].length === 0) next[qIndex] = null;
      return next;
    });
  };

  const handleSubmit = () => setSubmitted(true);

  const score = submitted
    ? answers.reduce<number>((acc, ans, i) => {
        if (!ans) return acc;
        const ca = correctArr(quiz.questions[i].correctAnswer);
        return acc + (arraysEqual(ans, ca) ? 1 : 0);
      }, 0)
    : 0;

  const pct = Math.round((score / quiz.questions.length) * 100);

  if (submitted) {
    return (
      <div className="flex flex-col gap-6">
        {/* Score */}
        <div
          className="rounded-2xl border border-slate-700/50 !p-8 text-center"
          style={{ background: "rgba(30,41,66,0.5)" }}
        >
          <div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full !mb-4"
            style={{
              background:
                pct >= 80
                  ? "rgba(16,185,129,0.2)"
                  : pct >= 50
                  ? "rgba(245,158,11,0.2)"
                  : "rgba(239,68,68,0.2)",
              border: `2px solid ${pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444"}`,
            }}
          >
            <span
              className="text-3xl font-bold"
              style={{ color: pct >= 80 ? "#6ee7b7" : pct >= 50 ? "#fcd34d" : "#fca5a5" }}
            >
              {pct}%
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-100 !mb-1">
            {pct >= 80 ? "Excellent!" : pct >= 50 ? "Good effort!" : "Keep practicing!"}
          </h3>
          <p className="text-slate-400 text-sm !mb-6">
            {score} of {quiz.questions.length} correct
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setAnswers(Array(quiz.questions.length).fill(null));
                setSubmitted(false);
                setQIndex(0);
                setTimeLeft(quiz.timeLimit ? quiz.timeLimit * 60 : null);
              }}
              className="flex items-center gap-2 !px-5 !py-2.5 rounded-xl text-sm font-medium border border-violet-500/50 text-violet-300 hover:border-violet-400 transition-colors"
              style={{ background: "rgba(109,40,217,0.15)" }}
            >
              <RefreshCw size={14} /> Retake
            </button>
            <button
              onClick={onBack}
              className="flex items-center gap-2 !px-5 !py-2.5 rounded-xl text-sm font-medium border border-slate-600 text-slate-300 hover:border-slate-500 transition-colors"
              style={{ background: "rgba(30,41,66,0.6)" }}
            >
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        </div>

        {/* Review */}
        <div className="flex flex-col gap-5">
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Answer Review</h4>
          {quiz.questions.map((q, qi) => {
            const ans = answers[qi];
            const ca = correctArr(q.correctAnswer);
            const ansArr = ans || [];
            const correct = arraysEqual(ansArr, ca);
            const skipped = !ans;
            return (
              <div
                key={q.id}
                className="rounded-2xl border !p-5"
                style={{
                  background: "rgba(30,41,66,0.45)",
                  borderColor: skipped ? "rgba(100,116,139,0.3)" : correct ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)",
                }}
              >
                <div className="flex items-start gap-3 !mb-4">
                  {skipped ? (
                    <span className="text-xs !px-2 !py-1 rounded-full bg-slate-700 text-slate-400 font-medium mt-0.5 shrink-0">Skip</span>
                  ) : correct ? (
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm font-medium text-slate-200">
                    Q{qi + 1}: {q.question}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  {q.options.map((opt, oi) => {
                    const isCorrectOpt = ca.includes(oi);
                    const isUserOpt = ansArr.includes(oi);
                    return (
                      <div
                        key={oi}
                        className="!px-3 !py-2 rounded-xl text-sm flex items-center gap-2"
                        style={{
                          background: isCorrectOpt
                            ? "rgba(16,185,129,0.12)"
                            : isUserOpt
                            ? "rgba(239,68,68,0.12)"
                            : "rgba(30,41,66,0.3)",
                          border: `1px solid ${isCorrectOpt ? "rgba(16,185,129,0.3)" : isUserOpt ? "rgba(239,68,68,0.3)" : "transparent"}`,
                        }}
                      >
                        {isCorrectOpt && <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />}
                        {isUserOpt && !isCorrectOpt && <XCircle size={13} className="text-red-400 shrink-0" />}
                        <span
                          style={{ color: isCorrectOpt ? "#6ee7b7" : isUserOpt ? "#fca5a5" : "#94a3b8" }}
                        >
                          {opt}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {q.explanation && (
                  <div
                    className="!mt-3 !px-3 !py-2.5 rounded-xl text-sm"
                    style={{ background: "rgba(59,130,246,0.1)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.2)" }}
                  >
                    <span className="font-medium">Explanation:</span> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const progress = ((qIndex + 1) / quiz.questions.length) * 100;
  const curAnswers = answers[qIndex] || [];

  return (
    <div className="flex flex-col gap-5">
      {/* Quiz header */}
      <div
        className="rounded-2xl border border-slate-700/50 !p-7"
        style={{ background: "rgba(30,41,66,0.5)" }}
      >
        <div className="flex items-start justify-between gap-3 !mb-5">
          <div>
            <h3 className="text-base font-semibold text-slate-100">{quiz.title}</h3>
            {quiz.description && (
              <p className="text-sm text-slate-400 !mt-0.5">{quiz.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {timeLeft !== null && (
              <span
                className="flex items-center gap-1 text-sm font-medium !px-3 !py-1 rounded-full"
                style={{
                  background: timeLeft < 30 ? "rgba(239,68,68,0.15)" : "rgba(30,41,66,0.8)",
                  color: timeLeft < 30 ? "#fca5a5" : "#94a3b8",
                  border: `1px solid ${timeLeft < 30 ? "rgba(239,68,68,0.3)" : "rgba(100,116,139,0.3)"}`,
                }}
              >
                <Clock size={13} />
                {formatTime(timeLeft)}
              </span>
            )}
            <button
              onClick={onBack}
              className="text-xs text-slate-400 hover:text-slate-200 !px-3 !py-1 rounded-full border border-slate-700 hover:border-slate-500 transition-colors"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 shrink-0">
            {qIndex + 1}/{quiz.questions.length}
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 shrink-0">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Question */}
      <div
        className="rounded-2xl border border-slate-700/50 !p-7"
        style={{ background: "rgba(30,41,66,0.5)" }}
      >
        <p className="text-base font-medium text-slate-100 !mb-6 leading-relaxed">
          {current.question}
        </p>

        <div className="flex flex-col gap-3">
          {current.options.map((opt, oi) => {
            const selected = curAnswers.includes(oi);
            return (
              <button
                key={oi}
                onClick={() => toggle(oi)}
                className="w-full text-left !px-4 !py-3.5 rounded-xl border transition-all text-sm"
                style={{
                  background: selected ? "rgba(139,92,246,0.15)" : "rgba(15,20,25,0.4)",
                  borderColor: selected ? "#8b5cf6" : "rgba(100,116,139,0.3)",
                  color: selected ? "#e2d9f3" : "#94a3b8",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
                    style={{
                      borderColor: selected ? "#8b5cf6" : "rgba(100,116,139,0.5)",
                      background: selected ? "#8b5cf6" : "transparent",
                    }}
                  >
                    {selected && <Check size={12} className="text-white" />}
                  </div>
                  {opt}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { setQIndex((i) => i - 1); }}
          disabled={qIndex === 0}
          className="flex items-center gap-1.5 !px-4 !py-2.5 rounded-xl text-sm border disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          style={{ background: "rgba(30,41,66,0.6)", borderColor: "rgba(100,116,139,0.3)", color: "#cbd5e1" }}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {/* Question dots */}
        <div className="flex gap-1.5">
          {quiz.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setQIndex(i)}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                background: i === qIndex ? "#8b5cf6" : answers[i] ? "#6ee7b7" : "rgba(100,116,139,0.3)",
                transform: i === qIndex ? "scale(1.4)" : "scale(1)",
              }}
            />
          ))}
        </div>

        {qIndex === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 !px-5 !py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "#8b5cf6", color: "white" }}
          >
            Submit <Trophy size={14} />
          </button>
        ) : (
          <button
            onClick={() => setQIndex((i) => i + 1)}
            className="flex items-center gap-1.5 !px-4 !py-2.5 rounded-xl text-sm border transition-all"
            style={{ background: "rgba(30,41,66,0.6)", borderColor: "rgba(100,116,139,0.3)", color: "#cbd5e1" }}
          >
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function QuizzesTab({ quizzes }: { quizzes: PublicQuiz[] }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState<string | null>(null);
  const activeQuiz = quizzes.find((q) => q.id === active);

  const handleTakeQuiz = (id: string) => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirectTo=${encodeURIComponent(pathname)}`);
      return;
    }
    setActive(id);
  };

  if (activeQuiz) {
    return <QuizPlayer quiz={activeQuiz} onBack={() => setActive(null)} />;
  }

  return (
    <div className="flex flex-col gap-5">
      {!isAuthenticated && (
        <div
          className="rounded-2xl border border-violet-500/20 !px-5 !py-3.5 flex items-center gap-3 text-sm"
          style={{ background: "rgba(109,40,217,0.08)" }}
        >
          <span className="text-slate-400">
            <Link href="/auth/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign in
            </Link>{" "}
            to take quizzes.
          </span>
        </div>
      )}
      {quizzes.map((q) => (
        <div
          key={q.id}
          className="rounded-2xl border border-slate-700/50 !p-5 transition-all hover:border-slate-600/70"
          style={{ background: "rgba(30,41,66,0.45)" }}
        >
          <div className="flex items-start justify-between gap-3 !mb-2">
            <h3 className="text-base font-semibold text-slate-100">{q.title}</h3>
            <DiffBadge level={q.difficulty} />
          </div>

          {q.description && (
            <p className="text-sm text-slate-400 !mb-3">{q.description}</p>
          )}

          <div className="flex items-center justify-between !mt-4 flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <HelpCircle size={13} />
                {q.questions.length} question{q.questions.length !== 1 ? "s" : ""}
              </span>
              {q.timeLimit && (
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock size={13} />
                  {q.timeLimit} min
                </span>
              )}
              {q.tags.map((t) => <TagPill key={t} tag={t} />)}
            </div>
            <button
              onClick={() => handleTakeQuiz(q.id)}
              className="flex items-center gap-2 !px-4 !py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "#8b5cf6", color: "white" }}
            >
              Take Quiz <ChevronRight size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="text-center !py-16">
      <div className="flex justify-center !mb-3 text-slate-700">{icon}</div>
      <p className="text-slate-500">{text}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PublicTopicPage() {
  const pathname = usePathname();
  const shareId = pathname.split("/").pop();

  const [data, setData] = useState<PublicTopicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("notes");

  useEffect(() => {
    if (!shareId) return;
    fetch(`/api/public/topics/${shareId}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.success) throw new Error(res.message || "Not found");
        setData(res.data);
        const d = res.data;
        if (d.notes.length === 0 && d.flashcards.length > 0) setActiveTab("flashcards");
        else if (d.notes.length === 0 && d.quizzes.length > 0) setActiveTab("quizzes");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f1419" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f1419" }}>
        <div className="text-center">
          <p className="text-red-400 !mb-3">{error}</p>
          <Link href="/public" className="text-sm text-violet-400 hover:underline">
            ← Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { topic, notes, flashcards, quizzes } = data;

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: "notes",      label: "Notes",      icon: <FileText size={14} />,   count: notes.length },
    { key: "flashcards", label: "Flashcards", icon: <Layers size={14} />,     count: flashcards.length },
    { key: "quizzes",    label: "Quizzes",    icon: <HelpCircle size={14} />, count: quizzes.length },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0f1419" }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-10 border-b border-slate-700/50 !px-6 !py-4 backdrop-blur-md"
        style={{ background: "rgba(15,20,25,0.9)" }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/public"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={15} /> Explore
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-sm text-slate-300 truncate">{topic.name}</span>
        </div>
      </div>

      <div className="!px-6 !py-12">
        {/* Topic header */}
        <div className="!mb-10">
          <div className="flex items-start gap-5 !mb-4">
            <div
              className="p-3 rounded-2xl shrink-0"
              style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}
            >
              <BookOpen size={22} className="text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-100 leading-tight">
                {topic.name}
              </h1>
              {topic.description && (
                <p className="text-slate-400 text-base !mt-1">{topic.description}</p>
              )}
            </div>
          </div>

          {topic.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 !mt-3">
              {topic.tags.map((t) => <TagPill key={t} tag={t} />)}
            </div>
          )}

          {/* Quick stats */}
          <div className="flex gap-6 !mt-6">
            {[
              { icon: <FileText size={14} />, count: notes.length, label: "Notes" },
              { icon: <Layers size={14} />, count: flashcards.length, label: "Flashcards" },
              { icon: <HelpCircle size={14} />, count: quizzes.length, label: "Quizzes" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-sm text-slate-400">
                <span className="text-slate-500">{s.icon}</span>
                <span className="font-medium text-slate-300">{s.count}</span>
                {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 !mb-8 border-b border-slate-700/50">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 !px-4 !py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "border-violet-500 text-violet-300"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab.icon}
              {tab.label}
              <span
                className="text-xs !px-1.5 !py-0.5 rounded-full"
                style={{
                  background: activeTab === tab.key ? "rgba(139,92,246,0.25)" : "rgba(100,116,139,0.15)",
                  color: activeTab === tab.key ? "#c4b5fd" : "#64748b",
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {activeTab === "notes"      && <NotesTab notes={notes} />}
        {activeTab === "flashcards" && (
          flashcards.length === 0
            ? <Empty icon={<Layers size={36} />} text="No flashcards shared." />
            : <FlashcardsTab flashcards={flashcards} />
        )}
        {activeTab === "quizzes"    && (
          quizzes.length === 0
            ? <Empty icon={<HelpCircle size={36} />} text="No quizzes shared." />
            : <QuizzesTab quizzes={quizzes} />
        )}
      </div>
    </div>
  );
}
