# TaskMate User Guide

Welcome to TaskMate! This comprehensive guide will help you get the most out of your task management experience.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Kanban Boards](#kanban-boards)
- [Task Management](#task-management)
- [Filtering & Sorting](#filtering--sorting)
- [Tags System](#tags-system)
- [Mobile Usage](#mobile-usage)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Tips & Best Practices](#tips--best-practices)
- [Troubleshooting](#troubleshooting)

## 🚀 Getting Started

### First Login

1. **Navigate to TaskMate** in your browser
2. **Register a new account** or **login** with existing credentials
3. **Default credentials** (if using demo setup):
   - Email: `admin@gmail.com`
   - Password: `password123`

### Initial Setup

Upon first login, TaskMate automatically creates:

- A default project called "My Tasks"
- Four Kanban boards: Backlog, To Do, In Progress, Done
- Sample tags: frontend, backend, urgent, bug, feature
- Sample tasks to get you started

## 🔐 Authentication

### Login Process

1. **Enter your email** and **password**
2. **Click "Login"** or press Enter
3. You'll be redirected to your task dashboard

### Registration

1. **Click "Register"** on the login page
2. **Fill in your details**:
   - Email address
   - Password (minimum 8 characters)
   - Full name
3. **Click "Register"** to create your account
4. You'll be automatically logged in

### Logout

- **Click the "Logout" button** in the top-right corner
- Your session will be cleared and you'll return to the login page

## 📊 Kanban Boards

TaskMate uses a Kanban-style board system with four main columns:

### Board Overview

| Board           | Purpose                     | WIP Limit | Auto-cleanup |
| --------------- | --------------------------- | --------- | ------------ |
| **Backlog**     | Ideas and future tasks      | None      | No           |
| **To Do**       | Tasks ready to be worked on | None      | No           |
| **In Progress** | Currently active tasks      | 1 task    | No           |
| **Done**        | Completed tasks             | None      | 48 hours     |

### Board Colors

- **Backlog**: Purple theme
- **To Do**: Gray theme
- **In Progress**: Blue theme
- **Done**: Green theme

### WIP Limits

The "In Progress" board has a **Work-in-Progress (WIP) limit of 1 task**:

- ✅ **Green border**: Under limit (0 tasks)
- ⚠️ **Yellow border**: At limit (1 task)
- ❌ **Red border**: Over limit (more than 1 task)
- 🚫 **Add Task button disabled**: When at or over limit

## 📝 Task Management

### Creating Tasks

#### Method 1: Header Button

1. **Click "Add Task"** in the top header
2. **Fill out the task form** (see [Task Form Details](#task-form-details))
3. **Click "Create Task"**

#### Method 2: Board Button

1. **Click the "+" button** in any board column
2. **Fill out the task form**
3. **Click "Create Task"**

#### Method 3: Empty Board

1. **Click "Add your first task"** in an empty board
2. **Fill out the task form**
3. **Click "Create Task"**

### Task Form Details

#### Required Fields

- **Title**: Brief description of the task
- **Board**: Automatically set to the board you clicked

#### Optional Fields

- **Description**: Detailed explanation of the task
- **Priority**: Low, Medium, High, or Urgent
- **Due Date**: When the task should be completed
- **Estimated Hours**: How long you think it will take
- **Tags**: Categorize your task (frontend, backend, urgent, etc.)

#### Priority Levels

- 🔵 **Low**: Nice to have, not urgent
- 🟡 **Medium**: Standard priority
- 🟠 **High**: Important, needs attention
- 🔴 **Urgent**: Critical, needs immediate attention

### Editing Tasks

1. **Click on any task card** to open the edit modal
2. **Modify any field** in the form
3. **Click "Update Task"** to save changes

### Deleting Tasks

1. **Click on a task card** to open the edit modal
2. **Click the "Delete" button** (trash icon)
3. **Confirm deletion** in the confirmation dialog

### Task Cards Display

Each task card shows:

- **Title** (bold)
- **Description** (if provided)
- **Priority** (colored badge)
- **Due date** (if set)
- **Estimated hours** (if provided)
- **Tags** (colored badges)
- **Assignee** (your name, auto-assigned)

## 🔍 Filtering & Sorting

### Accessing Filters

1. **Click the "Filters" button** in the header
2. **The filter panel will expand** below the header
3. **Click "Expand"** to see all filter options

### Quick Filters

Use these one-click filters for common scenarios:

| Filter          | Description                 |
| --------------- | --------------------------- |
| **All Tasks**   | Show all tasks (default)    |
| **Today**       | Tasks due or created today  |
| **This Week**   | Tasks from the last 7 days  |
| **This Month**  | Tasks from the last 30 days |
| **Overdue**     | Tasks past their due date   |
| **No Due Date** | Tasks without due dates     |

### Date Range Filter

1. **Click the date range picker** (calendar icon)
2. **Select a start date** (optional)
3. **Select an end date** (optional)
4. **The filter applies immediately**

**Tips:**

- Select only a start date to show tasks from that date forward
- Select only an end date to show tasks up to that date
- Select both dates for a specific range

### Sorting Options

#### Sort By

- **Created Date**: When the task was created
- **Due Date**: When the task is due (no due date = end of list)
- **Priority**: Urgent → High → Medium → Low
- **Title**: Alphabetical order
- **Updated Date**: When the task was last modified

#### Sort Order

- **Descending**: Newest first, Z-A, High priority first
- **Ascending**: Oldest first, A-Z, Low priority first

### Active Filters

The filter panel shows:

- **Active filter count** (badge next to "Task Filters")
- **Active filters summary** (at bottom of panel)
- **Clear button** to reset all filters

### Clearing Filters

- **Click "Clear"** to reset all filters to default
- **Individual filters** can be cleared by clicking their clear buttons

## 🏷️ Tags System

### Available Tags

TaskMate comes with pre-configured tags:

- **frontend** (blue) - Frontend development tasks
- **backend** (green) - Backend development tasks
- **urgent** (red) - Urgent tasks
- **bug** (orange) - Bug fixes
- **feature** (purple) - New features

### Adding Tags to Tasks

1. **Open the task form** (create or edit)
2. **Scroll to the "Tags" section**
3. **Click on any available tag** to add it
4. **The tag appears in the selected tags list**

### Removing Tags

1. **In the task form**, find the selected tags
2. **Click the "X" button** on any tag to remove it

### Tag Display

- **Available tags**: Shown as outlined badges
- **Selected tags**: Shown as filled badges with X button
- **Task cards**: Show tags as colored badges
- **Filtering**: Tags can be used to filter tasks (future feature)

## 📱 Mobile Usage

### Responsive Design

TaskMate is fully responsive and works great on mobile devices:

#### Mobile Layout

- **Collapsible boards**: Only one board visible at a time
- **Touch-friendly**: Large buttons and touch targets
- **Swipe gestures**: Natural mobile interactions
- **Optimized forms**: Mobile-friendly input fields

#### Board Navigation

1. **Tap on any board header** to expand it
2. **Other boards collapse** automatically
3. **Tap "Backlog"** to return to the first board
4. **Swipe left/right** to navigate between boards

#### Mobile Task Management

- **Tap task cards** to edit
- **Long press** for context menu (future feature)
- **Swipe to delete** (future feature)

### Mobile Tips

- **Use landscape mode** for better board visibility
- **Pinch to zoom** if needed
- **Use the mobile keyboard** for efficient text entry

## ⌨️ Keyboard Shortcuts

| Shortcut       | Action                      |
| -------------- | --------------------------- |
| `Ctrl/Cmd + N` | Create new task             |
| `Escape`       | Close modal/dialog          |
| `Enter`        | Submit form                 |
| `Tab`          | Navigate form fields        |
| `Ctrl/Cmd + F` | Focus filter panel (future) |

## 💡 Tips & Best Practices

### Task Organization

#### Naming Conventions

- **Use clear, actionable titles**: "Fix login bug" vs "Bug"
- **Be specific**: "Update user profile validation" vs "Update validation"
- **Use consistent formatting**: "Feature: Add dark mode" vs "Add dark mode"

#### Priority Guidelines

- **Urgent**: System down, security issues, critical bugs
- **High**: Important features, major bugs, deadlines
- **Medium**: Regular features, minor bugs, improvements
- **Low**: Nice-to-have features, refactoring, documentation

#### Due Date Strategy

- **Set realistic due dates** based on estimated hours
- **Use due dates for external deadlines** (client requests, releases)
- **Don't set due dates for exploratory tasks**

### Workflow Optimization

#### Board Usage

1. **Backlog**: Brain dump all ideas and requests
2. **To Do**: Plan your work for the day/week
3. **In Progress**: Focus on one task at a time (WIP limit)
4. **Done**: Review completed work before auto-cleanup

#### Daily Routine

1. **Morning**: Review "To Do" board, move tasks to "In Progress"
2. **During work**: Focus on "In Progress" tasks
3. **End of day**: Move completed tasks to "Done"
4. **Weekly**: Review "Backlog" and plan next week

#### Tag Strategy

- **Use consistent tags** across similar tasks
- **Create tag combinations**: "frontend + urgent" for critical UI issues
- **Don't over-tag**: 2-3 tags per task maximum

### Productivity Tips

#### Focus Techniques

- **Respect WIP limits**: Don't start new tasks until current ones are done
- **Use filters**: Focus on "Today" or "This Week" tasks
- **Batch similar tasks**: Group "frontend" or "backend" tasks together

#### Time Management

- **Set estimated hours**: Helps with planning and time tracking
- **Use due dates wisely**: Only for external deadlines
- **Review completed tasks**: Learn from time estimates

#### Collaboration

- **Use clear descriptions**: Help others understand your tasks
- **Tag appropriately**: Make tasks discoverable
- **Update regularly**: Keep task status current

## 🔧 Troubleshooting

### Common Issues

#### Task Creation Problems

**Problem**: Can't create new tasks
**Solutions**:

- Check if you're logged in
- Verify the "In Progress" board isn't at WIP limit
- Try refreshing the page
- Check browser console for errors

#### Filter Issues

**Problem**: Filters not working as expected
**Solutions**:

- Clear all filters and try again
- Check date range selection
- Verify sort options are correct
- Refresh the page

#### Mobile Issues

**Problem**: Mobile interface not working properly
**Solutions**:

- Rotate device to landscape mode
- Clear browser cache
- Update browser to latest version
- Try different browser

#### Performance Issues

**Problem**: App is slow or unresponsive
**Solutions**:

- Close other browser tabs
- Clear browser cache
- Check internet connection
- Try refreshing the page

### Error Messages

#### "Failed to create task"

- Check your internet connection
- Verify all required fields are filled
- Try again in a few moments
- Contact support if problem persists

#### "Failed to load data"

- Refresh the page
- Check your internet connection
- Try logging out and back in
- Contact support if problem persists

#### "Unauthorized"

- Log out and log back in
- Clear browser cookies
- Check if your session expired
- Contact support if problem persists

### Getting Help

#### Self-Service

1. **Check this user guide** for common solutions
2. **Try the troubleshooting steps** above
3. **Clear browser cache** and try again
4. **Log out and log back in**

#### Contact Support

If you're still having issues:

1. **Note the exact error message**
2. **Describe what you were trying to do**
3. **Include your browser and device information**
4. **Contact the development team**

## 🎯 Advanced Features

### Auto Cleanup

- **Completed tasks** in the "Done" board are automatically deleted after 48 hours
- **Use the Cleanup panel** to manually clean up old tasks
- **View cleanup statistics** to see how many tasks will be deleted

### Optimistic Updates

- **Tasks appear immediately** when created or moved
- **Changes sync in the background** with the server
- **Automatic rollback** if server operations fail
- **Toast notifications** keep you informed of status

### Real-time Collaboration

- **Multiple users** can work on the same project
- **Changes sync automatically** between users
- **No conflicts** with simultaneous editing
- **Session management** keeps data secure

## 📈 Analytics & Insights

### Task Statistics

- **Total tasks** across all boards
- **Completed tasks** in the last 30 days
- **Average completion time** by priority
- **Most used tags** for insights

### Productivity Metrics

- **Tasks completed per day/week**
- **Time spent on different priorities**
- **Tag usage patterns**
- **Board movement patterns**

---

## 🎉 Conclusion

TaskMate is designed to be simple yet powerful. Start with the basics:

1. **Create your first task**
2. **Move it through the boards**
3. **Try the filtering and sorting**
4. **Add tags to organize**
5. **Explore mobile features**

As you become more comfortable, experiment with:

- **Advanced filtering combinations**
- **Tag strategies**
- **Workflow optimization**
- **Productivity techniques**

Remember: The best task management system is the one you actually use. TaskMate is designed to be intuitive and helpful, not overwhelming.

**Happy task managing! 🚀**
