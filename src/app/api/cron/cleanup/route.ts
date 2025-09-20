import { handleCronCleanup } from "@/lib/scheduled-cleanup";

/**
 * Vercel Cron Job endpoint for automatic cleanup
 * This endpoint is called by Vercel's cron service
 *
 * To enable this, add to your vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/cleanup",
 *       "schedule": "0 2 * * *"
 *     }
 *   ]
 * }
 *
 * This will run daily at 2 AM UTC
 */
export async function GET() {
  return handleCronCleanup();
}

export async function POST() {
  return handleCronCleanup();
}
