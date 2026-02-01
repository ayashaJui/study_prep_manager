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

export default function Dashboard() {
  const recentActivity = [
    {
      id: 1,
      action: "Completed quiz",
      topic: "Array Manipulation Problems",
      time: "2 hours ago",
      score: "85%",
    },
    {
      id: 2,
      action: "Added flashcards",
      topic: "Binary Search Trees",
      time: "5 hours ago",
    },
    {
      id: 3,
      action: "Created notes",
      topic: "Graph Algorithms",
      time: "1 day ago",
    },
    {
      id: 4,
      action: "Studied",
      topic: "Linked Lists",
      time: "2 days ago",
    },
  ];

  const topicProgress = [
    {
      name: "Data Structures & Algorithms",
      progress: 65,
      status: "in-progress" as const,
    },
    { name: "JavaScript", progress: 40, status: "in-progress" as const },
    {
      name: "Behavioral Interview",
      progress: 25,
      status: "in-progress" as const,
    },
    { name: "System Design", progress: 10, status: "not-started" as const },
  ];

  const weeklyGoals = [
    { goal: "Complete 20 flashcards", current: 15, total: 20 },
    { goal: "Take 3 practice quizzes", current: 2, total: 3 },
    { goal: "Review 5 topics", current: 5, total: 5 },
    { goal: "Create 10 new notes", current: 7, total: 10 },
  ];

  return (
    <div className="!space-y-6 md:!space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          icon={<BookOpen size={24} />}
          value="12"
          label="Active Topics"
          variant="default"
        />
        <StatCard
          icon={<Brain size={24} />}
          value="156"
          label="Flashcards"
          variant="blue"
        />
        <StatCard
          icon={<CheckCircle2 size={24} />}
          value="23"
          label="Quizzes Taken"
          variant="green"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          value="78%"
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
            {recentActivity.map((activity) => (
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
            ))}
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
            {weeklyGoals.map((goal, index) => (
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
            ))}
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
          {topicProgress.map((topic, index) => (
            <div key={index}>
              <div className="flex items-center justify-between !mb-3">
                <div className="flex items-center gap-3">
                  <span
                    className="font-semibold text-sm md:text-base"
                    style={{ color: "#e2e8f0" }}
                  >
                    {topic.name}
                  </span>
                  <Badge variant={topic.status}>
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
          ))}
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
              14
            </div>
            <p className="text-base md:text-lg" style={{ color: "#cbd5e0" }}>
              Days in a row
            </p>
            <p className="text-xs md:text-sm !mt-2" style={{ color: "#a0aec0" }}>
              Keep it up! You're on fire 🔥
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
                28
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
                5
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
                12
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
                8h
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
