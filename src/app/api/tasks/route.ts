import { NextRequest, NextResponse } from "next/server";
import { getTasks, createTask } from "@/lib/authenticated-actions";
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

    const tasks = await getTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Get tasks API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = getSessionIdFromCookies(request.headers.get("cookie"));

    if (!sessionId) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    const user = await getCurrentUserFromSession(sessionId);
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const taskData = await request.json();
    const newTask = await createTask(taskData);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Create task API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
