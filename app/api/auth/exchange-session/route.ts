import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import { generateToken, setAuthCookie } from "@/lib/auth";
import { ApiError } from "@/lib/errorHandler";

export async function GET(_request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

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
  } catch (error) {
    const err = error as ApiError;
    console.error("Exchange session error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to exchange session",
      },
      { status: 500 },
    );
  }
}
