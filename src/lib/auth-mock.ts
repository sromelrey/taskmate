"use server";

// Mock authentication for testing when database is unavailable
import { User } from "./types";

const mockUser: User = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "dev@example.com",
  name: "Development User",
  timezone: "UTC",
  wip_limit: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Simple session storage for mock
const sessions = new Map<string, { userId: string; expires: number }>();

export async function loginUser(
  email: string,
  password: string
): Promise<{
  success: boolean;
  user?: User;
  sessionId?: string;
  error?: string;
}> {
  try {
    // Mock login - accept any email/password for testing
    if (email && password) {
      const sessionId = `mock-session-${Date.now()}`;
      const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      sessions.set(sessionId, { userId: mockUser.id, expires });

      return {
        success: true,
        user: mockUser,
        sessionId: sessionId,
      };
    }

    return {
      success: false,
      error: "Email and password are required",
    };
  } catch {
    return {
      success: false,
      error: "Login failed",
    };
  }
}

export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<{
  success: boolean;
  user?: User;
  sessionId?: string;
  error?: string;
}> {
  try {
    // Mock registration - accept any valid input
    if (email && password && name) {
      const sessionId = `mock-session-${Date.now()}`;
      const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      sessions.set(sessionId, { userId: mockUser.id, expires });

      return {
        success: true,
        user: mockUser,
        sessionId: sessionId,
      };
    }

    return {
      success: false,
      error: "Email, password, and name are required",
    };
  } catch {
    return {
      success: false,
      error: "Registration failed",
    };
  }
}

export async function getCurrentUserFromSession(
  sessionId: string
): Promise<User | null> {
  try {
    const session = sessions.get(sessionId);
    if (!session || session.expires < Date.now()) {
      sessions.delete(sessionId);
      return null;
    }

    return mockUser;
  } catch {
    return null;
  }
}

export async function logoutUser(sessionId: string): Promise<void> {
  sessions.delete(sessionId);
}
