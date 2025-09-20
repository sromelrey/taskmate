-- Add completed_at field to tasks table for auto-delete feature
-- Run this in your Neon SQL console

-- Add completed_at field to track when task was moved to done board
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient querying of completed tasks
CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON tasks(completed_at) WHERE completed_at IS NOT NULL;

-- Create index for efficient querying of done board tasks
CREATE INDEX IF NOT EXISTS idx_tasks_board_completed ON tasks(board_id, completed_at) WHERE completed_at IS NOT NULL;
