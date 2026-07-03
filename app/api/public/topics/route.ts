import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Topic from "@/models/Topic";
import User from "@/models/User";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request as Request);
    const rl = rateLimit({ key: `public-topics-list:${ip}`, limit: 30, windowMs: 60_000 });
    if (!rl.ok) {
      return NextResponse.json(
        { success: false, message: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const filter = { isPublic: true, shareId: { $exists: true, $ne: null } };

    const [topics, total] = await Promise.all([
      Topic.find(filter)
        .select("name description shareId stats tags createdAt userId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Topic.countDocuments(filter),
    ]);

    const userIds = [
      ...new Set(topics.map((t) => t.userId?.toString()).filter(Boolean)),
    ];
    const users = await User.find({ _id: { $in: userIds } })
      .select("name")
      .lean();
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u.name as string]));

    const data = topics.map((t) => ({
      shareId: t.shareId,
      name: t.name,
      description: t.description || null,
      tags: t.tags || [],
      stats: {
        notesCount: t.stats?.notesCount || 0,
        flashcardsCount: t.stats?.flashcardsCount || 0,
        quizzesCount: t.stats?.quizzesCount || 0,
      },
      authorName: t.userId ? (userMap[t.userId.toString()] ?? null) : null,
      createdAt: t.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch public topics" },
      { status: 500 },
    );
  }
}
