// TaskMate Database Types
// Updated to match the new database schema with UUIDs, boards, and projects

export interface User {
  id: string; // UUID
  email: string;
  name: string;
  avatar_url?: string;
  timezone: string;
  wip_limit: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string; // UUID
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: string; // UUID
  name: string;
  slug: "backlog" | "todo" | "in_progress" | "done";
  description?: string;
  project_id: string;
  position: number;
  wip_limit?: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string; // UUID
  name: string;
  color: string;
  project_id: string;
  created_at: string;
}

export interface Task {
  id: string; // UUID
  title: string;
  description?: string;
  board_id: string; // Changed from status to board_id
  assignee_id?: string; // Changed from assignee string to user ID
  creator_id: string;
  priority: "low" | "medium" | "high" | "urgent";
  due_date?: string;
  position: number;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
  // Computed fields (not in DB)
  assignee?: User;
  tags?: Tag[];
  board?: Board;
}

export interface ActivityLog {
  id: string; // UUID
  task_id?: string;
  user_id: string;
  action: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  created_at: string;
}

// Form data types for Server Actions
export interface CreateTaskData {
  title: string;
  description?: string;
  board_id: string;
  assignee_id?: string;
  priority: Task["priority"];
  due_date?: string;
  estimated_hours?: number;
  tag_ids?: string[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  board_id?: string;
  assignee_id?: string;
  priority?: Task["priority"];
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  position?: number;
  tag_ids?: string[];
}

export interface CreateTagData {
  name: string;
  color?: string;
  project_id: string;
}

// Board configuration for UI
export interface BoardConfig {
  slug: Board["slug"];
  title: string;
  color: string;
  headerColor: string;
  wipLimit?: number;
}

// WIP limit validation result
export interface WipLimitResult {
  canMove: boolean;
  reason?: string;
  currentCount: number;
  limit: number;
}

// Database query result types
export interface TaskWithRelations extends Task {
  assignee?: User;
  tags: Tag[];
  board?: Board;
}

export interface BoardWithTasks extends Board {
  tasks: TaskWithRelations[];
  taskCount: number;
}

export interface ProjectWithBoards extends Project {
  boards: BoardWithTasks[];
}
