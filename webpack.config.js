// webpack.config.js
const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = async function (env, argv) {
  // Create the default Expo webpack config
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          '@react-native',
          'react-native-vector-icons',
          // Add any modules that need to be transpiled here
        ],
      },
    }, 
    argv
  );
  
  // Customize the config to fix web issues
  config.resolve.alias = {
    ...config.resolve.alias,
    // Use web versions of React Native packages when available
    'react-native$': 'react-native-web',
    '@react-native': '@react-native-web',
    // Add path alias for @
    '@': path.resolve(__dirname, 'src'),
  };

  // Add TypeScript support
  config.resolve.extensions = [
    '.web.tsx', '.web.ts', '.tsx', '.ts', '.web.jsx', '.web.js', '.jsx', '.js',
    ...config.resolve.extensions
  ];
  
  // Set the entry point specifically for web
  config.entry = [
    path.resolve(__dirname, 'index.web.js')
  ];
  
  // Make sure we're using the correct HTML template
  if (config.plugins) {
    for (let i = 0; i < config.plugins.length; i++) {
      const plugin = config.plugins[i];
      if (plugin instanceof HtmlWebpackPlugin) {
        plugin.options.template = path.resolve(__dirname, 'index.html');
        break;
      }
    }
  }
  
  return config;
};
