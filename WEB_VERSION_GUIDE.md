# NetworkFounderApp Web Versions

This guide explains how to run and build web versions of the NetworkFounderApp for both SDK 51 and SDK 53.

## Project Setup

The project is configured to support both Expo SDK 51 and SDK 53, with the ability to switch between them. For the web version, we've added configuration files and scripts to make it easy to develop and build for both SDK versions.

## Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

## Web Development

### SDK 51 Web Version

To start the development server for the SDK 51 web version:

```bash
# Using the helper script
./web-setup.sh 51

# Or manually
./switch-sdk.sh 51
npm run web
```

This will open the web version in your browser at http://localhost:8082.

### SDK 53 Web Version

To start the development server for the SDK 53 web version:

```bash
# Using the helper script
./web-setup.sh 53

# Or manually
./switch-sdk.sh 53
npm run web
```

## Building for Production

### Build SDK 51 Web Version

To build the SDK 51 web version for production:

```bash
# Using the helper script
./web-setup.sh 51 build

# Or manually
./switch-sdk.sh 51
npx expo export:web
```

The build will be created in the `web-build` directory.

### Build SDK 53 Web Version

To build the SDK 53 web version for production:

```bash
# Using the helper script
./web-setup.sh 53 build

# Or manually
./switch-sdk.sh 53
npx expo export:web
```

## Testing the Production Build

To test the production build locally:

```bash
# Install serve if you don't have it
npm install -g serve

# Serve the build
serve web-build
```

This will start a local server at http://localhost:3000 with your production build.

## Web Configuration

The web configuration is defined in the following files:

- `app.json` - Contains web-specific settings under the `web` key
- `webpack.config.js` - Custom webpack configuration for web builds
- `web/index.html` - Custom HTML template for web builds

## Switching Between SDK Versions

To switch between SDK versions:

```bash
# Switch to SDK 51
./switch-sdk.sh 51

# Switch to SDK 53
./switch-sdk.sh 53
```

After switching, you may need to run `npm install --legacy-peer-deps` to update dependencies.

## Troubleshooting

### Port Conflicts

If the default port (8081 or 8082) is already in use, Expo will prompt you to use a different port.

### Dependencies Issues

If you encounter dependency issues:

```bash
npx expo-doctor
npx expo install [package-name]@[version]
```

### Build Errors

If you encounter build errors, check the console output for details. Common issues include:

- Missing dependencies
- Incompatible package versions
- Syntax errors in code

Try cleaning the cache and node_modules:

```bash
rm -rf node_modules
rm -rf web-build
npm cache clean --force
npm install --legacy-peer-deps
```
