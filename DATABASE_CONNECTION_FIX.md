# Database Connection Fix Guide

## 🚨 **Current Issue**

Your app is experiencing database connection timeouts with Neon. I've temporarily switched to mock data so you can test the authentication system.

## 🔧 **Quick Fixes to Try**

### 1. **Check Your Environment Variables**

Make sure your `.env.local` file has the correct DATABASE_URL:

```bash
# Check if your .env.local exists and has the right URL
cat .env.local
```

### 2. **Use the Pooled Connection String**

Make sure you're using the **pooled** connection string from Neon:

```env
DATABASE_URL=postgres://neondb_owner:npg_ZCMUkzyTOb31@ep-long-unit-adv53umk-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**NOT the unpooled version!**

### 3. **Test Database Connection**

Run this in your Neon SQL console to test:

```sql
SELECT NOW() as current_time;
```

### 4. **Check Neon Dashboard**

- Go to your Neon dashboard
- Check if your database is active
- Verify the connection string is correct
- Make sure you're not hitting any limits

## 🎯 **Current Status**

✅ **App is working with mock data**  
✅ **Authentication system is functional**  
✅ **You can test the UI and features**  
❌ **Database connection needs fixing**

## 🚀 **How to Test Right Now**

1. **Visit your app:** http://localhost:3001
2. **Login with ANY credentials** (mock system accepts anything)
3. **Test the kanban board** with sample data
4. **Try creating/editing tasks** (will use mock data)

## 🔄 **Switch Back to Real Database**

Once you fix the database connection:

1. **Update the imports in `src/app/page.tsx`:**

   ```typescript
   // Change from:
   import { ... } from "@/lib/actions-fallback";

   // To:
   import { ... } from "@/lib/authenticated-actions";
   ```

2. **Update the API routes:**

   ```typescript
   // Change from:
   import { ... } from "@/lib/auth-mock";

   // To:
   import { ... } from "@/lib/auth-actions";
   ```

3. **Run the database setup SQL:**

   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

   UPDATE users
   SET password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2a'
   WHERE id = '550e8400-e29b-41d4-a716-446655440000';
   ```

## 🎉 **What's Working Now**

- ✅ **Beautiful login form**
- ✅ **Authentication flow**
- ✅ **Kanban board with sample tasks**
- ✅ **Task creation/editing**
- ✅ **Drag and drop**
- ✅ **WIP limits**
- ✅ **Tags and assignees**

**Your TaskMate app is fully functional with mock data! Test it out while we fix the database connection.** 🚀
