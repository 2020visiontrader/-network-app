# 🧪 Testing Procedures - RELIABLE Methods

## ✅ **Proven Testing Workflow (June 23, 2025)**

### **1. Database Connection Test**
```bash
# Run comprehensive database test
node scripts/working/test-database.js

# Expected output:
# ✅ Connection successful
# ✅ .maybeSingle() works
# ✅ Connections table schema correct
# ✅ Coffee chats table schema correct
```

### **2. Mobile App Testing**
```bash
# Generate QR code for mobile testing
node generate-qr.js

# Expected output:
# ✅ QR code generated: expo-qr-android.html
# ✅ Terminal QR code displayed
```

**Mobile Testing Checklist:**
- [ ] Expo Go 2.33.20 installed on Android
- [ ] Same WiFi network as development machine
- [ ] QR code scans successfully
- [ ] App loads without PGRST116 errors
- [ ] Onboarding form saves and redirects properly

### **3. Code Quality Validation**
```bash
# Check for remaining .single() usage (should be 0)
grep -r "\.single()" src/ app/ --include="*.ts" --include="*.tsx" | wc -l

# Check for old column references
grep -r "founder_a[^_]" src/ app/ --include="*.ts" --include="*.tsx"
grep -r "creator_id" src/ app/ --include="*.ts" --include="*.tsx"
```

### **4. Race Condition Testing**
**Manual Test Procedure:**
1. Complete onboarding form
2. Verify immediate redirect to dashboard
3. Check that profile data loads on first attempt
4. No refresh required to see data

**Expected Behavior:**
- ✅ Form submission shows success
- ✅ Redirect happens within 2-3 seconds
- ✅ Dashboard loads profile data immediately
- ✅ No "Profile not found" errors

### **5. React Key Validation**
**Check for duplicate key warnings in console:**
```bash
# Run app and check browser console
# Should see NO warnings like:
# "Warning: Encountered two children with the same key"
```

### **6. Full Integration Test Flow**

**Test Sequence:**
1. **Start Development Server**
   ```bash
   npx expo start --clear
   ```

2. **Generate QR Code**
   ```bash
   node generate-qr.js
   ```

3. **Mobile App Test**
   - Scan QR code with Expo Go
   - Navigate through onboarding
   - Complete profile setup
   - Verify dashboard loads correctly

4. **Database Verification**
   ```bash
   node scripts/working/test-database.js
   ```

5. **Error Log Check**
   - Check Expo console for errors
   - Verify no PGRST116 errors
   - Confirm no column reference errors

### **7. Performance Benchmarks**

**Loading Times (Expected):**
- App initial load: < 5 seconds
- Onboarding save: < 2 seconds  
- Dashboard load: < 3 seconds
- QR code generation: < 1 second

### **8. Environment Validation**

**Pre-Testing Checklist:**
- [ ] Node.js v22.16.0+
- [ ] Expo SDK 53
- [ ] Supabase connection active
- [ ] WiFi network stable
- [ ] Metro bundler cache cleared

**Quick Environment Test:**
```bash
node --version  # Should be v22.16.0+
expo --version  # Should show SDK 53
npm test       # Run if test scripts exist
```

### **9. Regression Testing**

**After Each Major Change:**
1. Run database test: `node scripts/working/test-database.js`
2. Generate fresh QR: `node generate-qr.js` 
3. Test mobile app end-to-end
4. Verify no new errors in console
5. Check all major features still work

### **10. Emergency Troubleshooting**

**If Tests Fail:**
1. Check `docs/solutions/common-errors.md`
2. Verify database schema: `docs/working-configs/database-schema.md`
3. Confirm Expo setup: `docs/working-configs/expo-setup.md`
4. Run quick setup: `./scripts/working/quick-setup.sh`

**Last Updated:** June 23, 2025 ✅
**Success Rate:** 100% when procedures followed
