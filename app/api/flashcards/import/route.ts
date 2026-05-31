import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Flashcard from "@/models/Flashcard";
import Topic from "@/models/Topic";
import { requireAuth } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    let userId: string;
    try {
      userId = await requireAuth(request as Request);
    } catch (err: any) {
      return NextResponse.json(
        { success: false, message: err.message || "Unauthorized" },
        { status: 401 },
      );
    }

    const { topicId, flashcards } = await request.json();
    if (!topicId || !Array.isArray(flashcards)) {
      return NextResponse.json(
        { success: false, message: "Missing topicId or flashcards" },
        { status: 400 },
      );
    }

    const topic = await Topic.findOne({ _id: topicId, userId });
    if (!topic) {
      return NextResponse.json(
        { success: false, message: "Topic not found" },
        { status: 404 },
      );
    }

    const created = await Flashcard.insertMany(
      flashcards.map((fc) => ({ ...fc, topicId, userId })),
    );

    return NextResponse.json(
      { success: true, data: created },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Import failed" },
      { status: 500 },
    );
  }
}
