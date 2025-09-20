# TaskMate API Documentation

This document provides comprehensive information about TaskMate's API endpoints and server actions.

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Server Actions](#server-actions)
- [API Routes](#api-routes)
- [Data Types](#data-types)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## 🔍 Overview

TaskMate uses Next.js Server Actions for data mutations and API routes for data fetching. All operations require authentication and include proper error handling.

### Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

### Authentication

All API endpoints require a valid session cookie (`taskmate-session`).

## 🔐 Authentication

### Login

```typescript
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### Register

```typescript
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### Logout

```typescript
POST / api / auth / logout;
```

**Response:**

```json
{
  "success": true
}
```

### Get Current User

```typescript
GET / api / auth / me;
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "timezone": "UTC",
    "wip_limit": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

## ⚡ Server Actions

Server Actions are Next.js functions that run on the server and can be called directly from client components.

### Task Actions

#### Create Task

```typescript
import { createTask } from "@/lib/authenticated-actions";

const taskData = {
  title: "New Task",
  description: "Task description",
  board_id: "board-uuid",
  priority: "medium" as "low" | "medium" | "high" | "urgent",
  due_date: "2024-12-31",
  assignee_id: "user-uuid",
  estimated_hours: 2.5,
  tag_ids: ["tag-uuid-1", "tag-uuid-2"],
};

const result = await createTask(taskData);
```

#### Update Task

```typescript
import { updateTask } from "@/lib/authenticated-actions";

const updates = {
  title: "Updated Task",
  priority: "high",
  due_date: "2024-12-25",
};

const result = await updateTask("task-uuid", updates);
```

#### Delete Task

```typescript
import { deleteTask } from "@/lib/authenticated-actions";

const result = await deleteTask("task-uuid");
```

#### Move Task

```typescript
import { moveTask } from "@/lib/authenticated-actions";

const result = await moveTask("task-uuid", "new-board-uuid", 0);
```

#### Get Task by ID

```typescript
import { getTaskById } from "@/lib/authenticated-actions";

const task = await getTaskById("task-uuid");
```

### Board Actions

#### Get Boards

```typescript
import { getBoards } from "@/lib/authenticated-actions";

const boards = await getBoards();
```

### User Actions

#### Get Users

```typescript
import { getUsers } from "@/lib/authenticated-actions";

const users = await getUsers();
```

### Tag Actions

#### Get Tags

```typescript
import { getTags } from "@/lib/authenticated-actions";

const tags = await getTags();
```

### Cleanup Actions

#### Cleanup Old Done Tasks

```typescript
import { cleanupOldDoneTasks } from "@/lib/cleanup-actions";

const result = await cleanupOldDoneTasks();
// Returns: { deletedCount: number }
```

#### Get Cleanup Statistics

```typescript
import { getCleanupStats } from "@/lib/cleanup-actions";

const stats = await getCleanupStats();
// Returns: { tasksToDeleteCount: number, oldestTaskCompletedAt?: string, newestTaskCompletedAt?: string }
```

## 🌐 API Routes

### Boards

```typescript
GET / api / boards;
```

Returns all boards for the authenticated user.

### Tasks

```typescript
GET / api / tasks;
POST / api / tasks;
```

**GET Response:**

```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Task Title",
      "description": "Task description",
      "board_id": "uuid",
      "assignee_id": "uuid",
      "creator_id": "uuid",
      "priority": "medium",
      "due_date": "2024-12-31",
      "position": 0,
      "estimated_hours": 2.5,
      "actual_hours": null,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "completed_at": null,
      "assignee": {
        /* User object */
      },
      "board": {
        /* Board object */
      },
      "tags": [
        /* Tag objects */
      ]
    }
  ]
}
```

**POST Request:**

```json
{
  "title": "New Task",
  "description": "Task description",
  "board_id": "uuid",
  "priority": "medium",
  "due_date": "2024-12-31",
  "assignee_id": "uuid",
  "estimated_hours": 2.5,
  "tag_ids": ["uuid1", "uuid2"]
}
```

### Task by ID

```typescript
GET / api / tasks / [id];
PUT / api / tasks / [id];
DELETE / api / tasks / [id];
```

### Users

```typescript
GET / api / users;
```

Returns all users (currently just the authenticated user).

### Tags

```typescript
GET / api / tags;
```

Returns all tags for the authenticated user's project.

### Cleanup

```typescript
GET / api / cleanup;
POST / api / cleanup;
```

**GET Response:**

```json
{
  "stats": {
    "tasksToDeleteCount": 5,
    "oldestTaskCompletedAt": "2024-01-01T00:00:00Z",
    "newestTaskCompletedAt": "2024-01-02T00:00:00Z"
  }
}
```

**POST Response:**

```json
{
  "deletedCount": 3
}
```

### Cron Cleanup

```typescript
GET / api / cron / cleanup;
```

Endpoint for scheduled cleanup (called by Vercel cron jobs).

## 📊 Data Types

### User

```typescript
interface User {
  id: string; // UUID
  email: string;
  name: string;
  timezone: string;
  wip_limit: number;
  created_at: string;
  updated_at: string;
}
```

### Board

```typescript
interface Board {
  id: string; // UUID
  name: string;
  slug: "backlog" | "todo" | "in_progress" | "done";
  description?: string;
  project_id: string;
  position: number;
  wip_limit?: number;
  color: string;
  created_at: string;
  updated_at: string;
}
```

### Task

```typescript
interface Task {
  id: string; // UUID
  title: string;
  description?: string;
  board_id: string;
  assignee_id?: string;
  creator_id: string;
  priority: "low" | "medium" | "high" | "urgent";
  due_date?: string;
  position: number;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}
