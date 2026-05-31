import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { name, email, password, confirmPassword } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide all required fields",
        },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Passwords do not match",
        },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters",
        },
        { status: 400 },
      );
    }

    const ip = getClientIp(request as Request);
    const rate = rateLimit({
      key: `auth:register:${ip}:${email.toLowerCase()}`,
      limit: 3,
      windowMs: 60_000,
    });
    if (!rate.ok) {
      const retryAfter = Math.ceil((rate.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          success: false,
          message: "Too many registration attempts. Please try again later.",
        },
        {
          status: 429,
          headers: { "Retry-After": retryAfter.toString() },
        },
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already registered",
        },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      provider: "credentials",
      emailVerified: true, // Auto-verify for now (implement email verification later)
    });

    // Generate token
    const token = generateToken(user._id.toString());

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
          token,
        },
      },
      { status: 201 },
    );

    // Set auth cookie
    return setAuthCookie(response, token);
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Registration failed",
      },
      { status: 500 },
    );
  }
}
