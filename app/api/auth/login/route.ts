import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { comparePassword, generateToken, setAuthCookie } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { ApiError } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide email and password",
        },
        { status: 400 },
      );
    }

    const ip = getClientIp(request as Request);
    const rate = rateLimit({
      key: `auth:login:${ip}:${email.toLowerCase()}`,
      limit: 5,
      windowMs: 60_000,
    });
    if (!rate.ok) {
      const retryAfter = Math.ceil((rate.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          success: false,
          message: "Too many login attempts. Please try again later.",
        },
        {
          status: 429,
          headers: { "Retry-After": retryAfter.toString() },
        },
      );
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    // Check if user has password (could be OAuth-only user)
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login using your social account",
        },
        { status: 401 },
      );
    }

    // Compare password
    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
          token,
        },
      },
      { status: 200 },
    );

    // Set auth cookie
    return setAuthCookie(response, token);
  } catch (error) {
    const err = error as ApiError;
    console.error("Login error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Login failed",
      },
      { status: 500 },
    );
  }
}
