import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
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

    const session = await mongoose.startSession();
    let score = 0;
    let totalPoints = 0;
    try {
      await session.withTransaction(async () => {
        const result = await quizController.submitQuizAttempt(
          id,
          userId,
          body.answers || [],
          body.timeTaken || 0,
          session,
        );
        score = result.score;
        totalPoints = result.totalPoints;

        await StudySession.create(
          [
            {
              userId,
              topicId: result.quiz!.topicId,
              activityType: "quiz",
              duration: Math.max(1, Math.round((body.timeTaken || 0) / 60)),
              score:
                totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0,
            },
          ],
          { session },
        );
      });
    } finally {
      await session.endSession();
    }

    return NextResponse.json(
      {
        success: true,
        data: { score, totalPoints },
      },
      { status: 200 },
    );
  } catch (error) {
    const err = error as ApiError;
    const status = err.statusCode || 500;

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to submit quiz",
      },
      { status },
    );
  }
}
