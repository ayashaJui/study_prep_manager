import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Topic from "@/models/Topic";
import Flashcard from "@/models/Flashcard";
import Quiz from "@/models/Quiz";
import Note from "@/models/Note";
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

    // Get average quiz score
    const quizzes = await Quiz.find({ userId, lastScore: { $exists: true } });
    const averageScore =
      quizzes.length > 0
        ? Math.round(
            quizzes.reduce((sum, q) => sum + (q.lastScore || 0), 0) /
              quizzes.length,
          )
        : 0;

    // Calculate study streak (simplified - count days with activity in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentNotes = await Note.countDocuments({
      userId,
      updatedAt: { $gte: sevenDaysAgo },
    });
    const recentFlashcards = await Flashcard.countDocuments({
      userId,
      updatedAt: { $gte: sevenDaysAgo },
    });
    const recentQuizzes = await Quiz.countDocuments({
      userId,
      updatedAt: { $gte: sevenDaysAgo },
    });
    const studyStreak =
      recentNotes > 0 || recentFlashcards > 0 || recentQuizzes > 0 ? 1 : 0;

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
      studyTime: 0, // Not tracked at the moment
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          totalTopics,
          totalFlashcards,
          totalQuizzes,
          averageScore,
          studyStreak,
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
