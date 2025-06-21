// metro.config.js
// Metro configuration for React Native and Expo SDK 53
const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add any additional configuration here
defaultConfig.resolver.sourceExts = [
  ...defaultConfig.resolver.sourceExts,
  'mjs',
  'cjs',
];

// Ensure the Metro bundler handles all file types correctly
defaultConfig.resolver.assetExts = [
  ...defaultConfig.resolver.assetExts,
  'pem',
  'db'
];

module.exports = defaultConfig;
