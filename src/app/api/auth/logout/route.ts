import { NextRequest, NextResponse } from "next/server";
import { logoutUser } from "@/lib/auth-actions";
import { getSessionIdFromCookies } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const sessionId = getSessionIdFromCookies(request.headers.get("cookie"));

    if (sessionId) {
      await logoutUser(sessionId);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("taskmate-session");

    return response;
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
