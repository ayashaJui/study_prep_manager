import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { topicController } from "@/controllers/topicController";

// GET /api/topics - Get all topics or filter by parentId
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const userId = request.headers.get("x-user-id") || undefined; // From middleware

    // Get topics for this user only
    let query: any = { userId };

    if (parentId) {
      if (parentId === "null" || parentId === "root") {
        query.parentId = null;
      } else {
        query.parentId = parentId;
      }
    }

    const topics = await topicController.getAllTopics(parentId, userId);

    return NextResponse.json(
      {
        success: true,
        data: topics,
      },
      {
        status: 200,
      },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch topics",
      },
      { status: 500 },
    );
  }
}

// POST /api/topics - Create a new topic
export async function POST(request: NextRequest) {
  try {
    await connectDB();

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

    // Add userId to the topic data
    body.userId = userId;

    const topic = await topicController.createTopic(body);

    return NextResponse.json(
      {
        success: true,
        message: "Topic created successfully",
        data: topic,
      },
      { status: 201 },
    );
  } catch (error: any) {
    // Handle validation errors
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

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "A topic with this slug already exists at this level",
        },
        { status: 409 },
      );
    }

    // Handle custom errors
    const status = error.message.includes("not found")
      ? 404
      : error.message.includes("Invalid") || error.message.includes("required")
        ? 400
        : 500;

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create topic",
      },
      { status },
    );
  }
}
