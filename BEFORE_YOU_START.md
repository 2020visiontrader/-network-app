# 🚨 ENVIRONMENT VALIDATION REQUIRED

## Before ANY Testing or Development

**You MUST run this command first:**

```bash
npm run pre-test
```

## If Pre-Test Fails

1. **Environment Issues**: See `ENVIRONMENT_CHECKLIST.md`
2. **Database Issues**: Run `npm run validate-env`
3. **Configuration Issues**: Check `docs/working-configs/environment-setup.md`

## If Pre-Test Passes

```bash
npm run dev          # Start development server
npm run qr           # Generate QR for mobile testing
npm run test-db      # Test database connection
```

## Quick Commands

| Command | Purpose |
|---------|---------|
| `npm run pre-test` | **REQUIRED**: Full validation before testing |
| `npm run validate-env` | Check environment variables only |
| `npm run test-db` | Test database connection |
| `npm run dev` | Start development server |
| `npm run qr` | Generate mobile QR code |

## Critical Files

- `ENVIRONMENT_CHECKLIST.md` - Environment setup guide
- `.env` - Contains Supabase credentials
- `app.json` - Expo configuration with Supabase keys
- `docs/FINAL_STATUS_REPORT.md` - Complete project status

---

**🔒 Security Note**: Never commit `.env` file or share Supabase keys publicly.
