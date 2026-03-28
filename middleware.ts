import { NextRequest, NextResponse } from "next/server";
import { decodeTokenPayload, getTokenFromRequest } from "@/lib/auth";

// Protected routes that require authentication
const protectedRoutes = [
  "/api/topics",
  "/api/notes",
  "/api/flashcards",
  "/api/quizzes",
  "/api/dashboard",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Skip middleware for public routes
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get token from request
  const token = getTokenFromRequest(request);

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized - No token provided",
      },
      { status: 401 },
    );
  }

  // Edge-safe token validation: decode payload and check expiry/userId.
  const decoded = decodeTokenPayload(token);
  const nowInSeconds = Math.floor(Date.now() / 1000);

  if (!decoded?.userId || (decoded.exp && decoded.exp < nowInSeconds)) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized - Invalid or expired token",
      },
      { status: 401 },
    );
  }

  // Add userId to request headers for use in API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", decoded.userId);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
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
