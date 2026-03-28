import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Flashcard from "@/models/Flashcard";
import Quiz from "@/models/Quiz";
import Note from "@/models/Note";
import Topic from "@/models/Topic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Fetch recent activities from different resources
    const [recentNotes, recentFlashcards, recentQuizzes] = await Promise.all([
      Note.find()
        .sort({ updatedAt: -1 })
        .limit(limit)
        .populate("topicId", "name"),
      Flashcard.find()
        .sort({ updatedAt: -1 })
        .limit(limit)
        .populate("topicId", "name"),
      Quiz.find()
        .sort({ updatedAt: -1 })
        .limit(limit)
        .populate("topicId", "name"),
    ]);

    // Combine and sort all activities
    const activities = [
      ...recentNotes.map((note) => ({
        id: note._id,
        action: "Created notes",
        topic: (note.topicId as any)?.name || "Unknown Topic",
        time: getTimeAgo(note.updatedAt),
        timestamp: note.updatedAt,
      })),
      ...recentFlashcards.map((fc) => ({
        id: fc._id,
        action: "Added flashcards",
        topic: (fc.topicId as any)?.name || "Unknown Topic",
        time: getTimeAgo(fc.updatedAt),
        timestamp: fc.updatedAt,
      })),
      ...recentQuizzes.map((quiz) => ({
        id: quiz._id,
        action: quiz.lastScore ? "Completed quiz" : "Created quiz",
        topic: (quiz.topicId as any)?.name || "Unknown Topic",
        time: getTimeAgo(quiz.updatedAt),
        timestamp: quiz.updatedAt,
        score: quiz.lastScore ? `${quiz.lastScore}%` : undefined,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, limit)
      .map(({ timestamp, ...rest }) => rest); // Remove internal timestamp field

    return NextResponse.json(
      {
        success: true,
        data: activities,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching recent activity:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch recent activity",
      },
      { status: 500 },
    );
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}
