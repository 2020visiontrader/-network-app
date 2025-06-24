# Network App - Mobile Founder Platform

A mobile-first networking platform for the first 250 startup founders (free tier).

## 🎯 Platform Overview

**Exclusive founder networking** with mobile-optimized features:
- 📝 **Founder Applications** (admin approval required)
- ☕ **Coffee Chat Booking** (3/day rate limit)
- 🤝 **Founder Connections** (verified founders only)
- 📅 **Founder Events** (networking, demo days)
- 📱 **Push Notifications** (mobile-optimized)
- 🔐 **Row Level Security** (founder-only data access)
- 🔢 **250 Founder Cap** (free tier limit)

## 🚀 Quick Start

1. **Deploy Database Schema:**
   ```bash
   # Execute mobile_founder_schema.sql in Supabase Dashboard
   # Then verify deployment:
   npm run verify-schema
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   ```bash
   # Update .env with your Supabase credentials
   SUPABASE_URL=your_project_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   ```

4. **Development:**
   ```bash
   npm run dev:mobile
   ```

## 📱 Mobile-First Architecture

- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **Frontend:** Next.js App Router (mobile-responsive)
- **Styling:** Tailwind CSS (dark theme)
- **Deployment:** Netlify
- **Database:** 12 founder-specific tables with RLS

## 🔐 Founder-Only Features

- **250 member cap** with auto-numbering
- **Application vetting** system
- **Coffee chat rate limiting** (3 per day)
- **Push notification** infrastructure
- **Real-time status** updates
- **Location-based** founder discovery

## 📊 Database Schema

Core tables for mobile founder platform:
- `founders` - Verified startup founders (250 max)
- `founder_applications` - Application/vetting system
- `coffee_chats` - 1:1 meeting booking
- `connections` - Founder networking
- `notifications` - Mobile alerts
- `events` - Founder meetups
- `device_tokens` - Push notifications
- `availability_status` - Real-time status

## 🌐 Deployment

Deploy to Netlify:
```bash
npm run build
# Deploy to https://appnetwork.netlify.app
```

## 🔒 Advanced Data Protection & Stability

The application implements several advanced patterns to ensure data reliability:

- **UUID Validation** - All user IDs use proper UUID format for database compatibility
- **Circuit Breaker Pattern** - Prevents cascade failures during system overload
- **Queue-based Processing** - Sequential operation processing to prevent race conditions
- **Real-time Listeners** - React to database changes instead of polling
- **Server-side Verification** - Scheduled jobs to ensure data consistency

Learn more in the documentation:
- [Advanced Race Condition Patterns](docs/solutions/advanced-race-condition-patterns.md)
- [UUID Usage in Tests](docs/solutions/uuid-test-ids.md)

## 🎯 Target Users

**Startup founders only** - curated community of 250 verified founders building the next generation of companies.
