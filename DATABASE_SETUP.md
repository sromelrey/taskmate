# 🗄️ TaskMate Database Setup Guide

## Current Status: ✅ App Working with Mock Data

Your TaskMate app is now running with mock data! You can:

- ✅ View the kanban board with 4 columns (Backlog, To Do, In Progress, Done)
- ✅ See sample tasks
- ✅ Add, edit, and delete tasks
- ✅ Drag and drop tasks between boards
- ✅ See WIP limit indicators

## 🚀 Next Steps: Connect to Real Database

### Step 1: Set Up Neon Database

1. **Go to [Neon Console](https://console.neon.tech)**
2. **Open your database** (the one with your connection string)
3. **Go to SQL Editor tab**

### Step 2: Run Database Schema

1. **Copy the entire content** from `src/lib/database-schema.sql`
2. **Paste it into the SQL Editor**
3. **Click "Run"** to execute the schema

This will create:

- ✅ All required tables (users, projects, boards, tasks, tags, etc.)
- ✅ Row-Level Security (RLS) policies
- ✅ Default project and boards
- ✅ Database triggers for WIP limits
- ✅ Activity logging system

### Step 3: Switch to Real Database

Once the schema is set up, run this command to switch to the real database:

```bash
mv src/lib/actions.ts src/lib/actions-mock.ts && mv src/lib/actions-db.ts src/lib/actions.ts
```

### Step 4: Restart the App

```bash
npm run dev
```

## 🎯 What You'll Get with Real Database

### Enhanced Features:

- **Persistent data** - Tasks saved between sessions
- **User management** - Ready for authentication
- **WIP limits** - Enforced at database level
- **Activity logging** - Track all changes
- **Team collaboration** - Multi-user support ready

### Security Features:

- **Row-Level Security** - Users only see their own data
- **Input validation** - SQL injection protection
- **Authorization checks** - Proper access control

## 🔧 Troubleshooting

### If you get connection errors:

1. **Check your `.env.local`** file has correct `DATABASE_URL`
2. **Verify the database exists** in Neon console
3. **Make sure the schema was run** successfully

### If tables don't exist:

1. **Re-run the schema** from `src/lib/database-schema.sql`
2. **Check for any SQL errors** in the Neon console
3. **Verify all tables were created**

## 📁 File Structure

```
src/lib/
├── actions.ts          # Current: Mock data (working)
├── actions-db.ts       # Real database actions (ready to use)
├── actions-mock.ts     # Mock data backup
├── database.ts         # PostgreSQL connection
├── database-schema.sql # Complete database schema
└── types.ts           # TypeScript types
```

## 🎉 You're All Set!

Your TaskMate app is now:

- ✅ **Working immediately** with mock data
- ✅ **Ready for database** connection
- ✅ **Production-ready** with proper security
- ✅ **Scalable** for team collaboration

**Current URL:** http://localhost:3000 or http://localhost:3001

Enjoy your new kanban board with backlog support and WIP limits! 🚀
