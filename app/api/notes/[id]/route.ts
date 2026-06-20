import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { noteController } from "@/controllers/noteController";
import { requireAuth } from "@/lib/serverAuth";
import { ApiError } from "@/lib/errorHandler";
import StudySession from "@/models/StudySession";

// GET /api/notes/[id] - Get a single note by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
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

    const note = await noteController.getNoteById(id, userId);

    return NextResponse.json(
      {
        success: true,
        data: note,
      },
      { status: 200 },
    );
  } catch (error) {
    const err = error as ApiError;
    const status = err.message.includes("not found")
      ? 404
      : err.message.includes("Invalid")
        ? 400
        : 500;

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to fetch note",
      },
      { status },
    );
  }
}

// PATCH /api/notes/[id] - Update a note
export async function PATCH(
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

    const note = await noteController.updateNote(id, body, userId);

    // Only log a study session for actual content edits, not pin toggles etc.
    if (body.content !== undefined) {
      await StudySession.create({
        userId,
        topicId: note.topicId,
        activityType: "note",
        duration: body.duration || 1,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Note updated successfully",
      data: note,
    });
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

    const status = err.message.includes("not found")
      ? 404
      : err.message.includes("Invalid")
        ? 400
        : 500;

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to update note",
      },
      { status },
    );
  }
}

// DELETE /api/notes/[id] - Delete a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
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

    const note = await noteController.deleteNote(id, userId);

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
      data: note,
    });
  } catch (error) {
    const err = error as ApiError;
    const status = err.message.includes("not found")
      ? 404
      : err.message.includes("Invalid")
        ? 400
        : 500;

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to delete note",
      },
      { status },
    );
  }
}
