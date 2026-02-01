import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { topicController } from "@/controllers/topicController";

// GET /api/topics/[id] - Get a single topic by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    const topic = await topicController.getTopicById(id);

    return NextResponse.json(
      {
        success: true,
        data: topic,
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
        message: error.message || "Failed to fetch topic",
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
    const topic = await topicController.updateTopic(id, body);

    return NextResponse.json({
      success: true,
      message: "Topic updated successfully",
      data: topic,
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
        message: error.message || "Failed to update topic",
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

    const topic = await topicController.deleteTopic(id);

    return NextResponse.json({
      success: true,
      message: "Topic deleted successfully",
      data: topic,
    });
  } catch (error: any) {
    const status = error.message.includes("not found")
      ? 404
      : error.message.includes("Invalid")
        ? 400
        : error.message.includes("Cannot delete")
          ? 409
          : 500;

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete topic",
      },
      { status },
    );
  }
}
