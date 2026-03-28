import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Flashcard from "@/models/Flashcard";
import Quiz from "@/models/Quiz";
import Note from "@/models/Note";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get counts for this week
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      flashcardsThisWeek,
      quizzesThisWeek,
      notesThisWeek,
      totalFlashcards,
    ] = await Promise.all([
      Flashcard.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Quiz.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Note.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Flashcard.countDocuments(),
    ]);

    // Define weekly goals (dynamic based on total content)
    const goalTarget = Math.max(20, Math.ceil(totalFlashcards / 4)); // Review 1/4 of flashcards per week or min 20

    const weeklyGoals = [
      {
        goal: `Complete ${goalTarget} flashcards`,
        current: flashcardsThisWeek,
        total: goalTarget,
      },
      {
        goal: "Take 3 practice quizzes",
        current: quizzesThisWeek,
        total: 3,
      },
      {
        goal: "Review 5 topics",
        current: Math.min(5, notesThisWeek), // Use notes count as proxy for topic review
        total: 5,
      },
      {
        goal: "Create 10 new notes",
        current: notesThisWeek,
        total: 10,
      },
    ];

    return NextResponse.json(
      {
        success: true,
        data: weeklyGoals,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching weekly goals:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch weekly goals",
      },
      { status: 500 },
    );
  }
}
