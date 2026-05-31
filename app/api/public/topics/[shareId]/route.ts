import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Topic from "@/models/Topic";
import Note from "@/models/Note";
import Flashcard from "@/models/Flashcard";
import Quiz from "@/models/Quiz";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> },
) {
  try {
    await connectDB();
    const { shareId } = await params;

    const topic = await Topic.findOne({ shareId, isPublic: true }).lean();
    if (!topic) {
      return NextResponse.json(
        { success: false, message: "Public topic not found" },
        { status: 404 },
      );
    }

    // Fetch related content
    const [notes, flashcards, quizzes] = await Promise.all([
      Note.find({ topicId: topic._id }).lean(),
      Flashcard.find({ topicId: topic._id }).lean(),
      Quiz.find({ topicId: topic._id }).lean(),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          topic,
          notes: notes.map((n) => ({
            id: n._id,
            title: n.title,
            content: n.content,
          })),
          flashcards: flashcards.map((f) => ({
            id: f._id,
            front: f.front,
            back: f.back,
          })),
          quizzes: quizzes.map((q) => ({
            id: q._id,
            title: q.title,
            questionsCount: q.questions?.length || 0,
          })),
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch public topic",
      },
      { status: 500 },
    );
  }
}
