import { useState } from "react";
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { DragStartEvent, DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import { TaskWithRelations, BoardWithTasks } from "@/lib/types";
import { useTaskStore } from "@/lib/store";
import { moveTask } from "@/lib/authenticated-actions";
import toast from "react-hot-toast";

export function useDragAndDrop(boards: BoardWithTasks[]) {
  const { moveTask: moveTaskStore } = useTaskStore();
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Get all tasks from all boards for drag operations
  const allTasks = boards.flatMap((board) => board.tasks);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = allTasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? (over.id as string) : null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setOverId(null);

    if (!over) return;

    const taskId = active.id as string;
    const targetBoardId = over.id as string;

    // Find the target board
    const targetBoard = boards.find((board) => board.id === targetBoardId);
    if (!targetBoard) return;

    // Check if we're moving to a different board
    const currentTask = allTasks.find((task) => task.id === taskId);
    if (!currentTask || currentTask.board_id === targetBoardId) return;

    try {
      // Optimistic update - move in UI immediately
      moveTaskStore(taskId, targetBoardId);
      toast.loading("Moving task...", { id: "moving-task" });

      // Save to server in background
      await moveTask(taskId, targetBoardId);
      toast.success("Task moved successfully!", { id: "moving-task" });
    } catch (error) {
      console.error("Failed to move task:", error);
      // Rollback optimistic update
      moveTaskStore(taskId, currentTask.board_id);
      toast.error("Failed to move task. Please try again.", {
        id: "moving-task",
      });
    }
  };

  return {
    sensors,
    activeTask,
    overId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
