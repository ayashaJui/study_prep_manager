"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardTitle } from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import ProgressBar from "@/components/ui/ProgressBar";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  TrendingUp,
  Clock,
  Target,
  Pencil,
  Play,
  Square,
} from "lucide-react";
import {
  dashboardAPI,
  studySessionsAPI,
  WeeklyGoalMetric,
  WeeklyGoalInput,
} from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

interface DashboardStats {
  totalTopics: number;
  totalFlashcards: number;
  totalQuizzes: number;
  averageScore: number;
  weeklyStats: {
    flashcardsReviewed: number;
    quizzesTaken: number;
    notesCreated: number;
    studyTime: number;
  };
}

interface Activity {
  id: string;
  action: string;
  topic: string;
  time: string;
  score?: string;
}

interface TopicProgressItem {
  name: string;
  progress: number;
  status: string;
  id: string;
}

interface Goal {
  metric: WeeklyGoalMetric;
  goal: string;
  current: number;
  total: number;
}

function formatElapsed(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function Dashboard() {
  const { isLoading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [topicProgress, setTopicProgress] = useState<TopicProgressItem[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<Goal[]>([]);
  const [studyStreak, setStudyStreak] = useState(0);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(
    null,
  );
  const [sessionElapsedMs, setSessionElapsedMs] = useState(0);
  const [loggingSession, setLoggingSession] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditGoalsOpen, setIsEditGoalsOpen] = useState(false);
  const [editGoals, setEditGoals] = useState<WeeklyGoalInput[]>([]);
  const [savingGoals, setSavingGoals] = useState(false);

  useEffect(() => {
    // Fetch once auth initialization completes.
    if (!authLoading) {
      fetchDashboardData();
    }
  }, [authLoading]);

  useEffect(() => {
    if (sessionStartedAt === null) return;
    const interval = setInterval(() => {
      setSessionElapsedMs(Date.now() - sessionStartedAt);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartedAt]);

  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);
      setError(null);

      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const [statsRes, activityRes, progressRes, goalsRes, streakRes] =
        await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getRecentActivity(4),
          dashboardAPI.getTopicProgress(),
          dashboardAPI.getWeeklyGoals(),
          studySessionsAPI.getStreak(timeZone),
        ]);

      if (statsRes.success) setStats(statsRes.data);
      if (streakRes.success) setStudyStreak(streakRes.data?.streak || 0);
      if (activityRes.success) setRecentActivity(activityRes.data || []);
      if (progressRes.success) setTopicProgress(progressRes.data || []);
      if (goalsRes.success) setWeeklyGoals(goalsRes.data || []);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data",
      );
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleStartSession = () => {
    setSessionElapsedMs(0);
    setSessionStartedAt(Date.now());
  };

  const handleStopSession = async () => {
    if (sessionStartedAt === null) return;
    const durationMinutes = Math.max(
      1,
      Math.round((Date.now() - sessionStartedAt) / 60000),
    );

    try {
      setLoggingSession(true);
      const res = await studySessionsAPI.create({
        activityType: "review",
        duration: durationMinutes,
      });
      if (res.success) {
        showSuccess(`Logged a ${durationMinutes} min study session`);
        setSessionStartedAt(null);
        setSessionElapsedMs(0);
        await fetchDashboardData();
      } else {
        showError(res.message || "Failed to log study session");
      }
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to log study session",
      );
    } finally {
      setLoggingSession(false);
    }
  };

  const openEditGoals = () => {
    setEditGoals(
      weeklyGoals.map((g) => ({
        metric: g.metric,
        label: g.goal,
        target: g.total,
      })),
    );
    setIsEditGoalsOpen(true);
  };

  const updateEditGoal = (
    metric: WeeklyGoalMetric,
    field: "label" | "target",
    value: string,
  ) => {
    setEditGoals((prev) =>
      prev.map((g) =>
        g.metric === metric
          ? {
              ...g,
              [field]: field === "target" ? Number(value) || 0 : value,
            }
          : g,
      ),
    );
  };

  const handleSaveGoals = async () => {
    try {
      setSavingGoals(true);
      const res = await dashboardAPI.updateWeeklyGoals(editGoals);
      if (res.success) {
        showSuccess("Weekly goals updated");
        setIsEditGoalsOpen(false);
        await fetchDashboardData();
      } else {
        showError(res.message || "Failed to update weekly goals");
      }
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to update weekly goals",
      );
    } finally {
      setSavingGoals(false);
    }
  };

  // Show loading while authenticating
  if (authLoading) {
    return (
      <div className="!space-y-6 md:!space-y-8">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-lg animate-pulse"
              style={{ background: "rgba(45, 55, 72, 0.5)" }}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className="h-64 rounded-lg animate-pulse lg:col-span-2"
            style={{ background: "rgba(45, 55, 72, 0.5)" }}
          />
          <div
            className="h-64 rounded-lg animate-pulse"
            style={{ background: "rgba(45, 55, 72, 0.5)" }}
          />
        </div>
      </div>
    );
  }

  if (dashboardLoading) {
    return (
      <div className="!space-y-6 md:!space-y-8">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-lg animate-pulse"
              style={{ background: "rgba(45, 55, 72, 0.5)" }}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className="h-64 rounded-lg animate-pulse lg:col-span-2"
            style={{ background: "rgba(45, 55, 72, 0.5)" }}
          />
          <div
            className="h-64 rounded-lg animate-pulse"
            style={{ background: "rgba(45, 55, 72, 0.5)" }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p style={{ color: "#fc8181" }}>Error: {error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 rounded-lg"
          style={{ background: "#667eea", color: "white" }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="!space-y-6 md:!space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          icon={<BookOpen size={24} />}
          value={stats?.totalTopics.toString() || "0"}
          label="Active Topics"
          variant="default"
        />
        <StatCard
          icon={<Brain size={24} />}
          value={stats?.totalFlashcards.toString() || "0"}
          label="Flashcards"
          variant="blue"
        />
        <StatCard
          icon={<CheckCircle2 size={24} />}
          value={stats?.totalQuizzes.toString() || "0"}
          label="Quizzes Taken"
          variant="green"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          value={`${stats?.averageScore || 0}%`}
          label="Average Score"
          variant="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardTitle>
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-purple-400" />
              Recent Activity
            </div>
          </CardTitle>
          <div className="!space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between !p-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                  style={{ background: "rgba(45, 55, 72, 0.4)" }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 !mb-1">
                      <span
                        className="font-semibold text-sm md:text-base"
                        style={{ color: "#e2e8f0" }}
                      >
                        {activity.action}
                      </span>
                      {activity.score && (
                        <Badge variant="default">{activity.score}</Badge>
                      )}
                    </div>
                    <p
                      className="text-xs md:text-sm !mb-1"
                      style={{ color: "#cbd5e0" }}
                    >
                      {activity.topic}
                    </p>
                  </div>
                  <span className="text-xs" style={{ color: "#a0aec0" }}>
                    {activity.time}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: "#a0aec0" }}>No recent activity yet</p>
            )}
          </div>
        </Card>

        {/* Weekly Goals */}
        <Card>
          <CardTitle
            action={
              <button
                onClick={openEditGoals}
                className="!p-1.5 rounded hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-200"
                aria-label="Edit weekly goals"
              >
                <Pencil size={16} />
              </button>
            }
          >
            <div className="flex items-center gap-2">
              <Target size={20} className="text-green-400" />
              Weekly Goals
            </div>
          </CardTitle>
          <div className="!space-y-5">
            {weeklyGoals.length > 0 ? (
              weeklyGoals.map((goal) => (
                <div key={goal.metric}>
                  <div className="flex justify-between !mb-2">
                    <span
                      className="text-xs md:text-sm font-medium"
                      style={{ color: "#e2e8f0" }}
                    >
                      {goal.goal}
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "#667eea" }}
                    >
                      {goal.current}/{goal.total}
                    </span>
                  </div>
                  <ProgressBar
                    value={goal.current}
                    max={goal.total}
                    showPercentage={false}
                  />
                </div>
              ))
            ) : (
              <p style={{ color: "#a0aec0" }}>No goals set</p>
            )}
          </div>
        </Card>
      </div>

      {/* Topic Progress */}
      <Card>
        <CardTitle>
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-400" />
            Topic Progress
          </div>
        </CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topicProgress.length > 0 ? (
            topicProgress.map((topic) => (
              <div key={topic.id}>
                <div className="flex items-center justify-between !mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="font-semibold text-sm md:text-base"
                      style={{ color: "#e2e8f0" }}
                    >
                      {topic.name}
                    </span>
                    <Badge
                      variant={
                        topic.status as
                          | "default"
                          | "not-started"
                          | "in-progress"
                          | "review"
                          | "mastered"
                      }
                    >
                      {topic.status.replace("-", " ")}
                    </Badge>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#667eea" }}
                  >
                    {topic.progress}%
                  </span>
                </div>
                <ProgressBar value={topic.progress} showPercentage={false} />
              </div>
            ))
          ) : (
            <p style={{ color: "#a0aec0" }}>No topics yet</p>
          )}
        </div>
      </Card>

      {/* Study Streak */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <Card>
          <CardTitle>Study Streak</CardTitle>
          <div className="text-center py-8">
            <div
              className="text-6xl md:text-7xl font-bold !mb-4"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {studyStreak}
            </div>
            <p className="text-base md:text-lg" style={{ color: "#cbd5e0" }}>
              Days in a row
            </p>
            <p
              className="text-xs md:text-sm !mt-2"
              style={{ color: "#a0aec0" }}
            >
              {studyStreak > 0
                ? "Keep it up! You're on fire 🔥"
                : "Start your study streak today!"}
            </p>

            <div className="!mt-6 !pt-4 border-t border-slate-700/50">
              {sessionStartedAt === null ? (
                <Button onClick={handleStartSession} className="!mx-auto">
                  <Play size={16} />
                  Start Studying
                </Button>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <span
                    className="text-2xl font-mono font-semibold"
                    style={{ color: "#e2e8f0" }}
                  >
                    {formatElapsed(sessionElapsedMs)}
                  </span>
                  <Button
                    onClick={handleStopSession}
                    disabled={loggingSession}
                    className="!bg-red-600 hover:!bg-red-700 !mx-auto"
                  >
                    <Square size={16} />
                    {loggingSession ? "Logging..." : "Stop & Log Session"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle>This Week</CardTitle>
          <div className="grid grid-cols-2 gap-4 md:gap-6 !py-4">
            <div
              className="text-center !p-4 rounded-xl"
              style={{ background: "rgba(102, 126, 234, 0.1)" }}
            >
              <div
                className="text-3xl md:text-4xl font-bold !mb-2"
                style={{ color: "#667eea" }}
              >
                {stats?.weeklyStats.flashcardsReviewed || 0}
              </div>
              <p className="text-xs md:text-sm" style={{ color: "#cbd5e0" }}>
                Flashcards
              </p>
            </div>
            <div
              className="text-center !p-4 rounded-xl"
              style={{ background: "rgba(72, 187, 120, 0.1)" }}
            >
              <div
                className="text-3xl md:text-4xl font-bold !mb-2"
                style={{ color: "#48bb78" }}
              >
                {stats?.weeklyStats.quizzesTaken || 0}
              </div>
              <p className="text-xs md:text-sm" style={{ color: "#cbd5e0" }}>
                Quizzes
              </p>
            </div>
            <div
              className="text-center !p-4 rounded-xl"
              style={{ background: "rgba(66, 153, 225, 0.1)" }}
            >
              <div
                className="text-3xl md:text-4xl font-bold !mb-2"
                style={{ color: "#4299e1" }}
              >
                {stats?.weeklyStats.notesCreated || 0}
              </div>
              <p className="text-xs md:text-sm" style={{ color: "#cbd5e0" }}>
                Notes
              </p>
            </div>
            <div
              className="text-center !p-4 rounded-xl"
              style={{ background: "rgba(159, 122, 234, 0.1)" }}
            >
              <div
                className="text-3xl md:text-4xl font-bold !mb-2"
                style={{ color: "#9f7aea" }}
              >
                {stats?.weeklyStats.studyTime || 0}h
              </div>
              <p className="text-xs md:text-sm" style={{ color: "#cbd5e0" }}>
                Study Time
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={isEditGoalsOpen}
        onClose={() => setIsEditGoalsOpen(false)}
        title="Edit Weekly Goals"
      >
        <div className="!space-y-4">
          {editGoals.map((goal) => (
            <div key={goal.metric} className="!space-y-2">
              <label className="block text-xs font-medium text-slate-400 capitalize">
                {goal.metric}
              </label>
              <Input
                value={goal.label}
                onChange={(e) =>
                  updateEditGoal(goal.metric, "label", e.target.value)
                }
                placeholder="Goal description"
              />
              <Input
                type="number"
                min={1}
                max={1000}
                value={goal.target}
                onChange={(e) =>
                  updateEditGoal(goal.metric, "target", e.target.value)
                }
                placeholder="Target"
              />
            </div>
          ))}
          <div className="flex gap-3 justify-end !pt-2">
            <Button
              variant="secondary"
              onClick={() => setIsEditGoalsOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveGoals}
              disabled={savingGoals}
              type="button"
            >
              {savingGoals ? "Saving..." : "Save Goals"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
