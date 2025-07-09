# 🌊 Dashwave - Multi-Tenant Team Collaboration Platform

![Dashwave Banner]([https://via.placeholder.com/1200x400/667eea/ffffff?text=Dashwave+-+Team+Collaboration+Platform](https://dashwave-six.vercel.app/_next/image?url=%2Flogo.png&w=48&q=75))

[![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.8.1-white?logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk)](https://clerk.com/)

A modern, full-stack SaaS platform for team collaboration, project management, and task tracking. Built with the latest web technologies and designed for scalability and performance.

## ✨ Features

### 🏢 Multi-Tenant Architecture
- **Team Workspaces**: Isolated environments for different organizations
- **Role-Based Access Control**: 5 built-in roles (Owner, Manager, Writer, Member, Viewer)
- **Custom Role Titles**: Personalized role names while maintaining permissions
- **Granular Permissions**: Fine-grained control over team, project, and task management

### 📊 Project Management
- **Project Organization**: Create and manage multiple projects per team
- **Task Management**: Kanban-style task boards with status tracking
- **Task Assignment**: Assign tasks to team members with email notifications
- **Progress Tracking**: Visual progress indicators and completion statistics

### 📅 Advanced Task Features
- **Task Calendar**: View tasks organized by due dates in month/week/day views
- **Task Status Chart**: Visual distribution of tasks across statuses
- **Priority Levels**: Low, Medium, High, and Urgent with visual indicators
- **Due Date Tracking**: Overdue and due-soon warnings with visual feedback
- **Task Details**: Start dates, due dates, estimated hours, tags, and notes
- **Task Detail Page**: Comprehensive view of all task information in a well-organized layout
- **Task Editing**: Full editing capabilities for all task properties
- **Excel Export**: Export task data to Excel for reporting and analysis

### 🔍 Search & Filtering
- **Task Search**: Find tasks by title, description, or tags
- **Advanced Filters**: Filter by status, priority, assignee, and dates
- **Grouped Views**: Organize tasks by project with collapsible sections
- **Multiple View Options**: Switch between card and table views for tasks

### 🔐 Security & Authentication
- **Enterprise-Grade Auth**: Powered by Clerk authentication
- **Secure by Design**: Role-based access control at every level
- **Data Isolation**: Complete tenant separation for security and privacy
- **OAuth Support**: Google, GitHub, and Microsoft authentication

### 📧 Communication
- **Email Notifications**: Automatic notifications for task assignments
- **Team Invitations**: Seamless team member onboarding
- **SMTP Integration**: Gmail-powered email system

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on all devices
- **Loading States**: Smooth transitions and loading indicators
- **Modern Components**: Built with Radix UI and TailwindCSS
- **Performance Optimized**: Fast page transitions and optimized data loading
- **Collapsible Sidebar**: Toggleable sidebar that adapts to different screen sizes
- **Mobile-First Layout**: Optimized for both desktop and mobile experiences
- **Animated Transitions**: Smooth animations using Framer Motion
- **Tooltips & Hints**: Improved user experience with contextual information

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (recommended: [Neon.tech](https://neon.tech))
- Gmail account for SMTP
- Clerk account for authentication

### 1. Clone the Repository

```bash
git clone https://github.com/korayciftciii/dashwave.git
cd dashwave
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Gmail SMTP (for email notifications)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# App Configuration
NEXT_PUBLIC_APP_URL=https://dashwave-six.vercel.app
```

### 4. Database Setup

```bash
# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 📁 Project Structure

```
dashwave/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── public/
│   ├── logo.png              # App logo
│   └── favicon.png           # Favicon
├── src/
│   ├── app/                  # Next.js 14 App Router
│   │   ├── api/             # API routes
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── sign-in/         # Authentication pages
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── dashboard/       # Dashboard-specific components
│   │   │   ├── task-calendar.tsx    # Calendar view for tasks
│   │   │   ├── task-status-chart.tsx # Task status visualization
│   │   │   ├── task-search-filter.tsx # Advanced search & filtering
│   │   │   ├── grouped-tasks-view.tsx # Project-grouped tasks
│   │   │   └── ...          # Other dashboard components
│   │   ├── layout/          # Layout components
│   │   │   └── dashboard-layout.tsx # Main dashboard layout
│   │   ├── sidebar.tsx      # Collapsible sidebar component
│   │   ├── topbar.tsx       # Header component
│   │   ├── sidebar-link.tsx # Navigation link component
│   │   └── ui/             # Reusable UI components
│   ├── lib/
│   │   ├── actions.ts       # Server actions
│   │   ├── email-actions.ts # Email-specific actions
│   │   ├── email.ts         # Email utilities
│   │   ├── prisma.ts        # Prisma client
│   │   ├── utils.ts         # Utility functions
│   │   └── hooks/           # Custom React hooks
│   │       └── use-sidebar.ts # Sidebar state management hook
│   └── middleware.ts        # Clerk authentication middleware
├── README.md
├── SETUP.md                 # Detailed setup instructions
└── ARCH.md                  # Architecture documentation
```

## 🛠️ Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible components
- **[Lucide React](https://lucide.dev/)** - Beautiful & consistent icons
- **[React Big Calendar](https://github.com/jquense/react-big-calendar)** - Calendar component
- **[Recharts](https://recharts.org/)** - Composable charting library
- **[SWR](https://swr.vercel.app/)** - React Hooks for data fetching
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library for React

### Backend
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Robust relational database
- **[Nodemailer](https://nodemailer.com/)** - Email sending library

### Authentication & Security
- **[Clerk](https://clerk.com/)** - Complete authentication solution
- **Role-Based Access Control** - Custom permission system

### Performance Optimization
- **Server Components** - Reduced client-side JavaScript
- **Streaming & Suspense** - Progressive rendering
- **Client-side Caching** - Optimized data fetching
- **Image Optimization** - Next.js Image component
- **Route Prefetching** - Faster page transitions

### Deployment & DevOps
- **[Vercel](https://vercel.com/)** - Seamless deployment platform
- **[Neon.tech](https://neon.tech/)** - Serverless PostgreSQL

## 🎯 Usage

### Creating a Team
1. Sign up or log in to your account
2. Navigate to the Teams page
3. Click "Create Team" and enter team details
4. Invite members via email

### Managing Projects
1. Select a team from your dashboard
2. Create a new project within the team
3. Add project description and details
4. Start creating tasks for the project

### Task Management
1. Open a project to view its tasks
2. Create tasks with detailed information:
   - Title and description
   - Priority level (Low, Medium, High, Urgent)
   - Start and due dates
   - Estimated hours
   - Tags for categorization
   - Assignment to team members
3. Update task status (To Do, In Progress, Done)
4. Track progress through the project dashboard

### Task Visualization
1. Use the Calendar view to see tasks by dates
2. View task distribution in the Status Chart
3. Filter tasks by various criteria
4. Group tasks by project for better organization

### Role Management
1. As a team owner/manager, go to team settings
2. Click on a member to modify their role
3. Set custom role titles and permissions
4. Save changes to apply new access levels

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio
npx prisma migrate dev # Run database migrations
npx prisma generate  # Generate Prisma client
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>
    Created by <a href="https://github.com/korayciftciii"><strong>Koray Çiftçi</strong></a>
  </p>
  <p>
    <!-- <a href="https://twitter.com/korayciftci">Twitter</a> • -->
    <a href="https://www.linkedin.com/in/koray-ciftci-814392257">LinkedIn</a> •
    <a href="https://github.com/korayciftciii">GitHub</a>
  </p>
</div> 
