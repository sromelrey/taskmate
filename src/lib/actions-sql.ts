"use server";

import { query, withTransaction, dbUtils, ValidationError, AuthorizationError } from './database';
import { 
  User, 
  Tag, 
  CreateTaskData, 
  UpdateTaskData, 
  TaskWithRelations,
  BoardWithTasks
} from './types';

// =============================================
// AUTHENTICATION HELPERS
// =============================================

async function getCurrentUser(): Promise<User | null> {
  try {
    // Mock user for development
    // In production, integrate with Neon Auth
    const mockUser = {
      id: 'dev-user-id',
      email: 'dev@example.com',
      name: 'Development User',
      timezone: 'UTC',
      wip_limit: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Check if user exists, create if not
    const userResult = await query(
      'SELECT * FROM users WHERE id = $1',
      [mockUser.id]
    );

    if (userResult.rows.length === 0) {
      await query(
        `INSERT INTO users (id, email, name, timezone, wip_limit, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [mockUser.id, mockUser.email, mockUser.name, mockUser.timezone, mockUser.wip_limit, mockUser.created_at, mockUser.updated_at]
      );
    }

    return mockUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// =============================================
// BOARD OPERATIONS
// =============================================

export async function getBoards(): Promise<BoardWithTasks[]> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new AuthorizationError();

    // Get default project
    const projectResult = await query(
      'SELECT id FROM projects WHERE owner_id = $1 AND name = $2',
      [user.id, 'My Tasks']
    );

    if (projectResult.rows.length === 0) {
      throw new AuthorizationError('Default project not found');
    }

    const projectId = (projectResult.rows[0] as Record<string, unknown>).id as string;

    // Get boards with tasks
    const boardsResult = await query(`
      SELECT 
        b.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', t.id,
              'title', t.title,
              'description', t.description,
              'board_id', t.board_id,
              'assignee_id', t.assignee_id,
              'creator_id', t.creator_id,
              'priority', t.priority,
              'due_date', t.due_date,
              'position', t.position,
              'estimated_hours', t.estimated_hours,
              'actual_hours', t.actual_hours,
              'created_at', t.created_at,
              'updated_at', t.updated_at,
              'assignee', CASE 
                WHEN u.id IS NOT NULL THEN 
                  json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'avatar_url', u.avatar_url)
                ELSE NULL 
              END,
              'tags', COALESCE(tag_agg.tags, '[]')
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tasks
      FROM boards b
      LEFT JOIN tasks t ON b.id = t.board_id
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN (
        SELECT 
          tt.task_id,
          json_agg(json_build_object('id', tg.id, 'name', tg.name, 'color', tg.color)) as tags
        FROM task_tags tt
        JOIN tags tg ON tt.tag_id = tg.id
        GROUP BY tt.task_id
      ) tag_agg ON t.id = tag_agg.task_id
      WHERE b.project_id = $1
      GROUP BY b.id
      ORDER BY b.position ASC
    `, [projectId]);

    return boardsResult.rows.map((row: unknown) => {
      const rowData = row as Record<string, unknown>;
      return {
        ...(rowData as unknown as BoardWithTasks),
        tasks: (rowData.tasks as TaskWithRelations[]) || [],
        taskCount: (rowData.tasks as TaskWithRelations[])?.length || 0,
      };
    });
  } catch (error) {
    return dbUtils.handleError(error);
  }
}

// =============================================
// TASK OPERATIONS
// =============================================

export async function getTasks(boardId?: string): Promise<TaskWithRelations[]> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new AuthorizationError();

    let sql = `
      SELECT 
        t.*,
        u.id as assignee_id, u.name as assignee_name, u.email as assignee_email, u.avatar_url as assignee_avatar_url,
        b.id as board_id, b.name as board_name, b.slug as board_slug, b.color as board_color, b.wip_limit as board_wip_limit,
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
    `;
    
    const params = [user.id];
    
    if (boardId) {
      sql += ' AND t.board_id = $2';
      params.push(boardId);
    }
    
    sql += ' GROUP BY t.id, u.id, b.id ORDER BY t.position ASC';

    const result = await query(sql, params);
    
    return result.rows.map((row: unknown) => {
      const rowData = row as Record<string, unknown>;
      return {
        id: rowData.id as string,
        title: rowData.title as string,
        description: rowData.description as string,
        board_id: rowData.board_id as string,
        assignee_id: rowData.assignee_id as string,
        creator_id: rowData.creator_id as string,
        priority: rowData.priority as "low" | "medium" | "high" | "urgent",
        due_date: rowData.due_date as string,
        position: rowData.position as number,
        estimated_hours: rowData.estimated_hours as number,
        actual_hours: rowData.actual_hours as number,
        created_at: rowData.created_at as string,
        updated_at: rowData.updated_at as string,
        assignee: rowData.assignee_id ? {
          id: rowData.assignee_id as string,
          name: rowData.assignee_name as string,
          email: rowData.assignee_email as string,
          avatar_url: rowData.assignee_avatar_url as string,
          timezone: "UTC",
          wip_limit: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } : undefined,
        board: rowData.board_id ? {
          id: rowData.board_id as string,
          name: rowData.board_name as string,
          slug: rowData.board_slug as "backlog" | "todo" | "in_progress" | "done",
          description: "",
          project_id: "",
          position: 0,
          color: rowData.board_color as string,
          wip_limit: rowData.board_wip_limit as number,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } : undefined,
        tags: (rowData.tags as Tag[]) || [],
      };
    });
  } catch (error) {
    return dbUtils.handleError(error);
  }
}

export async function createTask(taskData: CreateTaskData): Promise<TaskWithRelations> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new AuthorizationError();

    if (!taskData.title?.trim()) {
      throw new ValidationError('Task title is required', 'title');
    }

    if (!taskData.board_id) {
      throw new ValidationError('Board ID is required', 'board_id');
    }

    return await withTransaction(async (client) => {
      // Get next position
      const positionResult = await client.query(
        'SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM tasks WHERE board_id = $1',
        [taskData.board_id]
      );
      const nextPosition = positionResult.rows[0].next_position;

      // Create task
      const taskResult = await client.query(
        `INSERT INTO tasks (title, description, board_id, assignee_id, creator_id, priority, due_date, position, estimated_hours)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          taskData.title.trim(),
          taskData.description?.trim(),
          taskData.board_id,
          taskData.assignee_id,
          user.id,
          taskData.priority || 'medium',
          taskData.due_date,
          nextPosition,
          taskData.estimated_hours,
        ]
      );

      const task = taskResult.rows[0];

      // Add tags if provided
      if (taskData.tag_ids && taskData.tag_ids.length > 0) {
        for (const tagId of taskData.tag_ids) {
          await client.query(
            'INSERT INTO task_tags (task_id, tag_id) VALUES ($1, $2)',
            [task.id, tagId]
          );
        }
      }

      // Fetch complete task with relations
      const completeTask = await getTasks(task.id);
      return completeTask[0];
    });
  } catch (error) {
    return dbUtils.handleError(error);
  }
}

