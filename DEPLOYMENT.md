# Vercel Deployment Guide

This guide will help you deploy your Formul8Next project to Vercel.

## Prerequisites

1. **MongoDB Database**: Set up a MongoDB Atlas cluster or use another MongoDB cloud provider
2. **GitHub Repository**: Your code should be pushed to GitHub (already done ✅)
3. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

## Deployment Steps

### 1. Set up MongoDB Atlas (if not already done)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository: `ardavan-afra/formul8Next`
4. Vercel will automatically detect it's a Next.js project
5. Configure environment variables (see below)
6. Click "Deploy"

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

### 3. Environment Variables

In your Vercel dashboard, add these environment variables:

```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/formul8-nextjs?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-here
NODE_ENV=production
```

### 4. Database Setup

After deployment, you'll need to run Prisma migrations:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

## Post-Deployment

1. **Test your application**: Visit your Vercel URL
2. **Check logs**: Monitor the Vercel dashboard for any errors
3. **Database connection**: Ensure your MongoDB connection is working
4. **Authentication**: Test user registration and login

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0)
2. **Environment Variables**: Double-check all environment variables are set correctly
3. **Build Errors**: Check the build logs in Vercel dashboard
4. **API Routes**: Ensure all API routes are properly configured

### Useful Commands

```bash
# Check build locally
npm run build

# Test production build locally
npm run start

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret for JWT token signing | `your-super-secret-key` |
| `NEXTAUTH_URL` | Your app's URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | NextAuth secret | `your-nextauth-secret` |
| `NODE_ENV` | Environment | `production` |

## Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Verify your MongoDB connection
3. Ensure all environment variables are set
4. Test your API routes locally first
