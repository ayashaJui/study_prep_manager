import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { noteController } from "@/controllers/noteController";

// GET /api/notes/[id] - Get a single note by ID
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

    const note = await noteController.getNoteById(id, userId);

    return NextResponse.json(
      {
        success: true,
        data: note,
      },
      { status: 200 },
    );
  } catch (error: any) {
    const status = error.message.includes("not found")
      ? 404
      : error.message.includes("Invalid")
        ? 400
        : 500;

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch note",
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

    const note = await noteController.updateNote(id, body, userId);

    return NextResponse.json({
      success: true,
      message: "Note updated successfully",
      data: note,
    });
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
      : error.message.includes("Invalid")
        ? 400
        : 500;

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update note",
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

    const note = await noteController.deleteNote(id, userId);

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
      data: note,
    });
  } catch (error: any) {
    const status = error.message.includes("not found")
      ? 404
      : error.message.includes("Invalid")
        ? 400
        : 500;

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete note",
      },
      { status },
    );
  }
}
