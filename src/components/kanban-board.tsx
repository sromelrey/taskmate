"use client";

import { TaskWithRelations, BoardWithTasks } from "@/lib/types";
import { TaskCard } from "./task-card";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { DndContext, DragOverlay, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { useTaskStore } from "@/lib/store";
import { useMobileLayout } from "@/hooks/useMobileLayout";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { useBoardConfig } from "@/hooks/useBoardConfig";

interface KanbanColumnProps {
  board: BoardWithTasks;
  onAddTask: () => void;
  onEditTask: (task: TaskWithRelations) => void;
  onDeleteTask: (id: string) => void;
  isExpanded?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
  isDragOver?: boolean;
}

function KanbanColumn({
  board,
  onAddTask,
  onEditTask,
  onDeleteTask,
  isExpanded = true,
  onToggle,
  isMobile = false,
  isDragOver = false,
}: KanbanColumnProps) {
  const { getBoardConfig, getWipStatus } = useBoardConfig();
  const { getFilteredAndSortedTasks } = useTaskStore();
  const config = getBoardConfig(board.slug);
  const { isWipLimitReached, isOverWipLimit } = getWipStatus(board);

  // Get filtered and sorted tasks for this board
  const filteredTasks = getFilteredAndSortedTasks(board.id);
  const taskIds = filteredTasks.map((task) => task.id);
  const { setNodeRef } = useDroppable({
    id: board.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${
        isMobile ? "w-full mb-4" : "flex-1 min-w-80"
      } rounded-lg border-2 ${config.color} ${
        isOverWipLimit ? "border-red-300" : ""
      } ${
        isDragOver ? "border-blue-400 bg-blue-50 scale-105 shadow-lg" : ""
      } transition-all duration-200`}
    >
      <div
        className={`p-4 rounded-t-lg ${config.headerColor} ${
          isMobile ? "cursor-pointer" : ""
        }`}
        onClick={isMobile ? onToggle : undefined}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            {isMobile && (
              <div className='text-gray-600'>
                {isExpanded ? (
                  <ChevronDown className='h-4 w-4' />
                ) : (
                  <ChevronRight className='h-4 w-4' />
                )}
              </div>
            )}
            <h3 className={`font-semibold ${config.textColor}`}>
              {board.name}
            </h3>
            {board.wip_limit && (
              <Badge
                variant={isWipLimitReached ? "destructive" : "secondary"}
                className='text-xs'
              >
                {filteredTasks.length}/{board.wip_limit}
              </Badge>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-600 bg-white px-2 py-1 rounded-full'>
              {filteredTasks.length}
            </span>
            {!isMobile && (
              <Button
                variant='ghost'
                size='sm'
                onClick={onAddTask}
                className='h-6 w-6 p-0 hover:bg-white/50'
                disabled={isWipLimitReached}
              >
                <Plus className='h-3 w-3' />
              </Button>
            )}
          </div>
        </div>

        {/* WIP Limit Warning */}
        {isWipLimitReached && (
          <div className='mt-2 flex items-center gap-1 text-xs text-red-600'>
            <AlertCircle className='h-3 w-3' />
            <span>WIP limit reached</span>
          </div>
        )}
      </div>

      {/* Tasks Container - Only show when expanded on mobile */}
      {(!isMobile || isExpanded) && (
        <>
          <div className='p-4 space-y-3 min-h-96'>
            <SortableContext
              items={taskIds}
              strategy={verticalListSortingStrategy}
            >
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </SortableContext>

            {filteredTasks.length === 0 && (
              <div className='text-center py-8 text-gray-500'>
                <p className='text-sm'>No tasks yet</p>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={onAddTask}
                  className='mt-2 text-xs'
                  disabled={isWipLimitReached}
                >
                  Add your first task
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Add Task Button */}
          {isMobile && filteredTasks.length > 0 && (
            <div className='p-4 border-t border-gray-200'>
              <Button
                variant='outline'
                size='sm'
                onClick={onAddTask}
                className='w-full'
                disabled={isWipLimitReached}
              >
                <Plus className='h-4 w-4 mr-2' />
                Add Task
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface KanbanBoardProps {
  onAddTask: (boardId: string) => void;
  onEditTask: (task: TaskWithRelations) => void;
  onDeleteTask: (id: string) => void;
}

export function KanbanBoard({
  onAddTask,
  onEditTask,
  onDeleteTask,
}: KanbanBoardProps) {
  const { boards } = useTaskStore();
  const { isMobile, handleToggleBoard, isBoardExpanded } =
    useMobileLayout(boards);
  const {
    sensors,
    activeTask,
    overId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useDragAndDrop(boards);

  // Sort boards by position
  const sortedBoards = [...boards].sort((a, b) => a.position - b.position);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className={`${
          isMobile
            ? "flex flex-col p-4 min-h-screen bg-gray-50"
            : "flex gap-6 p-6 min-h-screen bg-gray-50 overflow-x-auto"
        }`}
      >
        {sortedBoards.map((board) => (
          <KanbanColumn
            key={board.id}
            board={board}
            onAddTask={() => onAddTask(board.id)}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            isExpanded={isBoardExpanded(board.id)}
            onToggle={() => handleToggleBoard(board.id)}
            isMobile={isMobile}
            isDragOver={overId === board.id}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className='rotate-3 opacity-90 scale-105 shadow-2xl border-2 border-blue-400 bg-white rounded-lg'>
            <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
