-- Add password authentication to users table
-- Run this in your Neon SQL console

-- 1. Add password_hash column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. Create the dummy user with password
INSERT INTO users (id, email, name, password_hash, timezone, wip_limit)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'dev@example.com',
  'Development User',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2a', -- password: "password123"
  'UTC',
  1
) ON CONFLICT (id) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  email = EXCLUDED.email;

-- 3. Create default project for the user
INSERT INTO projects (id, name, description, owner_id)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'My Tasks',
  'Default project for personal tasks',
  '550e8400-e29b-41d4-a716-446655440000'
) ON CONFLICT (id) DO NOTHING;

-- 4. Create default boards
INSERT INTO boards (id, name, slug, description, project_id, position, wip_limit, color) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'Backlog', 'backlog', 'Ideas and future tasks', '550e8400-e29b-41d4-a716-446655440001', 0, NULL, '#8B5CF6'),
('550e8400-e29b-41d4-a716-446655440003', 'To Do', 'todo', 'Tasks ready to be worked on', '550e8400-e29b-41d4-a716-446655440001', 1, NULL, '#6B7280'),
('550e8400-e29b-41d4-a716-446655440004', 'In Progress', 'in_progress', 'Currently working on', '550e8400-e29b-41d4-a716-446655440001', 2, 1, '#3B82F6'),
('550e8400-e29b-41d4-a716-446655440005', 'Done', 'done', 'Completed tasks', '550e8400-e29b-41d4-a716-446655440001', 3, NULL, '#10B981')
ON CONFLICT (id) DO NOTHING;

-- 5. Create some sample tags
INSERT INTO tags (id, name, color, project_id) VALUES
('550e8400-e29b-41d4-a716-446655440006', 'frontend', '#3B82F6', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440007', 'backend', '#10B981', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440008', 'urgent', '#EF4444', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440009', 'bug', '#F59E0B', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440010', 'feature', '#8B5CF6', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

-- 6. Create some sample tasks
INSERT INTO tasks (id, title, description, board_id, assignee_id, creator_id, priority, due_date, position, estimated_hours) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'Set up database schema', 'Create and run the database schema in Neon', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'high', NOW() + INTERVAL '7 days', 1, 2),
('550e8400-e29b-41d4-a716-446655440012', 'Implement authentication', 'Add Neon Auth integration', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'medium', NOW() + INTERVAL '14 days', 1, 4),
('550e8400-e29b-41d4-a716-446655440013', 'Add task filtering', 'Implement filtering by priority, assignee, and tags', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'medium', NOW() - INTERVAL '1 day', 1, 3)
ON CONFLICT (id) DO NOTHING;

-- 7. Add tags to tasks
INSERT INTO task_tags (task_id, tag_id) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440007'), -- Set up database schema -> backend
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440006'), -- Implement authentication -> frontend
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440007'), -- Implement authentication -> backend
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440006'), -- Add task filtering -> frontend
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440010')  -- Add task filtering -> feature
ON CONFLICT DO NOTHING;

-- Verify the setup
SELECT 'User created:' as status, email, name FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000';
SELECT 'Project created:' as status, name FROM projects WHERE id = '550e8400-e29b-41d4-a716-446655440001';
SELECT 'Boards created:' as status, COUNT(*) as count FROM boards WHERE project_id = '550e8400-e29b-41d4-a716-446655440001';
SELECT 'Tags created:' as status, COUNT(*) as count FROM tags WHERE project_id = '550e8400-e29b-41d4-a716-446655440001';
SELECT 'Tasks created:' as status, COUNT(*) as count FROM tasks WHERE creator_id = '550e8400-e29b-41d4-a716-446655440000';
