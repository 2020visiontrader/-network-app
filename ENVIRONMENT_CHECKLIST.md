# ENVIRONMENT VARIABLES CHECKLIST

## 🚨 CRITICAL: RUN BEFORE ANY TESTING

**You MUST validate environment variables before running any tests, scripts, or development servers.**

### Quick Validation Commands

```bash
# Full pre-test checklist (RECOMMENDED)
npm run pre-test

# Environment variables only
npm run validate-env

# Database connection test
npm run test-db
```

## 📋 Required Environment Variables

### ✅ Primary Variables (REQUIRED)

| Variable | Value | Status |
|----------|-------|--------|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://projectid.supabase.co` | ❗ Must be set |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI...` | ❗ Must be set |

### ⚪ Secondary Variables (OPTIONAL)

| Variable | Purpose | When Needed |
|----------|---------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Admin operations | Database migrations, RLS updates |
| `EXPO_PUBLIC_DEBUG_MODE` | Debug logging | Development only |

## 🔧 How to Set Up Environment Variables

### Step 1: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to: **Settings** → **API**
4. Copy:
   - **Project URL** (URL section)
   - **anon public** key (API Keys section)

### Step 2: Update .env File

Create/update `.env` in project root:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# App Configuration  
EXPO_PUBLIC_APP_NAME=Network Founder App
EXPO_PUBLIC_API_URL=https://your-project-id.supabase.co

# Development Settings
EXPO_PUBLIC_DEBUG_MODE=true
```

### Step 3: Update app.json

Ensure `app.json` has Supabase configuration:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://your-project-id.supabase.co",
      "supabaseAnonKey": "your_anon_key_here"
    }
  }
}
```

### Step 4: Validate Configuration

```bash
npm run pre-test
```

## 🚨 Common Issues & Solutions

### Issue: "Missing Supabase environment variables"

**Cause**: `.env` file missing or incorrect variable names

**Solution**: 
1. Check `.env` file exists in project root
2. Verify variable names match exactly (case-sensitive)
3. Run `npm run validate-env` for detailed diagnosis

### Issue: "Invalid URL format"

**Cause**: URL doesn't match required pattern

**Solution**:
- Ensure URL is `https://projectid.supabase.co`
- No trailing slashes
- No extra characters or spaces

### Issue: "Invalid key format"

**Cause**: Supabase key is incomplete or wrong type

**Solution**:
- Ensure key starts with `eyJ`
- Use the full JWT token (very long string)
- Copy from correct section in Supabase dashboard

### Issue: "Connection failed"

**Cause**: Invalid credentials or project issues

**Solution**:
1. Verify credentials in Supabase dashboard
2. Check project is not paused
3. Confirm you're using the correct project

## 📝 Testing Workflow

### Before Any Development

```bash
# 1. Validate environment
npm run pre-test

# 2. If validation passes, start development
npm run dev
```

### Before Running Tests

```bash
# 1. Full environment check
npm run pre-test

# 2. Run specific tests
npm run test-db
node scripts/working/test-database.js
```

### Before Mobile Testing

```bash
# 1. Validate environment
npm run pre-test

# 2. Generate QR code
npm run qr

# 3. Start development server
npm run dev
```

## 🔒 Security Best Practices

- ✅ `.env` file is in `.gitignore` (never commit)
- ✅ Use different projects for dev/production
- ✅ Rotate keys if accidentally exposed
- ✅ Never share service role keys publicly

## 📞 Help & Troubleshooting

If you encounter persistent issues:

1. **Run the environment validator**: `npm run validate-env`
2. **Check documentation**: `docs/working-configs/environment-setup.md`
3. **Review status report**: `docs/FINAL_STATUS_REPORT.md`
4. **Verify Supabase project settings** match your configuration

## ⚡ Quick Reference

```bash
# Essential commands (run in order)
npm run pre-test      # Validate everything
npm run dev          # Start development  
npm run qr           # Generate mobile QR
npm run test-db      # Test database

# Troubleshooting commands
npm run validate-env # Check environment variables only
npm run test-race    # Test race condition fixes
cat .env            # View current environment file
cat app.json | grep -A 5 "extra"  # Check app.json config
```
