# Network App Deployment Guide

## 🚀 Deployment Options

The Network app can be deployed using several platforms. Here are the recommended options:

### 1. 🟢 Vercel (Recommended - Easiest)

**Why Vercel?**
- Built by Next.js creators
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Perfect for Next.js apps

**Steps:**

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy from project root**
```bash
vercel
```

4. **Follow prompts:**
   - Project name: `network-app`
   - Framework: Next.js (auto-detected)
   - Build command: `npm run build`
   - Output directory: `.next`

5. **Set Environment Variables in Vercel Dashboard:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (if needed)

**Production URL:** `https://network-app.vercel.app`

### 2. 🔵 Netlify

**Steps:**

1. **Connect GitHub Repository**
   - Go to [netlify.com](https://netlify.com)
   - "New site from Git"
   - Connect GitHub account
   - Select repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18.x

3. **Environment Variables**
   - Site settings → Environment variables
   - Add Supabase keys

### 3. 🟠 Railway

**Steps:**

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - "Deploy from GitHub"
   - Select repository

2. **Auto-deployment**
   - Railway auto-detects Next.js
   - Builds and deploys automatically

3. **Environment Variables**
   - Project settings → Variables
   - Add Supabase configuration

### 4. 🟡 DigitalOcean App Platform

**Steps:**

1. **Create App**
   - Go to DigitalOcean control panel
   - Apps → Create App
   - Connect GitHub

2. **Configure Build**
   - Framework: Next.js
   - Build command: `npm run build`
   - Run command: `npm start`

## 🔧 Environment Variables Setup

### Required Variables

Create these in your deployment platform:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Service Role Key (for admin functions)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### Getting Supabase Keys

1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Settings → API
4. Copy:
   - Project URL
   - Anon public key
   - Service role key (if needed)

## 📊 Database Setup

### 1. Run Database Migrations

Execute the SQL files in your Supabase dashboard:

```sql
-- Run these in Supabase SQL Editor:
-- 1. database/schema.sql (if you have it)
-- 2. database/new-features.sql
```

### 2. Set Up Row Level Security

Ensure RLS is enabled on all tables:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mastermind_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_introductions ENABLE ROW LEVEL SECURITY;
-- ... other tables
```

### 3. Create Policies

The policies are already defined in `database/new-features.sql`. Make sure they're applied.

## 🔒 Security Checklist

### Before Going Live

- [ ] Environment variables are set correctly
- [ ] Supabase RLS policies are active
- [ ] No sensitive data in client-side code
- [ ] HTTPS is enabled (automatic on most platforms)
- [ ] Database backups are configured
- [ ] Error monitoring is set up

### Supabase Security

1. **Enable RLS on all tables**
2. **Review all policies**
3. **Rotate keys if needed**
4. **Set up database backups**
5. **Configure auth settings**

## 🚀 Quick Deploy Commands

### Option 1: Vercel (Fastest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Redeploy with env vars
vercel --prod
```

### Option 2: Build and Deploy Manually

```bash
# Build the app
npm run build

# Test production build locally
npm start

# Deploy build folder to your hosting provider
```

## 🔍 Post-Deployment Testing

### 1. Functionality Test

- [ ] User registration works
- [ ] Login/logout works
- [ ] All pages load correctly
- [ ] Database operations work
- [ ] Feature flags work correctly

### 2. Performance Test

- [ ] Page load speeds are acceptable
- [ ] Images load properly
- [ ] Mobile responsiveness works
- [ ] PWA features work (if enabled)

### 3. Security Test

- [ ] Authentication is required for protected routes
- [ ] Users can only access their own data
- [ ] API endpoints are secured
- [ ] No sensitive data exposed

## 🐛 Troubleshooting

### Common Issues

**Build Fails:**
```bash
# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint

# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Environment Variables Not Working:**
- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Restart deployment after adding variables
- Check variable names match exactly

**Database Connection Issues:**
- Verify Supabase URL and keys
- Check if Supabase project is active
- Ensure RLS policies allow access

**404 Errors:**
- Check if all pages are properly exported
- Verify routing configuration
- Ensure dynamic routes are handled

## 📈 Monitoring & Analytics

### Recommended Tools

1. **Vercel Analytics** (if using Vercel)
2. **Google Analytics** for user tracking
3. **Sentry** for error monitoring
4. **Supabase Dashboard** for database monitoring

### Setting Up Monitoring

```typescript
// Add to _app.tsx for error monitoring
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Initialize analytics
    if (typeof window !== 'undefined') {
      // Add your analytics code here
    }
  }, []);

  return <Component {...pageProps} />;
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🎯 Production Optimizations

### Performance

1. **Enable compression** (automatic on most platforms)
2. **Optimize images** with Next.js Image component
3. **Enable caching** for static assets
4. **Use CDN** for global distribution

### SEO

1. **Add meta tags** to all pages
2. **Generate sitemap**
3. **Add robots.txt**
4. **Implement structured data**

## 📞 Support

If you encounter issues:

1. Check deployment platform documentation
2. Review Supabase logs
3. Check browser console for errors
4. Verify environment variables
5. Test locally first

---

**Ready to deploy? Start with Vercel for the easiest experience! 🚀**
