# 🏗️ Dashwave Architecture Documentation

This document provides a comprehensive overview of Dashwave's architecture, technology stack, and system design patterns.

## 📊 System Architecture Overview

Dashwave is built as a modern, full-stack SaaS application using a multi-tenant architecture pattern. The system is designed for scalability, security, and performance.

### High-Level Architecture

The system follows a layered architecture with clear separation of concerns:

- **Frontend Layer**: Next.js 14 with App Router, TypeScript, TailwindCSS
- **Authentication Layer**: Clerk authentication with JWT tokens
- **Backend Layer**: API routes, Prisma ORM, email services
- **Data Layer**: PostgreSQL database with Neon.tech
- **Performance Layer**: SWR for data fetching, Suspense for streaming

## 🛠️ Technology Stack

### Frontend Technologies
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible components
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[React Big Calendar](https://github.com/jquense/react-big-calendar)** - Calendar component
- **[Recharts](https://recharts.org/)** - Composable charting library
- **[SWR](https://swr.vercel.app/)** - React Hooks for data fetching
- **[Moment.js](https://momentjs.com/)** - Date manipulation library
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library for React
- **[XLSX](https://github.com/sheetjs/sheetjs)** - Excel file generation library

### Backend Technologies
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[Nodemailer](https://nodemailer.com/)** - Email service

### Authentication & Security
- **[Clerk](https://clerk.com/)** - Authentication platform
- **Role-Based Access Control** - Custom authorization system

### Performance Optimization
- **Server Components** - Reduced client-side JavaScript
- **Streaming & Suspense** - Progressive rendering
- **Client-side Caching** - Optimized data fetching with SWR
- **Image Optimization** - Next.js Image component
- **Route Prefetching** - Faster page transitions
- **Bundle Optimization** - Code splitting and tree shaking
- **Memoization** - Preventing unnecessary re-renders

### Infrastructure & Deployment
- **[Vercel](https://vercel.com/)** - Deployment platform
- **[Neon.tech](https://neon.tech/)** - Serverless PostgreSQL

## 🏢 Multi-Tenant Architecture

### Tenant Isolation Strategy

Dashwave implements a **shared database, shared schema** multi-tenancy model with the following characteristics:

- **Team-based isolation**: Each team acts as a tenant with isolated data
- **Row-level security**: Database queries filtered by team membership
- **API-level authorization**: Middleware ensures users only access their team's data

### Data Isolation
- Teams cannot access other teams' data
- Users can belong to multiple teams
- Role-based permissions within each team

## 🗄️ Database Schema

### Core Entities

1. **User** - User accounts linked to Clerk authentication
2. **Team** - Multi-tenant team workspaces
3. **TeamMember** - Team membership with roles and permissions
4. **Project** - Projects within teams
5. **Task** - Tasks within projects with assignments

### Task Schema
- **id** - Unique identifier
- **title** - Task name
- **description** - Detailed description
- **status** - todo, in-progress, done
- **priority** - low, medium, high, urgent
- **createdAt** - Creation timestamp
- **updatedAt** - Last update timestamp
- **projectId** - Associated project
- **createdById** - User who created the task
- **assignedToId** - User assigned to the task
- **startDate** - When work should begin
- **dueDate** - Deadline for completion
- **estimatedHours** - Time estimation
- **actualHours** - Time spent (optional)
- **tags** - String array for categorization
- **notes** - Additional information
- **isBlocked** - Whether task is blocked
- **blockedReason** - Why task is blocked (optional)
- **completedAt** - When task was completed

### Role System
- **OWNER** - Full access, can transfer ownership
- **MANAGER** - Can manage team, projects, and tasks
- **WRITER** - Can create projects and tasks
- **MEMBER** - Can create tasks and participate
- **VIEWER** - Read-only access

### Permissions
- `canManageTeam` - Add/remove members, change roles
- `canManageProjects` - Create/delete projects
- `canManageTasks` - Create/assign tasks
- `canViewAll` - View all team content

## 🔐 Security Architecture

### Authentication Flow
1. User signs in through Clerk
2. Clerk issues JWT token
3. Middleware validates token on protected routes
4. User context available throughout application

### Authorization System
- **Role-based permissions** for each team
- **Custom role titles** while maintaining permissions
- **Granular permission flags** for fine-tuned access control

## 📧 Email System

### SMTP Configuration
- **Gmail SMTP** integration for reliable email delivery
- **HTML email templates** with branding
- **Personalized content** based on user and action context

### Email Triggers
- Task assignments
- Team invitations
- Welcome messages
- Project notifications

## 🎨 Frontend Architecture

### Component Structure
- **Layout components** for consistent UI structure
  - **DashboardLayout** - Main layout with responsive sidebar and header
  - **Sidebar** - Collapsible navigation with mobile support
  - **Topbar** - Responsive header with user controls
- **Page components** for route-specific content
- **Feature components** for business logic
- **UI components** for reusable interface elements

### State Management
- **React state** for local component state
- **URL state** for navigation and filtering
- **Server state** via API calls and SWR caching
- **Authentication state** through Clerk context
- **Sidebar state** with localStorage persistence

### Responsive Design
- **Mobile-first approach** with tailored experiences per device
- **Adaptive sidebar** that collapses on smaller screens
- **Overlay navigation** for mobile devices
- **Responsive grid layouts** using TailwindCSS
- **Smooth animations** with Framer Motion

### Dashboard Components
- **TaskStatusChart** - Visualize task distribution
- **TaskCalendar** - Calendar view for task scheduling
- **TaskSearchFilter** - Advanced filtering system
- **GroupedTasksView** - Project-based task organization
- **TasksTable** - Tabular view of tasks with sorting and filtering
- **TaskDetailPage** - Comprehensive view of task information
- **TaskEditPage** - Full editing capabilities for tasks
- **ExcelExport** - Export task data to Excel for reporting

## 🔄 API Architecture

### RESTful API Design
- **Resource-based URLs** (`/api/teams`, `/api/projects`, `/api/tasks`)
- **HTTP methods** for CRUD operations
- **Consistent response formats** with proper error handling
- **Input validation** and sanitization

### Middleware Pipeline
1. **Authentication** - Verify user identity
2. **Authorization** - Check team membership and permissions
3. **Validation** - Validate request data
4. **Rate limiting** - Prevent abuse

## 🚀 Performance Optimization

### Frontend Optimizations
- **Code splitting** for reduced bundle sizes
- **Image optimization** with Next.js Image component
- **Static generation** for public pages
- **Client-side caching** for API responses
- **Prefetching** for faster page transitions
- **Memoization** to prevent unnecessary re-renders
- **Suspense and Streaming** for progressive loading

### Backend Optimizations
- **Database indexing** for query performance
- **Connection pooling** for database efficiency
- **Query optimization** with Prisma
- **API response caching** with Cache-Control headers

### Infrastructure Optimizations
- **CDN delivery** through Vercel
- **Edge functions** for global performance
- **Automatic scaling** based on demand

## 🔧 Development Workflow

### Code Quality
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Git hooks** for automated checks

### CI/CD Pipeline
1. Code commit triggers build
2. Automated testing and linting
3. Build verification
4. Automatic deployment to Vercel

## 📊 Monitoring & Observability

### Error Tracking
- Client-side error monitoring
- Server-side error logging
- Performance metrics collection

### User Analytics
- Feature usage tracking
- User engagement metrics
- Conversion funnel analysis

## 🔮 Future Enhancements

### Planned Features
1. **Real-time collaboration** with WebSockets
2. **Advanced analytics** and reporting
3. **API rate limiting** and usage analytics
4. **Mobile applications** with React Native
5. **AI-powered insights** for project management
6. **Kanban board view** for visual task management
7. **Time tracking** integration
8. **Document management** system

### Scalability Improvements
1. **Microservices architecture** for complex features
2. **Event-driven architecture** with message queues
3. **Advanced caching** with Redis
4. **Database sharding** for large-scale deployment

## 📋 Deployment Architecture

### Production Environment
- **Vercel hosting** for frontend and API routes
- **Neon.tech PostgreSQL** for database
- **Gmail SMTP** for email delivery
- **Clerk** for authentication services

### Environment Configuration
- **Environment variables** for sensitive configuration
- **Separate staging and production** environments
- **Automated backups** and disaster recovery

---

<div align="center">
  <p>
    <strong>Dashwave Architecture Documentation</strong><br/>
    Created  by <a href="https://github.com/korayciftciii"><strong>Koray Çiftçi</strong></a>
  </p>
  <p>
    <strong>Version:</strong> 1.2.0 | <strong>Last Updated:</strong> June 2025
  </p>
</div>
