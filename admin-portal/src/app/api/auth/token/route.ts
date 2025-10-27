import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, refreshToken } = body;

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
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
