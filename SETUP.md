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
- Nodemailer for emails

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
3. Choose your authentication providers (Email, Google, etc.)
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
2. Create a new account
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
2. Create a task and assign it to yourself
3. Verify email notification is received

## 🏗️ Database Schema Overview

The application uses the following main entities:

### Core Models
- **User** - User accounts linked to Clerk
- **Team** - Multi-tenant team workspaces
- **TeamMember** - Team membership with roles and permissions
- **Project** - Projects within teams
- **Task** - Tasks within projects with assignments

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
   NEXT_PUBLIC_APP_URL=https://dashwave.vercel.app
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

#### 2. Clerk Authentication Issues
- Verify API keys are correct
- Check allowed origins in Clerk dashboard
- Ensure redirect URLs match

#### 3. Email Not Sending
- Verify Gmail credentials
- Check App Password is 16 characters
- Ensure 2FA is enabled on Gmail

#### 4. Build Errors
- Run `npm run lint` to check for errors
- Verify all environment variables are set
- Check TypeScript errors with `npm run type-check`

### Environment Variables Checklist

Ensure all these are set in your `.env.local`:

```bash
✅ DATABASE_URL
✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
✅ CLERK_SECRET_KEY
✅ NEXT_PUBLIC_CLERK_SIGN_IN_URL
✅ NEXT_PUBLIC_CLERK_SIGN_UP_URL
✅ NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
✅ NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
✅ GMAIL_USER
✅ GMAIL_APP_PASSWORD
✅ NEXT_PUBLIC_APP_URL
```

## 📚 Additional Resources

- **[Next.js Documentation](https://nextjs.org/docs)**
- **[Prisma Documentation](https://www.prisma.io/docs)**
- **[Clerk Documentation](https://clerk.com/docs)**
- **[TailwindCSS Documentation](https://tailwindcss.com/docs)**
- **[Vercel Deployment Guide](https://vercel.com/docs)**

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