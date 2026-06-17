import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import { generateToken, setAuthCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = (await getServerSession(
      authOptions as any,
    )) as Session | null;

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: "No session" },
        { status: 401 },
      );
    }

    const userId = session.user.id as string;
    const token = generateToken(userId);

    const response = NextResponse.json(
      { success: true, token },
      { status: 200 },
    );

    // Set HttpOnly cookie for compatibility with serverAuth that checks cookies
    return setAuthCookie(response, token);
  } catch (error: any) {
    console.error("Exchange session error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to exchange session",
      },
      { status: 500 },
    );
  }
}
