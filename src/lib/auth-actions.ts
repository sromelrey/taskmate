"use server";

import { query } from "./database";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export interface User {
  id: string;
  email: string;
  name: string;
  timezone: string;
  wip_limit: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  sessionId?: string;
  error?: string;
}

// Simple session storage (in production, use proper session management)
// Use global variable to persist across Next.js hot reloads
declare global {
  var __sessions: Map<string, { userId: string; expires: number }> | undefined;
}

const sessions =
  globalThis.__sessions ||
  new Map<string, { userId: string; expires: number }>();
globalThis.__sessions = sessions;

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    // Find user by email
    const result = await query("SELECT * FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);

    if (result.rows.length === 0) {
      throw new Error("Invalid email or password");
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // Create session
    const sessionId = uuidv4();
    const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    sessions.set(sessionId, { userId: user.id, expires });

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;

    return {
      success: true,
      user: userWithoutPassword,
      sessionId: sessionId,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Login failed",
    };
  }
}

export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<AuthResult> {
  try {
    // Check if user already exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);

    if (existingUser.rows.length > 0) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = uuidv4();
    const now = new Date().toISOString();

    await query(
      `INSERT INTO users (id, email, name, password_hash, timezone, wip_limit, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, email.toLowerCase(), name, passwordHash, "UTC", 1, now, now]
    );

    // Create default project for the user
    const projectId = uuidv4();
    await query(
      `INSERT INTO projects (id, name, description, owner_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        projectId,
        "My Tasks",
        "Default project for personal tasks",
        userId,
        now,
        now,
      ]
    );

    // Create default boards
    const boards = [
      {
        name: "Backlog",
        slug: "backlog",
        color: "#8B5CF6",
        position: 0,
        wip_limit: null,
      },
      {
        name: "To Do",
        slug: "todo",
        color: "#6B7280",
        position: 1,
        wip_limit: null,
      },
      {
        name: "In Progress",
        slug: "in_progress",
        color: "#3B82F6",
        position: 2,
        wip_limit: 1,
      },
      {
        name: "Done",
        slug: "done",
        color: "#10B981",
        position: 3,
        wip_limit: null,
      },
    ];

    for (const board of boards) {
      const boardId = uuidv4();
      await query(
        `INSERT INTO boards (id, name, slug, description, project_id, position, wip_limit, color, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          boardId,
          board.name,
          board.slug,
          `${board.name} tasks`,
          projectId,
          board.position,
          board.wip_limit,
          board.color,
          now,
          now,
        ]
      );
    }

    // Create default tags
    const tags = [
      { name: "frontend", color: "#3B82F6" },
      { name: "backend", color: "#10B981" },
      { name: "urgent", color: "#EF4444" },
      { name: "bug", color: "#F59E0B" },
      { name: "feature", color: "#8B5CF6" },
    ];

    for (const tag of tags) {
      const tagId = uuidv4();
      await query(
        `INSERT INTO tags (id, name, color, project_id, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [tagId, tag.name, tag.color, projectId, now]
      );
    }

    // Get the created user
    const userResult = await query(
      "SELECT id, email, name, timezone, wip_limit, created_at, updated_at FROM users WHERE id = $1",
      [userId]
    );

    const user = userResult.rows[0];

    // Create session
    const sessionId = uuidv4();
    const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    sessions.set(sessionId, { userId: user.id, expires });

    return {
      success: true,
      user,
      sessionId: sessionId,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
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

    const result = await query(
      "SELECT id, email, name, timezone, wip_limit, created_at, updated_at FROM users WHERE id = $1",
      [session.userId]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

export async function logoutUser(sessionId: string): Promise<void> {
  sessions.delete(sessionId);
}
