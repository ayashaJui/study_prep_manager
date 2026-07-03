import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Topic from "@/models/Topic";
import Note from "@/models/Note";
import Flashcard from "@/models/Flashcard";
import Quiz from "@/models/Quiz";
import { ApiError } from "@/lib/errorHandler";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { tryGetUserIdFromToken } from "@/lib/serverAuth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> },
) {
  try {
    const ip = getClientIp(request as Request);
    const rl = rateLimit({ key: `public-topic:${ip}`, limit: 60, windowMs: 60_000 });
    if (!rl.ok) {
      return NextResponse.json(
        { success: false, message: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
      );
    }

    const isAuthenticated = !!tryGetUserIdFromToken(request as Request);

    await connectDB();
    const { shareId } = await params;

    const topic = await Topic.findOne({ shareId, isPublic: true }).lean();
    if (!topic) {
      return NextResponse.json(
        { success: false, message: "Public topic not found" },
        { status: 404 },
      );
    }

    const [notes, flashcards, quizzes] = await Promise.all([
      Note.find({ topicId: topic._id, userId: topic.userId }).lean(),
      Flashcard.find({ topicId: topic._id, userId: topic.userId }).lean(),
      Quiz.find({ topicId: topic._id, userId: topic.userId }).lean(),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          topic: {
            id: topic._id,
            name: topic.name,
            description: topic.description,
            tags: topic.tags || [],
          },
          notes: notes.map((n) => ({
            id: n._id,
            content: n.content,
            tags: n.tags || [],
            pinned: n.pinned,
            createdAt: n.createdAt,
          })),
          flashcards: flashcards.map((f) => ({
            id: f._id,
            front: f.front,
            back: f.back,
            difficulty: f.difficulty,
            tags: f.tags || [],
          })),
          quizzes: quizzes.map((q) => ({
            id: q._id,
            title: q.title,
            description: q.description || null,
            difficulty: q.difficulty,
            tags: q.tags || [],
            timeLimit: q.timeLimit || null,
            questions: (q.questions || []).map((qu: { id: string; question: string; options: string[]; correctAnswer: number | number[]; explanation?: string }) => ({
              id: qu.id,
              question: qu.question,
              options: qu.options,
              ...(isAuthenticated ? { correctAnswer: qu.correctAnswer, explanation: qu.explanation || null } : {}),
            })),
          })),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    const err = error as ApiError;
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to fetch public topic",
      },
      { status: 500 },
    );
  }
}
