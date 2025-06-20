# 🔧 FIXING METRO CONNECTION ISSUE

## Common Causes & Solutions

### 1. Network/Firewall Issues
The most common cause is network connectivity between your device and computer.

**Solution**: Try these connection methods:

#### Option A: Use Tunnel Mode (Most Reliable)
```bash
# Stop current server (Ctrl+C in terminal)
# Then restart with tunnel:
npx expo start --tunnel
```

#### Option B: Use LAN Mode with Correct IP
```bash
# Stop current server (Ctrl+C in terminal)  
# Then restart with LAN:
npx expo start --lan
```

#### Option C: Use Web Version (Immediate Testing)
- Press `w` in the Expo terminal
- This opens the app in your browser at http://localhost:8082
- Perfect for testing authentication and onboarding

### 2. Device-Specific Solutions

#### For Physical Device:
1. Ensure device and computer are on same WiFi network
2. Try scanning QR code again
3. In Expo Go app: Settings > Connection > Switch between LAN/Tunnel
4. Check if firewall is blocking port 8082

#### For iOS Simulator:
1. Press `i` in Expo terminal to open simulator
2. If simulator not installed: Install Xcode from App Store
3. Alternative: Use web version with `w`

#### For Android Emulator:
1. Press `a` in Expo terminal to open emulator
2. If no emulator: Install Android Studio
3. Alternative: Use web version with `w`

### 3. Immediate Fix: Use Web Version
Since you need to test authentication:
1. Press `w` in the Expo terminal
2. Browser will open at http://localhost:8082
3. Test signup/login/onboarding in browser
4. This bypasses all connection issues

### 4. Metro Cache Issues
If Metro bundler has issues:
```bash
# Clear Metro cache
npx expo start --clear
# or
npx expo r --clear
```

---

**Quick Fix**: Press `w` in your terminal to test the app in browser immediately while we set up the other components.
