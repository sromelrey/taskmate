-- Setup initial data for TaskMate with custom authentication
-- This creates a test user and default project/boards

-- Create a test user (you can change the credentials)
INSERT INTO public.users (id, email, name, timezone, wip_limit, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'dev@example.com',
  'Development User',
  'UTC',
  1,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create default project for the test user
INSERT INTO public.projects (id, name, description, owner_id, created_at, updated_at)
VALUES (
  '660e8400-e29b-41d4-a716-446655440000',
  'My Tasks',
  'Default project for personal tasks',
  '550e8400-e29b-41d4-a716-446655440000',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create default boards
INSERT INTO public.boards (id, name, slug, description, project_id, position, wip_limit, color, created_at, updated_at) VALUES
('770e8400-e29b-41d4-a716-446655440000', 'Backlog', 'backlog', 'Ideas and future tasks', '660e8400-e29b-41d4-a716-446655440000', 0, NULL, '#8B5CF6', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440000', 'To Do', 'todo', 'Tasks ready to be worked on', '660e8400-e29b-41d4-a716-446655440000', 1, NULL, '#6B7280', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440000', 'In Progress', 'in_progress', 'Currently working on', '660e8400-e29b-41d4-a716-446655440000', 2, 1, '#3B82F6', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440000', 'Done', 'done', 'Completed tasks', '660e8400-e29b-41d4-a716-446655440000', 3, NULL, '#10B981', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create some sample tags
INSERT INTO public.tags (id, name, color, project_id, created_at) VALUES
('bb0e8400-e29b-41d4-a716-446655440000', 'frontend', '#10B981', '660e8400-e29b-41d4-a716-446655440000', NOW()),
('cc0e8400-e29b-41d4-a716-446655440000', 'backend', '#F59E0B', '660e8400-e29b-41d4-a716-446655440000', NOW()),
('dd0e8400-e29b-41d4-a716-446655440000', 'urgent', '#EF4444', '660e8400-e29b-41d4-a716-446655440000', NOW()),
('ee0e8400-e29b-41d4-a716-446655440000', 'feature', '#8B5CF6', '660e8400-e29b-41d4-a716-446655440000', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create some sample tasks
INSERT INTO public.tasks (id, title, description, board_id, assignee_id, creator_id, priority, due_date, position, estimated_hours, actual_hours, created_at, updated_at) VALUES
('ff0e8400-e29b-41d4-a716-446655440000', 'Implement login page', 'Create Next.js login with server actions and authentication flow.', '880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'high', '2025-01-15', 1, 8, 6, NOW(), NOW()),
('110e8400-e29b-41d4-a716-446655440000', 'Set up database schema', 'Design and implement database tables for tasks, tags, and users with proper relationships.', '770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'medium', '2025-01-20', 1, 12, NULL, NOW(), NOW()),
('220e8400-e29b-41d4-a716-446655440000', 'Add task filtering', 'Implement filtering by priority, assignee, and tags in the kanban board.', 'aa0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'medium', '2025-01-05', 1, 6, 5, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Link tasks to tags
INSERT INTO public.task_tags (task_id, tag_id) VALUES
('ff0e8400-e29b-41d4-a716-446655440000', 'bb0e8400-e29b-41d4-a716-446655440000'),
('ff0e8400-e29b-41d4-a716-446655440000', 'ee0e8400-e29b-41d4-a716-446655440000'),
('110e8400-e29b-41d4-a716-446655440000', 'cc0e8400-e29b-41d4-a716-446655440000'),
('110e8400-e29b-41d4-a716-446655440000', 'ee0e8400-e29b-41d4-a716-446655440000'),
('220e8400-e29b-41d4-a716-446655440000', 'bb0e8400-e29b-41d4-a716-446655440000'),
('220e8400-e29b-41d4-a716-446655440000', 'ee0e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (task_id, tag_id) DO NOTHING;

-- Verify the data was created
SELECT 'Users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'Projects', COUNT(*) FROM public.projects
UNION ALL
SELECT 'Boards', COUNT(*) FROM public.boards
UNION ALL
SELECT 'Tags', COUNT(*) FROM public.tags
UNION ALL
SELECT 'Tasks', COUNT(*) FROM public.tasks
UNION ALL
SELECT 'Task Tags', COUNT(*) FROM public.task_tags;
