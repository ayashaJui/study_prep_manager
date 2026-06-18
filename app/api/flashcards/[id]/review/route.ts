import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import * as flashcardController from "@/controllers/flashcardController";
import StudySession from "@/models/StudySession";
import { requireAuth } from "@/lib/serverAuth";
import { ApiError } from "@/lib/errorHandler";

// POST /api/flashcards/[id]/review
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

    const flashcard = await flashcardController.reviewFlashcard(
      id,
      body.quality,
      userId,
    );

    await StudySession.create({
      userId,
      topicId: flashcard.topicId,
      activityType: "flashcard",
      duration: body.duration || 0,
    });

    return NextResponse.json(
      {
        success: true,
        data: flashcard,
      },
      { status: 200 },
    );
  } catch (error) {
    const err = error as ApiError;
    const status =
      err.message === "Flashcard not found"
        ? 404
        : err.message.includes("Invalid")
          ? 400
          : 500;

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to review flashcard",
      },
      { status },
    );
  }
}
