"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface CleanupStats {
  tasksToDelete: number;
  oldestTask: { title: string; completed_at: string } | null;
  newestTask: { title: string; completed_at: string } | null;
}

interface CleanupResult {
  success: boolean;
  message: string;
  deletedCount: number;
  deletedTasks: Array<{ id: string; title: string; completed_at: string }>;
}

export function CleanupPanel() {
  const [stats, setStats] = useState<CleanupStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/cleanup");

      if (!response.ok) {
        throw new Error("Failed to fetch cleanup stats");
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching cleanup stats:", error);
      toast.error("Failed to load cleanup statistics");
    } finally {
      setIsLoading(false);
    }
  };

  const performCleanup = async () => {
    try {
      setIsCleaning(true);
      toast.loading("Cleaning up old tasks...", { id: "cleanup" });

      const response = await fetch("/api/cleanup", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to perform cleanup");
      }

      const result: CleanupResult = await response.json();

      toast.success(`Successfully deleted ${result.deletedCount} old tasks!`, {
        id: "cleanup",
      });

      // Refresh stats after cleanup
      await fetchStats();
    } catch (error) {
      console.error("Error performing cleanup:", error);
      toast.error("Failed to perform cleanup", { id: "cleanup" });
    } finally {
      setIsCleaning(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  if (isLoading) {
    return (
      <Card className='w-full max-w-2xl'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Trash2 className='h-5 w-5' />
            Auto Cleanup
          </CardTitle>
          <CardDescription>Loading cleanup statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-2xl'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Trash2 className='h-5 w-5' />
          Auto Cleanup
        </CardTitle>
        <CardDescription>
          Tasks in the "Done" board are automatically deleted after 48 hours to
          keep your workspace clean.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {stats && (
          <>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Clock className='h-4 w-4 text-gray-500' />
                <span className='text-sm text-gray-600'>
                  Tasks ready for cleanup:
                </span>
              </div>
              <Badge
                variant={stats.tasksToDelete > 0 ? "destructive" : "secondary"}
              >
                {stats.tasksToDelete}
              </Badge>
            </div>

            {stats.tasksToDelete > 0 && (
              <div className='space-y-2'>
                <div className='text-sm text-gray-600'>
                  <strong>Oldest task:</strong> {stats.oldestTask?.title}
                  <span className='text-gray-500 ml-2'>
                    ({getTimeAgo(stats.oldestTask?.completed_at || "")})
                  </span>
                </div>
                <div className='text-sm text-gray-600'>
                  <strong>Newest task:</strong> {stats.newestTask?.title}
                  <span className='text-gray-500 ml-2'>
                    ({getTimeAgo(stats.newestTask?.completed_at || "")})
                  </span>
                </div>
              </div>
            )}

            {stats.tasksToDelete === 0 && (
              <div className='flex items-center gap-2 text-green-600'>
                <CheckCircle className='h-4 w-4' />
                <span className='text-sm'>No tasks need cleanup</span>
              </div>
            )}

            <div className='flex gap-2'>
              <Button
                onClick={fetchStats}
                variant='outline'
                size='sm'
                disabled={isLoading}
              >
                Refresh Stats
              </Button>

              {stats.tasksToDelete > 0 && (
                <Button
                  onClick={performCleanup}
                  variant='destructive'
                  size='sm'
                  disabled={isCleaning}
                >
                  {isCleaning
                    ? "Cleaning..."
                    : `Delete ${stats.tasksToDelete} Tasks`}
                </Button>
              )}
            </div>
          </>
        )}

        <div className='border-t pt-4'>
          <div className='flex items-start gap-2 text-sm text-gray-600'>
            <AlertTriangle className='h-4 w-4 mt-0.5 text-amber-500' />
            <div>
              <p className='font-medium'>Automatic Cleanup Schedule:</p>
              <p>• Runs daily at 2:00 AM UTC</p>
              <p>• Deletes tasks completed more than 48 hours ago</p>
              <p>• Only affects tasks in the "Done" board</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
