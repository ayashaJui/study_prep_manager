import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import * as flashcardController from "@/controllers/flashcardController";

// GET /api/flashcards/[id] - Get single flashcard
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    const flashcard = await flashcardController.getFlashcardById(id);

    return NextResponse.json(
      {
        success: true,
        data: flashcard,
      },
      { status: 200 },
    );
  } catch (error: any) {
    const status =
      error.message === "Flashcard not found"
        ? 404
        : error.message.includes("Invalid")
          ? 400
          : 500;

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch flashcard",
      },
      { status },
    );
  }
}

// PATCH /api/flashcards/[id] - Update flashcard
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const flashcard = await flashcardController.updateFlashcard(id, body);

    return NextResponse.json(
      {
        success: true,
        message: "Flashcard updated successfully",
        data: flashcard,
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
      error.message === "Flashcard not found"
        ? 404
        : error.message.includes("Invalid")
          ? 400
          : 500;

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update flashcard",
      },
      { status },
    );
  }
}

// DELETE /api/flashcards/[id] - Delete flashcard
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    await flashcardController.deleteFlashcard(id);

    return NextResponse.json(
      {
        success: true,
        message: "Flashcard deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    const status =
      error.message === "Flashcard not found"
        ? 404
        : error.message.includes("Invalid")
          ? 400
          : 500;

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete flashcard",
      },
      { status },
    );
  }
}
