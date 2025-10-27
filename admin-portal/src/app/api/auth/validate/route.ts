import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/api";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No access token found" },
        { status: 401 }
      );
    }

    const response = await authService.introspectToken({ token });

    if (response.code === 1000 && response.result?.isValid) {
      return NextResponse.json(
        {
          isValid: true,
          userId: response.result.userId,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  } catch (error: any) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { error: "Token validation failed" },
      { status: 500 }
    );
  }
}
