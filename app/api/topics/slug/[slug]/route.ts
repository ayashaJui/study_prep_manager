import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { topicController } from "@/controllers/topicController";

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

    const topic = await topicController.getTopicBySlug(slug, parentId);

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
      : error.message.includes("Invalid") || error.message.includes("required")
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
