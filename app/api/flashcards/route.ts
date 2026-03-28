import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import * as flashcardController from "@/controllers/flashcardController";

// GET /api/flashcards?topicId={id} - Get all flashcards for a topic
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId");
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

    if (!topicId) {
      return NextResponse.json(
        {
          success: false,
          message: "topicId query parameter is required",
        },
        { status: 400 },
      );
    }

    const flashcards = await flashcardController.getFlashcardsByTopic(
      topicId,
      userId,
    );

    return NextResponse.json(
      {
        success: true,
        data: flashcards,
      },
      { status: 200 },
    );
  } catch (error: any) {
    const status = error.message.includes("Invalid") ? 400 : 500;

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch flashcards",
      },
      { status },
    );
  }
}

// POST /api/flashcards - Create a new flashcard
export async function POST(request: NextRequest) {
  try {
    await connectDB();

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

    // Add userId to the flashcard data
    body.userId = userId;

    const flashcard = await flashcardController.createFlashcard(body);

    return NextResponse.json(
      {
        success: true,
        message: "Flashcard created successfully",
        data: flashcard,
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
        message: error.message || "Failed to create flashcard",
      },
      { status },
    );
  }
}
