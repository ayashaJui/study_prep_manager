import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Topic from "@/models/Topic";
import Flashcard from "@/models/Flashcard";
import Quiz from "@/models/Quiz";
import Note from "@/models/Note";
import StudySession from "@/models/StudySession";
import { requireAuth } from "@/lib/serverAuth";
import { ApiError } from "@/lib/errorHandler";

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

    // Get total topics
    const totalTopics = await Topic.countDocuments({ userId, level: 0 });

    // Get total flashcards
    const totalFlashcards = await Flashcard.countDocuments({ userId });

    // Get total quizzes
    const totalQuizzes = await Quiz.countDocuments({ userId });

    // Get average quiz score. `lastScore` is a virtual computed from
    // `attempts`, so we select that field (not the much larger `questions`
    // array) rather than trying to select the virtual itself - and filter
    // for attempted quizzes in JS, since `lastScore` can't be queried as a
    // Mongo filter (it isn't a stored field).
    const quizzes = await Quiz.find({ userId }).select("attempts");
    const attemptedQuizzes = quizzes.filter((q) => q.lastScore !== null);
    const averageScore =
      attemptedQuizzes.length > 0
        ? Math.round(
            attemptedQuizzes.reduce((sum, q) => sum + (q.lastScore || 0), 0) /
              attemptedQuizzes.length,
          )
        : 0;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recentSessions = await StudySession.find({
      userId,
      createdAt: { $gte: sevenDaysAgo },
    }).select("duration");
    const studyMinutes = recentSessions.reduce(
      (sum, s) => sum + (s.duration || 0),
      0,
    );

    // Weekly stats
    const weeklyStats = {
      flashcardsReviewed: await Flashcard.countDocuments({
        userId,
        updatedAt: { $gte: sevenDaysAgo },
      }),
      quizzesTaken: await Quiz.countDocuments({
        userId,
        updatedAt: { $gte: sevenDaysAgo },
      }),
      notesCreated: await Note.countDocuments({
        userId,
        createdAt: { $gte: sevenDaysAgo },
      }),
      studyTime: Math.round((studyMinutes / 60) * 10) / 10, // hours, logged StudySession durations
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          totalTopics,
          totalFlashcards,
          totalQuizzes,
          averageScore,
          weeklyStats,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    const err = error as ApiError;
    console.error("Error fetching dashboard stats:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to fetch dashboard stats",
      },
      { status: 500 },
    );
  }
}
