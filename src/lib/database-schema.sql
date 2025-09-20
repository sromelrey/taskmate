-- TaskMate Database Schema
-- Designed for Next.js + Neon Postgres with Row-Level Security

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- AUTHENTICATION & USER MANAGEMENT
-- =============================================

-- Users table (extends auth.users from Neon Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  wip_limit INTEGER DEFAULT 1, -- Work in progress limit per user
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PROJECT & BOARD MANAGEMENT
-- =============================================

-- Projects table (for future multi-project support)
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Boards table (backlog, todo, in_progress, done)
CREATE TABLE public.boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL, -- 'backlog', 'todo', 'in_progress', 'done'
  description TEXT,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0, -- For ordering boards
  wip_limit INTEGER, -- NULL means no limit
  color VARCHAR(7) DEFAULT '#6B7280', -- Hex color for UI
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, slug)
);

-- =============================================
-- TASK MANAGEMENT
-- =============================================

-- Tags table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#6B7280',
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  position INTEGER NOT NULL DEFAULT 0, -- For ordering within board
  estimated_hours DECIMAL(5,2), -- Time estimation
  actual_hours DECIMAL(5,2), -- Time tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task tags junction table
CREATE TABLE public.task_tags (
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- =============================================
-- ACTIVITY & AUDIT LOG
-- =============================================

-- Activity log for tracking changes
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'moved', 'assigned', etc.
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User indexes
CREATE INDEX idx_users_email ON public.users(email);

-- Project indexes
CREATE INDEX idx_projects_owner_id ON public.projects(owner_id);

-- Board indexes
CREATE INDEX idx_boards_project_id ON public.boards(project_id);
CREATE INDEX idx_boards_position ON public.boards(project_id, position);

-- Task indexes
CREATE INDEX idx_tasks_board_id ON public.tasks(board_id);
CREATE INDEX idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX idx_tasks_creator_id ON public.tasks(creator_id);
CREATE INDEX idx_tasks_position ON public.tasks(board_id, position);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);

-- Tag indexes
CREATE INDEX idx_tags_project_id ON public.tags(project_id);

-- Activity log indexes
CREATE INDEX idx_activity_log_task_id ON public.activity_log(task_id);
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view projects they own" ON public.projects
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = owner_id);

-- Boards policies
CREATE POLICY "Users can view boards of their projects" ON public.boards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = boards.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage boards of their projects" ON public.boards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = boards.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Tasks policies
CREATE POLICY "Users can view tasks in their projects" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      JOIN public.projects ON projects.id = boards.project_id
      WHERE boards.id = tasks.board_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks in their projects" ON public.tasks
  FOR INSERT WITH CHECK (
    auth.uid() = creator_id AND
    EXISTS (
      SELECT 1 FROM public.boards 
      JOIN public.projects ON projects.id = boards.project_id
      WHERE boards.id = tasks.board_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks in their projects" ON public.tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      JOIN public.projects ON projects.id = boards.project_id
      WHERE boards.id = tasks.board_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks in their projects" ON public.tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      JOIN public.projects ON projects.id = boards.project_id
      WHERE boards.id = tasks.board_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Tags policies
CREATE POLICY "Users can view tags in their projects" ON public.tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = tags.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tags in their projects" ON public.tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = tags.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Task tags policies
CREATE POLICY "Users can view task tags in their projects" ON public.task_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      JOIN public.boards ON boards.id = tasks.board_id
      JOIN public.projects ON projects.id = boards.project_id
      WHERE tasks.id = task_tags.task_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage task tags in their projects" ON public.task_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      JOIN public.boards ON boards.id = tasks.board_id
      JOIN public.projects ON projects.id = boards.project_id
      WHERE tasks.id = task_tags.task_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Activity log policies
CREATE POLICY "Users can view activity in their projects" ON public.activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      JOIN public.boards ON boards.id = tasks.board_id
      JOIN public.projects ON projects.id = boards.project_id
      WHERE tasks.id = activity_log.task_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create activity logs" ON public.activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON public.boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check WIP limits
CREATE OR REPLACE FUNCTION check_wip_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_wip_count INTEGER;
  board_wip_limit INTEGER;
  user_wip_limit INTEGER;
BEGIN
  -- Get board WIP limit
  SELECT wip_limit INTO board_wip_limit 
  FROM public.boards 
  WHERE id = NEW.board_id;
  
  -- Get user WIP limit
  SELECT wip_limit INTO user_wip_limit 
  FROM public.users 
  WHERE id = NEW.assignee_id;
  
  -- If moving to in_progress board, check limits
  IF NEW.board_id = (SELECT id FROM public.boards WHERE slug = 'in_progress') THEN
    -- Check board limit
    IF board_wip_limit IS NOT NULL THEN
      SELECT COUNT(*) INTO current_wip_count
      FROM public.tasks 
      WHERE board_id = NEW.board_id AND id != NEW.id;
      
      IF current_wip_count >= board_wip_limit THEN
        RAISE EXCEPTION 'Board WIP limit of % reached', board_wip_limit;
      END IF;
    END IF;
    
    -- Check user limit
    IF user_wip_limit IS NOT NULL AND NEW.assignee_id IS NOT NULL THEN
      SELECT COUNT(*) INTO current_wip_count
      FROM public.tasks 
      WHERE board_id = NEW.board_id 
      AND assignee_id = NEW.assignee_id 
      AND id != NEW.id;
      
      IF current_wip_count >= user_wip_limit THEN
        RAISE EXCEPTION 'User WIP limit of % reached', user_wip_limit;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add WIP limit trigger
CREATE TRIGGER check_wip_limit_trigger BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION check_wip_limit();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_task_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the activity
  INSERT INTO public.activity_log (task_id, user_id, action, old_values, new_values)
  VALUES (
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.creator_id, auth.uid()),
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

-- Add activity logging triggers
CREATE TRIGGER log_task_activity_trigger 
  AFTER INSERT OR UPDATE OR DELETE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION log_task_activity();

-- =============================================
-- INITIAL DATA SETUP
-- =============================================

-- Create default project and boards for new users
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

-- Add trigger to create default project for new users
CREATE TRIGGER setup_default_project_trigger 
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION setup_default_project();
