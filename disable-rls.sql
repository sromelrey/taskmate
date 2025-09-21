-- Disable Row Level Security for custom authentication system
-- This allows the custom auth system to work without Neon Auth

-- Disable RLS on all tables
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view projects they own" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view boards of their projects" ON public.boards;
DROP POLICY IF EXISTS "Users can manage boards of their projects" ON public.boards;
DROP POLICY IF EXISTS "Users can view tasks in their projects" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks in their projects" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks in their projects" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete tasks in their projects" ON public.tasks;
DROP POLICY IF EXISTS "Users can view tags in their projects" ON public.tags;
DROP POLICY IF EXISTS "Users can manage tags in their projects" ON public.tags;
DROP POLICY IF EXISTS "Users can view task tags in their projects" ON public.task_tags;
DROP POLICY IF EXISTS "Users can manage task tags in their projects" ON public.task_tags;
DROP POLICY IF EXISTS "Users can view activity in their projects" ON public.activity_log;
DROP POLICY IF EXISTS "Users can create activity logs" ON public.activity_log;

-- Update the setup_default_project function to work without auth.uid()
CREATE OR REPLACE FUNCTION setup_default_project()
RETURNS TRIGGER AS $$
DECLARE
  project_id UUID;
BEGIN
  -- Create default project
  INSERT INTO public.projects (name, description, owner_id)
  VALUES ('My Tasks', 'Default project for personal tasks', NEW.id)
  RETURNING id INTO project_id;
  
  -- Create default boards
  INSERT INTO public.boards (name, slug, description, project_id, position, wip_limit, color) VALUES
  ('Backlog', 'backlog', 'Ideas and future tasks', project_id, 0, NULL, '#8B5CF6'),
  ('To Do', 'todo', 'Tasks ready to be worked on', project_id, 1, NULL, '#6B7280'),
  ('In Progress', 'in_progress', 'Currently working on', project_id, 2, 1, '#3B82F6'),
  ('Done', 'done', 'Completed tasks', project_id, 3, NULL, '#10B981');
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Update the log_task_activity function to work without auth.uid()
CREATE OR REPLACE FUNCTION log_task_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the activity
  INSERT INTO public.activity_log (task_id, user_id, action, old_values, new_values)
  VALUES (
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.creator_id, OLD.creator_id),
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN TG_OP = 'UPDATE' THEN 'updated'
      WHEN TG_OP = 'DELETE' THEN 'deleted'
    END,
    CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'projects', 'boards', 'tasks', 'tags', 'task_tags', 'activity_log');
