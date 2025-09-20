"use server";

import {
  query,
  withTransaction,
  dbUtils,
  ValidationError,
  AuthorizationError,
} from "./database";
import {
  User,
  Tag,
  CreateTaskData,
  UpdateTaskData,
  TaskWithRelations,
  BoardWithTasks,
} from "./types";

// =============================================
// AUTHENTICATION HELPERS
// =============================================

async function getCurrentUser(): Promise<User | null> {
  try {
    // This will be called from server actions that have access to the request
    // For now, we'll use a mock user, but in production this would get the user from the session
    const mockUser = {
      id: "550e8400-e29b-41d4-a716-446655440000", // Valid UUID format
      email: "dev@example.com",
      name: "Development User",
      timezone: "UTC",
      wip_limit: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Check if user exists
    const userResult = await query("SELECT * FROM users WHERE id = $1", [
      mockUser.id,
    ]);

    if (userResult.rows.length === 0) {
      throw new AuthorizationError("User not found");
    }

    return mockUser;
  } catch (error) {
    console.error("Error getting current user:", error);
    throw new AuthorizationError("Authentication required");
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
      "SELECT id FROM projects WHERE owner_id = $1 AND name = $2",
      [user.id, "My Tasks"]
    );

    if (projectResult.rows.length === 0) {
      throw new AuthorizationError("Default project not found");
    }

    const projectId = projectResult.rows[0].id;

    // Get boards with tasks
    const boardsResult = await query(
      `
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
    `,
      [projectId]
    );

    return boardsResult.rows.map((row: Record<string, unknown>) => ({
      ...row,
      tasks: row.tasks || [],
      taskCount: row.tasks?.length || 0,
    }));
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
      sql += " AND t.board_id = $2";
      params.push(boardId);
    }

    sql += " GROUP BY t.id, u.id, b.id ORDER BY t.position ASC";

    const result = await query(sql, params);

    return result.rows.map((row: Record<string, unknown>) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      board_id: row.board_id,
      assignee_id: row.assignee_id,
      creator_id: row.creator_id,
      priority: row.priority,
      due_date: row.due_date,
      position: row.position,
      estimated_hours: row.estimated_hours,
      actual_hours: row.actual_hours,
      created_at: row.created_at,
      updated_at: row.updated_at,
      assignee: row.assignee_id
        ? {
            id: row.assignee_id,
            name: row.assignee_name,
            email: row.assignee_email,
            avatar_url: row.assignee_avatar_url,
          }
        : undefined,
      board: row.board_id
        ? {
            id: row.board_id,
            name: row.board_name,
            slug: row.board_slug,
            color: row.board_color,
            wip_limit: row.board_wip_limit,
          }
        : undefined,
      tags: row.tags || [],
    }));
  } catch (error) {
    return dbUtils.handleError(error);
  }
}

export async function getTaskById(taskId: string): Promise<TaskWithRelations> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new AuthorizationError();

    const sql = `
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
      WHERE t.id = $1 AND t.creator_id = $2
      GROUP BY t.id, u.id, b.id
    `;

    const result = await query(sql, [taskId, user.id]);

    if (result.rows.length === 0) {
      throw new AuthorizationError("Task not found or access denied");
    }

    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      board_id: row.board_id,
      assignee_id: row.assignee_id,
      creator_id: row.creator_id,
      priority: row.priority,
      due_date: row.due_date,
      position: row.position,
      estimated_hours: row.estimated_hours,
      actual_hours: row.actual_hours,
      created_at: row.created_at,
      updated_at: row.updated_at,
      assignee: row.assignee_id
        ? {
            id: row.assignee_id,
            name: row.assignee_name,
            email: row.assignee_email,
            avatar_url: row.assignee_avatar_url,
            timezone: "UTC",
            wip_limit: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : undefined,
      board: {
        id: row.board_id,
        name: row.board_name,
        slug: row.board_slug,
        description: "",
        project_id: "",
        position: 0,
        color: row.board_color,
        wip_limit: row.board_wip_limit,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      tags: row.tags || [],
    };
  } catch (error) {
    return dbUtils.handleError(error);
  }
}

export async function createTask(
  taskData: CreateTaskData
): Promise<TaskWithRelations> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new AuthorizationError();

    if (!taskData.title?.trim()) {
      throw new ValidationError("Task title is required", "title");
    }

    if (!taskData.board_id) {
      throw new ValidationError("Board ID is required", "board_id");
    }

    return await withTransaction(async (client) => {
      // Get next position
      const positionResult = await client.query(
        "SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM tasks WHERE board_id = $1",
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
          taskData.priority || "medium",
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
            "INSERT INTO task_tags (task_id, tag_id) VALUES ($1, $2)",
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

export async function updateTask(
  taskId: string,
  updates: UpdateTaskData
): Promise<TaskWithRelations> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new AuthorizationError();

    return await withTransaction(async (client) => {
      // Validate task ownership
      const taskResult = await client.query(
        "SELECT * FROM tasks WHERE id = $1 AND creator_id = $2",
        [taskId, user.id]
      );

      if (taskResult.rows.length === 0) {
        throw new AuthorizationError("Task not found or access denied");
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
        throw new ValidationError("No updates provided");
      }

      updateFields.push(`updated_at = NOW()`);
      values.push(taskId);

      await client.query(
        `UPDATE tasks SET ${updateFields.join(
          ", "
        )} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      // Update tags if provided
      if (updates.tag_ids !== undefined) {
        // Remove existing tags
        await client.query("DELETE FROM task_tags WHERE task_id = $1", [
          taskId,
        ]);

        // Add new tags
        for (const tagId of updates.tag_ids) {
          await client.query(
            "INSERT INTO task_tags (task_id, tag_id) VALUES ($1, $2)",
            [taskId, tagId]
          );
        }
      }

      // Fetch complete task with relations
      const completeTask = await getTaskById(taskId);
      return completeTask;
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
      "DELETE FROM tasks WHERE id = $1 AND creator_id = $2",
      [taskId, user.id]
    );

    if (result.rowCount === 0) {
      throw new AuthorizationError("Task not found or access denied");
    }
  } catch (error) {
    return dbUtils.handleError(error);
  }
}

export async function moveTask(
  taskId: string,
  boardId: string,
  position?: number
): Promise<TaskWithRelations> {
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
      "SELECT id FROM projects WHERE owner_id = $1 AND name = $2",
      [user.id, "My Tasks"]
    );

    if (projectResult.rows.length === 0) {
      throw new AuthorizationError("Default project not found");
    }

    const projectId = projectResult.rows[0].id;

    const result = await query(
      "SELECT * FROM tags WHERE project_id = $1 ORDER BY name ASC",
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
