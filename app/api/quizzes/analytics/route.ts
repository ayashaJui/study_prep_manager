import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Quiz, { IQuizAttempt } from "@/models/Quiz";
import { requireAuth } from "@/lib/serverAuth";
import { ApiError } from "@/lib/errorHandler";
import mongoose from "mongoose";

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

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId");

    if (!topicId || !mongoose.Types.ObjectId.isValid(topicId)) {
      return NextResponse.json(
        { success: false, message: "Valid topicId is required" },
        { status: 400 },
      );
    }

    const quizzes = await Quiz.find({ topicId, userId })
      .select("title difficulty attempts")
      .lean();

    const quizData = quizzes.map((q) => {
      const attempts = (q.attempts as IQuizAttempt[] || [])
        .map((a: IQuizAttempt) => ({
          date:
            a.date instanceof Date ? a.date.toISOString() : String(a.date),
          scorePct:
            a.totalPoints > 0
              ? Math.round((a.score / a.totalPoints) * 100)
              : 0,
          timeTaken: a.timeTaken || 0,
        }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

      return {
        quizId: String(q._id),
        title: q.title,
        difficulty: q.difficulty,
        attempts,
      };
    });

    const allAttempts = quizData.flatMap((q) => q.attempts);
    const summary = {
      totalQuizzes: quizzes.length,
      quizzesAttempted: quizData.filter((q) => q.attempts.length > 0).length,
      totalAttempts: allAttempts.length,
      avgScore:
        allAttempts.length > 0
          ? Math.round(
              allAttempts.reduce((s, a) => s + a.scorePct, 0) /
                allAttempts.length,
            )
          : 0,
      bestScore:
        allAttempts.length > 0
          ? Math.max(...allAttempts.map((a) => a.scorePct))
          : 0,
    };

    return NextResponse.json(
      { success: true, data: { summary, quizzes: quizData } },
      { status: 200 },
    );
  } catch (error) {
    const err = error as ApiError;
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to fetch quiz analytics",
      },
      { status: err.statusCode || 500 },
    );
  }
}
