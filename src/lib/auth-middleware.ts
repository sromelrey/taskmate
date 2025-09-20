"use server";

import { headers } from "next/headers";
import { getCurrentUserFromSession } from "./auth-actions";
import { getSessionIdFromCookies } from "./auth-utils";
import { AuthorizationError } from "./database";

export async function withAuth<T>(
  action: (user: { id: string; email: string; name: string }) => Promise<T>
): Promise<T> {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const sessionId = getSessionIdFromCookies(cookieHeader);

    if (!sessionId) {
      throw new AuthorizationError("No session found");
    }

    const user = await getCurrentUserFromSession(sessionId);
    if (!user) {
      throw new AuthorizationError("Invalid session");
    }

    return await action({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    throw error;
  }
}
