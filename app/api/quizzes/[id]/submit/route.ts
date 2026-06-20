import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import * as quizController from "@/controllers/quizController";
import StudySession from "@/models/StudySession";
import { requireAuth } from "@/lib/serverAuth";
import { ApiError } from "@/lib/errorHandler";

// POST /api/quizzes/[id]/submit - Submit a quiz attempt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

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

    const { quiz, score, totalPoints } = await quizController.submitQuizAttempt(
      id,
      userId,
      body.answers || [],
      body.timeTaken || 0,
    );

    await StudySession.create({
      userId,
      topicId: quiz.topicId,
      activityType: "quiz",
      duration: Math.max(1, Math.round((body.timeTaken || 0) / 60)),
      score: totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0,
    });

    return NextResponse.json(
      {
        success: true,
        data: { score, totalPoints },
      },
      { status: 200 },
    );
  } catch (error) {
    const err = error as ApiError;
    const status =
      err.message === "Quiz not found"
        ? 404
        : err.message.includes("Invalid")
          ? 400
          : 500;

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to submit quiz",
      },
      { status },
    );
  }
}
