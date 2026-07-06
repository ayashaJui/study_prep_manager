import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { topicController } from "@/controllers/topicController";
import { requireAuth } from "@/lib/serverAuth";
import { ApiError } from "@/lib/errorHandler";

// GET /api/topics/[id] - Get a single topic by ID
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

    const topic = await topicController.getTopicById(id, userId);

    return NextResponse.json(
      {
        success: true,
        data: topic,
      },
      { status: 200 },
    );
  } catch (error) {
    const err = error as ApiError;
    const status = err.statusCode || 500;

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to fetch topic",
      },
      { status },
    );
  }
}

// PATCH /api/topics/[id] - Update a topic
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

    const topic = await topicController.updateTopic(id, body, userId);

    return NextResponse.json({
      success: true,
      message: "Topic updated successfully",
      data: topic,
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

    const status = err.statusCode || 500;

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to update topic",
      },
      { status },
    );
  }
}

// DELETE /api/topics/[id] - Delete a topic
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

    const recursive = request.nextUrl.searchParams.get("recursive") === "true";
    const topic = recursive
      ? await topicController.deleteTopicRecursive(id, userId)
      : await topicController.deleteTopic(id, userId);

    return NextResponse.json({
      success: true,
      message: "Topic deleted successfully",
      data: topic,
    });
  } catch (error) {
    const err = error as ApiError;
    const status = err.statusCode || 500;

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to delete topic",
      },
      { status },
    );
  }
}
