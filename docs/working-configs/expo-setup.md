# 📱 Expo Setup - WORKING Configuration

## ✅ **Confirmed Working Setup (June 23, 2025)**

### **Environment Details**
- **Expo SDK:** 53.0.0
- **Expo Go Version:** 2.33.20 (Android)
- **Node Version:** v22.16.0
- **Platform:** macOS → Android testing

### **Working Expo Commands**
```bash
# Start Expo (WORKS - use this method)
npx expo start --clear

# For mobile testing (LOCAL NETWORK - more reliable than tunnel)
npx expo start --clear
# Then use the LAN URL format: exp://192.168.0.102:8081

# If tunnel needed (backup method)
npx expo start --tunnel
```

### **QR Code Generation**
- **Method:** Use `generate-qr.js` script in project root
- **URL Format:** `exp://[LOCAL_IP]:8081` (NOT tunnel URLs)
- **Testing:** Android Expo Go app, scan QR or paste URL directly

### **app.json Configuration (WORKING)**
```json
{
  "expo": {
    "name": "Network Founder App",
    "slug": "network-founder-app",
    "version": "1.0.0",
    "sdkVersion": "53.0.0",
    "platforms": ["ios", "android", "web"],
    "orientation": "portrait"
  }
}
```

### **Known Issues & Solutions**
- ❌ **Tunnel URLs often fail** → Use local network IP instead
- ❌ **Metro bundler cache issues** → Always use `--clear` flag
- ✅ **Local network reliable** → Ensure same WiFi network

### **Mobile Testing Workflow**
1. Start Expo: `npx expo start --clear`
2. Run QR generator: `node generate-qr.js`
3. Open generated HTML file in browser
4. Scan QR with Expo Go or paste URL directly

**Last Verified:** June 23, 2025 ✅
