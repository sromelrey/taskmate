"use client";

import { TaskWithRelations } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User,
  Tag,
  MoreHorizontal,
  Edit,
  Trash2,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskCardProps {
  task: TaskWithRelations;
  onEdit: (task: TaskWithRelations) => void;
  onDelete: (id: string) => void;
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const isOverdue =
    task.due_date &&
    new Date(task.due_date).setHours(0, 0, 0, 0) <
      new Date().setHours(0, 0, 0, 0);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`mb-3 hover:shadow-md transition-shadow cursor-pointer group ${
        isDragging ? "opacity-50" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between'>
          <CardTitle className='text-sm font-medium leading-tight line-clamp-2'>
            {task.title}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
              >
                <MoreHorizontal className='h-3 w-3' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className='h-3 w-3 mr-2' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className='text-red-600'
              >
                <Trash2 className='h-3 w-3 mr-2' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className='pt-0 space-y-2'>
        {task.description && (
          <p className='text-xs text-gray-600 line-clamp-2'>
            {task.description}
          </p>
        )}

        <div className='flex items-center gap-2'>
          <Badge
            variant='secondary'
            className={`text-xs ${priorityColors[task.priority]}`}
          >
            {priorityLabels[task.priority]}
          </Badge>
        </div>

        <div className='space-y-1'>
          {task.assignee && (
            <div className='flex items-center gap-1 text-xs text-gray-500'>
              <User className='h-3 w-3' />
              <span className='truncate'>{task.assignee.name}</span>
            </div>
          )}

          {task.due_date && (
            <div
              className={`flex items-center gap-1 text-xs ${
                isOverdue ? "text-red-500" : "text-gray-500"
              }`}
            >
              <Calendar className='h-3 w-3' />
              <span>
                {new Date(task.due_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}

          {task.estimated_hours && (
            <div className='flex items-center gap-1 text-xs text-gray-500'>
              <Clock className='h-3 w-3' />
              <span>{task.estimated_hours}h</span>
            </div>
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className='flex items-center gap-1 flex-wrap'>
            <Tag className='h-3 w-3 text-gray-400' />
            {task.tags.slice(0, 2).map((tag) => (
              <Badge 
                key={tag.id} 
                variant='outline' 
                className='text-xs px-1 py-0'
                style={{ borderColor: tag.color, color: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <span className='text-xs text-gray-400'>
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
