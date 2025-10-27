import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/api";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No access token found" },
        { status: 401 }
      );
    }

    const response = await authService.refreshToken(token);

    if (response.code === 1000 && response.result) {
      const { token: newToken } = response.result;

      // Create response
      const nextResponse = NextResponse.json(
        { success: true, message: "Token refreshed successfully" },
        { status: 200 }
      );

      // Set new HttpOnly cookie
      nextResponse.cookies.set("accessToken", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return nextResponse;
    } else {
      return NextResponse.json(
        { error: "Token refresh failed" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Token refresh failed" },
      { status: 500 }
    );
  }
}
