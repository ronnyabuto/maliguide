# Deployment Guide for MaliGuide

This guide provides instructions for deploying the MaliGuide application, covering both the Node.js backend and the React/Vite frontend, along with the Supabase database setup.

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Environment Variables Setup](#2-environment-variables-setup)
3. [Supabase Database Setup](#3-supabase-database-setup)
   - [Create Supabase Project](#create-supabase-project)
   - [Database Schema Initialization](#database-schema-initialization)
   - [Authentication Setup](#authentication-setup)
4. [Backend Deployment](#4-backend-deployment)
   - [Choosing a Hosting Provider](#choosing-a-hosting-provider)
   - [Deployment Steps](#deployment-steps)
5. [Frontend Deployment](#5-frontend-deployment)
   - [Choosing a Hosting Provider](#choosing-a-hosting-provider-1)
   - [Deployment Steps (Example: Netlify)](#deployment-steps-example-netlify)
6. [Post-Deployment Verification](#6-post-deployment-verification)

---

## 1. Prerequisites

Before you begin, ensure you have the following:

- **Node.js and npm**: Installed on your local machine.
- **Git**: For cloning the repository.
- **Supabase Account**: A free or paid account at [Supabase](https://supabase.com/).
- **Hosting Provider Accounts**: Accounts with a suitable backend hosting provider (e.g., Render, Heroku, DigitalOcean) and a static site hosting provider (e.g., Netlify, Vercel).

## 2. Environment Variables Setup

The application relies on environment variables for configuration, especially for sensitive API keys and database credentials.

Create a `.env` file in the root of your project (if you don't have one, you can copy `.env.example` and rename it). Populate it with your specific values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=3001
NODE_ENV=production # Set to 'production' for deployment

# External API Keys (when available)
# Note: Current scrapers do not use these directly, but they are placeholders.
CBK_API_KEY=your_cbk_api_key
NSE_API_KEY=your_nse_api_key
CRYPTO_API_KEY=your_crypto_api_key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend specific (VITE_ prefix is important for client-side access)
VITE_API_URL=your_deployed_backend_url # e.g., https://your-backend-app.render.com
```

**Important Notes:**

- `VITE_` prefixed variables are accessible in the frontend (Vite automatically exposes them).
- Non-`VITE_` prefixed variables are for the backend only.
- `NODE_ENV` should be set to `production` for deployment. This affects CORS settings and error logging in `server/index.js`.
- `VITE_API_URL` must point to the public URL of your deployed backend server.

## 3. Supabase Database Setup

Supabase provides the PostgreSQL database and authentication services for your application.

### Create Supabase Project

1. Go to your [Supabase Dashboard](https://app.supabase.com/) and click "New project".
2. Choose an organization, name your project, set a strong database password, and select a region.
3. Wait for your project to be provisioned.

### Database Schema Initialization

The application's database schema is defined in `server/database/init.js`.

1. Navigate to the "SQL Editor" in your Supabase project dashboard.
2. Copy the entire content from `supabase/migrations/create_notifications_system.sql`.
3. Paste it into the SQL Editor and click "Run". This will create all necessary tables (`market_data`, `user_portfolios`, `user_profiles`, `ai_recommendations`, `market_insights`, `news_sources`) and set up Row Level Security (RLS) policies.
4. **Verify RLS**: Go to "Authentication" -> "Policies" in your Supabase dashboard and ensure RLS is enabled for all tables and policies are active.

### Authentication Setup

1. Go to "Authentication" -> "Settings" in your Supabase dashboard.
2. Under "Authentication Providers", enable "Email" and configure any other providers you wish to support.
3. Ensure "Enable email confirmations" is set to `OFF` for development/testing, but consider setting it to `ON` for production for better security.

## 4. Backend Deployment

The backend is a Node.js Express application.

### Choosing a Hosting Provider

Popular choices for Node.js applications include:

- **Render**: Easy to use, good for small to medium applications.
- **Heroku**: Long-standing platform-as-a-service (PaaS).
- **DigitalOcean App Platform**: Similar to Render, good integration with DigitalOcean ecosystem.
- **AWS EC2/Lightsail**: More control, but requires more setup.

### Deployment Steps

The exact steps vary by provider, but generally involve:

1. **Connect to Git Repository**: Link your hosting provider to your Git repository (e.g., GitHub, GitLab).
2. **Build Command**: Configure the build command. For this project, it's usually not needed for the backend itself, as Node.js runs directly.
3. **Start Command**: Set the command to start your server. This will be `npm run server` or `node server/index.js`.
4. **Environment Variables**: Crucially, set all backend environment variables (from your `.env` file, excluding `VITE_` prefixed ones) directly in your hosting provider's configuration. **Never commit your `.env` file to Git.**
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_SUPABASE_URL` (yes, this is used by the backend too)
   - `PORT` (often set by the hosting provider, e.g., `process.env.PORT`)
   - `NODE_ENV=production`
   - `RATE_LIMIT_WINDOW_MS`
   - `RATE_LIMIT_MAX_REQUESTS`
   - `CBK_API_KEY`, `NSE_API_KEY`, `CRYPTO_API_KEY` (if you plan to use external APIs instead of scrapers)
5. **CORS Configuration**: In `server/index.js`, the `cors` middleware is configured based on `NODE_ENV`. For production, ensure `origin` includes your deployed frontend URL (e.g., `https://your-frontend-app.netlify.app`).
   ```javascript
   app.use(cors({
     origin: process.env.NODE_ENV === 'production' 
       ? ['https://your-frontend-app.netlify.app'] // Replace with your actual frontend domain
       : ['http://localhost:5173', 'http://localhost:3000'],
     credentials: true
   }));
   ```
6. **Deploy**: Trigger the deployment.
7. **Note the Backend URL**: Once deployed, note the public URL of your backend server. You will need this for the frontend configuration.

## 5. Frontend Deployment

The frontend is a React application built with Vite.

### Choosing a Hosting Provider

Popular choices for static site hosting include:

- **Netlify**: Excellent for continuous deployment from Git.
- **Vercel**: Similar to Netlify, popular for Next.js and React apps.
- **GitHub Pages**: Simple for personal projects.

### Deployment Steps (Example: Netlify)

1. **Connect to Git Repository**: Log in to Netlify and connect your Git repository.
2. **Site Settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. **Environment Variables**: Set the frontend environment variables in Netlify's build settings. These must match the `VITE_` prefixed variables from your `.env` file.
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (This is crucial. Set it to the public URL of your deployed backend server from the previous step).
4. **Deploy**: Trigger the deployment. Netlify will build and deploy your site.
5. **Custom Domain (Optional)**: Configure a custom domain for your frontend application if desired.

## 6. Post-Deployment Verification

After both frontend and backend are deployed:

1. **Access Frontend**: Open your deployed frontend application in a web browser.
2. **Test Functionality**:
   - **User Authentication**: Sign up, sign in, sign out.
   - **Market Data**: Verify that market overview, portfolio data, and AI recommendations load correctly.
   - **AI Chat**: Test the AI chat functionality.
   - **User Profile**: Update your user profile.
   - **Portfolio Management**: Add, edit, and delete portfolio holdings.
3. **Monitor Logs**: Check the logs of both your backend and frontend hosting providers for any errors.
4. **Scheduled Tasks**: Ensure the scheduled data ingestion tasks on your backend are running as expected (check backend logs).

## Additional Configuration

### Real-time Updates

The application includes real-time polling for:
- Market data (updates every 60 seconds)
- Portfolio values (updates every 2 minutes)
- AI insights (updates every 5 minutes)
- AI recommendations (updates every 10 minutes)

These intervals can be adjusted in the respective React hooks if needed for production optimization.

### Performance Optimization

For production deployment, consider:

1. **CDN Configuration**: Use a CDN for static assets
2. **Database Indexing**: Ensure proper database indexes are in place (already configured in the schema)
3. **Caching**: Implement Redis caching for frequently accessed data
4. **Rate Limiting**: Adjust rate limits based on expected traffic
5. **Monitoring**: Set up application monitoring and alerting

### Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **CORS**: Ensure CORS is properly configured for your domain
3. **RLS Policies**: Verify Row Level Security policies are working correctly
4. **API Keys**: Rotate API keys regularly
5. **HTTPS**: Ensure all communications use HTTPS in production

By following these steps, your Kenyan Investment Analyzer should be successfully deployed and operational in a production environment.
By following these steps, your MaliGuide application should be successfully deployed and operational in a production environment.