import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import StudySession from "@/models/StudySession";
import { requireAuth } from "@/lib/serverAuth";

const getDayKey = (value: Date) => {
  const day = new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );
  return day.toISOString().slice(0, 10);
};

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

    const sessions = await StudySession.find({ userId })
      .sort({ createdAt: -1 })
      .select("createdAt");

    if (sessions.length === 0) {
      return NextResponse.json(
        { success: true, data: { streak: 0, lastStudyDate: null } },
        { status: 200 },
      );
    }

    const uniqueDays = new Set<string>();
    sessions.forEach((session) => {
      uniqueDays.add(getDayKey(session.createdAt));
    });

    const dayList = Array.from(uniqueDays).sort((a, b) => (a > b ? -1 : 1));

    let streak = 0;
    const todayKey = getDayKey(new Date());
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayKey = getDayKey(yesterday);

    let currentKey = dayList[0];
    if (currentKey !== todayKey && currentKey !== yesterdayKey) {
      return NextResponse.json(
        { success: true, data: { streak: 0, lastStudyDate: currentKey } },
        { status: 200 },
      );
    }

    for (let i = 0; i < dayList.length; i++) {
      const expected = new Date(dayList[0]);
      expected.setUTCDate(expected.getUTCDate() - i);
      const expectedKey = getDayKey(expected);
      if (dayList[i] === expectedKey) {
        streak += 1;
      } else {
        break;
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: { streak, lastStudyDate: dayList[0] },
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch study streak",
      },
      { status: 500 },
    );
  }
}
