# TaskMate Deployment Guide

This guide covers deploying TaskMate to various platforms and environments.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
- [Other Platforms](#other-platforms)
- [Database Setup](#database-setup)
- [Domain Configuration](#domain-configuration)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## 🔍 Overview

TaskMate is a Next.js application that can be deployed to various platforms. This guide covers the most common deployment scenarios and best practices.

### Deployment Options
- **Vercel** (Recommended) - Easiest and most optimized
- **Netlify** - Good alternative with edge functions
- **Railway** - Full-stack platform with database
- **DigitalOcean App Platform** - Managed containers
- **AWS Amplify** - AWS ecosystem integration
- **Self-hosted** - Docker containers or VPS

## 🛠️ Prerequisites

### Required
- **Node.js 18+** for local development
- **PostgreSQL database** (Neon, Supabase, or self-hosted)
- **Git repository** with your code
- **Domain name** (optional but recommended)

### Recommended
- **SSL certificate** for HTTPS
- **CDN** for static assets
- **Monitoring service** (Vercel Analytics, Sentry, etc.)
- **Error tracking** (Sentry, LogRocket, etc.)

## 🔧 Environment Variables

### Required Variables
```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Authentication
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-domain.com

# Optional: Cron job secret for cleanup
CRON_SECRET=your-cron-secret-key
```

### Development Variables
```env
# Local development
DATABASE_URL=postgresql://localhost:5432/taskmate
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-key
```

### Production Variables
```env
# Production
DATABASE_URL=postgresql://user:pass@prod-host:5432/taskmate
NEXTAUTH_URL=https://taskmate.yourdomain.com
NEXTAUTH_SECRET=super-secure-production-secret
CRON_SECRET=secure-cron-secret
```

### Generating Secrets
```bash
# Generate NextAuth secret
openssl rand -base64 32

# Generate cron secret
openssl rand -hex 32
```

## 🚀 Vercel Deployment

### Step 1: Prepare Repository
1. **Push code to GitHub/GitLab/Bitbucket**
2. **Ensure all files are committed**
3. **Verify package.json has correct scripts**

### Step 2: Connect to Vercel
1. **Go to [vercel.com](https://vercel.com)**
2. **Sign in with GitHub/GitLab/Bitbucket**
3. **Click "New Project"**
4. **Import your TaskMate repository**

### Step 3: Configure Project
1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `./` (default)
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)
5. **Install Command**: `npm install` (default)

### Step 4: Set Environment Variables
In Vercel dashboard:
1. **Go to Project Settings**
2. **Click "Environment Variables"**
3. **Add each variable**:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `CRON_SECRET` (optional)

### Step 5: Deploy
1. **Click "Deploy"**
2. **Wait for build to complete**
3. **Test the deployed application**

### Step 6: Configure Custom Domain (Optional)
1. **Go to Project Settings**
2. **Click "Domains"**
3. **Add your custom domain**
4. **Configure DNS records** as instructed

### Step 7: Set Up Cron Jobs
1. **Go to Project Settings**
2. **Click "Functions"**
3. **Add cron job**:
   - **Path**: `/api/cron/cleanup`
   - **Schedule**: `0 2 * * *` (daily at 2 AM UTC)
   - **Secret**: Your `CRON_SECRET` value

### Vercel Configuration File
Create `vercel.json` in project root:
```json
{
  "functions": {
    "src/app/api/cron/cleanup/route.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

## 🌐 Other Platforms

### Netlify Deployment

#### Step 1: Build Configuration
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Step 2: Deploy
1. **Connect repository to Netlify**
2. **Set environment variables**
3. **Deploy**

**Note**: Netlify doesn't support server actions natively. Consider using API routes instead.

### Railway Deployment

#### Step 1: Connect Repository
1. **Go to [railway.app](https://railway.app)**
2. **Connect your GitHub repository**
3. **Railway will auto-detect Next.js**

#### Step 2: Add Database
1. **Click "New" → "Database" → "PostgreSQL"**
2. **Railway will provide connection string**
3. **Copy to environment variables**

#### Step 3: Configure Environment
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

### DigitalOcean App Platform

#### Step 1: Create App
1. **Go to DigitalOcean App Platform**
2. **Create new app from GitHub**
3. **Select your repository**

#### Step 2: Configure Build
```yaml
name: taskmate
services:
- name: web
  source_dir: /
  github:
    repo: your-username/taskmate
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: DATABASE_URL
    value: your-database-url
  - key: NEXTAUTH_SECRET
    value: your-secret
  - key: NEXTAUTH_URL
    value: https://your-app.ondigitalocean.app
```

### AWS Amplify

#### Step 1: Connect Repository
1. **Go to AWS Amplify Console**
2. **Connect your GitHub repository**
3. **Select Next.js framework**

#### Step 2: Configure Build
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

## 🗄️ Database Setup

### Neon (Recommended)
1. **Go to [neon.tech](https://neon.tech)**
2. **Create new project**
3. **Copy connection string**
4. **Run database schema**:
   ```bash
   psql "your-connection-string" -f database-schema.sql
   ```

### Supabase
1. **Go to [supabase.com](https://supabase.com)**
2. **Create new project**
3. **Go to SQL Editor**
4. **Run database schema**
5. **Enable Row Level Security**

### Self-hosted PostgreSQL
1. **Set up PostgreSQL server**
2. **Create database and user**
3. **Run schema migration**
4. **Configure SSL certificates**

### Database Migration Script
```sql
-- Run this in your database
\i database-schema.sql
\i create-admin-user.sql
```

## 🌍 Domain Configuration

### Custom Domain Setup
1. **Purchase domain** from registrar
2. **Configure DNS records**:
   - **A record**: Point to platform IP
   - **CNAME**: Point www to main domain
   - **CAA record**: For SSL certificates

### SSL Certificate
Most platforms provide automatic SSL:
- **Vercel**: Automatic Let's Encrypt
- **Netlify**: Automatic SSL
- **Railway**: Automatic SSL
- **DigitalOcean**: Automatic SSL

### DNS Configuration Examples

#### Vercel
```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### Netlify
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-app.netlify.app
```

## 📊 Monitoring & Maintenance

### Performance Monitoring
- **Vercel Analytics**: Built-in performance monitoring
- **Google Analytics**: User behavior tracking
- **Sentry**: Error tracking and performance monitoring

### Uptime Monitoring
- **UptimeRobot**: Free uptime monitoring
- **Pingdom**: Advanced monitoring
- **StatusCake**: Comprehensive monitoring

### Log Management
- **Vercel**: Built-in function logs
- **Railway**: Application logs
- **Papertrail**: Centralized log management

### Backup Strategy
1. **Database backups**: Daily automated backups
2. **Code backups**: Git repository
3. **Environment backups**: Document all configurations

### Health Checks
Create health check endpoint:
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await query('SELECT 1');
    
    return Response.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: error.message },
      { status: 500 }
    );
  }
}
```

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
**Problem**: Build fails during deployment
**Solutions**:
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check for TypeScript errors
- Ensure environment variables are set

#### Database Connection Issues
**Problem**: Cannot connect to database
**Solutions**:
- Verify DATABASE_URL format
- Check database server status
- Verify SSL requirements
- Test connection locally

#### Authentication Issues
**Problem**: Login not working
**Solutions**:
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches domain
- Clear browser cookies
- Check session storage

#### Performance Issues
**Problem**: Slow loading times
**Solutions**:
- Enable CDN for static assets
- Optimize images
- Check database query performance
- Monitor function execution times

### Debugging Steps

#### 1. Check Logs
```bash
# Vercel
vercel logs

# Railway
railway logs

# Local development
npm run dev
```

#### 2. Test Environment Variables
```typescript
// Add to any API route for debugging
console.log('Environment check:', {
  hasDatabaseUrl: !!process.env.DATABASE_URL,
  hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
  hasNextAuthUrl: !!process.env.NEXTAUTH_URL
});
```

#### 3. Database Connection Test
```typescript
// Test database connection
import { query } from '@/lib/database';

try {
  const result = await query('SELECT NOW()');
  console.log('Database connected:', result.rows[0]);
} catch (error) {
  console.error('Database error:', error);
}
```

### Performance Optimization

#### 1. Enable Caching
```typescript
// Add to API routes
export const revalidate = 3600; // 1 hour
```

#### 2. Optimize Images
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={100}
  height={100}
  priority
/>
```

#### 3. Database Optimization
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_tasks_board_id ON tasks(board_id);
CREATE INDEX idx_tasks_creator_id ON tasks(creator_id);
```

## 🔒 Security Considerations

### Environment Variables
- **Never commit** `.env` files
- **Use strong secrets** for production
- **Rotate secrets** regularly
- **Use different secrets** for each environment

### Database Security
- **Enable SSL** for database connections
- **Use strong passwords**
- **Limit database access** by IP
- **Enable Row Level Security**

### Application Security
- **Enable HTTPS** everywhere
- **Set secure cookies**
- **Validate all inputs**
- **Use CSRF protection**

### Headers Configuration
```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

## 📈 Scaling Considerations

### Horizontal Scaling
- **Stateless application**: No server-side sessions
- **Database connection pooling**: Handle multiple instances
- **CDN**: Distribute static assets globally

### Vertical Scaling
- **Increase memory**: For larger datasets
- **Faster CPU**: For complex queries
- **SSD storage**: For better I/O performance

### Database Scaling
- **Read replicas**: For read-heavy workloads
- **Connection pooling**: PgBouncer or similar
- **Query optimization**: Indexes and query analysis

---

## 🎉 Conclusion

TaskMate is designed to be deployment-friendly with modern best practices:

1. **Start with Vercel** for the easiest deployment
2. **Use Neon** for managed PostgreSQL
3. **Set up monitoring** from day one
4. **Follow security best practices**
5. **Plan for scaling** as you grow

### Quick Deployment Checklist
- [ ] Code pushed to Git repository
- [ ] Database set up and schema applied
- [ ] Environment variables configured
- [ ] Domain configured (optional)
- [ ] SSL certificate active
- [ ] Health checks working
- [ ] Monitoring set up
- [ ] Backup strategy in place

**Happy deploying! 🚀**
