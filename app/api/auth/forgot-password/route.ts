import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { ApiError } from "@/lib/errorHandler";

// Configure email transporter (using Gmail SMTP)
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASSWORD;
const isProduction = process.env.NODE_ENV === "production";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    if (isProduction && (!emailUser || !emailPass)) {
      throw new Error(
        "Missing EMAIL_USER or EMAIL_PASSWORD. Set Gmail SMTP credentials in production.",
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 },
      );
    }

    const ip = getClientIp(request as Request);
    const rate = rateLimit({
      key: `auth:forgot:${ip}:${email.toLowerCase()}`,
      limit: 5,
      windowMs: 60_000,
    });
    if (!rate.ok) {
      const retryAfter = Math.ceil((rate.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests. Please try again later.",
        },
        {
          status: 429,
          headers: { "Retry-After": retryAfter.toString() },
        },
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if email exists
      return NextResponse.json(
        {
          success: true,
          message: "If an account exists, a password reset email has been sent",
        },
        { status: 200 },
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save token and expiry to user (10 minutes)
    user.resetToken = resetTokenHash;
    user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/auth/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: emailUser,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Reset Your Password</h2>
        <p>You requested a password reset. Click the link below to reset your password.</p>
        <a href="${resetLink}" style="background-color: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>This link expires in 10 minutes.</p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });

    return NextResponse.json(
      {
        success: true,
        message: "If an account exists, a password reset email has been sent",
      },
      { status: 200 },
    );
  } catch (error) {
    const err = error as ApiError;
    console.error("Forgot password error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to process password reset",
      },
      { status: 500 },
    );
  }
}
