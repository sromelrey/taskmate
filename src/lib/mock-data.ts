import { Task, User } from './store'

export const mockUsers: User[] = [
  { id: 1, name: "Romel Rey", email: "romel@example.com" },
  { id: 2, name: "Joy Doe", email: "joy@example.com" },
  { id: 3, name: "John Smith", email: "john@example.com" },
];

export const mockTags: string[] = [
  "frontend",
  "backend",
  "urgent",
  "bug",
  "feature",
  "design",
  "testing",
];

export const mockTasks: Task[] = [
  {
    id: 1,
    title: "Implement login page",
    description:
      "Create Next.js login with server actions and authentication flow.",
    status: "in_progress",
    priority: "high",
    due_date: "2025-01-15",
    assignee: "Romel Rey",
    tags: ["frontend", "feature"],
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-01-01T10:00:00Z",
  },
  {
    id: 2,
    title: "Set up database schema",
    description:
      "Design and implement database tables for tasks, tags, and users with proper relationships.",
    status: "todo",
    priority: "medium",
    due_date: "2025-01-20",
    assignee: "Joy Doe",
    tags: ["backend", "feature"],
    created_at: "2025-01-01T11:00:00Z",
    updated_at: "2025-01-01T11:00:00Z",
  },
  {
    id: 3,
    title: "Fix UI bugs in Kanban board",
    description:
      "Drag-and-drop functionality sometimes breaks on mobile devices. Need to investigate and fix.",
    status: "todo",
    priority: "urgent",
    due_date: "2025-01-10",
    assignee: "Romel Rey",
    tags: ["frontend", "bug", "urgent"],
    created_at: "2025-01-01T12:00:00Z",
    updated_at: "2025-01-01T12:00:00Z",
  },
  {
    id: 4,
    title: "Add task filtering",
    description:
      "Implement filtering by priority, assignee, and tags in the kanban board.",
    status: "done",
    priority: "medium",
    due_date: "2025-01-05",
    assignee: "John Smith",
    tags: ["frontend", "feature"],
    created_at: "2025-01-01T09:00:00Z",
    updated_at: "2025-01-01T15:00:00Z",
  },
  {
    id: 5,
    title: "Write unit tests",
    description:
      "Add comprehensive unit tests for all task management functions.",
    status: "todo",
    priority: "low",
    due_date: "2025-01-25",
    assignee: "Joy Doe",
    tags: ["testing", "backend"],
    created_at: "2025-01-01T13:00:00Z",
    updated_at: "2025-01-01T13:00:00Z",
  },
];
