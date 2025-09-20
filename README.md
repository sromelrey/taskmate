# TaskMate

A modern, full-featured task management application built with Next.js 14, featuring Kanban-style boards, advanced filtering, sorting, and real-time collaboration capabilities.

![TaskMate](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- **🎯 Kanban Board Management** - Drag and drop tasks between boards (Backlog, To Do, In Progress, Done)
- **🔍 Advanced Filtering** - Filter tasks by date range, quick filters (Today, This Week, Overdue)
- **📊 Smart Sorting** - Sort by created date, due date, priority, title, or updated date
- **🏷️ Tag System** - Organize tasks with customizable tags and colors
- **⚡ Real-time Updates** - Optimistic UI with instant feedback and error rollback
- **📱 Mobile Responsive** - Collapsible boards and touch-friendly interface
- **🔐 Secure Authentication** - User authentication with session management
- **🚀 WIP Limits** - Enforce work-in-progress limits to maintain focus
- **🧹 Auto Cleanup** - Automatic deletion of completed tasks after 48 hours
- **🎨 Modern UI** - Beautiful interface built with Tailwind CSS and shadcn/ui

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taskmate
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your `.env.local`:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/taskmate
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   # Run the database setup script
   psql -d your_database -f database-schema.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Documentation

- **[User Guide](docs/USER_GUIDE.md)** - Complete guide on how to use TaskMate
- **[API Documentation](docs/API.md)** - Server actions and API endpoints
- **[Database Schema](docs/DATABASE.md)** - Database structure and relationships
- **[Deployment Guide](docs/DEPLOYMENT.md)** - How to deploy TaskMate

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: Zustand
- **Database**: PostgreSQL with direct SQL queries
- **Authentication**: Custom session-based auth
- **Drag & Drop**: @dnd-kit
- **Date Handling**: date-fns
- **Notifications**: react-hot-toast

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── ui/               # Reusable UI components
│   ├── kanban-board.tsx  # Main Kanban board
│   ├── task-modal.tsx    # Task creation/editing modal
│   └── task-filters.tsx  # Filtering and sorting
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
│   ├── store.ts          # Zustand state management
│   ├── database.ts       # Database connection
│   ├── types.ts          # TypeScript type definitions
│   └── actions.ts        # Server actions
└── styles/               # Global styles
```

## 🎯 Key Features Explained

### Kanban Boards
- **Backlog**: Ideas and future tasks
- **To Do**: Tasks ready to be worked on  
- **In Progress**: Currently active tasks (WIP limit: 1)
- **Done**: Completed tasks (auto-deleted after 48 hours)

### Task Management
- Create, edit, and delete tasks with rich metadata
- Assign priorities (Low, Medium, High, Urgent)
- Set due dates with calendar picker
- Add estimated hours and descriptions
- Organize with tags and colors

### Filtering & Sorting
- **Quick Filters**: Today, This Week, This Month, Overdue, No Due Date
- **Date Range**: Custom date range picker
- **Sorting**: By created date, due date, priority, title, or updated date
- **Order**: Ascending or descending

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

### Code Quality

This project follows strict coding standards:
- TypeScript with strict mode
- ESLint configuration
- Prettier formatting
- Conventional commit messages

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on every push

### Other Platforms

TaskMate can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

See [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Zustand](https://zustand-demo.pmnd.rs/) for simple state management
- [@dnd-kit](https://dndkit.com/) for accessible drag and drop

## 📞 Support

If you have any questions or need help:

1. Check the [User Guide](docs/USER_GUIDE.md)
2. Review the [API Documentation](docs/API.md)
3. Open an issue on GitHub
4. Contact the development team

---

**Built with ❤️ using Next.js and modern web technologies**
