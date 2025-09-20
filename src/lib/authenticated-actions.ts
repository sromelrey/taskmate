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
// BOARD OPERATIONS
// =============================================

export async function getBoards(): Promise<BoardWithTasks[]> {
  return withAuth(async (user) => {
    try {
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
        LEFT JOIN LATERAL (
          SELECT COALESCE(
            json_agg(
              json_build_object('id', tg.id, 'name', tg.name, 'color', tg.color)
            ),
            '[]'
          ) as tags
          FROM task_tags tt2
          JOIN tags tg ON tt2.tag_id = tg.id
          WHERE tt2.task_id = t.id
        ) tag_agg ON true
        WHERE b.project_id = $1
        GROUP BY b.id
        ORDER BY b.position ASC
        `,
        [projectId]
      );

      return boardsResult.rows.map((row: Record<string, unknown>) => ({
        ...row,
        tasks: row.tasks || [],
      }));
    } catch (error) {
      console.error("Error getting boards:", error);
      return dbUtils.handleError(error);
    }
  });
}

// =============================================
// TASK OPERATIONS
// =============================================

export async function getTasks(): Promise<TaskWithRelations[]> {
  return withAuth(async (user) => {
    try {
      const result = await query(
        `SELECT
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
        GROUP BY t.id, u.id, b.id ORDER BY t.position ASC`,
        [user.id]
      );

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
      }));
    } catch (error) {
      console.error("Error getting tasks:", error);
      return dbUtils.handleError(error);
    }
  });
}

export async function getTaskById(taskId: string): Promise<TaskWithRelations> {
  return withAuth(async (user) => {
    try {
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
      console.error("Error getting task by ID:", error);
      return dbUtils.handleError(error);
    }
  });
}

export async function createTask(taskData: CreateTaskData): Promise<Task> {
  return withAuth(async (user) => {
    try {
      return await withTransaction(async (client) => {
        // Get the next position for the board
        const positionResult = await client.query(
          "SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM tasks WHERE board_id = $1",
          [taskData.board_id]
        );
        const nextPosition = positionResult.rows[0].next_position;

        // Insert the task
        const taskResult = await client.query(
          `INSERT INTO tasks (
            title, description, board_id, assignee_id, creator_id, 
            priority, due_date, position, estimated_hours, actual_hours,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *`,
          [
            taskData.title,
            taskData.description || null,
            taskData.board_id,
            taskData.assignee_id || null,
            user.id,
            taskData.priority || "medium",
            taskData.due_date || null,
            nextPosition,
            taskData.estimated_hours || null,
            taskData.actual_hours || null,
            new Date().toISOString(),
            new Date().toISOString(),
          ]
        );

        const task = taskResult.rows[0];

        // Insert task tags if provided
        if (taskData.tag_ids && taskData.tag_ids.length > 0) {
          for (const tagId of taskData.tag_ids) {
            await client.query(
              "INSERT INTO task_tags (task_id, tag_id) VALUES ($1, $2)",
              [task.id, tagId]
            );
          }
        }

        return task;
      });
    } catch (error) {
      console.error("Error creating task:", error);
      return dbUtils.handleError(error);
    }
  });
}

export async function updateTask(
  taskId: string,
  taskData: UpdateTaskData
): Promise<TaskWithRelations> {
  return withAuth(async (user) => {
    try {
      return await withTransaction(async (client) => {
        // Verify task ownership
        const taskResult = await client.query(
          "SELECT * FROM tasks WHERE id = $1 AND creator_id = $2",
          [taskId, user.id]
        );

        if (taskResult.rows.length === 0) {
          throw new AuthorizationError("Task not found or access denied");
        }

        // Build dynamic update query
        const updateFields: string[] = [];
        const updateValues: unknown[] = [];
        let paramIndex = 1;

        const allowedFields = [
          "title",
          "description",
          "board_id",
          "assignee_id",
          "priority",
          "due_date",
          "estimated_hours",
          "actual_hours",
        ];

        for (const [key, value] of Object.entries(taskData)) {
          if (allowedFields.includes(key) && value !== undefined) {
            updateFields.push(`${key} = $${paramIndex}`);
            updateValues.push(value);
            paramIndex++;
          }
        }

        if (updateFields.length === 0) {
          throw new ValidationError("No valid fields to update");
        }

        updateFields.push(`updated_at = $${paramIndex}`);
        updateValues.push(new Date().toISOString());
        paramIndex++;

        updateValues.push(taskId, user.id);

        const updateQuery = `
          UPDATE tasks 
          SET ${updateFields.join(", ")}
          WHERE id = $${paramIndex} AND creator_id = $${paramIndex + 1}
          RETURNING *
        `;

        await client.query(updateQuery, updateValues);

        // Update task tags if provided
        if (taskData.tag_ids !== undefined) {
          // Delete existing tags
          await client.query("DELETE FROM task_tags WHERE task_id = $1", [
            taskId,
          ]);

          // Insert new tags
          if (taskData.tag_ids.length > 0) {
            for (const tagId of taskData.tag_ids) {
              await client.query(
                "INSERT INTO task_tags (task_id, tag_id) VALUES ($1, $2)",
                [taskId, tagId]
              );
            }
          }
        }

        // Fetch complete task with relations
        const completeTask = await getTaskById(taskId);
        return completeTask;
      });
    } catch (error) {
      console.error("Error updating task:", error);
      return dbUtils.handleError(error);
    }
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  return withAuth(async (user) => {
    try {
      const result = await query(
        "DELETE FROM tasks WHERE id = $1 AND creator_id = $2",
        [taskId, user.id]
      );

      if (result.rowCount === 0) {
        throw new AuthorizationError("Task not found or access denied");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      return dbUtils.handleError(error);
    }
  });
}

export async function moveTask(
  taskId: string,
  boardId: string,
  position?: number
): Promise<TaskWithRelations> {
  return withAuth(async (user) => {
    try {
      // Get the current task to check if it's moving to/from done board
      const currentTaskResult = await query(
        "SELECT board_id FROM tasks WHERE id = $1 AND creator_id = $2",
        [taskId, user.id]
      );

      if (currentTaskResult.rows.length === 0) {
        throw new AuthorizationError("Task not found or access denied");
      }

      const currentBoardId = currentTaskResult.rows[0].board_id;

      // Get the "done" board ID
      const projectResult = await query(
        "SELECT id FROM projects WHERE owner_id = $1 AND name = $2",
        [user.id, "My Tasks"]
      );

      if (projectResult.rows.length === 0) {
        throw new AuthorizationError("Default project not found");
      }

      const projectId = projectResult.rows[0].id;

      const doneBoardResult = await query(
        "SELECT id FROM boards WHERE project_id = $1 AND slug = $2",
        [projectId, "done"]
      );

      if (doneBoardResult.rows.length === 0) {
        throw new AuthorizationError("Done board not found");
      }

      const doneBoardId = doneBoardResult.rows[0].id;

      // Update the task
      const updatedTask = await updateTask(taskId, {
        board_id: boardId,
        position: position,
      });

      // Handle completion tracking
      if (currentBoardId !== doneBoardId && boardId === doneBoardId) {
        // Task moved TO done board - mark as completed
        await query(
          "UPDATE tasks SET completed_at = NOW(), updated_at = NOW() WHERE id = $1",
          [taskId]
        );
      } else if (currentBoardId === doneBoardId && boardId !== doneBoardId) {
        // Task moved FROM done board - mark as incomplete
        await query(
          "UPDATE tasks SET completed_at = NULL, updated_at = NOW() WHERE id = $1",
          [taskId]
        );
      }

      return updatedTask;
    } catch (error) {
      console.error("Error moving task:", error);
      return dbUtils.handleError(error);
    }
  });
}

// =============================================
// USER OPERATIONS
// =============================================

export async function getUsers(): Promise<User[]> {
  return withAuth(async (user) => {
    try {
      // For now, return just the current user
      // In a team environment, this would return team members
      const result = await query(
        "SELECT id, email, name, timezone, wip_limit, created_at, updated_at FROM users WHERE id = $1",
        [user.id]
      );

      return result.rows;
    } catch (error) {
      console.error("Error getting users:", error);
      return dbUtils.handleError(error);
    }
  });
}

// =============================================
// TAG OPERATIONS
// =============================================

export async function getTags(): Promise<Tag[]> {
  return withAuth(async (user) => {
    try {
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
      console.error("Error getting tags:", error);
      return dbUtils.handleError(error);
    }
  });
}

export async function createTag(tagData: CreateTagData): Promise<Tag> {
  return withAuth(async (user) => {
    try {
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
        `INSERT INTO tags (name, color, project_id, created_at)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [tagData.name, tagData.color, projectId, new Date().toISOString()]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Error creating tag:", error);
      return dbUtils.handleError(error);
    }
  });
}
