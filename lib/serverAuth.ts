import jwt from "jsonwebtoken";
import { getTokenFromRequest } from "./auth";

/**
 * Server-side helper: verify token signature and return userId.
 * Throws an Error when token is missing/invalid/expired.
 */
export async function requireAuth(request: Request): Promise<string> {
  const token = getTokenFromRequest(request as Request);
  if (!token) {
    throw new Error("Unauthorized - No token provided");
  }

  try {
    // Verify token signature using same helper as auth
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as {
      userId?: string;
    };
    if (!decoded || !decoded.userId) {
      throw new Error("Unauthorized - Invalid token payload");
    }

    return decoded.userId as string;
  } catch (err) {
    throw new Error("Unauthorized - Invalid or expired token");
  }
}

export function tryGetUserIdFromToken(request: Request): string | null {
  try {
    const token = getTokenFromRequest(request as Request);
    if (!token) return null;
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    const decoded = jwt.verify(token, secret) as { userId?: string };
    return decoded?.userId || null;
  } catch {
    return null;
  }
}
