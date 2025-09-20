// Database client for TaskMate
// Implements proper connection handling and follows cursor rules

import { Pool } from "pg";

// Validate environment variables
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create PostgreSQL connection pool for Neon
export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
  // Connection pool settings optimized for Neon
  max: 5, // Reduced for Neon
  min: 0, // Start with 0 connections
  idleTimeoutMillis: 10000, // Shorter idle timeout
  connectionTimeoutMillis: 10000, // Longer connection timeout
  allowExitOnIdle: true, // Allow process to exit when idle
});
export const dbConfig = {
  url: databaseUrl,
  // Connection pooling settings
  pool: {
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
};

// Database error types
export class DatabaseError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = "Unauthorized access") {
    super(message);
    this.name = "AuthorizationError";
  }
}

// Utility functions for database operations
export const dbUtils = {
  // Convert database row to Task with relations
  mapTaskWithRelations: (row: any): any => ({
    id: row.id,
    title: row.title,
    description: row.description,
    board_id: row.board_id,
    assignee_id: row.assignee_id,
    creator_id: row.creator_id,
    priority: row.priority,
    due_date: row.due_date,
    position: row.position,
    estimated_hours: row.estimated_hours,
    actual_hours: row.actual_hours,
    created_at: row.created_at,
    updated_at: row.updated_at,
    assignee: row.assignee
      ? {
          id: row.assignee.id,
          name: row.assignee.name,
          email: row.assignee.email,
          avatar_url: row.assignee.avatar_url,
        }
      : undefined,
    tags: row.tags || [],
    board: row.board
      ? {
          id: row.board.id,
          name: row.board.name,
          slug: row.board.slug,
          color: row.board.color,
          wip_limit: row.board.wip_limit,
        }
      : undefined,
  }),

  // Validate UUID format
  isValidUUID: (uuid: string): boolean => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  // Sanitize input for database queries
  sanitizeInput: (input: any): any => {
    if (typeof input === "string") {
      return input.trim();
    }
    if (typeof input === "object" && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = dbUtils.sanitizeInput(value);
      }
      return sanitized;
    }
    return input;
  },

  // Handle database errors
  handleError: (error: any): never => {
    console.error("Database error:", error);

    if (error.code === "23505") {
      throw new DatabaseError("Duplicate entry", error.code, error.details);
    }
    if (error.code === "23503") {
      throw new DatabaseError(
        "Foreign key constraint violation",
        error.code,
        error.details
      );
    }
    if (error.code === "23514") {
      throw new DatabaseError(
        "Check constraint violation",
        error.code,
        error.details
      );
    }
    if (error.message?.includes("WIP limit")) {
      throw new ValidationError(error.message);
    }

    throw new DatabaseError(
      "Database operation failed",
      error.code,
      error.details
    );
  },
};

// Connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    try {
      await client.query("SELECT 1");
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database connection check error:", error);
    return false;
  }
}

// Database query helper with retry logic
export async function query(text: string, params?: any[]): Promise<any> {
  let retries = 3;
  let lastError: any;

  while (retries > 0) {
    let client;
    try {
      client = await pool.connect();
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`Database query error (${4 - retries}/3):`, error);

      if (retries === 1) {
        // Last retry failed, throw the error
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
      retries--;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  throw lastError;
}

// Database transaction helper
export async function withTransaction<T>(
  operation: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    return dbUtils.handleError(error);
  } finally {
    client.release();
  }
}
