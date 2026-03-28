"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardTitle } from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import ProgressBar from "@/components/ui/ProgressBar";
import Badge from "@/components/ui/Badge";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react";
import { dashboardAPI } from "@/lib/api";

interface DashboardStats {
  totalTopics: number;
  totalFlashcards: number;
  totalQuizzes: number;
  averageScore: number;
  studyStreak: number;
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
  goal: string;
  current: number;
  total: number;
}

export default function Dashboard() {
  const { isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [topicProgress, setTopicProgress] = useState<TopicProgressItem[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<Goal[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch once auth initialization completes.
    if (!authLoading) {
      fetchDashboardData();
    }
  }, [authLoading]);

  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);
      setError(null);

      const [statsRes, activityRes, progressRes, goalsRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentActivity(4),
        dashboardAPI.getTopicProgress(),
        dashboardAPI.getWeeklyGoals(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (activityRes.success) setRecentActivity(activityRes.data || []);
      if (progressRes.success) setTopicProgress(progressRes.data || []);
      if (goalsRes.success) setWeeklyGoals(goalsRes.data || []);
    } catch (err: any) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setDashboardLoading(false);
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
          <CardTitle>
            <div className="flex items-center gap-2">
              <Target size={20} className="text-green-400" />
              Weekly Goals
            </div>
          </CardTitle>
          <div className="!space-y-5">
            {weeklyGoals.length > 0 ? (
              weeklyGoals.map((goal, index) => (
                <div key={index}>
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
              {stats?.studyStreak || 0}
            </div>
            <p className="text-base md:text-lg" style={{ color: "#cbd5e0" }}>
              Days in a row
            </p>
            <p
              className="text-xs md:text-sm !mt-2"
              style={{ color: "#a0aec0" }}
            >
              {(stats?.studyStreak || 0) > 0
                ? "Keep it up! You're on fire 🔥"
                : "Start your study streak today!"}
            </p>
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
    </div>
  );
}
