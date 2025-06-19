# 🚀 Dashwave Setup Guide

This guide will walk you through setting up Dashwave, a multi-tenant team collaboration platform, from scratch to deployment.

## 📋 Prerequisites

Before you begin, ensure you have the following installed and configured:

### Required Software
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Code Editor** - VS Code recommended

### Required Services
- **PostgreSQL Database** - We recommend [Neon.tech](https://neon.tech) for serverless PostgreSQL
- **Clerk Account** - [Sign up here](https://clerk.com) for authentication
- **Gmail Account** - For SMTP email notifications

## 🔧 Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/korayciftciii/dashwave.git
cd dashwave
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Next.js 14 with App Router
- TypeScript
- Prisma ORM
- TailwindCSS
- Clerk authentication
- Radix UI components
- Framer Motion for animations
- Nodemailer for emails
- React Big Calendar for task calendar
- Recharts for data visualization
- SWR for data fetching
- Moment.js for date handling

### 3. Database Setup (Neon.tech)

#### Create a Neon Database

1. Go to [Neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy your connection string

#### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Gmail SMTP Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Clerk Authentication Setup

#### Create a Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Choose your authentication providers (Email, Google, GitHub, Microsoft)
4. Copy your API keys to the `.env.local` file

#### Configure Redirects

In your Clerk dashboard:
- Set sign-in redirect to `/dashboard`
- Set sign-up redirect to `/dashboard`
- Add `http://localhost:3000` to allowed origins

### 5. Gmail SMTP Setup

#### Generate App Password

1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings
3. Generate an App Password for "Mail"
4. Use this 16-character password in `GMAIL_APP_PASSWORD`

#### Email Features

The application will send emails for:
- Team invitations
- Task assignments
- Welcome messages

### 6. Database Migration

Run Prisma migrations to set up your database:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

### 7. Start Development Server

```bash
npm run dev
```

Your application will be available at [http://localhost:3000](http://localhost:3000)

## 🎯 Testing the Setup

### 1. Authentication Test
1. Navigate to `/sign-up`
2. Create a new account (try Google OAuth for testing)
3. Verify you're redirected to `/dashboard`

### 2. Team Creation Test
1. Go to Teams page
2. Create a new team
3. Verify you're set as the team owner

### 3. Email Test
1. Go to Settings page
2. Click "Send Test Email"
3. Check your email inbox

### 4. Project & Task Test
1. Create a project within your team
2. Create a task with the following details:
   - Title and description
   - Priority level (try Urgent)
   - Set start and due dates
   - Add estimated hours
   - Add some tags
   - Assign it to yourself
3. Verify email notification is received
4. Check task appears in Calendar view

### 5. Dashboard Features Test
1. Verify Task Status Chart shows your task
2. Check Calendar view displays your task on the correct date
3. Test filtering tasks by status and priority
4. Test the responsive sidebar:
   - On desktop: Toggle the sidebar between expanded and collapsed states
   - On mobile: Open and close the sidebar drawer
   - Verify tooltips appear when hovering over icons in collapsed state
5. Test the dashboard layout on different devices:
   - Desktop (1024px and above)
   - Tablet (768px to 1023px)
   - Mobile (below 768px)

## 🏗️ Database Schema Overview

The application uses the following main entities:

### Core Models
- **User** - User accounts linked to Clerk
- **Team** - Multi-tenant team workspaces
- **TeamMember** - Team membership with roles and permissions
- **Project** - Projects within teams
- **Task** - Tasks within projects with assignments, due dates, priorities, and tags

### Task Properties
- **title** - Task name
- **description** - Detailed description
- **status** - todo, in-progress, done
- **priority** - low, medium, high, urgent
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

## 🚀 Production Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial setup"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Import your repository in Vercel
   - Add all environment variables
   - Deploy automatically

3. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_APP_URL=https://dashwave-six.vercel.app
   ```

4. **Update Clerk Settings**
   - Add production domain to Clerk
   - Update redirect URLs

### Database Migration for Production

```bash
# Generate and apply migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## 🔧 Development Commands

### Essential Commands
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types

# Database Management
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate dev # Create and apply migration
npx prisma migrate reset # Reset database (development only)
npx prisma db seed   # Seed database with sample data
npx prisma generate  # Generate Prisma client
```

### Performance Optimization

To optimize the application for better performance:

```bash
# Analyze bundle size
npm run build:analyze

# Clean build cache
npm run clean

# Production preview
npm run preview
```

### Useful Development Tools
```bash
# View database
npx prisma studio

# Reset database (destructive!)
npx prisma migrate reset

# View logs
npm run dev -- --verbose
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Database Connection Error
- Verify DATABASE_URL is correct
- Check network connectivity
- Ensure database exists

#### 2. Authentication Issues
- Verify Clerk API keys
- Check allowed domains in Clerk dashboard
- Clear browser cookies

#### 3. Email Sending Fails
- Verify GMAIL_APP_PASSWORD is correct
- Check if 2FA is enabled on Gmail
- Verify GMAIL_USER is correct

#### 4. Calendar View Not Loading
- Check console for React Big Calendar errors
- Ensure tasks have valid date objects
- Verify moment.js is properly installed

#### 5. Performance Issues
- Use production build for accurate performance testing
- Check network tab for slow API requests
- Verify SWR is properly caching responses

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [React Big Calendar Documentation](https://github.com/jquense/react-big-calendar)
- [Recharts Documentation](https://recharts.org/en-US/api)
- [SWR Documentation](https://swr.vercel.app/docs/getting-started)

---

<div align="center">
  <p>
    <strong>Dashwave Setup Guide</strong><br/>
    Version 1.2.0 | Last Updated: June 2025
  </p>
</div>

## 🆘 Getting Help

If you encounter issues:

1. Check this setup guide thoroughly
2. Review the [Architecture Documentation](ARCH.md)
3. Search existing GitHub issues
4. Create a new issue with:
   - Error messages
   - Steps to reproduce
   - Environment details

---

**Created by [Koray Çiftçi](https://github.com/korayciftciii)** 