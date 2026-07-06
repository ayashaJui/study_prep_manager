import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { problemController } from "@/controllers/problemController";
import { requireAuth } from "@/lib/serverAuth";
import { ApiError } from "@/lib/errorHandler";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const userId = await requireAuth(request as Request).catch((err: ApiError) => { throw err; });
    const { confidence } = await request.json();

    if (!["easy", "medium", "hard", "again"].includes(confidence)) {
      return NextResponse.json(
        { success: false, message: "confidence must be easy | medium | hard | again" },
        { status: 400 },
      );
    }

    const problem = await problemController.reviewProblem(id, userId, confidence);
    return NextResponse.json({ success: true, data: problem });
  } catch (error) {
    const err = error as ApiError;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to submit review" },
      { status: err.statusCode || 500 },
    );
  }
}
