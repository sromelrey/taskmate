"use client";

import { useState, useEffect } from "react";
import { TaskWithRelations, CreateTaskData, Tag } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: CreateTaskData) => Promise<void>;
  task?: TaskWithRelations | null;
  currentUserId: string;
  availableTags: Tag[];
}

export function TaskModal({
  isOpen,
  onClose,
  onSave,
  task,
  currentUserId,
  availableTags,
}: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    board_id: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    due_date: "",
    assignee_id: "",
    estimated_hours: "",
    tag_ids: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        board_id: task.board_id,
        priority: task.priority,
        due_date: task.due_date || "",
        assignee_id: task.assignee_id || currentUserId, // Use current user if no assignee
        estimated_hours: task.estimated_hours?.toString() || "",
        tag_ids: task.tags?.map((tag) => tag.id) || [],
      });
    } else {
      setFormData({
        title: "",
        description: "",
        board_id: "",
        priority: "medium",
        due_date: "",
        assignee_id: currentUserId, // Auto-assign to current user
        estimated_hours: "",
        tag_ids: [],
      });
    }
  }, [task, isOpen, currentUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);

    try {
      // Convert string values to appropriate types
      const processedData: CreateTaskData = {
        title: formData.title,
        description: formData.description,
        board_id: formData.board_id,
        priority: formData.priority,
        due_date: formData.due_date || undefined,
        assignee_id: formData.assignee_id,
        estimated_hours: formData.estimated_hours
          ? parseFloat(formData.estimated_hours)
          : undefined,
        tag_ids: formData.tag_ids,
      };

      // Close modal immediately for better UX
      onClose();

      // Save task in background
      await onSave(processedData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addExistingTag = (tag: Tag) => {
    if (!formData.tag_ids.includes(tag.id)) {
      setFormData((prev) => ({
        ...prev,
        tag_ids: [...prev.tag_ids, tag.id],
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.filter((tag) => tag !== tagToRemove),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='text-sm font-medium'>Title *</label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder='Enter task title'
              required
            />
          </div>

          <div>
            <label className='text-sm font-medium'>Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder='Enter task description'
              rows={3}
            />
          </div>

          <div>
            <label className='text-sm font-medium'>Estimated Hours</label>
            <Input
              type='number'
              value={formData.estimated_hours}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  estimated_hours: e.target.value,
                }))
              }
              placeholder='Enter estimated hours'
              min='0'
              step='0.5'
            />
          </div>

          <div>
            <label className='text-sm font-medium mb-3 block'>Priority</label>
            <div className='flex gap-3'>
              {[
                {
                  value: "low",
                  label: "Low",
                  color: "bg-gray-100 text-gray-800 border-gray-300",
                  textColor: "text-gray-600",
                },
                {
                  value: "medium",
                  label: "Medium",
                  color: "bg-blue-100 text-blue-800 border-blue-300",
                  textColor: "text-blue-600",
                },
                {
                  value: "high",
                  label: "High",
                  color: "bg-orange-100 text-orange-800 border-orange-300",
                  textColor: "text-orange-600",
                },
                {
                  value: "urgent",
                  label: "Urgent",
                  color: "bg-red-100 text-red-800 border-red-300",
                  textColor: "text-red-600",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`
                    flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all flex-1
                    ${
                      formData.priority === option.value
                        ? `${option.color} border-opacity-100`
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }
                  `}
                >
                  <input
                    type='radio'
                    name='priority'
                    value={option.value}
                    checked={formData.priority === option.value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        priority: e.target.value as
                          | "low"
                          | "medium"
                          | "high"
                          | "urgent",
                      }))
                    }
                    className='sr-only'
                  />
                  <div
                    className={`
                      w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${
                        formData.priority === option.value
                          ? "border-current"
                          : "border-gray-300"
                      }
                    `}
                  >
                    {formData.priority === option.value && (
                      <div className='w-2 h-2 rounded-full bg-current' />
                    )}
                  </div>
                  <span className={`font-medium ${option.textColor}`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className='text-sm font-medium mb-3 block text-gray-700'>
              Due Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className={`
                    w-full h-14 text-base font-medium justify-start text-left
                    border-2 border-gray-200 rounded-lg
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                    hover:border-gray-300 transition-all duration-200
                    bg-white shadow-sm
                    ${!formData.due_date && "text-muted-foreground"}
                  `}
                >
                  <CalendarIcon className='mr-2 h-5 w-5' />
                  {formData.due_date
                    ? format(new Date(formData.due_date), "PPP")
                    : "Select due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className='p-0'
                align='start'
                sideOffset={4}
                style={{ width: "var(--radix-popover-trigger-width)" }}
              >
                <Calendar
                  mode='single'
                  selected={
                    formData.due_date ? new Date(formData.due_date) : undefined
                  }
                  onSelect={(date) => {
                    if (date) {
                      setFormData((prev) => ({
                        ...prev,
                        due_date: format(date, "yyyy-MM-dd"),
                      }));
                    }
                  }}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  initialFocus
                  className='w-full'
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className='text-sm font-medium'>Tags</label>
            <div className='space-y-2'>
              {availableTags.length > 0 && (
                <div className='flex flex-wrap gap-1'>
                  {availableTags
                    .filter((tag) => !formData.tag_ids.includes(tag.id))
                    .map((tag) => (
                      <Badge
                        key={tag.id}
                        variant='outline'
                        className='cursor-pointer hover:bg-gray-100'
                        onClick={() => addExistingTag(tag)}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                </div>
              )}

              {formData.tag_ids.length > 0 && (
                <div className='flex flex-wrap gap-1'>
                  {formData.tag_ids.map((tagId) => {
                    const tag = availableTags.find((t) => t.id === tagId);
                    return (
                      <Badge
                        key={tagId}
                        variant='secondary'
                        className='flex items-center gap-1'
                      >
                        {tag?.name || tagId}
                        <X
                          className='h-3 w-3 cursor-pointer'
                          onClick={() => removeTag(tagId)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting
                ? task
                  ? "Updating..."
                  : "Creating..."
                : task
                ? "Update Task"
                : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
