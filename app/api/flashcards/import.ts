import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Flashcard from "@/models/Flashcard";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { topicId, flashcards } = await req.json();
    if (!topicId || !Array.isArray(flashcards)) {
      return NextResponse.json(
        { error: "Missing topicId or flashcards" },
        { status: 400 },
      );
    }
    // Bulk insert flashcards
    const created = await Flashcard.insertMany(
      flashcards.map((fc) => ({ ...fc, topicId })),
    );
    return NextResponse.json({ success: true, flashcards: created });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
