"use client";

import { KanbanBoard } from "@/components/kanban-board";
import { TaskModal } from "@/components/task-modal";
import { CleanupPanel } from "@/components/cleanup-panel";
import { TaskFilters } from "@/components/task-filters";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Settings, Filter } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/lib/auth-context";
import { useTaskMateApp } from "@/hooks/useTaskMateApp";
import { useTaskStore } from "@/lib/store";
import { useState } from "react";

function TaskMateApp() {
  const { user, logout } = useAuth();
  const [showCleanupPanel, setShowCleanupPanel] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const {
    boards,
    tags,
    isModalOpen,
    editingTask,
    isLoading,
    handleAddTask,
    handleEditTask,
    handleSaveTask,
    handleDeleteTask,
    handleCloseModal,
  } = useTaskMateApp();

  const {
    filters,
    isFiltersExpanded,
    setFilters,
    clearFilters,
    toggleFiltersExpanded,
  } = useTaskStore();

  // Pass full tag objects instead of just names

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
            <p className='text-sm text-gray-600'>Welcome back, {user?.name}!</p>
          </div>
          <div className='flex items-center gap-3'>
            <Button
              onClick={() => {
                // Default to first board (backlog) for new tasks
                const firstBoard = boards[0];
                if (firstBoard) {
                  handleAddTask(firstBoard.id);
                }
              }}
              className='flex items-center gap-2'
            >
              <Plus className='h-4 w-4' />
              Add Task
            </Button>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant='outline'
              className='flex items-center gap-2'
            >
              <Filter className='h-4 w-4' />
              Filters
            </Button>
            <Button
              onClick={() => setShowCleanupPanel(!showCleanupPanel)}
              variant='outline'
              className='flex items-center gap-2'
            >
              <Settings className='h-4 w-4' />
              Cleanup
            </Button>
            <Button
              onClick={logout}
              variant='outline'
              className='flex items-center gap-2'
            >
              <LogOut className='h-4 w-4' />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Task Filters */}
      {showFilters && (
        <div className='bg-white border-b border-gray-200 px-6 py-4'>
          <TaskFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
            isExpanded={isFiltersExpanded}
            onToggleExpanded={toggleFiltersExpanded}
          />
        </div>
      )}

      {/* Cleanup Panel */}
      {showCleanupPanel && (
        <div className='bg-white border-b border-gray-200 px-6 py-4'>
          <CleanupPanel />
        </div>
      )}

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
        currentUserId={user?.id || ""}
        availableTags={tags}
      />
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <TaskMateApp />
    </ProtectedRoute>
  );
}
