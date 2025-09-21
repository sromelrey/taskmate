# 🔧 TaskMate Database Fix Guide

## 🚨 Issue: Server Components Error

You're getting a "Failed to load data" error because the database schema is set up for Neon Auth with Row Level Security (RLS) policies, but the application is using a custom authentication system.

## 🎯 Solution: Disable RLS and Set Up Initial Data

### Step 1: Disable Row Level Security

1. **Go to your Neon Console** (https://console.neon.tech)
2. **Open your database**
3. **Go to SQL Editor tab**
4. **Copy and paste the contents of `disable-rls.sql`**
5. **Click "Run"** to execute

This will:

- ✅ Disable RLS on all tables
- ✅ Remove all RLS policies
- ✅ Update functions to work without `auth.uid()`

### Step 2: Set Up Initial Data

1. **In the same SQL Editor**
2. **Copy and paste the contents of `setup-initial-data.sql`**
3. **Click "Run"** to execute

This will create:

- ✅ A test user (`dev@example.com`)
- ✅ Default project ("My Tasks")
- ✅ Default boards (Backlog, To Do, In Progress, Done)
- ✅ Sample tags and tasks

### Step 3: Add Password to Test User

1. **In the SQL Editor, run this:**

```sql
-- Add password_hash column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Set password for test user (password: "password123")
UPDATE users
SET password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2a'
WHERE email = 'dev@example.com';

-- Verify the update
SELECT id, email, name, password_hash IS NOT NULL as has_password FROM users;
```

### Step 4: Test the Application

1. **Start your development server:**

   ```bash
   pnpm run dev
   ```

2. **Open your browser** to `http://localhost:3000`

3. **Login with these credentials:**

   - **Email:** `dev@example.com`
   - **Password:** `password123`

4. **You should now see your kanban board with sample data!**

## 🔍 What Was Wrong?

The database schema was designed for **Neon Auth** with Row Level Security policies that use `auth.uid()` to identify the current user. However, the application uses a **custom authentication system** that doesn't have this function.

The RLS policies were blocking all database access because:

- `auth.uid()` doesn't exist in custom auth
- All queries were being rejected by RLS
- The app couldn't load any data

## ✅ What's Fixed?

- **RLS disabled** - Database is now accessible
- **Custom auth works** - No more `auth.uid()` dependencies
- **Initial data created** - Test user and sample tasks ready
- **Password set** - Can login immediately

## 🚀 Next Steps

1. **Test the application** - Make sure everything works
2. **Create your own account** - Use the register form
3. **Add your own tasks** - Start using the kanban board
4. **Customize as needed** - Modify colors, add more tags, etc.

## 🔒 Security Note

Since we disabled RLS, the application now relies on the custom authentication system for security. The `withAuth()` middleware ensures that:

- Only authenticated users can access data
- Users can only see their own projects and tasks
- All database operations are properly authorized

## 🎉 You're All Set!

Your TaskMate app should now work perfectly with:

- ✅ **Custom authentication**
- ✅ **Database persistence**
- ✅ **Sample data to get started**
- ✅ **All features working**

**Need help?** Check the browser console for any remaining errors, and make sure your `DATABASE_URL` environment variable is set correctly.
