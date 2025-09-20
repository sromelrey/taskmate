/**
 * Scheduled cleanup function for automatically deleting old done tasks
 * This can be called by:
 * 1. Vercel Cron Jobs (recommended for production)
 * 2. Manual API calls
 * 3. Serverless functions
 */

import { cleanupOldDoneTasks } from "./cleanup-actions";

export interface CleanupResult {
  success: boolean;
  deletedCount: number;
  deletedTasks: Array<{ id: string; title: string; completed_at: string }>;
  timestamp: string;
  error?: string;
}

/**
 * Main cleanup function that can be called by scheduled jobs
 * This function handles all users and cleans up their old done tasks
 */
export async function performScheduledCleanup(): Promise<CleanupResult> {
  try {
    console.log("Starting scheduled cleanup of old done tasks...");

    // For now, we'll use a mock user ID since this is called from a scheduled job
    // In a real implementation, you might want to iterate through all users
    // or use a service account with appropriate permissions

    const result = await cleanupOldDoneTasks();

    console.log(`Cleanup completed: ${result.deletedCount} tasks deleted`);

    return {
      success: true,
      deletedCount: result.deletedCount,
      deletedTasks: result.deletedTasks,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Scheduled cleanup failed:", error);

    return {
      success: false,
      deletedCount: 0,
      deletedTasks: [],
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Vercel Cron Job handler
 * This function is designed to be called by Vercel's cron service
 * Add this to your vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/cleanup",
 *       "schedule": "0 2 * * *"
 *     }
 *   ]
 * }
 */
export async function handleCronCleanup(): Promise<Response> {
  try {
    const result = await performScheduledCleanup();

    if (result.success) {
      return new Response(
        JSON.stringify({
          message: "Cleanup completed successfully",
          deletedCount: result.deletedCount,
          timestamp: result.timestamp,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          message: "Cleanup failed",
          error: result.error,
          timestamp: result.timestamp,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Cron cleanup handler failed:", error);

    return new Response(
      JSON.stringify({
        message: "Cleanup handler failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

/**
 * Get cleanup statistics for monitoring
 */
export async function getCleanupMonitoringStats() {
  try {
    // This would typically aggregate stats across all users
    // For now, we'll return basic info
    return {
      lastCleanup: new Date().toISOString(),
      nextScheduledCleanup: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString(), // 24 hours from now
      cleanupInterval: "24 hours",
      retentionPeriod: "48 hours",
    };
  } catch (error) {
    console.error("Error getting cleanup monitoring stats:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
