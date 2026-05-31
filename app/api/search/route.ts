import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireAuth } from "@/lib/serverAuth";
import Topic from "@/models/Topic";
import Note from "@/models/Note";
import Flashcard from "@/models/Flashcard";
import Quiz from "@/models/Quiz";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    let userId: string;
    try {
      userId = await requireAuth(request as Request);
    } catch (err: any) {
      return NextResponse.json(
        { success: false, message: err.message || "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("query") || "").trim();
    const limit = Math.min(Number(searchParams.get("limit") || 10), 25);

    if (query.length < 2) {
      return NextResponse.json(
        {
          success: true,
          data: {
            topics: [],
            notes: [],
            flashcards: [],
            quizzes: [],
          },
        },
        { status: 200 },
      );
    }

    const regex = new RegExp(escapeRegExp(query), "i");

    const [topics, notes, flashcards, quizzes] = await Promise.all([
      Topic.find({
        userId,
        $or: [
          { name: regex },
          { description: regex },
          { slug: regex },
          { tags: regex },
        ],
      })
        .select("name slug description status stats")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Note.find({
        userId,
        $or: [{ title: regex }, { content: regex }, { tags: regex }],
      })
        .select("title content topicId")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Flashcard.find({
        userId,
        $or: [{ front: regex }, { back: regex }, { tags: regex }],
      })
        .select("front back topicId")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Quiz.find({
        userId,
        $or: [
          { title: regex },
          { description: regex },
          { tags: regex },
          { "questions.question": regex },
          { "questions.explanation": regex },
          { "questions.tags": regex },
        ],
      })
        .select("title description topicId")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: { topics, notes, flashcards, quizzes },
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Search failed",
      },
      { status: 500 },
    );
  }
}
