# Formul8 - Next.js Research Project Platform

A modern, full-stack research project platform built with Next.js 14, TypeScript, Prisma, and Tailwind CSS. This application connects professors with students for research opportunities.

## Features

### For Professors
- Create and manage research projects with detailed descriptions
- Set requirements (GPA, academic year, prerequisites)
- Add project materials and resources
- Review and manage student applications
- Accept or reject applications with notes
- Track project capacity and student enrollment

### For Students
- Browse and search research projects
- Filter projects by department, skills, and other criteria
- View detailed project information and requirements
- Apply to projects with cover letters and motivation statements
- Track application status
- Manage profile with skills and research interests

### General Features
- User authentication and role-based access
- Responsive design for desktop and mobile
- Real-time search and filtering
- Modern, intuitive user interface
- Secure API with data validation

## Technology Stack

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Query** for data fetching
- **React Hook Form** with Zod validation

### Backend
- **Next.js API Routes** for backend functionality
- **Prisma** as ORM with MongoDB
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Zod** for input validation

### Database
- **MongoDB** with Prisma ORM
- Text search indexes for project discovery
- Unique constraints for data integrity

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nextjs-formul8
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```
   
   Update the `.env.local` file with your values:
   ```env
   DATABASE_URL="mongodb://localhost:27017/formul8-nextjs"
   JWT_SECRET="your-super-secret-jwt-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-here"
   NODE_ENV="development"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # (Optional) Seed the database
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

## Project Structure

```
nextjs-formul8/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── projects/      # Project management
│   │   ├── applications/  # Application management
│   │   └── users/         # User management
│   ├── dashboard/         # Dashboard page
│   ├── projects/          # Project browsing
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── layout.tsx         # Root layout
├── components/            # Reusable React components
├── contexts/             # React contexts (Auth)
├── lib/                  # Utility functions
│   ├── auth.ts           # Authentication utilities
│   ├── db.ts             # Database connection
│   ├── utils.ts          # General utilities
│   └── validations.ts    # Zod schemas
├── prisma/               # Database schema
│   └── schema.prisma     # Prisma schema
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects (with search/filter)
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project (professor only)
- `PUT /api/projects/:id` - Update project (owner only)
- `DELETE /api/projects/:id` - Delete project (owner only)
- `GET /api/projects/professor/my-projects` - Get professor's projects

### Applications
- `POST /api/applications` - Submit application (student only)
- `GET /api/applications/student/my-applications` - Get student's applications
- `GET /api/applications/professor/my-project-applications` - Get project applications
- `PUT /api/applications/:id/status` - Update application status (professor only)
- `DELETE /api/applications/:id` - Withdraw application (student only)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/departments` - Get all departments
- `GET /api/users/skills` - Get all skills

## Database Schema

### User Model
- Basic info (name, email, password, role, department)
- Student-specific fields (GPA, year, skills, interests)
- Professor-specific fields (bio, research areas)

### Project Model
- Project details (title, description, department)
- Requirements (GPA, year, prerequisites, skills)
- Logistics (duration, time commitment, compensation)
- Materials and resources
- Capacity and status tracking

### Application Model
- Student and project references
- Application content (cover letter, experience, motivation)
- Status tracking and professor notes
- Timestamps for application and response dates

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

### Code Structure
- **Components**: Reusable UI components in `/components`
- **Pages**: Next.js pages in `/app`
- **API Routes**: Backend endpoints in `/app/api`
- **Types**: TypeScript definitions in `/types`
- **Utils**: Utility functions in `/lib`
- **Contexts**: React contexts for state management

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
- **Netlify**: Use Next.js build output
- **Railway**: Deploy with MongoDB Atlas
- **DigitalOcean**: Use App Platform

### Environment Variables for Production
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/formul8"
JWT_SECRET="your-production-jwt-secret"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-nextauth-secret"
NODE_ENV="production"
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@formul8.app or create an issue in the repository.
