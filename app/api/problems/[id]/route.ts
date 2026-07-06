import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { problemController } from "@/controllers/problemController";
import { requireAuth } from "@/lib/serverAuth";
import { ApiError } from "@/lib/errorHandler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const userId = await requireAuth(request as Request).catch((err: ApiError) => { throw err; });
    const problem = await problemController.getProblemById(id, userId);
    return NextResponse.json({ success: true, data: problem });
  } catch (error) {
    const err = error as ApiError;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch problem" },
      { status: err.statusCode || 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const userId = await requireAuth(request as Request).catch((err: ApiError) => { throw err; });
    const body = await request.json();
    const problem = await problemController.updateProblem(id, userId, body);
    return NextResponse.json({ success: true, data: problem });
  } catch (error) {
    const err = error as ApiError;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update problem" },
      { status: err.statusCode || 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const userId = await requireAuth(request as Request).catch((err: ApiError) => { throw err; });
    await problemController.deleteProblem(id, userId);
    return NextResponse.json({ success: true, message: "Problem deleted" });
  } catch (error) {
    const err = error as ApiError;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete problem" },
      { status: err.statusCode || 500 },
    );
  }
}
