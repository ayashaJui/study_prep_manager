import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Topic from "@/models/Topic";
import { requireAuth } from "@/lib/serverAuth";
import { ApiError } from "@/lib/errorHandler";

export async function POST(
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

    const topic = await Topic.findOne({ _id: id, userId });
    if (!topic) {
      return NextResponse.json(
        { success: false, message: "Topic not found" },
        { status: 404 },
      );
    }

    // Generate a shareId and rely on the unique index to catch collisions
    // atomically (avoids a check-then-act race between concurrent requests).
    const crypto = globalThis.crypto || (await import("crypto")).webcrypto;
    let shareId = crypto.randomUUID();
    topic.isPublic = true;
    topic.shareId = shareId;

    const MAX_ATTEMPTS = 5;
    for (let attempt = 1; ; attempt++) {
      try {
        await topic.save();
        break;
      } catch (err) {
        const isDuplicateShareId =
          (err as { code?: number; keyPattern?: Record<string, unknown> })
            .code === 11000 &&
          "shareId" in
            ((err as { keyPattern?: Record<string, unknown> }).keyPattern ||
              {});
        if (!isDuplicateShareId || attempt >= MAX_ATTEMPTS) {
          throw err;
        }
        shareId = crypto.randomUUID();
        topic.shareId = shareId;
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: { shareId, publicUrl: `/public/topic/${shareId}` },
      },
      { status: 200 },
    );
  } catch (error) {
    const err = error as ApiError;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to publish topic" },
      { status: 500 },
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

    const topic = await Topic.findOne({ _id: id, userId });
    if (!topic) {
      return NextResponse.json(
        { success: false, message: "Topic not found" },
        { status: 404 },
      );
    }

    topic.isPublic = false;
    topic.shareId = undefined;
    topic.markModified("shareId");
    await topic.save();

    return NextResponse.json(
      { success: true, message: "Topic unpublished" },
      { status: 200 },
    );
  } catch (error) {
    const err = error as ApiError;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to unpublish topic" },
      { status: 500 },
    );
  }
}
