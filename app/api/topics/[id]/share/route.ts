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

    // Generate unique shareId
    const crypto = globalThis.crypto || (await import("crypto")).webcrypto;
    let shareId = crypto.randomUUID();
    // Ensure uniqueness
    while (await Topic.findOne({ shareId })) {
      shareId = crypto.randomUUID();
    }

    topic.isPublic = true;
    topic.shareId = shareId;
    await topic.save();

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
    topic.shareId = null;
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
