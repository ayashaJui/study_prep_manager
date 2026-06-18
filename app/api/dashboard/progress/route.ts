import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Topic from "@/models/Topic";
import { ApiError } from "@/lib/errorHandler";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Fetch top-level topics with their stats
    const topics = await Topic.find({ level: 0 })
      .sort({ createdAt: -1 })
      .limit(10);

    const topicProgress = topics.map((topic) => ({
      name: topic.name,
      progress: topic.stats?.completionPercentage || 0,
      status: topic.status || "not-started",
      id: topic._id,
    }));

    return NextResponse.json(
      {
        success: true,
        data: topicProgress,
      },
      { status: 200 },
    );
  } catch (error) {
    const err = error as ApiError;
    console.error("Error fetching topic progress:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to fetch topic progress",
      },
      { status: 500 },
    );
  }
}
