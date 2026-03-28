import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import * as quizController from "@/controllers/quizController";

// GET /api/quizzes/[id] - Get single quiz
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const userId = request.headers.get("x-user-id"); // From middleware

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - No user ID",
        },
        { status: 401 },
      );
    }

    const quiz = await quizController.getQuizById(id, userId);

    return NextResponse.json(
      {
        success: true,
        data: quiz,
      },
      { status: 200 },
    );
  } catch (error: any) {
    const status =
      error.message === "Quiz not found"
        ? 404
        : error.message.includes("Invalid")
          ? 400
          : 500;

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch quiz",
      },
      { status },
    );
  }
}

// PATCH /api/quizzes/[id] - Update quiz
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const userId = request.headers.get("x-user-id"); // From middleware

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - No user ID",
        },
        { status: 401 },
      );
    }

    const quiz = await quizController.updateQuiz(id, body, userId);

    return NextResponse.json(
      {
        success: true,
        message: "Quiz updated successfully",
        data: quiz,
      },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: Object.values(error.errors).map((e: any) => e.message),
        },
        { status: 400 },
      );
    }

    const status =
      error.message === "Quiz not found"
        ? 404
        : error.message.includes("Invalid")
          ? 400
          : 500;

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update quiz",
      },
      { status },
    );
  }
}

// DELETE /api/quizzes/[id] - Delete quiz
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const userId = request.headers.get("x-user-id"); // From middleware

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - No user ID",
        },
        { status: 401 },
      );
    }

    await quizController.deleteQuiz(id, userId);

    return NextResponse.json(
      {
        success: true,
        message: "Quiz deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    const status =
      error.message === "Quiz not found"
        ? 404
        : error.message.includes("Invalid")
          ? 400
          : 500;

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete quiz",
      },
      { status },
    );
  }
}
