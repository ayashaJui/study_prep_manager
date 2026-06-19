import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Flashcard from "@/models/Flashcard";
import Quiz from "@/models/Quiz";
import Note from "@/models/Note";
import User, { IWeeklyGoal, WeeklyGoalMetric } from "@/models/User";
import { requireAuth } from "@/lib/serverAuth";
import { ApiError } from "@/lib/errorHandler";

const METRICS: WeeklyGoalMetric[] = ["flashcards", "quizzes", "topics", "notes"];

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    let userId: string;
    try {
      userId = await requireAuth(request as Request);
    } catch (err) {
      const e = err as ApiError;
      return NextResponse.json(
        { success: false, message: e.message || "Unauthorized" },
        { status: 401 },
      );
    }

    // Get counts for this week
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      flashcardsThisWeek,
      quizzesThisWeek,
      notesThisWeek,
      totalFlashcards,
      user,
    ] = await Promise.all([
      Flashcard.countDocuments({ userId, createdAt: { $gte: sevenDaysAgo } }),
      Quiz.countDocuments({ userId, createdAt: { $gte: sevenDaysAgo } }),
      Note.countDocuments({ userId, createdAt: { $gte: sevenDaysAgo } }),
      Flashcard.countDocuments({ userId }),
      User.findById(userId).select("weeklyGoals").lean(),
    ]);

    // Default targets/labels (dynamic for flashcards, fixed for the rest)
    const defaultFlashcardTarget = Math.max(20, Math.ceil(totalFlashcards / 4));
    const defaults: Record<WeeklyGoalMetric, { label: string; target: number }> = {
      flashcards: {
        label: `Complete ${defaultFlashcardTarget} flashcards`,
        target: defaultFlashcardTarget,
      },
      quizzes: { label: "Take 3 practice quizzes", target: 3 },
      topics: { label: "Review 5 topics", target: 5 },
      notes: { label: "Create 10 new notes", target: 10 },
    };

    const overrides = new Map<WeeklyGoalMetric, IWeeklyGoal>(
      (user?.weeklyGoals || []).map((g: IWeeklyGoal) => [g.metric, g]),
    );

    const currentByMetric: Record<WeeklyGoalMetric, number> = {
      flashcards: flashcardsThisWeek,
      quizzes: quizzesThisWeek,
      // Notes count is used as a proxy for topic review activity.
      topics: notesThisWeek,
      notes: notesThisWeek,
    };

    const weeklyGoals = METRICS.map((metric) => {
      const override = overrides.get(metric);
      const label = override?.label ?? defaults[metric].label;
      const target = override?.target ?? defaults[metric].target;

      return {
        metric,
        goal: label,
        current: Math.min(target, currentByMetric[metric]),
        total: target,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: weeklyGoals,
      },
      { status: 200 },
    );
  } catch (error) {
    const err = error as ApiError;
    console.error("Error fetching weekly goals:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to fetch weekly goals",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    let userId: string;
    try {
      userId = await requireAuth(request as Request);
    } catch (err) {
      const e = err as ApiError;
      return NextResponse.json(
        { success: false, message: e.message || "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const goals = body?.goals;

    if (!Array.isArray(goals) || goals.length === 0) {
      return NextResponse.json(
        { success: false, message: "goals must be a non-empty array" },
        { status: 400 },
      );
    }

    const seen = new Set<string>();
    const sanitized: IWeeklyGoal[] = [];

    for (const g of goals) {
      if (
        !g ||
        typeof g.metric !== "string" ||
        !METRICS.includes(g.metric as WeeklyGoalMetric) ||
        seen.has(g.metric)
      ) {
        return NextResponse.json(
          { success: false, message: `Invalid or duplicate metric: ${g?.metric}` },
          { status: 400 },
        );
      }
      if (typeof g.label !== "string" || !g.label.trim()) {
        return NextResponse.json(
          { success: false, message: "Each goal needs a non-empty label" },
          { status: 400 },
        );
      }
      if (
        typeof g.target !== "number" ||
        !Number.isInteger(g.target) ||
        g.target < 1 ||
        g.target > 1000
      ) {
        return NextResponse.json(
          { success: false, message: "Each goal target must be an integer between 1 and 1000" },
          { status: 400 },
        );
      }

      seen.add(g.metric);
      sanitized.push({
        metric: g.metric as WeeklyGoalMetric,
        label: g.label.trim(),
        target: g.target,
      });
    }

    await User.findByIdAndUpdate(userId, { weeklyGoals: sanitized });

    return NextResponse.json(
      { success: true, data: sanitized },
      { status: 200 },
    );
  } catch (error) {
    const err = error as ApiError;
    console.error("Error updating weekly goals:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to update weekly goals",
      },
      { status: 500 },
    );
  }
}
