import { useEffect, useState } from "react";
import { useTaskStore } from "@/lib/store";
import { TaskWithRelations, CreateTaskData } from "@/lib/types";
import {
  getBoards,
  getUsers,
  getTags,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/authenticated-actions";
import toast from "react-hot-toast";

export function useTaskMateApp() {
  const {
    boards,
    users,
    tags,
    tasks,
    setBoards,
    setUsers,
    setTags,
    addTask,
    updateTask: updateTaskStore,
    deleteTask: deleteTaskStore,
    setLoading,
    setError,
    clearError,
  } = useTaskStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        clearError();

        const [boardsData, usersData, tagsData] = await Promise.all([
          getBoards(),
          getUsers(),
          getTags(),
        ]);

        setBoards(boardsData);
        setUsers(usersData);
        setTags(tagsData);

        toast.success("Data loaded successfully!");
      } catch (error) {
        console.error("Failed to load data:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load data";
        setError(errorMessage);
        toast.error(`Failed to load data: ${errorMessage}`);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    loadData();
  }, [setBoards, setUsers, setTags, setLoading, setError, clearError]);

  const handleAddTask = (boardId: string) => {
    setEditingTask({
      id: "",
      title: "",
      description: "",
      board_id: boardId,
      assignee_id: "",
      creator_id: "",
      priority: "medium",
      due_date: "",
      position: 0,
      estimated_hours: undefined,
      actual_hours: undefined,
      created_at: "",
      updated_at: "",
      tags: [],
      assignee: undefined,
      board: undefined,
    } as TaskWithRelations);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: TaskWithRelations) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: CreateTaskData) => {
    if (editingTask && editingTask.id) {
      // Update existing task
      try {
        // Optimistic update - update UI immediately
        updateTaskStore(editingTask.id, taskData);
        toast.loading("Updating task...", { id: "updating-task" });

        // Save to server in background
        await updateTask(editingTask.id, taskData);
        toast.success("Task updated successfully!", { id: "updating-task" });
      } catch (error) {
        console.error("Failed to update task:", error);
        // Rollback optimistic update
        updateTaskStore(editingTask.id, editingTask);
        toast.error("Failed to update task. Please try again.", {
          id: "updating-task",
        });
        setError(
          error instanceof Error ? error.message : "Failed to update task"
        );
      }
    } else {
      // Create new task
      try {
        // Add optimistic task to UI immediately using store's addTask
        addTask(taskData);
        toast.loading("Creating task...", { id: "creating-task" });

        // Save to server in background
        await createTask(taskData);
        toast.success("Task created successfully!", { id: "creating-task" });
      } catch (error) {
        console.error("Failed to create task:", error);
        // Remove the optimistic task on error
        // Find the optimistic task that was just added
        const optimisticTask = tasks.find(
          (task) =>
            task.title === taskData.title &&
            task.board_id === taskData.board_id &&
            task.id.startsWith("temp-")
        );

        if (optimisticTask) {
          deleteTaskStore(optimisticTask.id);
        }

        toast.error("Failed to create task. Please try again.", {
          id: "creating-task",
        });
        setError(
          error instanceof Error ? error.message : "Failed to create task"
        );
      }
    }
  };

  const handleDeleteTask = async (id: string) => {
    // Find the task to restore if deletion fails
    const taskToDelete = boards
      .flatMap((board) => board.tasks)
      .find((task) => task.id === id);

    if (!taskToDelete) {
      toast.error("Task not found");
      return;
    }

    try {
      // Optimistic update - remove from UI immediately
      deleteTaskStore(id);
      toast.loading("Deleting task...", { id: "deleting-task" });

      // Delete from server in background
      await deleteTask(id);
      toast.success("Task deleted successfully!", { id: "deleting-task" });
    } catch (error) {
      console.error("Failed to delete task:", error);
      // Rollback optimistic update
      addTask(taskToDelete);
      toast.error("Failed to delete task. Please try again.", {
        id: "deleting-task",
      });
      setError(
        error instanceof Error ? error.message : "Failed to delete task"
      );
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return {
    // State
    boards,
    users,
    tags,
    isModalOpen,
    editingTask,
    isLoading,

    // Actions
    handleAddTask,
    handleEditTask,
    handleSaveTask,
    handleDeleteTask,
    handleCloseModal,
  };
}
