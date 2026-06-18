import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { requireAuth } from "@/lib/serverAuth";
import { ApiError } from "@/lib/errorHandler";

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

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            provider: user.provider,
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    const err = error as ApiError;
    console.error("Get profile error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to fetch profile",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const { name, avatar } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is required",
        },
        { status: 400 },
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name: name.trim(),
        avatar: avatar || null,
      },
      { new: true, runValidators: true },
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            provider: user.provider,
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    const err = error as ApiError;
    console.error("Update profile error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to update profile",
      },
      { status: 500 },
    );
  }
}
