import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Quiz from "@/models/Quiz";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { topicId, quizzes } = await req.json();
    if (!topicId || !Array.isArray(quizzes)) {
      return NextResponse.json(
        { error: "Missing topicId or quizzes" },
        { status: 400 },
      );
    }
    // Bulk insert quizzes
    const created = await Quiz.insertMany(
      quizzes.map((quiz) => ({ ...quiz, topicId })),
    );
    return NextResponse.json({ success: true, quizzes: created });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Import failed" },
      { status: 500 },
    );
  }
}
