import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { noteController } from "@/controllers/noteController";

// GET /api/notes - Get all notes for a topic
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
          message: "Topic ID is required",
        },
        { status: 400 },
      );
    }

    const notes = await noteController.getNotesByTopic(topicId, userId);

    return NextResponse.json(
      {
        success: true,
        data: notes,
      },
      { status: 200 },
    );
  } catch (error: any) {
    const status = error.message.includes("Invalid") ? 400 : 500;

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch notes",
      },
      { status },
    );
  }
}

// POST /api/notes - Create a new note
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

    // Add userId to the note data
    body.userId = userId;
    const note = await noteController.createNote(body);

    return NextResponse.json(
      {
        success: true,
        message: "Note created successfully",
        data: note,
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
        message: error.message || "Failed to create note",
      },
      { status },
    );
  }
}
