# NetworkFounderApp SDK and Web Guide

This guide provides comprehensive instructions for managing both SDK 51 and SDK 53 versions of the NetworkFounderApp, including mobile and web builds.

## Project Structure

The project is set up to support both Expo SDK 51 and SDK 53, with the ability to switch between them seamlessly. Configuration files for both SDKs are maintained separately.

## SDK Management

### Switching Between SDK Versions

Use the `switch-sdk.sh` script to switch between SDK versions:

```bash
# Switch to SDK 51
./switch-sdk.sh 51

# Switch to SDK 53
./switch-sdk.sh 53
```

After switching, you may need to run `npm install --legacy-peer-deps` to update dependencies.

## Mobile Development

### QR Codes for Mobile Testing

Generate QR codes for testing on mobile devices:

```bash
# For SDK 51
node generate-sdk51-qr.js

# For SDK 53
node sdk53-generate-qr.js
```

The QR codes and URLs will be saved to:
- `expo-sdk51-qr-code-port8082.html` (for SDK 51)
- `expo-sdk53-qr-code.html` (for SDK 53)

### Starting the Development Server

Start the Expo development server:

```bash
# For SDK 51 (after switching)
npx expo start

# For SDK 53 (after switching)
npx expo start
```

## Web Development

### Starting Web Development Server

Start the web development server:

```bash
# For SDK 51
./web-setup.sh 51

# For SDK 53
./web-setup.sh 53
```

This will start a development server at:
- http://localhost:8082 (or another port if 8082 is in use)

### Building Web Versions

Build the web version for production:

```bash
# For SDK 51
./build-web.sh 51

# For SDK 53
./build-web.sh 53
```

This will create builds in:
- `web-build-sdk51` (for SDK 51)
- `web-build-sdk53` (for SDK 53)

### Testing Web Builds

To test the web builds locally:

```bash
# For SDK 51
npx serve web-build-sdk51

# For SDK 53
npx serve web-build-sdk53
```

## Configuration Files

- `package.json` - Main package configuration
- `app.json` - Expo configuration
- `webpack.config.js` - Custom webpack configuration for web builds
- `index.web.js` - Web-specific entry point
- `web/index.html` - Custom HTML template for web builds

## Helper Scripts

- `switch-sdk.sh` - Switch between SDK 51 and SDK 53
- `generate-sdk51-qr.js` - Generate QR code for SDK 51
- `sdk53-generate-qr.js` - Generate QR code for SDK 53
- `web-setup.sh` - Set up and start web development
- `build-web.sh` - Build web versions

## Troubleshooting

### Common Issues

1. **Port Conflicts**: If the default ports are in use, accept the prompt to use another port or specify one:
   ```bash
   npx expo start --port 8084
   ```

2. **Dependency Issues**: Use the legacy-peer-deps flag:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Web Build Issues**: Ensure all web dependencies are installed:
   ```bash
   npm install --save react-native-web@~0.19.6 @expo/metro-runtime@~3.2.3 --legacy-peer-deps
   ```

4. **Clean Install**: If all else fails, try a clean install:
   ```bash
   rm -rf node_modules
   rm -rf web-build*
   npm cache clean --force
   npm install --legacy-peer-deps
   ```

## Maintaining Both Versions

- Always commit changes to both SDK versions when making significant updates
- Test both versions thoroughly before deployment
- Keep backup files (*.sdk51, *.sdk53-backup) in sync with active configurations
