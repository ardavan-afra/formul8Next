# Formul8 Next.js Setup Guide

This guide will help you set up and run the Formul8 research project platform built with Next.js.

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud)
- npm or yarn package manager

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file and update it with your values:

```bash
cp env.example .env.local
```

Update `.env.local` with your database URL and JWT secret:

```env
DATABASE_URL="mongodb://localhost:27017/formul8-nextjs"
JWT_SECRET="your-super-secret-jwt-key-here"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NODE_ENV="development"
```

### 3. Database Setup

Generate Prisma client and set up the database:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Sample Accounts

After running the seed script, you can use these accounts to test the application:

### Professors
- **Email:** prof1@university.edu
- **Password:** password123
- **Department:** Computer Science

- **Email:** prof2@university.edu  
- **Password:** password123
- **Department:** Biology

### Students
- **Email:** student1@university.edu
- **Password:** password123
- **Department:** Computer Science

- **Email:** student2@university.edu
- **Password:** password123
- **Department:** Biology

## Features Overview

### For Professors
- ✅ Create and manage research projects
- ✅ Set project requirements and materials
- ✅ Review and manage student applications
- ✅ Accept/reject applications with notes
- ✅ Track project capacity and enrollment

### For Students
- ✅ Browse and search research projects
- ✅ Filter projects by department, skills, status
- ✅ Apply to projects with cover letters
- ✅ Track application status
- ✅ Manage profile and skills

### General Features
- ✅ User authentication and role-based access
- ✅ Responsive design for all devices
- ✅ Real-time search and filtering
- ✅ Modern, intuitive user interface
- ✅ Secure API with data validation

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database and seed

## Project Structure

```
nextjs-formul8/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── projects/          # Project browsing
│   ├── applications/      # Application management
│   ├── profile/           # User profile
│   ├── create-project/    # Project creation
│   ├── my-projects/       # Professor's projects
│   ├── edit-project/     # Project editing
│   ├── login/             # Login page
│   └── register/          # Registration page
├── components/            # Reusable React components
├── contexts/             # React contexts (Auth)
├── lib/                  # Utility functions
├── prisma/               # Database schema and seed
├── types/                # TypeScript definitions
└── middleware.ts          # Next.js middleware
```

## Database Schema

The application uses MongoDB with the following main models:

- **User**: Professors and students with role-based access
- **Project**: Research projects with requirements and materials
- **Application**: Student applications to projects
- **Material**: Project resources and documents

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects (with search/filter)
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project (professor only)
- `PUT /api/projects/:id` - Update project (owner only)
- `DELETE /api/projects/:id` - Delete project (owner only)

### Applications
- `POST /api/applications` - Submit application (student only)
- `GET /api/applications/student/my-applications` - Get student's applications
- `GET /api/applications/professor/my-project-applications` - Get project applications
- `PUT /api/applications/:id/status` - Update application status (professor only)

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MongoDB is running
   - Check DATABASE_URL in .env.local
   - Run `npm run db:push` to sync schema

2. **Authentication Issues**
   - Clear browser cookies and localStorage
   - Check JWT_SECRET in .env.local
   - Restart the development server

3. **Build Errors**
   - Run `npm run db:generate` to generate Prisma client
   - Check for TypeScript errors
   - Ensure all dependencies are installed

### Reset Database

To completely reset the database and start fresh:

```bash
npm run db:reset
```

This will:
1. Drop all existing data
2. Recreate the database schema
3. Seed with sample data

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production

```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/formul8"
JWT_SECRET="your-production-jwt-secret"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-nextauth-secret"
NODE_ENV="production"
```

## Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is accessible
4. Try resetting the database with `npm run db:reset`

For additional help, refer to the main README.md file or create an issue in the repository.
