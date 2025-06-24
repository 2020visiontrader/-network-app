# Environment Variables Setup Guide

## 🔧 Required Environment Variables

Before running any tests, development servers, or scripts, you **MUST** ensure these environment variables are properly configured:

### Primary Variables (Required)

| Variable | Description | Format | Example |
|----------|-------------|---------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://[project-id].supabase.co` | `https://abcd1234.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | JWT token starting with `eyJ` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Secondary Variables (Optional)

| Variable | Description | When Needed |
|----------|-------------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations | Database migrations, RLS policy updates |

## 📋 Environment Setup Checklist

### ✅ Pre-Test Validation Checklist

**ALWAYS run this checklist before any testing or development:**

1. **Environment File Exists**
   ```bash
   ls -la .env
   ```
   ✅ Should show `.env` file in project root

2. **Validate Environment Variables**
   ```bash
   node scripts/working/env-validator.js
   ```
   ✅ Should show "ALL REQUIRED ENVIRONMENT VARIABLES ARE VALID"

3. **Test Database Connection**
   ```bash
   npm run test-db
   ```
   ✅ Should connect successfully to Supabase

4. **Verify Expo Configuration**
   ```bash
   cat app.json | grep -A 5 "extra"
   ```
   ✅ Should show supabaseUrl and supabaseAnonKey in extra section

### 🚨 Critical Rules

- **NEVER run tests without validating environment variables first**
- **NEVER commit real Supabase keys to version control**
- **ALWAYS use the env-validator script before testing**
- **ALWAYS check that URLs don't have trailing slashes**

## 🔧 How to Get Supabase Credentials

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to API Settings**
   - Left sidebar → Settings → API

3. **Copy Required Values**
   - **Project URL**: Copy the URL (starts with `https://`)
   - **anon public**: Copy the `anon` key (starts with `eyJ`)
   - **service_role**: Copy for admin operations (optional)

## 📄 .env File Template

Create/update your `.env` file with:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# App Configuration  
EXPO_PUBLIC_APP_NAME=Network Founder App
EXPO_PUBLIC_API_URL=https://your-project-id.supabase.co

# Development Settings
EXPO_PUBLIC_DEBUG_MODE=true

# Optional: For admin operations only
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 🧪 Environment Validation Commands

```bash
# Full environment validation
node scripts/working/env-validator.js

# Quick database test
npm run test-db

# Test mobile app connection
npm run dev
npm run generate-qr

# Validate all services
npm run test-system
```

## 🚨 Common Environment Issues

### Issue: "Missing Supabase environment variables"
**Solution**: Run `node scripts/working/env-validator.js` and fix reported issues

### Issue: "Invalid URL format"
**Solution**: Ensure URL is `https://projectid.supabase.co` (no trailing slash)

### Issue: "Invalid key format"
**Solution**: Ensure key starts with `eyJ` and is the full JWT token

### Issue: "Connection failed"
**Solution**: 
1. Verify credentials in Supabase dashboard
2. Check project is not paused
3. Confirm correct project selected

## 📝 Development Workflow

1. **Before Starting Development**
   ```bash
   node scripts/working/env-validator.js
   ```

2. **Before Running Tests**
   ```bash
   node scripts/working/env-validator.js
   npm run test-db
   ```

3. **Before Mobile Testing**
   ```bash
   node scripts/working/env-validator.js
   npm run generate-qr
   ```

4. **Before Deployment**
   ```bash
   node scripts/working/env-validator.js
   npm run test-system
   ```

## 🔒 Security Notes

- Environment variables are automatically excluded from git via `.gitignore`
- Never share your service role key publicly
- Rotate keys if accidentally exposed
- Use different projects for development/production

## 📞 Troubleshooting

If you encounter issues:

1. Run the environment validator first
2. Check the FINAL_STATUS_REPORT.md for known solutions
3. Verify Supabase project settings match your .env file
4. Ensure no extra spaces or characters in environment values
