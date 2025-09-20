import { NextRequest, NextResponse } from "next/server";
import { getSessionIdFromCookies } from "@/lib/auth-utils";
import { getCurrentUserFromSession } from "@/lib/auth-actions";
import { cleanupOldDoneTasks, getCleanupStats } from "@/lib/cleanup-actions";

export async function GET(request: NextRequest) {
  try {
    // Get session ID from cookies
    const sessionId = getSessionIdFromCookies(request.headers.get("cookie"));
    if (!sessionId) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    // Get current user from session
    const user = await getCurrentUserFromSession(sessionId);
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Get cleanup statistics
    const stats = await getCleanupStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error getting cleanup stats:", error);
    return NextResponse.json(
      { error: "Failed to get cleanup stats" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get session ID from cookies
    const sessionId = getSessionIdFromCookies(request.headers.get("cookie"));
    if (!sessionId) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    // Get current user from session
    const user = await getCurrentUserFromSession(sessionId);
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Perform cleanup
    const result = await cleanupOldDoneTasks();

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} old tasks`,
      deletedCount: result.deletedCount,
      deletedTasks: result.deletedTasks,
    });
  } catch (error) {
    console.error("Error performing cleanup:", error);
    return NextResponse.json(
      { error: "Failed to perform cleanup" },
      { status: 500 }
    );
  }
}
