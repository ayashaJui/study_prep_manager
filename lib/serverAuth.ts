import { getTokenFromRequest, verifyTokenSignature } from "./auth";

/**
 * Server-side helper: verify token signature and return userId.
 * Throws an Error when token is missing/invalid/expired.
 */
export async function requireAuth(request: Request): Promise<string> {
  const token = getTokenFromRequest(request as Request);
  if (!token) {
    throw new Error("Unauthorized - No token provided");
  }

  const decoded = verifyTokenSignature(token);
  if (!decoded || !decoded.userId) {
    throw new Error("Unauthorized - Invalid or expired token");
  }

  return decoded.userId;
}

export function tryGetUserIdFromToken(request: Request): string | null {
  const token = getTokenFromRequest(request as Request);
  if (!token) return null;
  const decoded = verifyTokenSignature(token);
  return decoded?.userId || null;
}
