"use server";

import { 
  User, 
  Tag, 
  CreateTaskData, 
  UpdateTaskData, 
  TaskWithRelations,
  BoardWithTasks
} from './types';

// Mock data for development when database is not available
const mockUser: User = {
  id: "dev-user-id",
  email: "dev@example.com",
  name: "Development User",
  timezone: "UTC",
  wip_limit: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockBoards: BoardWithTasks[] = [
  {
    id: "backlog-board",
    name: "Backlog",
    slug: "backlog",
    description: "Ideas and future tasks",
    project_id: "default-project",
    position: 0,
    wip_limit: undefined,
    color: "#8B5CF6",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tasks: [],
    taskCount: 0,
  },
  {
    id: "todo-board",
    name: "To Do",
    slug: "todo",
    description: "Tasks ready to be worked on",
    project_id: "default-project",
    position: 1,
    wip_limit: undefined,
    color: "#6B7280",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tasks: [],
    taskCount: 0,
  },
  {
    id: "in-progress-board",
    name: "In Progress",
    slug: "in_progress",
    description: "Currently working on",
    project_id: "default-project",
    position: 2,
    wip_limit: 1,
    color: "#3B82F6",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tasks: [],
    taskCount: 0,
  },
  {
    id: "done-board",
    name: "Done",
    slug: "done",
    description: "Completed tasks",
    project_id: "default-project",
    position: 3,
    wip_limit: undefined,
    color: "#10B981",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tasks: [],
    taskCount: 0,
  },
];

const mockTags: Tag[] = [
  {
    id: "tag-1",
    name: "frontend",
    color: "#3B82F6",
    project_id: "default-project",
    created_at: new Date().toISOString(),
  },
  {
    id: "tag-2",
    name: "backend",
    color: "#10B981",
    project_id: "default-project",
    created_at: new Date().toISOString(),
  },
  {
    id: "tag-3",
    name: "urgent",
    color: "#EF4444",
    project_id: "default-project",
    created_at: new Date().toISOString(),
  },
];

// In-memory storage for development
const mockTasks: TaskWithRelations[] = [
  {
    id: "task-1",
    title: "Set up database schema",
    description: "Create and run the database schema in Neon",
    board_id: "todo-board",
    assignee_id: mockUser.id,
    creator_id: mockUser.id,
    priority: "high",
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    position: 1,
    estimated_hours: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    assignee: mockUser,
    tags: [mockTags[1]],
    board: mockBoards[1],
  },
  {
    id: "task-2",
    title: "Implement authentication",
    description: "Add Neon Auth integration",
    board_id: "backlog-board",
    assignee_id: mockUser.id,
    creator_id: mockUser.id,
    priority: "medium",
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    position: 1,
    estimated_hours: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    assignee: mockUser,
    tags: [mockTags[0], mockTags[1]],
    board: mockBoards[0],
  },
];

// Update board tasks
mockBoards.forEach(board => {
  board.tasks = mockTasks.filter(task => task.board_id === board.id);
  board.taskCount = board.tasks.length;
});

// =============================================
// MOCK SERVER ACTIONS
// =============================================

export async function getBoards(): Promise<BoardWithTasks[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockBoards;
}

export async function getTasks(boardId?: string): Promise<TaskWithRelations[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  if (boardId) {
    return mockTasks.filter(task => task.board_id === boardId);
  }
  return mockTasks;
}

export async function createTask(taskData: CreateTaskData): Promise<TaskWithRelations> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const newTask: TaskWithRelations = {
    id: `task-${Date.now()}`,
    title: taskData.title,
    description: taskData.description,
    board_id: taskData.board_id,
    assignee_id: taskData.assignee_id,
    creator_id: "dev-user-id",
    priority: taskData.priority || "medium",
    due_date: taskData.due_date,
    position: mockTasks.filter(t => t.board_id === taskData.board_id).length + 1,
    estimated_hours: taskData.estimated_hours,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    assignee: mockUser,
    tags: taskData.tag_ids ? mockTags.filter(tag => taskData.tag_ids?.includes(tag.id)) : [],
    board: mockBoards.find(b => b.id === taskData.board_id),
  };
  
  mockTasks.push(newTask);
  
  // Update board tasks
  mockBoards.forEach(board => {
    board.tasks = mockTasks.filter(task => task.board_id === board.id);
    board.taskCount = board.tasks.length;
  });
  
  return newTask;
}

export async function updateTask(taskId: string, updates: UpdateTaskData): Promise<TaskWithRelations> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const taskIndex = mockTasks.findIndex(task => task.id === taskId);
  if (taskIndex === -1) {
    throw new Error("Task not found");
  }
  
  const updatedTask = {
    ...mockTasks[taskIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  mockTasks[taskIndex] = updatedTask;
  
  // Update board tasks
  mockBoards.forEach(board => {
    board.tasks = mockTasks.filter(task => task.board_id === board.id);
    board.taskCount = board.tasks.length;
  });
  
  return updatedTask;
}

export async function deleteTask(taskId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const taskIndex = mockTasks.findIndex(task => task.id === taskId);
  if (taskIndex === -1) {
    throw new Error("Task not found");
  }
  
  mockTasks.splice(taskIndex, 1);
  
  // Update board tasks
  mockBoards.forEach(board => {
    board.tasks = mockTasks.filter(task => task.board_id === board.id);
    board.taskCount = board.tasks.length;
  });
}

export async function moveTask(taskId: string, boardId: string, position?: number): Promise<TaskWithRelations> {
  return await updateTask(taskId, {
    board_id: boardId,
    position: position,
  });
}

export async function getTags(): Promise<Tag[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockTags;
}

export async function getUsers(): Promise<User[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return [mockUser];
}
