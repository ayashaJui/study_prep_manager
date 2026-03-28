import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRY = "7d";

// Generate JWT token
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
};

// Verify JWT token
export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as { userId: string };
  } catch (error) {
    return null;
  }
};

// Decode JWT payload without signature verification (Edge-safe utility).
// Use only in middleware where jsonwebtoken may not run in Edge runtime.
export const decodeTokenPayload = (
  token: string,
): { userId?: string; exp?: number } | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");

    let decodedJson = "";
    if (typeof atob === "function") {
      decodedJson = atob(payload);
    } else {
      decodedJson = Buffer.from(payload, "base64").toString("utf-8");
    }

    return JSON.parse(decodedJson) as { userId?: string; exp?: number };
  } catch {
    return null;
  }
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
};

// Compare password
export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcryptjs.compare(password, hashedPassword);
};

// Extract token from request
export const getTokenFromRequest = (request: Request): string | null => {
  // Check Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Check cookies
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>,
    );
    return cookies.auth_token || null;
  }

  return null;
};

// Set auth cookie in response
export const setAuthCookie = (response: Response, token: string): Response => {
  // In development (localhost), don't require Secure flag for HTTP
  // In production, always use Secure flag for HTTPS
  const isProduction = process.env.NODE_ENV === "production";
  const secureFlagSuffix = isProduction ? "; Secure" : "";

  response.headers.append(
    "Set-Cookie",
    `auth_token=${token}; Path=/; HttpOnly${secureFlagSuffix}; SameSite=Lax; Max-Age=604800`,
  );
  return response;
};

// Clear auth cookie
export const clearAuthCookie = (response: Response): Response => {
  // In development (localhost), don't require Secure flag for HTTP
  // In production, always use Secure flag for HTTPS
  const isProduction = process.env.NODE_ENV === "production";
  const secureFlagSuffix = isProduction ? "; Secure" : "";

  response.headers.append(
    "Set-Cookie",
    `auth_token=; Path=/; HttpOnly${secureFlagSuffix}; SameSite=Lax; Max-Age=0`,
  );
  return response;
};
