import { NextRequest } from "next/server";
import { authService } from "@/services/api";

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  role: "admin" | "moderator";
}

/**
 * Server-side authentication utility for Next.js App Router
 * Validates tokens from HttpOnly cookies and returns user data
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    const token = request.cookies.get("accessToken")?.value;

    if (!token) {
      return null;
    }

    // Validate token with backend
    const introspectResponse = await authService.introspectToken({ token });

    if (
      introspectResponse.code !== 1000 ||
      !introspectResponse.result?.isValid
    ) {
      return null;
    }

    // Get user details
    const userId = introspectResponse.result.userId;
    if (!userId) {
      return null;
    }

    // Note: This would need to be implemented in the userService
    // For now, we'll return a basic user object
    // In a real implementation, you'd fetch user details from the backend
    return {
      id: userId,
      email: "", // Would be fetched from userService.getUserById(userId)
      username: "", // Would be fetched from userService.getUserById(userId)
      role: "admin" as const, // Would be determined from user roles
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

/**
 * Middleware helper to check if user is authenticated
 */
export async function requireAuth(
  request: NextRequest
): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}
