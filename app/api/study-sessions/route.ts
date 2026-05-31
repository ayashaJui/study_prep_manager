import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import StudySession from "@/models/StudySession";
import { requireAuth } from "@/lib/serverAuth";

// GET /api/study-sessions?limit=10&page=1
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    let userId: string;
    try {
      userId = await requireAuth(request as Request);
    } catch (err: any) {
      return NextResponse.json(
        { success: false, message: err.message || "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

    const query = { userId };
    const [sessions, total] = await Promise.all([
      StudySession.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      StudySession.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: sessions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch study sessions",
      },
      { status: 500 },
    );
  }
}

// POST /api/study-sessions
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    let userId: string;
    try {
      userId = await requireAuth(request as Request);
    } catch (err: any) {
      return NextResponse.json(
        { success: false, message: err.message || "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const session = await StudySession.create({
      userId,
      topicId: body.topicId || null,
      activityType: body.activityType,
      duration: body.duration || 0,
      score: body.score,
    });

    return NextResponse.json(
      {
        success: true,
        data: session,
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create study session",
      },
      { status: 500 },
    );
  }
}
