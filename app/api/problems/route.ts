import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { problemController } from "@/controllers/problemController";
import { requireAuth } from "@/lib/serverAuth";
import { ApiError } from "@/lib/errorHandler";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const userId = await requireAuth(request as Request).catch((err: ApiError) => {
      throw err;
    });

    const { searchParams } = new URL(request.url);
    const filters = {
      topicId: searchParams.get("topicId") || undefined,
      status: searchParams.get("status") || undefined,
      difficulty: searchParams.get("difficulty") || undefined,
      platform: searchParams.get("platform") || undefined,
      tag: searchParams.get("tag") || undefined,
      due: searchParams.get("due") === "true",
    };

    const problems = await problemController.getProblems(userId, filters);
    return NextResponse.json({ success: true, data: problems }, { status: 200 });
  } catch (error) {
    const err = error as ApiError;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch problems" },
      { status: err.statusCode || 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const userId = await requireAuth(request as Request).catch((err: ApiError) => {
      throw err;
    });

    const body = await request.json();
    const problem = await problemController.createProblem({ ...body, userId });
    return NextResponse.json({ success: true, data: problem }, { status: 201 });
  } catch (error) {
    const err = error as ApiError;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create problem" },
      { status: err.statusCode || 500 },
    );
  }
}
