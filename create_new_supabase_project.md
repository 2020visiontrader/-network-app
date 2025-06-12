# 🚀 CREATE NEW SUPABASE PROJECT FOR NETWORK APP

## 📋 STEP-BY-STEP INSTRUCTIONS

### 🎯 STEP 1: CREATE PROJECT
1. **🌐 Go to:** https://supabase.com/dashboard (already open)
2. **🆕 Click:** "New Project" button
3. **📝 Fill in details:**
   - **Project Name:** `Network App - Mobile Founder Platform`
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your location
   - **Organization:** Select your organization
4. **⏳ Wait:** 2-3 minutes for project creation

### 🔑 STEP 2: GET PROJECT CREDENTIALS
1. **📊 Go to:** Project Settings → API (left sidebar)
2. **📋 Copy these values:**
   - **Project URL** (starts with https://...)
   - **anon/public key** (starts with eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)
   - **service_role key** (starts with eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)

### 📄 STEP 3: UPDATE .env FILE
Replace the current .env content with your new credentials:

```bash
# NEW SUPABASE PROJECT - MOBILE FOUNDER PLATFORM
SUPABASE_URL=https://YOUR_NEW_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=YOUR_NEW_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_NEW_SERVICE_ROLE_KEY
```

### 📊 STEP 4: DEPLOY DATABASE SCHEMA
1. **🌐 Go to:** SQL Editor in your new Supabase project
2. **📋 Copy:** All contents of `mobile_founder_schema.sql` (631 lines)
3. **📝 Paste:** Into SQL Editor
4. **⚡ Click:** "Run" to deploy all 12 founder tables
5. **✅ Verify:** All tables created successfully

### 🧪 STEP 5: TEST CONNECTION
Run the verification script:
```bash
npm run verify-schema
```

## 🎯 WHAT THIS WILL CREATE

### 📊 DATABASE TABLES (12 total):
1. **founders** - Verified startup founders (250 max)
2. **founder_applications** - Application/vetting system
3. **connections** - Founder networking
4. **coffee_chats** - 1:1 meeting booking
5. **chat_messages** - Chat coordination
6. **device_tokens** - Push notifications
7. **notifications** - Mobile alerts
8. **availability_status** - Real-time status
9. **location_shares** - Location discovery
10. **referrals** - Referral tracking
11. **events** - Founder events
12. **event_attendees** - Event attendance

### 🔐 SECURITY FEATURES:
- ✅ Row Level Security on all tables
- ✅ Founder-only data access
- ✅ 250 founder cap enforcement
- ✅ Coffee chat rate limiting (3/day)
- ✅ Mobile-optimized indexes
- ✅ Real-time triggers and functions

### 📱 MOBILE FEATURES:
- ✅ Push notification infrastructure
- ✅ Real-time status updates
- ✅ Location-based founder discovery
- ✅ Mobile-first architecture
- ✅ Founder application system

## ⚡ QUICK START AFTER SETUP

Once you have the new project credentials:

1. **Update .env** with new credentials
2. **Restart dev server:** `npm run dev`
3. **Test signup:** Create founder application
4. **Test login:** After admin approval
5. **Test features:** Coffee chats, connections, events

## 🎉 BENEFITS OF NEW PROJECT

✅ **Clean database** - No legacy tables  
✅ **Proper founder schema** - Mobile-optimized  
✅ **All features working** - Complete functionality  
✅ **Security enabled** - RLS policies active  
✅ **Performance optimized** - Mobile-first indexes  

---

**📋 Follow these steps and your Network App will be fully functional! 🚀**
