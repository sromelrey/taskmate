"use server";

import {
  query,
  dbUtils,
  AuthorizationError,
} from "./database";
import { withAuth } from "./auth-middleware";

// =============================================
// CLEANUP OPERATIONS
// =============================================

/**
 * Delete tasks that have been in the "Done" board for more than 48 hours
 * This function is called automatically or manually to clean up completed tasks
 */
export async function cleanupOldDoneTasks(): Promise<{
  deletedCount: number;
  deletedTasks: Array<{ id: string; title: string; completed_at: string }>;
}> {
  return withAuth(async (user) => {
    try {
      // Get the "done" board for the user's default project
      const projectResult = await query(
        "SELECT id FROM projects WHERE owner_id = $1 AND name = $2",
        [user.id, "My Tasks"]
      );

      if (projectResult.rows.length === 0) {
        throw new AuthorizationError("Default project not found");
      }

      const projectId = (projectResult.rows[0] as Record<string, unknown>)
        .id as string;

      const boardResult = await query(
        "SELECT id FROM boards WHERE project_id = $1 AND slug = $2",
        [projectId, "done"]
      );

      if (boardResult.rows.length === 0) {
        throw new AuthorizationError("Done board not found");
      }

      const doneBoardId = (boardResult.rows[0] as Record<string, unknown>)
        .id as string;

      // Find tasks that have been completed for more than 48 hours
      const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago

      const tasksToDeleteResult = await query(
        `
        SELECT id, title, completed_at 
        FROM tasks 
        WHERE board_id = $1 
          AND creator_id = $2 
          AND completed_at IS NOT NULL 
          AND completed_at < $3
        `,
        [doneBoardId, user.id, cutoffTime]
      );

      const tasksToDelete = tasksToDeleteResult.rows;

      if (tasksToDelete.length === 0) {
        return {
          deletedCount: 0,
          deletedTasks: [],
        };
      }

      // Delete the tasks (CASCADE will handle task_tags)
      const taskIds = tasksToDelete.map(
        (task) => (task as Record<string, unknown>).id as string
      );
      const placeholders = taskIds.map((_, index) => `$${index + 1}`).join(",");

      await query(
        `DELETE FROM tasks WHERE id IN (${placeholders}) AND creator_id = $${
          taskIds.length + 1
        }`,
        [...taskIds, user.id]
      );

      return {
        deletedCount: tasksToDelete.length,
        deletedTasks: tasksToDelete.map((task) => {
          const taskData = task as Record<string, unknown>;
          return {
            id: taskData.id as string,
            title: taskData.title as string,
            completed_at: taskData.completed_at as string,
          };
        }),
      };
    } catch (error) {
      console.error("Error cleaning up old done tasks:", error);
      return dbUtils.handleError(error);
    }
  });
}

/**
 * Update the completed_at timestamp when a task is moved to the "Done" board
 * This should be called whenever a task is moved to the done board
 */
export async function markTaskAsCompleted(taskId: string): Promise<void> {
  return withAuth(async (user) => {
    try {
      // Get the "done" board for the user's default project
      const projectResult = await query(
        "SELECT id FROM projects WHERE owner_id = $1 AND name = $2",
        [user.id, "My Tasks"]
      );

      if (projectResult.rows.length === 0) {
        throw new AuthorizationError("Default project not found");
      }

      const projectId = (projectResult.rows[0] as Record<string, unknown>)
        .id as string;

      const boardResult = await query(
        "SELECT id FROM boards WHERE project_id = $1 AND slug = $2",
        [projectId, "done"]
      );

      if (boardResult.rows.length === 0) {
        throw new AuthorizationError("Done board not found");
      }

      const doneBoardId = (boardResult.rows[0] as Record<string, unknown>)
        .id as string;

      // Update the task to set completed_at timestamp
      const result = await query(
        `
        UPDATE tasks 
        SET completed_at = NOW(), updated_at = NOW()
        WHERE id = $1 
          AND creator_id = $2 
          AND board_id = $3
        `,
        [taskId, user.id, doneBoardId]
      );

      if (result.rowCount === 0) {
        throw new AuthorizationError("Task not found or not in done board");
      }
    } catch (error) {
      console.error("Error marking task as completed:", error);
      return dbUtils.handleError(error);
    }
  });
}

/**
 * Clear the completed_at timestamp when a task is moved away from the "Done" board
 * This should be called whenever a task is moved away from the done board
 */
export async function markTaskAsIncomplete(taskId: string): Promise<void> {
  return withAuth(async (user) => {
    try {
      // Clear the completed_at timestamp
      const result = await query(
        `
        UPDATE tasks 
        SET completed_at = NULL, updated_at = NOW()
        WHERE id = $1 AND creator_id = $2
        `,
        [taskId, user.id]
      );

      if (result.rowCount === 0) {
        throw new AuthorizationError("Task not found or access denied");
      }
    } catch (error) {
      console.error("Error marking task as incomplete:", error);
      return dbUtils.handleError(error);
    }
  });
}

/**
 * Get statistics about tasks that will be cleaned up
 * Useful for showing users what will be deleted
 */
export async function getCleanupStats(): Promise<{
  tasksToDelete: number;
  oldestTask: { title: string; completed_at: string } | null;
  newestTask: { title: string; completed_at: string } | null;
}> {
  return withAuth(async (user) => {
    try {
      // Get the "done" board for the user's default project
      const projectResult = await query(
        "SELECT id FROM projects WHERE owner_id = $1 AND name = $2",
        [user.id, "My Tasks"]
      );

      if (projectResult.rows.length === 0) {
        throw new AuthorizationError("Default project not found");
      }

      const projectId = (projectResult.rows[0] as Record<string, unknown>)
        .id as string;

      const boardResult = await query(
        "SELECT id FROM boards WHERE project_id = $1 AND slug = $2",
        [projectId, "done"]
      );

      if (boardResult.rows.length === 0) {
        throw new AuthorizationError("Done board not found");
      }

      const doneBoardId = (boardResult.rows[0] as Record<string, unknown>)
        .id as string;

      // Find tasks that have been completed for more than 48 hours
      const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago

      const statsResult = await query(
        `
        SELECT 
          COUNT(*) as count,
          MIN(completed_at) as oldest_completed,
          MAX(completed_at) as newest_completed,
          (SELECT title FROM tasks WHERE board_id = $1 AND creator_id = $2 AND completed_at IS NOT NULL AND completed_at < $3 ORDER BY completed_at ASC LIMIT 1) as oldest_title,
          (SELECT title FROM tasks WHERE board_id = $1 AND creator_id = $2 AND completed_at IS NOT NULL AND completed_at < $3 ORDER BY completed_at DESC LIMIT 1) as newest_title
        FROM tasks 
        WHERE board_id = $1 
          AND creator_id = $2 
          AND completed_at IS NOT NULL 
          AND completed_at < $3
        `,
        [doneBoardId, user.id, cutoffTime]
      );

      const stats = statsResult.rows[0] as Record<string, unknown>;

      return {
        tasksToDelete: parseInt(stats.count as string) || 0,
        oldestTask: stats.oldest_completed
          ? {
              title: stats.oldest_title as string,
              completed_at: stats.oldest_completed as string,
            }
          : null,
        newestTask: stats.newest_completed
          ? {
              title: stats.newest_title as string,
              completed_at: stats.newest_completed as string,
            }
          : null,
      };
    } catch (error) {
      console.error("Error getting cleanup stats:", error);
      return dbUtils.handleError(error);
    }
  });
}
