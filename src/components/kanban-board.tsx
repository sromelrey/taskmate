"use client";

import { useTaskStore, Task } from "@/lib/store";
import { TaskCard } from "./task-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";

interface KanbanColumnProps {
  title: string;
  status: Task["status"];
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
}

const statusConfig = {
  todo: {
    title: "To Do",
    color: "bg-gray-50 border-gray-200",
    headerColor: "bg-gray-100",
  },
  in_progress: {
    title: "In Progress",
    color: "bg-blue-50 border-blue-200",
    headerColor: "bg-blue-100",
  },
  done: {
    title: "Done",
    color: "bg-green-50 border-green-200",
    headerColor: "bg-green-100",
  },
};

function KanbanColumn({
  title,
  status,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const taskIds = tasks.map((task) => task.id.toString());
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-80 rounded-lg border-2 ${statusConfig[status].color}`}
    >
      <div className={`p-4 rounded-t-lg ${statusConfig[status].headerColor}`}>
        <div className='flex items-center justify-between'>
          <h3 className='font-semibold text-gray-800'>{title}</h3>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-600 bg-white px-2 py-1 rounded-full'>
              {tasks.length}
            </span>
            <Button
              variant='ghost'
              size='sm'
              onClick={onAddTask}
              className='h-6 w-6 p-0 hover:bg-white/50'
            >
              <Plus className='h-3 w-3' />
            </Button>
          </div>
        </div>
      </div>

      <div className='p-4 space-y-3 min-h-96'>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className='text-center py-8 text-gray-500'>
            <p className='text-sm'>No tasks yet</p>
            <Button
              variant='ghost'
              size='sm'
              onClick={onAddTask}
              className='mt-2 text-xs'
            >
              Add your first task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  onAddTask: (status?: Task["status"]) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
}

export function KanbanBoard({
  onAddTask,
  onEditTask,
  onDeleteTask,
}: KanbanBoardProps) {
  const { tasks, moveTask } = useTaskStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const todoTasks = tasks.filter((task) => task.status === "todo");
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress");
  const doneTasks = tasks.filter((task) => task.status === "done");

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id.toString() === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = parseInt(active.id as string);
    const newStatus = over.id as Task["status"];

    if (newStatus && ["todo", "in_progress", "done"].includes(newStatus)) {
      moveTask(taskId, newStatus as Task["status"]);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className='flex gap-6 p-6 min-h-screen bg-gray-50'>
        <KanbanColumn
          title='To Do'
          status='todo'
          tasks={todoTasks}
          onAddTask={() => onAddTask("todo")}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />

        <KanbanColumn
          title='In Progress'
          status='in_progress'
          tasks={inProgressTasks}
          onAddTask={() => onAddTask("in_progress")}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />

        <KanbanColumn
          title='Done'
          status='done'
          tasks={doneTasks}
          onAddTask={() => onAddTask("done")}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className='rotate-3 opacity-90'>
            <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
