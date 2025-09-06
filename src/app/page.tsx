/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useTaskStore } from "@/lib/store";
import { KanbanBoard } from "@/components/kanban-board";
import { TaskModal } from "@/components/task-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  getTasks,
  getUsers,
  getTags,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/actions";

export default function Home() {
  const {
    users,
    tags,
    setTasks,
    setUsers,
    setTags,
    addTask,
    updateTask: updateTaskStore,
    deleteTask: deleteTaskStore,
  } = useTaskStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tasksData, usersData, tagsData] = await Promise.all([
          getTasks(),
          getUsers(),
          getTags(),
        ]);

        setTasks(tasksData);
        setUsers(usersData);
        setTags(tagsData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setTasks, setUsers, setTags]);

  const handleAddTask = (status?: any) => {
    setEditingTask({ status: status || "todo" });
    setIsModalOpen(true);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: any) => {
    try {
      if (editingTask && editingTask.id) {
        // Update existing task
        const updatedTask = await updateTask(editingTask.id, taskData);
        updateTaskStore(editingTask.id, taskData);
      } else {
        // Create new task
        const newTask = await createTask(taskData);
        addTask(taskData);
      }
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);
      deleteTaskStore(id);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const userNames = users.map((user) => user.name);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>TaskMate</h1>
          <p className='text-sm text-gray-600'>Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>TaskMate</h1>
            <p className='text-sm text-gray-600'>
              Your personal kanban task manager
            </p>
          </div>
          <Button
            onClick={() => handleAddTask()}
            className='flex items-center gap-2'
          >
            <Plus className='h-4 w-4' />
            Add Task
          </Button>
        </div>
      </header>

      {/* Kanban Board */}
      <main>
        <KanbanBoard
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        task={editingTask}
        users={userNames}
        availableTags={tags}
      />
    </div>
  );
}
