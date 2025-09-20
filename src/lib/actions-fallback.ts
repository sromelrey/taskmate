"use server";

// Fallback actions using mock data when database is unavailable
import { TaskWithRelations, BoardWithTasks, User, Tag, CreateTaskData, UpdateTaskData } from "./types";

// Mock data for fallback
const mockUser: User = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "dev@example.com",
  name: "Development User",
  timezone: "UTC",
  wip_limit: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockBoards: BoardWithTasks[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Backlog",
    slug: "backlog",
    description: "Ideas and future tasks",
    project_id: "550e8400-e29b-41d4-a716-446655440001",
    position: 0,
    wip_limit: undefined,
    color: "#8B5CF6",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tasks: [
      {
        id: "550e8400-e29b-41d4-a716-446655440012",
        title: "Implement authentication",
        description: "Add Neon Auth integration",
        board_id: "550e8400-e29b-41d4-a716-446655440002",
        assignee_id: "550e8400-e29b-41d4-a716-446655440000",
        creator_id: "550e8400-e29b-41d4-a716-446655440000",
        priority: "medium",
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        position: 1,
        estimated_hours: 4,
        actual_hours: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        assignee: mockUser,
        tags: [
          {
            id: "550e8400-e29b-41d4-a716-446655440006",
            name: "frontend",
            color: "#3B82F6",
            project_id: "550e8400-e29b-41d4-a716-446655440001",
            created_at: new Date().toISOString(),
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440007",
            name: "backend",
            color: "#10B981",
            project_id: "550e8400-e29b-41d4-a716-446655440001",
            created_at: new Date().toISOString(),
          },
        ],
      },
    ],
    taskCount: 1,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "To Do",
    slug: "todo",
    description: "Tasks ready to be worked on",
    project_id: "550e8400-e29b-41d4-a716-446655440001",
    position: 1,
    wip_limit: undefined,
    color: "#6B7280",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tasks: [
      {
        id: "550e8400-e29b-41d4-a716-446655440011",
        title: "Set up database schema",
        description: "Create and run the database schema in Neon",
        board_id: "550e8400-e29b-41d4-a716-446655440003",
        assignee_id: "550e8400-e29b-41d4-a716-446655440000",
        creator_id: "550e8400-e29b-41d4-a716-446655440000",
        priority: "high",
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        position: 1,
        estimated_hours: 2,
        actual_hours: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        assignee: mockUser,
        tags: [
          {
            id: "550e8400-e29b-41d4-a716-446655440007",
            name: "backend",
            color: "#10B981",
            project_id: "550e8400-e29b-41d4-a716-446655440001",
            created_at: new Date().toISOString(),
          },
        ],
      },
    ],
    taskCount: 1,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    name: "In Progress",
    slug: "in_progress",
    description: "Currently working on",
    project_id: "550e8400-e29b-41d4-a716-446655440001",
    position: 2,
    wip_limit: 1,
    color: "#3B82F6",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tasks: [],
    taskCount: 0,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    name: "Done",
    slug: "done",
    description: "Completed tasks",
    project_id: "550e8400-e29b-41d4-a716-446655440001",
    position: 3,
    wip_limit: undefined,
    color: "#10B981",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tasks: [
      {
        id: "550e8400-e29b-41d4-a716-446655440013",
        title: "Add task filtering",
        description: "Implement filtering by priority, assignee, and tags",
        board_id: "550e8400-e29b-41d4-a716-446655440005",
        assignee_id: "550e8400-e29b-41d4-a716-446655440000",
        creator_id: "550e8400-e29b-41d4-a716-446655440000",
        priority: "medium",
        due_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        position: 1,
        estimated_hours: 3,
        actual_hours: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        assignee: mockUser,
        tags: [
          {
            id: "550e8400-e29b-41d4-a716-446655440006",
            name: "frontend",
            color: "#3B82F6",
            project_id: "550e8400-e29b-41d4-a716-446655440001",
            created_at: new Date().toISOString(),
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440010",
            name: "feature",
            color: "#8B5CF6",
            project_id: "550e8400-e29b-41d4-a716-446655440001",
            created_at: new Date().toISOString(),
          },
        ],
      },
    ],
    taskCount: 1,
  },
];

const mockTags: Tag[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    name: "frontend",
    color: "#3B82F6",
    project_id: "550e8400-e29b-41d4-a716-446655440001",
    created_at: new Date().toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    name: "backend",
    color: "#10B981",
    project_id: "550e8400-e29b-41d4-a716-446655440001",
    created_at: new Date().toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    name: "urgent",
    color: "#EF4444",
    project_id: "550e8400-e29b-41d4-a716-446655440001",
    created_at: new Date().toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    name: "bug",
    color: "#F59E0B",
    project_id: "550e8400-e29b-41d4-a716-446655440001",
    created_at: new Date().toISOString(),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    name: "feature",
    color: "#8B5CF6",
    project_id: "550e8400-e29b-41d4-a716-446655440001",
    created_at: new Date().toISOString(),
  },
];

// Fallback actions
export async function getBoards(): Promise<BoardWithTasks[]> {
  console.log("Using fallback mock data for getBoards");
  return mockBoards;
}

export async function getTasks(): Promise<TaskWithRelations[]> {
  console.log("Using fallback mock data for getTasks");
  const allTasks: TaskWithRelations[] = [];
  mockBoards.forEach((board) => {
    allTasks.push(...board.tasks);
  });
  return allTasks;
}

export async function getUsers(): Promise<User[]> {
  console.log("Using fallback mock data for getUsers");
  return [mockUser];
}

export async function getTags(): Promise<Tag[]> {
  console.log("Using fallback mock data for getTags");
  return mockTags;
}

export async function createTask(taskData: CreateTaskData): Promise<TaskWithRelations> {
  console.log("Using fallback mock data for createTask");
  const newTask: TaskWithRelations = {
    id: `mock-${Date.now()}`,
    ...taskData,
    creator_id: mockUser.id,
    position: 0,
    actual_hours: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: [],
    assignee: undefined,
    board: undefined,
  };
  return newTask;
}

export async function updateTask(taskId: string, taskData: UpdateTaskData): Promise<TaskWithRelations> {
  console.log("Using fallback mock data for updateTask");
  return {
    id: taskId,
    title: "Updated Task",
    description: "",
    board_id: "mock-board",
    assignee_id: undefined,
    creator_id: mockUser.id,
    priority: "medium",
    due_date: undefined,
    position: 0,
    estimated_hours: undefined,
    actual_hours: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: [],
    assignee: undefined,
    board: undefined,
    ...taskData,
  };
}

export async function deleteTask(taskId: string): Promise<void> {
  console.log("Using fallback mock data for deleteTask");
  // Mock implementation - just log the deletion
  console.log(`Mock: Deleted task ${taskId}`);
}