export async function updateTask(taskId: string, updates: UpdateTaskData): Promise<TaskWithRelations> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new AuthorizationError();

    return await withTransaction(async (client) => {
      // Validate task ownership
      const taskResult = await client.query(
        'SELECT * FROM tasks WHERE id = $1 AND creator_id = $2',
        [taskId, user.id]
      );

      if (taskResult.rows.length === 0) {
        throw new AuthorizationError('Task not found or access denied');
      }

      // Build update query
      const updateFields = [];
      const values = [];
      let paramCount = 1;

      if (updates.title !== undefined) {
        updateFields.push(`title = $${paramCount++}`);
        values.push(updates.title.trim());
      }
      if (updates.description !== undefined) {
        updateFields.push(`description = $${paramCount++}`);
        values.push(updates.description?.trim());
      }
      if (updates.board_id !== undefined) {
        updateFields.push(`board_id = $${paramCount++}`);
        values.push(updates.board_id);
      }
      if (updates.assignee_id !== undefined) {
        updateFields.push(`assignee_id = $${paramCount++}`);
        values.push(updates.assignee_id);
      }
      if (updates.priority !== undefined) {
        updateFields.push(`priority = $${paramCount++}`);
        values.push(updates.priority);
      }
      if (updates.due_date !== undefined) {
        updateFields.push(`due_date = $${paramCount++}`);
        values.push(updates.due_date);
      }
      if (updates.position !== undefined) {
        updateFields.push(`position = $${paramCount++}`);
        values.push(updates.position);
      }
      if (updates.estimated_hours !== undefined) {
        updateFields.push(`estimated_hours = $${paramCount++}`);
        values.push(updates.estimated_hours);
      }
      if (updates.actual_hours !== undefined) {
        updateFields.push(`actual_hours = $${paramCount++}`);
        values.push(updates.actual_hours);
      }

      if (updateFields.length === 0) {
        throw new ValidationError('No updates provided');
      }

      updateFields.push(`updated_at = NOW()`);
      values.push(taskId);

      await client.query(
        `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      // Update tags if provided
      if (updates.tag_ids !== undefined) {
        // Remove existing tags
        await client.query('DELETE FROM task_tags WHERE task_id = $1', [taskId]);

        // Add new tags
        for (const tagId of updates.tag_ids) {
          await client.query(
            'INSERT INTO task_tags (task_id, tag_id) VALUES ($1, $2)',
            [taskId, tagId]
          );
        }
      }

      // Fetch complete task with relations
      const completeTask = await getTasks(taskId);
      return completeTask[0];
    });
  } catch (error) {
    return dbUtils.handleError(error);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new AuthorizationError();

    const result = await query(
      'DELETE FROM tasks WHERE id = $1 AND creator_id = $2',
      [taskId, user.id]
    );

    if (result.rowCount === 0) {
      throw new AuthorizationError('Task not found or access denied');
    }
  } catch (error) {
    return dbUtils.handleError(error);
  }
}

export async function moveTask(taskId: string, boardId: string, position?: number): Promise<TaskWithRelations> {
  try {
    return await updateTask(taskId, {
      board_id: boardId,
      position: position,
    });
  } catch (error) {
    return dbUtils.handleError(error);
  }
}

// =============================================
// TAG OPERATIONS
// =============================================

export async function getTags(): Promise<Tag[]> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new AuthorizationError();

    // Get default project
    const projectResult = await query(
      'SELECT id FROM projects WHERE owner_id = $1 AND name = $2',
      [user.id, 'My Tasks']
    );

    if (projectResult.rows.length === 0) {
      throw new AuthorizationError('Default project not found');
    }

    const projectId = (projectResult.rows[0] as Record<string, unknown>).id as string;

    const result = await query(
      'SELECT * FROM tags WHERE project_id = $1 ORDER BY name ASC',
      [projectId]
    );

    return result.rows;
  } catch (error) {
    return dbUtils.handleError(error);
  }
}

// =============================================
// USER OPERATIONS
// =============================================

export async function getUsers(): Promise<User[]> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new AuthorizationError();

    // For now, return just the current user
    // In a team environment, this would return team members
    return [user];
  } catch (error) {
    return dbUtils.handleError(error);
  }
}
