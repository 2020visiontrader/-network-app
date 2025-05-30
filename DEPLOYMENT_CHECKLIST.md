# 🚀 Network App Deployment Checklist

## Pre-Deployment Setup

### 1. 🗄️ Database Setup (Supabase)

- [ ] Create Supabase project at [supabase.com](https://supabase.com)
- [ ] Run SQL migrations in Supabase SQL Editor:
  ```sql
  -- Copy and paste contents of database/new-features.sql
  ```
- [ ] Verify all tables are created:
  - [ ] `users`
  - [ ] `contacts` 
  - [ ] `mastermind_sessions`
  - [ ] `event_suggestions`
  - [ ] `smart_introductions`
- [ ] Enable Row Level Security on all tables
- [ ] Test database connection locally

### 2. 🔑 Environment Variables

- [ ] Copy `.env.example` to `.env.local`
- [ ] Get Supabase credentials:
  - [ ] Project URL from Supabase dashboard
  - [ ] Anon key from Supabase API settings
  - [ ] Service role key (if needed)
- [ ] Update `.env.local` with real values
- [ ] Test app locally with real database

### 3. 🧪 Pre-Deployment Testing

- [ ] Run type checking: `npm run type-check`
- [ ] Run linting: `npm run lint`
- [ ] Build successfully: `npm run build`
- [ ] Test production build: `npm start`
- [ ] Test all major features:
  - [ ] User registration/login
  - [ ] Dashboard loads
  - [ ] Contacts management
  - [ ] Navigation works
  - [ ] Feature flags work correctly

## Deployment Options

### Option 1: 🟢 Vercel (Recommended)

**Quick Deploy:**
```bash
npm run deploy:vercel
```

**Manual Steps:**
1. [ ] Install Vercel CLI: `npm i -g vercel`
2. [ ] Login: `vercel login`
3. [ ] Deploy: `vercel`
4. [ ] Set environment variables in Vercel dashboard
5. [ ] Redeploy: `vercel --prod`

**Environment Variables to Set:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (if needed)

### Option 2: 🔵 Netlify

**Quick Deploy:**
```bash
npm run deploy:netlify
```

**Manual Steps:**
1. [ ] Connect GitHub repo to Netlify
2. [ ] Set build command: `npm run build`
3. [ ] Set publish directory: `.next`
4. [ ] Add environment variables
5. [ ] Deploy

### Option 3: 🟠 Railway

1. [ ] Connect GitHub repo to Railway
2. [ ] Railway auto-detects Next.js
3. [ ] Add environment variables
4. [ ] Deploy automatically

### Option 4: 🟡 DigitalOcean App Platform

1. [ ] Create new app from GitHub
2. [ ] Select Next.js framework
3. [ ] Configure build settings
4. [ ] Add environment variables
5. [ ] Deploy

## Post-Deployment Verification

### 1. 🔍 Functionality Test

- [ ] Visit deployed URL
- [ ] Test user registration
- [ ] Test login/logout
- [ ] Navigate through all pages:
  - [ ] Dashboard
  - [ ] Contacts
  - [ ] Smart Introductions
  - [ ] Hive (AI features)
  - [ ] Masterminds
  - [ ] Calendar
- [ ] Test mobile responsiveness
- [ ] Test feature flags (should show "coming soon" for disabled features)

### 2. 🔒 Security Test

- [ ] Authentication required for protected routes
- [ ] Users can only see their own data
- [ ] No sensitive data in browser console
- [ ] HTTPS enabled (automatic on most platforms)
- [ ] Database policies working correctly

### 3. 📊 Performance Test

- [ ] Page load times acceptable (<3 seconds)
- [ ] Images load properly
- [ ] No console errors
- [ ] Mobile performance good

## Troubleshooting

### Common Issues

**Build Fails:**
- [ ] Check TypeScript errors: `npm run type-check`
- [ ] Check for missing dependencies
- [ ] Verify all imports are correct

**Environment Variables Not Working:**
- [ ] Ensure variables start with `NEXT_PUBLIC_` for client-side
- [ ] Restart deployment after adding variables
- [ ] Check variable names match exactly

**Database Connection Issues:**
- [ ] Verify Supabase URL and keys are correct
- [ ] Check if Supabase project is active
- [ ] Ensure RLS policies allow access
- [ ] Test connection locally first

**404 Errors:**
- [ ] Check if all pages are properly exported
- [ ] Verify routing configuration
- [ ] Ensure dynamic routes are handled

## Quick Commands

```bash
# Test everything locally
npm run type-check && npm run lint && npm run build && npm start

# Deploy to Vercel
npm run deploy:vercel

# Deploy to Netlify  
npm run deploy:netlify

# Build for manual deployment
npm run deploy:manual
```

## Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

## Success! 🎉

Once deployed, your Network app will be live at your chosen domain. Users can:

- ✅ Register and login securely
- ✅ Manage their professional contacts
- ✅ View upcoming masterminds and events
- ✅ See "coming soon" previews for AI features
- ✅ Access all features on mobile and desktop

**Ready to deploy? Start with Vercel for the easiest experience!**

```bash
npm run deploy:vercel
```
