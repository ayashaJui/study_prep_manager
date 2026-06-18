import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { topicController } from "@/controllers/topicController";
import { tryGetUserIdFromToken } from "@/lib/serverAuth";
import { ApiError } from "@/lib/errorHandler";

// GET /api/topics/slug/[slug] - Get a topic by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await connectDB();
    const { slug } = await params;

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const userId = tryGetUserIdFromToken(request as Request) || undefined;

    const topic = await topicController.getTopicBySlug(slug, parentId, userId);

    return NextResponse.json(
      {
        success: true,
        data: topic,
      },
      { status: 200 },
    );
  } catch (error) {
    const err = error as ApiError;
    const status = err.message.includes("not found")
      ? 404
      : err.message.includes("Invalid") || err.message.includes("required")
        ? 400
        : 500;

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to fetch topic",
      },
      { status },
    );
  }
}
