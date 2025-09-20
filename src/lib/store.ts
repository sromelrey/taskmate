import { create } from "zustand";
import {
  User,
  Board,
  Tag,
  TaskWithRelations,
  BoardWithTasks,
  CreateTaskData,
  UpdateTaskData,
} from "./types";
import { FilterOptions } from "@/components/task-filters";

interface TaskStore {
  // Data
  tasks: TaskWithRelations[];
  boards: BoardWithTasks[];
  users: User[];
  tags: Tag[];

  // Filter state
  filters: FilterOptions;
  isFiltersExpanded: boolean;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Task operations
  addTask: (task: CreateTaskData) => void;
  updateTask: (id: string, updates: UpdateTaskData) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, boardId: string, position?: number) => void;

  // Data setters
  setTasks: (tasks: TaskWithRelations[]) => void;
  setBoards: (boards: BoardWithTasks[]) => void;
  setUsers: (users: User[]) => void;
  setTags: (tags: Tag[]) => void;

  // Loading states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Filter operations
  setFilters: (filters: FilterOptions) => void;
  clearFilters: () => void;
  toggleFiltersExpanded: () => void;

  // Utility functions
  getTasksByBoard: (boardId: string) => TaskWithRelations[];
  getBoardBySlug: (slug: Board["slug"]) => BoardWithTasks | undefined;
  getFilteredAndSortedTasks: (boardId: string) => TaskWithRelations[];
  clearError: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  tasks: [],
  boards: [],
  users: [],
  tags: [],
  filters: {
    dateRange: { from: null, to: null },
    sortBy: "created_at",
    sortOrder: "desc",
    quickFilter: "all",
  },
  isFiltersExpanded: false,
  isLoading: false,
  error: null,

  // Task operations
  addTask: (taskData) =>
    set((state) => {
      // This would typically be handled by Server Actions
      // For now, we'll just update the local state optimistically
      const newTask: TaskWithRelations = {
        id: `temp-${Date.now()}`,
        title: taskData.title,
        description: taskData.description,
        board_id: taskData.board_id,
        assignee_id: taskData.assignee_id,
        creator_id: "current-user",
        priority: taskData.priority || "medium",
        due_date: taskData.due_date,
        position: 0,
        estimated_hours: taskData.estimated_hours,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        assignee: undefined,
        board: {
          id: taskData.board_id,
          name: "",
          slug: "todo",
          description: "",
          project_id: "",
          position: 0,
          color: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        tags: [],
      };

      return {
        tasks: [...state.tasks, newTask],
        boards: state.boards.map((board) =>
          board.id === taskData.board_id
            ? { ...board, tasks: [...board.tasks, newTask] }
            : board
        ),
      };
    }),

  updateTask: (id, updates) =>
    set((state) => {
      const updatedTask = state.tasks.find((task) => task.id === id);
      if (!updatedTask) return state;

      const newTask = {
        ...updatedTask,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      return {
        tasks: state.tasks.map((task) => (task.id === id ? newTask : task)),
        boards: state.boards.map((board) => ({
          ...board,
          tasks: board.tasks.map((task) => (task.id === id ? newTask : task)),
        })),
      };
    }),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
      boards: state.boards.map((board) => ({
        ...board,
        tasks: board.tasks.filter((task) => task.id !== id),
      })),
    })),

  moveTask: (id, boardId, position) =>
    set((state) => {
      const movedTask = state.tasks.find((task) => task.id === id);
      if (!movedTask) return state;

      const newTask = {
        ...movedTask,
        board_id: boardId,
        position: position || movedTask.position,
        updated_at: new Date().toISOString(),
      };

      return {
        tasks: state.tasks.map((task) => (task.id === id ? newTask : task)),
        boards: state.boards.map((board) => {
          if (board.id === movedTask.board_id) {
            // Remove from old board
            return {
              ...board,
              tasks: board.tasks.filter((task) => task.id !== id),
            };
          } else if (board.id === boardId) {
            // Add to new board
            return { ...board, tasks: [...board.tasks, newTask] };
          }
          return board;
        }),
      };
    }),

  // Data setters
  setTasks: (tasks) => set({ tasks }),
  setBoards: (boards) => set({ boards }),
  setUsers: (users) => set({ users }),
  setTags: (tags) => set({ tags }),

  // Loading states
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Filter operations
  setFilters: (filters) => set({ filters }),
  clearFilters: () =>
    set({
      filters: {
        dateRange: { from: null, to: null },
        sortBy: "created_at",
        sortOrder: "desc",
        quickFilter: "all",
      },
    }),
  toggleFiltersExpanded: () =>
    set((state) => ({
      isFiltersExpanded: !state.isFiltersExpanded,
    })),

  // Utility functions
  getTasksByBoard: (boardId) => {
    const { tasks } = get();
    return tasks.filter((task) => task.board_id === boardId);
  },

  getBoardBySlug: (slug) => {
    const { boards } = get();
    return boards.find((board) => board.slug === slug);
  },

  getFilteredAndSortedTasks: (boardId) => {
    const { tasks, filters } = get();
    let filteredTasks = tasks.filter((task) => task.board_id === boardId);

    // Apply date filtering
    if (filters.dateRange.from || filters.dateRange.to) {
      filteredTasks = filteredTasks.filter((task) => {
        const taskDate = new Date(task.due_date || task.created_at);

        if (filters.dateRange.from && taskDate < filters.dateRange.from) {
          return false;
        }
        if (filters.dateRange.to && taskDate > filters.dateRange.to) {
          return false;
        }
        return true;
      });
    }

    // Apply quick filters
    if (filters.quickFilter !== "all") {
      const now = new Date();
      filteredTasks = filteredTasks.filter((task) => {
        const taskDate = new Date(task.due_date || task.created_at);

        switch (filters.quickFilter) {
          case "today":
            return taskDate.toDateString() === now.toDateString();
          case "this_week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return taskDate >= weekAgo;
          case "this_month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return taskDate >= monthAgo;
          case "overdue":
            return task.due_date && new Date(task.due_date) < now;
          case "no_due_date":
            return !task.due_date;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filteredTasks.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (filters.sortBy) {
        case "created_at":
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case "due_date":
          aValue = a.due_date ? new Date(a.due_date) : new Date("9999-12-31");
          bValue = b.due_date ? new Date(b.due_date) : new Date("9999-12-31");
          break;
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "updated_at":
          aValue = new Date(a.updated_at);
          bValue = new Date(b.updated_at);
          break;
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
      }

      if (aValue < bValue) return filters.sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filteredTasks;
  },

  clearError: () => set({ error: null }),
}));
