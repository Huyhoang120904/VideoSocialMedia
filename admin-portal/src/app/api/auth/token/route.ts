import { NextRequest, NextResponse } from "next/server";

// GET endpoint to retrieve token from HttpOnly cookie
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No access token found" },
        { status: 401 }
      );
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Token retrieval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Legacy POST endpoint for compatibility
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken } = body;

    // Mock token validation for demo purposes
    if (accessToken === "mock-access-token") {
      const mockUser = {
        id: "1",
        email: "admin@tiktokclone.com",
        username: "admin",
        role: "admin",
        avatar: undefined,
      };

      return NextResponse.json({
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        data: {
          account: mockUser,
        },
      });
    }

    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  } catch (err) {
    console.error("Token validation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
