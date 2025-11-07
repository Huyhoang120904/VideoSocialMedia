import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/api";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const response = await authService.authenticate({ username, password });

    if (response.code === 1000 && response.result) {
      const { token, expireAt } = response.result;

      // Create response with HttpOnly cookie
      const nextResponse = NextResponse.json(
        { success: true, message: "Login successful" },
        { status: 200 }
      );

      // Set HttpOnly, Secure, SameSite cookie
      nextResponse.cookies.set("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return nextResponse;
    } else {
      return NextResponse.json(
        { error: response.message || "Authentication failed" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
