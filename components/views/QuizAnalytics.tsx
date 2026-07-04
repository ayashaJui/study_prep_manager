"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, BarChart2, Trophy, Target, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  quizzesAPI,
  QuizAnalyticsData,
  QuizAnalyticsItem,
  QuizAttemptStat,
} from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

interface QuizAnalyticsProps {
  topicId: string;
  topicName: string;
  onBack: () => void;
}

function formatTime(seconds: number) {
  if (!seconds || seconds <= 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function scoreColor(pct: number) {
  if (pct >= 80) return "#48bb78";
  if (pct >= 60) return "#ecc94b";
  return "#fc8181";
}

function difficultyStyle(d: string) {
  if (d === "easy") return { color: "#48bb78", background: "rgba(72,187,120,0.12)", border: "1px solid rgba(72,187,120,0.3)" };
  if (d === "hard") return { color: "#fc8181", background: "rgba(252,129,129,0.12)", border: "1px solid rgba(252,129,129,0.3)" };
  return { color: "#ecc94b", background: "rgba(236,201,75,0.12)", border: "1px solid rgba(236,201,75,0.3)" };
}

function ScoreChart({ attempts }: { attempts: QuizAttemptStat[] }) {
  if (attempts.length === 0) return null;
  const CHART_H = 52;
  return (
    <div className="flex items-end gap-1.5 overflow-x-auto !pb-1">
      {attempts.map((a, idx) => {
        const barH = Math.max(3, Math.round((a.scorePct / 100) * CHART_H));
        const label = new Date(a.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        return (
          <div
            key={idx}
            className="flex flex-col items-center gap-0.5 flex-shrink-0"
            style={{ width: 36 }}
            title={`${a.scorePct}% on ${label} (${formatTime(a.timeTaken)})`}
          >
            <span className="text-[10px] text-slate-400">{a.scorePct}%</span>
            <div
              className="w-full rounded-t"
              style={{ height: barH, background: scoreColor(a.scorePct) }}
            />
            <span className="text-[9px] text-slate-500 truncate w-full text-center leading-tight">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function QuizHistoryRow({ quiz }: { quiz: QuizAnalyticsItem }) {
  const [expanded, setExpanded] = useState(false);
  const avg = Math.round(
    quiz.attempts.reduce((s, a) => s + a.scorePct, 0) / quiz.attempts.length,
  );

  return (
    <div
      className="rounded-xl border border-slate-700/50 overflow-hidden"
      style={{ background: "rgba(30, 41, 59, 0.4)" }}
    >
      <button
        className="w-full flex items-center justify-between !px-5 !py-4 text-left hover:bg-slate-700/20 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-medium text-slate-100 truncate">
            {quiz.title}
          </span>
          <span
            className="text-[10px] font-semibold uppercase !px-2 !py-0.5 rounded-full flex-shrink-0"
            style={difficultyStyle(quiz.difficulty)}
          >
            {quiz.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 !ml-3">
          <span
            className="text-sm font-semibold"
            style={{ color: scoreColor(avg) }}
          >
            avg {avg}%
          </span>
          <span className="text-xs text-slate-400">
            {quiz.attempts.length} attempt{quiz.attempts.length !== 1 ? "s" : ""}
          </span>
          {expanded ? (
            <ChevronUp size={14} className="text-slate-500" />
          ) : (
            <ChevronDown size={14} className="text-slate-500" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="!px-5 !pb-5 !space-y-4 border-t border-slate-700/40">
          <div className="!mt-4">
            <p className="text-xs text-slate-500 !mb-2 font-medium">
              Score trend
            </p>
            <ScoreChart attempts={quiz.attempts} />
          </div>

          <div>
            <p className="text-xs text-slate-500 !mb-2 font-medium">
              Attempt history (newest first)
            </p>
            <div className="rounded-lg overflow-hidden border border-slate-700/40">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "rgba(15, 23, 42, 0.5)" }}>
                    <th className="text-left !px-4 !py-2 text-xs font-medium text-slate-400">
                      Date
                    </th>
                    <th className="text-left !px-4 !py-2 text-xs font-medium text-slate-400">
                      Score
                    </th>
                    <th className="text-left !px-4 !py-2 text-xs font-medium text-slate-400">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...quiz.attempts].reverse().map((a, idx) => (
                    <tr key={idx} className="border-t border-slate-700/30">
                      <td className="!px-4 !py-2.5 text-slate-300">
                        {new Date(a.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="!px-4 !py-2.5">
                        <span
                          className="font-semibold"
                          style={{ color: scoreColor(a.scorePct) }}
                        >
                          {a.scorePct}%
                        </span>
                      </td>
                      <td className="!px-4 !py-2.5 text-slate-400">
                        {formatTime(a.timeTaken)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizAnalytics({
  topicId,
  topicName,
  onBack,
}: QuizAnalyticsProps) {
  const [data, setData] = useState<QuizAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const result = await quizzesAPI.getAnalytics(topicId);
      setData(result);
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to load analytics",
      );
    } finally {
      setLoading(false);
    }
  }, [topicId, showError]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <Card>
        <CardTitle>Quiz Analytics — {topicName}</CardTitle>
        <div className="text-center !py-8 text-slate-400">
          Loading analytics...
        </div>
      </Card>
    );
  }

  if (!data) return null;

  const { summary, quizzes } = data;
  const attempted = quizzes.filter((q) => q.attempts.length > 0);

  return (
    <Card>
      <CardTitle
        action={
          <Button variant="secondary" onClick={onBack}>
            <ArrowLeft size={16} />
            Back to Quizzes
          </Button>
        }
      >
        <div className="flex items-center gap-2">
          <BarChart2 size={20} className="text-purple-400" />
          Quiz Analytics — {topicName}
        </div>
      </CardTitle>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 !mb-8">
        {[
          {
            icon: <Target size={16} />,
            label: "Total Attempts",
            value: summary.totalAttempts,
          },
          {
            icon: <BarChart2 size={16} />,
            label: "Avg Score",
            value: `${summary.avgScore}%`,
          },
          {
            icon: <Trophy size={16} />,
            label: "Best Score",
            value: `${summary.bestScore}%`,
          },
          {
            icon: <Clock size={16} />,
            label: "Quizzes Attempted",
            value: `${summary.quizzesAttempted} / ${summary.totalQuizzes}`,
          },
        ].map(({ icon, label, value }) => (
          <div
            key={label}
            className="rounded-xl !p-4 text-center border border-slate-700/50"
            style={{ background: "rgba(45, 55, 72, 0.4)" }}
          >
            <div className="flex justify-center !mb-1 text-purple-400">
              {icon}
            </div>
            <div className="text-xl font-bold text-slate-100">{value}</div>
            <div className="text-xs text-slate-400 !mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Per-quiz history */}
      {attempted.length === 0 ? (
        <div className="text-center !py-10 text-slate-400">
          <BarChart2
            size={36}
            className="!mx-auto !mb-3 opacity-30"
          />
          <p>No quiz attempts yet. Take a quiz to see your history here.</p>
        </div>
      ) : (
        <div className="!space-y-3">
          {attempted.map((quiz) => (
            <QuizHistoryRow key={quiz.quizId} quiz={quiz} />
          ))}
        </div>
      )}
    </Card>
  );
}
