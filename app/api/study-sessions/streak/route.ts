import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import StudySession from "@/models/StudySession";
import { requireAuth } from "@/lib/serverAuth";
import { ApiError } from "@/lib/errorHandler";

// Buckets a timestamp into a calendar-day key (YYYY-MM-DD) in the given
// IANA timezone, so a session at e.g. 11pm local time isn't bucketed into
// the next UTC day and doesn't break the user's streak.
const getDayKey = (value: Date, timeZone: string) => {
  // en-CA formats as YYYY-MM-DD, which sorts/compares lexicographically.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
};

const isValidTimeZone = (tz: string) => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();

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

    const { searchParams } = new URL(request.url);
    const tzParam = searchParams.get("tz");
    const timeZone = tzParam && isValidTimeZone(tzParam) ? tzParam : "UTC";

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
      uniqueDays.add(getDayKey(session.createdAt, timeZone));
    });

    const dayList = Array.from(uniqueDays).sort((a, b) => (a > b ? -1 : 1));

    let streak = 0;
    const todayKey = getDayKey(new Date(), timeZone);
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayKey = getDayKey(yesterday, timeZone);

    const currentKey = dayList[0];
    if (currentKey !== todayKey && currentKey !== yesterdayKey) {
      return NextResponse.json(
        { success: true, data: { streak: 0, lastStudyDate: currentKey } },
        { status: 200 },
      );
    }

    for (let i = 0; i < dayList.length; i++) {
      const expected = new Date(`${dayList[0]}T00:00:00Z`);
      expected.setUTCDate(expected.getUTCDate() - i);
      const expectedKey = getDayKey(expected, timeZone);
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
  } catch (error) {
    const err = error as ApiError;
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to fetch study streak",
      },
      { status: 500 },
    );
  }
}
