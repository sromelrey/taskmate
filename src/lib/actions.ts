'use server'

import { Task, User } from './store'
import { mockTasks, mockUsers, mockTags } from './mock-data'

// Mock database operations - these would be replaced with real DB calls
export async function getTasks(): Promise<Task[]> {
  console.log('📋 Fetching tasks from mock database')
  return mockTasks
}

export async function getUsers(): Promise<User[]> {
  console.log('👥 Fetching users from mock database')
  return mockUsers
}

export async function getTags(): Promise<string[]> {
  console.log('🏷️ Fetching tags from mock database')
  return mockTags
}

export async function createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  console.log('➕ Creating new task:', taskData)
  const newTask: Task = {
    ...taskData,
    id: Date.now(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  return newTask
}

export async function updateTask(id: number, updates: Partial<Task>): Promise<Task> {
  console.log(`✏️ Updating task ${id}:`, updates)
  const updatedTask: Task = {
    id,
    ...updates,
    updated_at: new Date().toISOString(),
  } as Task
  return updatedTask
}

export async function deleteTask(id: number): Promise<void> {
  console.log(`🗑️ Deleting task ${id}`)
  // In a real app, this would delete from database
}

export async function moveTask(id: number, status: Task['status']): Promise<Task> {
  console.log(`🔄 Moving task ${id} to ${status}`)
  const movedTask: Task = {
    id,
    status,
    updated_at: new Date().toISOString(),
  } as Task
  return movedTask
}
