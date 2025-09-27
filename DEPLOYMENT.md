# TaxWise Deployment Guide

This guide covers deploying the TaxWise platform to production using Vercel (frontend) and Supabase (backend).

## 🏗️ Architecture Overview

```
Frontend (Vercel) → Supabase Edge Functions → Supabase Database
```

- **Frontend**: React SPA hosted on Vercel
- **Backend**: Supabase Edge Functions (Hono.js server)
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage for file uploads

## 🚀 Deployment Steps

### Step 1: Prepare Your Supabase Project

1. **Create a Supabase project** at https://supabase.com
2. **Note down your credentials**:
   - Project URL: `https://your-project-ref.supabase.co`
   - Anon Key: Found in Project Settings → API
   - Service Role Key: Found in Project Settings → API (keep secret!)

### Step 2: Deploy Backend (Supabase Edge Functions)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize Supabase in your project (if not done)
supabase init

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the edge function
supabase functions deploy server

# Set environment secrets for edge function
supabase secrets set SUPABASE_URL=https://your-project-ref.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Deploy Frontend (Vercel)

#### Option A: GitHub Integration (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it as a Vite project

3. **Configure Environment Variables** in Vercel dashboard:
   - Go to your project settings in Vercel
   - Navigate to "Environment Variables"
   - Add the following variables:
   ```
   VITE_SUPABASE_URL = https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key
   ```
   - Make sure to set them for "Production", "Preview", and "Development" environments

4. **Deploy**: Vercel will automatically deploy on push to main

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

### Step 4: Configure Custom Domain (Optional)

1. **In Vercel Dashboard**:
   - Go to your project settings
   - Click "Domains"
   - Add your custom domain
   - Configure DNS records as shown

2. **SSL Certificate**: Automatically provisioned by Vercel

## 🔧 Environment Variables

### Frontend (.env.local for development)
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (Supabase Secrets)
```bash
supabase secrets set SUPABASE_URL=https://your-project-ref.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
```

## 🏥 Health Checks

After deployment, verify these endpoints:

1. **Frontend**: https://your-app.vercel.app
2. **Backend Health**: https://your-project-ref.supabase.co/functions/v1/make-server-76b9cb10/health
3. **Database**: Check in Supabase dashboard

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails on Vercel**:
   - Check build logs for missing dependencies
   - Ensure all imports are correct
   - Verify TypeScript configuration

2. **Environment Variables Not Working**:
   - Prefix frontend variables with `VITE_`
   - Redeploy after adding environment variables
   - Check variable names match exactly

3. **CORS Issues**:
   - Verify backend CORS configuration
   - Check allowed origins in Supabase settings
   - Ensure API calls use correct URLs

4. **Edge Function Errors**:
   - Check function logs: `supabase functions logs server`
   - Verify environment secrets are set
   - Test locally: `supabase functions serve`

### Debug Commands

```bash
# Check Supabase connection
supabase status

# View edge function logs
supabase functions logs server --follow

# Test edge function locally
supabase functions serve server

# Verify Vercel deployment
vercel logs
```

## 📊 Monitoring

### Production Monitoring

1. **Vercel Analytics**: Automatically enabled
2. **Supabase Dashboard**: Monitor API usage, database performance
3. **Error Tracking**: Check browser console for frontend errors
4. **Performance**: Use Lighthouse for performance audits

### Key Metrics to Monitor

- **Frontend**: Load time, error rate, user engagement
- **Backend**: API response times, edge function invocations
- **Database**: Query performance, storage usage
- **Authentication**: Login success rate, session duration

## 🔄 CI/CD Pipeline

### Automatic Deployment

1. **Push to main branch** → Vercel auto-deploys frontend
2. **Update edge functions** → Manual deploy with `supabase functions deploy`
3. **Database changes** → Manual migration via Supabase dashboard

### Recommended Workflow

```bash
# Development
git checkout -b feature/new-feature
# Make changes
git commit -m "Add new feature"
git push origin feature/new-feature
# Create PR, merge to main

# Production deployment
git checkout main
git pull origin main
# Deploy edge functions if changed
supabase functions deploy server
# Frontend auto-deploys via Vercel
```

## 🚨 Security Checklist

- [ ] Environment variables are properly configured
- [ ] Service role key is only used in backend
- [ ] CORS is properly configured
- [ ] API routes are protected with authentication
- [ ] File uploads have proper validation
- [ ] Rate limiting is enabled (via Supabase)

## 📱 Mobile & Performance

- **PWA Support**: Consider adding PWA manifest
- **Performance**: Optimize images, lazy load components
- **Mobile**: Test on various devices and screen sizes
- **Offline**: Implement offline capabilities where needed

## 🆙 Updates & Maintenance

### Regular Maintenance

1. **Dependencies**: Update npm packages regularly
2. **Security**: Monitor for security advisories
3. **Monitoring**: Review performance metrics weekly
4. **Backups**: Supabase handles automatic backups
5. **Testing**: Run tests before major updates

### Scaling Considerations

- **Database**: Monitor connection limits and performance
- **Edge Functions**: Check invocation limits
- **Storage**: Monitor storage usage and costs
- **CDN**: Leverage Vercel's global CDN

---

**🎉 Your TaxWise platform is now live and ready for users!**

For additional support, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TaxWise GitHub Repository](https://github.com/your-repo)