```

### TaskWithRelations

```typescript
interface TaskWithRelations extends Task {
  assignee?: User;
  tags: Tag[];
  board?: Board;
}
```

### Tag

```typescript
interface Tag {
  id: string; // UUID
  name: string;
  color: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}
```

### CreateTaskData

```typescript
interface CreateTaskData {
  title: string;
  description?: string;
  board_id: string;
  priority?: "low" | "medium" | "high" | "urgent";
  due_date?: string;
  assignee_id: string;
  estimated_hours?: number;
  tag_ids: string[];
}
```

### UpdateTaskData

```typescript
interface UpdateTaskData {
  title?: string;
  description?: string;
  board_id?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  due_date?: string;
  assignee_id?: string;
  estimated_hours?: number;
  tag_ids?: string[];
}
```

## ❌ Error Handling

### Error Types

#### AuthorizationError

```typescript
class AuthorizationError extends Error {
  constructor(message = "Unauthorized access") {
    super(message);
    this.name = "AuthorizationError";
  }
}
```

#### DatabaseError

```typescript
class DatabaseError extends Error {
  constructor(message: string, code?: string, details?: any) {
    super(message);
    this.name = "DatabaseError";
    this.code = code;
    this.details = details;
  }
}
```

### Error Responses

#### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired session"
}
```

#### 400 Bad Request

```json
{
  "error": "Bad Request",
  "message": "Invalid request data",
  "details": {
    "field": "title",
    "issue": "Title is required"
  }
}
```

#### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "Database operation failed"
}
```

### Client-Side Error Handling

```typescript
try {
  const result = await createTask(taskData);
  // Handle success
} catch (error) {
  if (error instanceof AuthorizationError) {
    // Redirect to login
  } else if (error instanceof DatabaseError) {
    // Show user-friendly error message
  } else {
    // Handle unexpected errors
  }
}
```

## 🚦 Rate Limiting

Currently, TaskMate doesn't implement rate limiting, but it's recommended for production deployments:

### Recommended Limits

- **Authentication**: 5 attempts per minute per IP
- **Task Creation**: 10 tasks per minute per user
- **General API**: 100 requests per minute per user

### Implementation Example

```typescript
// Using a rate limiting library like 'express-rate-limit'
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP",
});
```

## 🔒 Security Considerations

### Authentication

- **Session-based authentication** with HTTP-only cookies
- **Password hashing** using bcrypt
- **Session expiration** after 30 days
- **CSRF protection** via SameSite cookies

### Data Validation

- **Input sanitization** for all user inputs
- **Type validation** using TypeScript
- **SQL injection prevention** via parameterized queries
- **XSS protection** via React's built-in escaping

### Authorization

- **Row-level security** in database
- **User isolation** - users can only access their own data
- **Server-side validation** for all operations
- **Middleware protection** for all server actions

## 📈 Performance Considerations

### Database Optimization

- **Indexed columns** for frequently queried fields
- **Connection pooling** for database connections
- **Query optimization** with proper JOINs
- **Pagination** for large datasets (future feature)

### Caching Strategy

- **Next.js built-in caching** for static data
- **Client-side caching** with Zustand store
- **Optimistic updates** for better UX
- **Background sync** for server operations

### Monitoring

- **Error logging** for debugging
- **Performance metrics** for optimization
- **User analytics** for feature usage
- **Database monitoring** for query performance

## 🧪 Testing

### Unit Tests

```typescript
// Example test for createTask
import { createTask } from "@/lib/authenticated-actions";

describe("createTask", () => {
  it("should create a task successfully", async () => {
    const taskData = {
      title: "Test Task",
      board_id: "test-board-id",
      assignee_id: "test-user-id",
      tag_ids: [],
    };

    const result = await createTask(taskData);
    expect(result.title).toBe("Test Task");
  });
});
```

### Integration Tests

```typescript
// Example API test
import { createMocks } from "node-mocks-http";
import handler from "@/app/api/tasks/route";

describe("/api/tasks", () => {
  it("should return tasks for authenticated user", async () => {
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        cookie: "taskmate-session=valid-session-id",
      },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
  });
});
```

## 🔄 Webhooks (Future Feature)

### Planned Webhook Events

- `task.created`
- `task.updated`
- `task.deleted`
- `task.moved`
- `user.registered`

### Webhook Payload Example

```json
{
  "event": "task.created",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "task": {
      /* Task object */
    },
    "user": {
      /* User object */
    }
  }
}
```

---

## 📞 Support

For API-related questions or issues:

1. **Check this documentation** for common solutions
2. **Review error messages** and status codes
3. **Test with curl or Postman** to isolate issues
4. **Contact the development team** with specific error details

**Happy coding! 🚀**
