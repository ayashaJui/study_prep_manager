import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Note from "@/models/Note";
import { requireAuth } from "@/lib/serverAuth";
import { ApiError } from "@/lib/errorHandler";

// GET /api/notes/pinned - Get all pinned notes for the user, across topics
export async function GET(request: NextRequest) {
  try {
    await connectDB();

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

    const notes = await Note.find({ userId, pinned: true })
      .sort({ updatedAt: -1 })
      .populate("topicId", "name slug");

    return NextResponse.json(
      {
        success: true,
        data: notes,
      },
      { status: 200 },
    );
  } catch (error) {
    const err = error as ApiError;
    console.error("Error fetching pinned notes:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to fetch pinned notes",
      },
      { status: 500 },
    );
  }
}
