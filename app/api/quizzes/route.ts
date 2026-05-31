import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import * as quizController from "@/controllers/quizController";
import { requireAuth } from "@/lib/serverAuth";

// GET /api/quizzes?topicId={id} - Get all quizzes for a topic
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId");
    let userId: string;
    try {
      userId = await requireAuth(request as Request);
    } catch (err: any) {
      return NextResponse.json(
        { success: false, message: err.message || "Unauthorized" },
        { status: 401 },
      );
    }

    if (!topicId) {
      return NextResponse.json(
        {
          success: false,
          message: "topicId query parameter is required",
        },
        { status: 400 },
      );
    }

    const quizzes = await quizController.getQuizzesByTopic(topicId, userId);

    return NextResponse.json(
      {
        success: true,
        data: quizzes,
      },
      { status: 200 },
    );
  } catch (error: any) {
    const status = error.message.includes("Invalid") ? 400 : 500;

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch quizzes",
      },
      { status },
    );
  }
}

// POST /api/quizzes - Create a new quiz
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    let userId: string;
    try {
      userId = await requireAuth(request as Request);
    } catch (err: any) {
      return NextResponse.json(
        { success: false, message: err.message || "Unauthorized" },
        { status: 401 },
      );
    }

    const quiz = await quizController.createQuiz(body, userId);

    return NextResponse.json(
      {
        success: true,
        message: "Quiz created successfully",
        data: quiz,
      },
      { status: 201 },
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

    const status = error.message.includes("not found")
      ? 404
      : error.message.includes("Invalid") || error.message.includes("required")
        ? 400
        : 500;

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create quiz",
      },
      { status },
    );
  }
}
