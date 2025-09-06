import { create } from 'zustand'

export interface Task {
  id: number
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  assignee: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  name: string
  email: string
}

interface TaskStore {
  tasks: Task[]
  users: User[]
  tags: string[]
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void
  updateTask: (id: number, updates: Partial<Task>) => void
  deleteTask: (id: number) => void
  moveTask: (id: number, status: Task['status']) => void
  setTasks: (tasks: Task[]) => void
  setUsers: (users: User[]) => void
  setTags: (tags: string[]) => void
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  users: [],
  tags: [],
  
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, {
      ...task,
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }]
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(task => 
      task.id === id 
        ? { ...task, ...updates, updated_at: new Date().toISOString() }
        : task
    )
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(task => task.id !== id)
  })),
  
  moveTask: (id, status) => set((state) => ({
    tasks: state.tasks.map(task => 
      task.id === id 
        ? { ...task, status, updated_at: new Date().toISOString() }
        : task
    )
  })),
  
  setTasks: (tasks) => set({ tasks }),
  setUsers: (users) => set({ users }),
  setTags: (tags) => set({ tags }),
}))
