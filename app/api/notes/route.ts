import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { noteController } from "@/controllers/noteController";
import { requireAuth } from "@/lib/serverAuth";
import { ApiError } from "@/lib/errorHandler";
import StudySession from "@/models/StudySession";

// GET /api/notes - Get all notes for a topic
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId");
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
  } catch (error) {
    const err = error as ApiError;
    const status = err.statusCode || 500;

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to fetch notes",
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

    // Add userId to the note data
    body.userId = userId;
    const note = await noteController.createNote(body);

    await StudySession.create({
      userId,
      topicId: note.topicId,
      activityType: "note",
      duration: body.duration || 1,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Note created successfully",
        data: note,
      },
      { status: 201 },
    );
  } catch (error) {
    const err = error as ApiError;
    if (err.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: Object.values(err.errors ?? {}).map((e) => e.message),
        },
        { status: 400 },
      );
    }

    const status = err.statusCode || 500;

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to create note",
      },
      { status },
    );
  }
}
