# 🌊 Dashwave - Multi-Tenant Team Collaboration Platform

![Dashwave Banner](https://via.placeholder.com/1200x400/667eea/ffffff?text=Dashwave+-+Team+Collaboration+Platform)

[![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-white?logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk)](https://clerk.com/)

A modern, full-stack SaaS platform for team collaboration, project management, and task tracking. Built with the latest web technologies and designed for scalability.

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

### 🔐 Security & Authentication
- **Enterprise-Grade Auth**: Powered by Clerk authentication
- **Secure by Design**: Role-based access control at every level
- **Data Isolation**: Complete tenant separation for security and privacy

### 📧 Communication
- **Email Notifications**: Automatic notifications for task assignments
- **Team Invitations**: Seamless team member onboarding
- **SMTP Integration**: Gmail-powered email system

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on all devices
- **Loading States**: Smooth transitions and loading indicators
- **Modern Components**: Built with Radix UI and TailwindCSS

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
│   │   └── ui/             # Reusable UI components
│   ├── lib/
│   │   ├── actions.ts       # Server actions
│   │   ├── email.ts         # Email utilities
│   │   ├── prisma.ts        # Prisma client
│   │   └── utils.ts         # Utility functions
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

### Backend
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Robust relational database
- **[Nodemailer](https://nodemailer.com/)** - Email sending library

### Authentication & Security
- **[Clerk](https://clerk.com/)** - Complete authentication solution
- **Role-Based Access Control** - Custom permission system

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
2. Create tasks and assign them to team members
3. Update task status (To Do, In Progress, Done)
4. Track progress through the project dashboard

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