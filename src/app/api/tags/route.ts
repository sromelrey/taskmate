import { NextRequest, NextResponse } from "next/server";
import { getTags } from "@/lib/authenticated-actions";
import { getSessionIdFromCookies } from "@/lib/auth-utils";
import { getCurrentUserFromSession } from "@/lib/auth-actions";

export async function GET(request: NextRequest) {
  try {
    const sessionId = getSessionIdFromCookies(request.headers.get("cookie"));

    if (!sessionId) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    const user = await getCurrentUserFromSession(sessionId);
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const tags = await getTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Get tags API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
