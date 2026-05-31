import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getTokenFromRequest } from "@/lib/auth";

// Protected routes that require authentication
const protectedRoutes = [
  "/user",
  "/api/topics",
  "/api/notes",
  "/api/flashcards",
  "/api/quizzes",
  "/api/dashboard",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith("/api/");
  const requestedPath = `${pathname}${request.nextUrl.search}`;

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Skip proxy for public routes
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get token from request
  const token = getTokenFromRequest(request);

  if (!token) {
    if (!isApiRoute) {
      const loginUrl = new URL("/auth/login", request.url);

      if (requestedPath !== "/") {
        loginUrl.searchParams.set("redirectTo", requestedPath);
      }

      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized - No token provided",
      },
      { status: 401 },
    );
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized - Missing JWT secret",
      },
      { status: 401 },
    );
  }

  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    if (!payload?.userId) {
      throw new Error("Invalid token payload");
    }
  } catch {
    if (!isApiRoute) {
      const loginUrl = new URL("/auth/login", request.url);

      if (requestedPath !== "/") {
        loginUrl.searchParams.set("redirectTo", requestedPath);
      }

      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized - Invalid or expired token",
      },
      { status: 401 },
    );
  }

  // Do NOT inject `x-user-id` here. Token signature verification must be
  // performed server-side inside API route handlers where Node APIs are
  // available. Proxy only performs a lightweight presence/expiry check
  // to handle redirects for pages and public routes.

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/user/:path*",
    // Protected API routes
    "/api/topics/:path*",
    "/api/notes/:path*",
    "/api/flashcards/:path*",
    "/api/quizzes/:path*",
    "/api/dashboard/:path*",
    // Protected pages (optional)
    // "/:path*(?<!auth|login|register)"
  ],
};