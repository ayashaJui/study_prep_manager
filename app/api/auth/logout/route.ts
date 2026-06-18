import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { ApiError } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200 },
    );

    // Clear auth cookie
    return clearAuthCookie(response);
  } catch (error) {
    const err = error as ApiError;
    console.error("Logout error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Logout failed",
      },
      { status: 500 },
    );
  }
}
