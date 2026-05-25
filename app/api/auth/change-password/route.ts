import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { comparePassword, getTokenFromRequest, hashPassword, verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Missing token" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Invalid token" },
        { status: 401 },
      );
    }

    const { currentPassword, newPassword, confirmPassword } =
      await request.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: "All password fields are required" },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match" },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const user = await User.findById(decoded.userId).select("+password");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password changes must be done through your provider",
        },
        { status: 400 },
      );
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 401 },
      );
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return NextResponse.json(
      { success: true, message: "Password updated successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to change password",
      },
      { status: 500 },
    );
  }
}
