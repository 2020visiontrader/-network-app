# 📚 NetworkFounder App - Working Configurations & Solutions

This folder contains all TESTED and WORKING configurations, solutions, and scripts for the NetworkFounder App. Reference these when starting new development sessions or debugging issues.

## � CRITICAL: Always Run Pre-Test Checklist

**Before ANY testing or development:**

```bash
npm run pre-test
```

This validates environment variables, database connection, and project configuration. **Never skip this step.**

## �📁 Directory Structure

### `/docs/working-configs/`
- `environment-setup.md` - **CRITICAL**: Environment variables setup and validation
- `expo-setup.md` - Working Expo Go configuration for Android
- `database-schema.md` - Confirmed database table structures and column names  
- `supabase-setup.md` - Working Supabase connection and RLS policies

### `/docs/solutions/`
- `common-errors.md` - Known errors and their proven solutions
- `database-fixes.md` - All applied database fixes and migrations
- `code-patterns.md` - Working code patterns and best practices
- `testing-procedures.md` - Reliable testing methods and scripts

### `/scripts/working/`
- `env-validator.js` - **REQUIRED**: Environment variable validation
- `pre-test-checklist.sh` - **REQUIRED**: Complete pre-test validation
- `test-database.js` - Database connection and schema validation
- `generate-qr.js` - Reliable QR code generator for mobile testing
- `quick-setup.sh` - Environment setup automation

## 🚀 Quick Start Reference

**To start development session:**

1. **ALWAYS run pre-test checklist:**
   ```bash
   npm run pre-test
   ```

2. **If checklist passes, start development:**
   ```bash
   npm run dev
   npm run qr
   ```

3. **For troubleshooting:**
   - Check `ENVIRONMENT_CHECKLIST.md` for environment issues
   - Reference `/docs/solutions/common-errors.md` for other problems

**Last Updated:** June 23, 2025
**Status:** All configurations tested and working ✅
