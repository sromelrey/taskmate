import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth-actions";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const result = await registerUser(email, password, name);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Use the session ID from the registration result
    const sessionId = result.sessionId || uuidv4();
    const response = NextResponse.json({ user: result.user });

    response.cookies.set("taskmate-session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
