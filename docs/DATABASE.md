# TaskMate Database Schema

This document describes the database structure, relationships, and data flow for TaskMate.

## 📋 Table of Contents

- [Overview](#overview)
- [Database Schema](#database-schema)
- [Table Relationships](#table-relationships)
- [Indexes](#indexes)
- [Row-Level Security](#row-level-security)
- [Data Types](#data-types)
- [Sample Data](#sample-data)
- [Migration Scripts](#migration-scripts)

## 🔍 Overview

TaskMate uses PostgreSQL as its primary database with the following key features:

- **UUID primary keys** for all entities
- **Row-level security (RLS)** for data isolation
- **Foreign key constraints** for data integrity
- **Optimized indexes** for performance
- **Automatic timestamps** for audit trails

### Database Connection

```typescript
// Connection string format
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  wip_limit INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Store user account information and preferences.

**Key Fields**:

- `id`: Unique identifier (UUID)
- `email`: User's email address (unique)
- `name`: Display name
- `password_hash`: Bcrypt hashed password
- `timezone`: User's timezone preference
- `wip_limit`: Personal work-in-progress limit

### Projects Table

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Organize tasks into projects (currently one per user).

**Key Fields**:

- `id`: Unique identifier (UUID)
- `name`: Project name
- `description`: Project description
- `owner_id`: Reference to the user who owns the project

### Boards Table

```sql
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(50) NOT NULL CHECK (slug IN ('backlog', 'todo', 'in_progress', 'done')),
  description TEXT,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  wip_limit INTEGER,
  color VARCHAR(7) NOT NULL DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, slug)
);
```

**Purpose**: Define Kanban board columns within projects.

**Key Fields**:

- `id`: Unique identifier (UUID)
- `name`: Board display name
- `slug`: Board identifier (backlog, todo, in_progress, done)
- `project_id`: Reference to parent project
- `position`: Order of boards
- `wip_limit`: Work-in-progress limit for this board
- `color`: Hex color code for UI theming

### Tasks Table

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  position INTEGER NOT NULL DEFAULT 0,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Store individual task information.

**Key Fields**:

- `id`: Unique identifier (UUID)
- `title`: Task title
- `description`: Detailed task description
- `board_id`: Reference to current board
- `assignee_id`: User assigned to the task
- `creator_id`: User who created the task
- `priority`: Task priority level
- `due_date`: When the task should be completed
- `position`: Order within the board
- `estimated_hours`: Expected time to complete
- `actual_hours`: Actual time spent
- `completed_at`: When the task was completed

### Tags Table

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#6B7280',
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, name)
);
```

**Purpose**: Categorize tasks with labels.

**Key Fields**:

- `id`: Unique identifier (UUID)
- `name`: Tag name
- `color`: Hex color code for UI
- `project_id`: Reference to parent project

### Task Tags Junction Table

```sql
CREATE TABLE task_tags (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);
```

**Purpose**: Many-to-many relationship between tasks and tags.

### Activity Log Table

```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Track user actions for audit and analytics.

**Key Fields**:

- `id`: Unique identifier (UUID)
- `user_id`: User who performed the action
- `action`: Type of action (created, updated, deleted, moved)
- `entity_type`: Type of entity (task, board, tag)
- `entity_id`: ID of the affected entity
- `details`: Additional action details in JSON format

## 🔗 Table Relationships

### Entity Relationship Diagram

```
Users (1) ──→ (N) Projects
Projects (1) ──→ (N) Boards
Projects (1) ──→ (N) Tags
Boards (1) ──→ (N) Tasks
Users (1) ──→ (N) Tasks (as creator)
Users (1) ──→ (N) Tasks (as assignee)
Tasks (N) ──→ (N) Tags (via task_tags)
Users (1) ──→ (N) Activity Log
```

### Foreign Key Constraints

- `projects.owner_id` → `users.id`
- `boards.project_id` → `projects.id`
- `tasks.board_id` → `boards.id`
- `tasks.assignee_id` → `users.id`
- `tasks.creator_id` → `users.id`
- `tags.project_id` → `projects.id`
- `task_tags.task_id` → `tasks.id`
- `task_tags.tag_id` → `tags.id`
- `activity_log.user_id` → `users.id`

### Cascade Behaviors

- **ON DELETE CASCADE**: Projects, boards, tasks, tags, activity logs
- **ON DELETE SET NULL**: Task assignee (preserves task if user is deleted)

## 📊 Indexes

### Primary Indexes

All tables have primary key indexes on their `id` columns.

### Performance Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);

-- Projects
CREATE INDEX idx_projects_owner_id ON projects(owner_id);

-- Boards
CREATE INDEX idx_boards_project_id ON boards(project_id);
CREATE INDEX idx_boards_slug ON boards(project_id, slug);

-- Tasks
CREATE INDEX idx_tasks_board_id ON tasks(board_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_creator_id ON tasks(creator_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at);
CREATE INDEX idx_tasks_board_completed ON tasks(board_id, completed_at) WHERE completed_at IS NOT NULL;

-- Tags
CREATE INDEX idx_tags_project_id ON tags(project_id);
CREATE INDEX idx_tags_name ON tags(project_id, name);

-- Task Tags
CREATE INDEX idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX idx_task_tags_tag_id ON task_tags(tag_id);

-- Activity Log
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);
```

## 🔒 Row-Level Security (RLS)

### Enable RLS

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

#### Users Table

```sql
-- Users can only see and modify their own data
CREATE POLICY "Users can manage own data" ON users
  FOR ALL USING (id = current_setting('app.current_user_id')::uuid);
```

#### Projects Table

```sql
-- Users can only access their own projects
CREATE POLICY "Users can manage own projects" ON projects
  FOR ALL USING (owner_id = current_setting('app.current_user_id')::uuid);
```

#### Boards Table

```sql
-- Users can only access boards in their own projects
CREATE POLICY "Users can manage own boards" ON boards
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = current_setting('app.current_user_id')::uuid
    )
  );
```

#### Tasks Table

```sql
-- Users can only access tasks they created or are assigned to
CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL USING (
    creator_id = current_setting('app.current_user_id')::uuid OR
    assignee_id = current_setting('app.current_user_id')::uuid
  );
```

#### Tags Table

```sql
-- Users can only access tags in their own projects
CREATE POLICY "Users can manage own tags" ON tags
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = current_setting('app.current_user_id')::uuid
    )
  );
```

#### Task Tags Table

```sql
-- Users can only access task tags for their own tasks
CREATE POLICY "Users can manage own task tags" ON task_tags
  FOR ALL USING (
    task_id IN (
      SELECT id FROM tasks WHERE creator_id = current_setting('app.current_user_id')::uuid
    )
  );
```

#### Activity Log Table

```sql
-- Users can only see their own activity
CREATE POLICY "Users can view own activity" ON activity_log
  FOR SELECT USING (user_id = current_setting('app.current_user_id')::uuid);
```

### Setting Current User

```sql
-- Set the current user context for RLS
SET app.current_user_id = 'user-uuid-here';
```

## 📝 Data Types

### UUID

- **Format**: `550e8400-e29b-41d4-a716-446655440000`
- **Usage**: Primary keys, foreign keys
- **Generation**: `gen_random_uuid()`

### Timestamps

- **Type**: `TIMESTAMP WITH TIME ZONE`
- **Format**: `2024-01-01T12:00:00Z`
- **Default**: `NOW()`

### Priority Enum

- **Values**: `low`, `medium`, `high`, `urgent`
- **Default**: `medium`

### Board Slug Enum

- **Values**: `backlog`, `todo`, `in_progress`, `done`
- **Constraint**: Must be one of these values

### Color Format

- **Type**: `VARCHAR(7)`
- **Format**: `#RRGGBB` (hex color codes)
- **Default**: `#6B7280` (gray)

## 🎯 Sample Data

### Default User

```sql
INSERT INTO users (id, email, name, password_hash, timezone, wip_limit)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'admin@gmail.com',
  'Admin User',
  '$2b$12$WWBXEaSeqH/CpLcV467YwetlO2BJ2tdWX9DqKO7AkSKhQGahoGEsG',
  'UTC',
  1
);
```

### Default Project

```sql
INSERT INTO projects (id, name, description, owner_id)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'My Tasks',
  'Default project for personal tasks',
  '550e8400-e29b-41d4-a716-446655440000'
);
```

### Default Boards

```sql
INSERT INTO boards (id, name, slug, description, project_id, position, wip_limit, color)
VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'Backlog', 'backlog', 'Ideas and future tasks', '550e8400-e29b-41d4-a716-446655440001', 0, NULL, '#8B5CF6'),
  ('550e8400-e29b-41d4-a716-446655440003', 'To Do', 'todo', 'Tasks ready to be worked on', '550e8400-e29b-41d4-a716-446655440001', 1, NULL, '#6B7280'),
  ('550e8400-e29b-41d4-a716-446655440004', 'In Progress', 'in_progress', 'Currently working on', '550e8400-e29b-41d4-a716-446655440001', 2, 1, '#3B82F6'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Done', 'done', 'Completed tasks', '550e8400-e29b-41d4-a716-446655440001', 3, NULL, '#10B981');
```

### Default Tags

```sql
INSERT INTO tags (id, name, color, project_id)
VALUES
  ('550e8400-e29b-41d4-a716-446655440006', 'frontend', '#3B82F6', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440007', 'backend', '#10B981', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440008', 'urgent', '#EF4444', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440009', 'bug', '#F59E0B', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440010', 'feature', '#8B5CF6', '550e8400-e29b-41d4-a716-446655440001');
```

### Sample Tasks

```sql
INSERT INTO tasks (id, title, description, board_id, assignee_id, creator_id, priority, due_date, position, estimated_hours)
VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 'Set up database schema', 'Create and run the database schema in Neon', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'high', NOW() + INTERVAL '7 days', 1, 2),
  ('550e8400-e29b-41d4-a716-446655440012', 'Implement authentication', 'Add real database authentication', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'medium', NOW() + INTERVAL '14 days', 1, 4),
  ('550e8400-e29b-41d4-a716-446655440013', 'Add task filtering', 'Implement filtering by priority, assignee, and tags', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'medium', NOW() - INTERVAL '1 day', 1, 3);
```

### Sample Task Tags

```sql
INSERT INTO task_tags (task_id, tag_id)
VALUES
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440007'),
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440006'),
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440007'),
  ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440006'),
  ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440010');
```

## 🔄 Migration Scripts

### Initial Schema

```sql
-- Create all tables with proper constraints
-- Enable RLS and create policies
-- Create indexes for performance
-- Insert default data
```

### Add Completed At Field

```sql
-- Migration: Add completed_at column to tasks table
ALTER TABLE public.tasks
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create an index on completed_at for efficient querying
CREATE INDEX idx_tasks_completed_at ON public.tasks (completed_at);

-- Create an index for tasks in the 'done' board that are completed
CREATE INDEX idx_tasks_board_completed ON public.tasks (board_id, completed_at)
WHERE completed_at IS NOT NULL;

-- Add a comment for documentation
COMMENT ON COLUMN public.tasks.completed_at IS 'Timestamp when the task was moved to a "done" board.';
```

### Add Password Hash Column

```sql
-- Add password_hash column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Update existing users with default password
UPDATE users
SET password_hash = '$2b$12$WWBXEaSeqH/CpLcV467YwetlO2BJ2tdWX9DqKO7AkSKhQGahoGEsG'
WHERE password_hash IS NULL;
```

## 📊 Query Examples

### Get User's Tasks with Relations

```sql
SELECT
  t.*,
  u.name as assignee_name,
  b.name as board_name,
  b.slug as board_slug,
  COALESCE(
    json_agg(
      json_build_object(
        'id', tg.id,
        'name', tg.name,
        'color', tg.color
      )
    ) FILTER (WHERE tg.id IS NOT NULL),
    '[]'
  ) as tags
FROM tasks t
LEFT JOIN users u ON t.assignee_id = u.id
LEFT JOIN boards b ON t.board_id = b.id
LEFT JOIN task_tags tt ON t.id = tt.task_id
LEFT JOIN tags tg ON tt.tag_id = tg.id
WHERE t.creator_id = $1
GROUP BY t.id, u.id, b.id
ORDER BY t.position;
```

### Get Tasks for Cleanup

```sql
SELECT COUNT(*), MIN(completed_at), MAX(completed_at)
FROM tasks t
JOIN boards b ON t.board_id = b.id
WHERE b.slug = 'done'
  AND t.creator_id = $1
  AND t.completed_at IS NOT NULL
  AND t.completed_at < NOW() - INTERVAL '48 hours';
```

### Get User's Project Statistics

```sql
SELECT
  p.name as project_name,
  COUNT(DISTINCT b.id) as board_count,
  COUNT(DISTINCT t.id) as task_count,
  COUNT(DISTINCT CASE WHEN b.slug = 'done' THEN t.id END) as completed_tasks,
  COUNT(DISTINCT tg.id) as tag_count
FROM projects p
LEFT JOIN boards b ON p.id = b.project_id
LEFT JOIN tasks t ON b.id = t.board_id
LEFT JOIN tags tg ON p.id = tg.project_id
WHERE p.owner_id = $1
GROUP BY p.id, p.name;
```

## 🔧 Maintenance

### Regular Maintenance Tasks

1. **Clean up old activity logs** (older than 1 year)
2. **Vacuum and analyze tables** for performance
3. **Monitor index usage** and optimize as needed
4. **Backup database** regularly
5. **Update statistics** for query planner

### Performance Monitoring

```sql
-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;
```

---

## 📞 Support

For database-related questions or issues:

1. **Check this documentation** for schema details
2. **Review query examples** for common operations
3. **Test queries** in a development environment
4. **Contact the development team** for complex issues

**Happy querying! 🚀**
