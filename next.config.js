/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'images.unsplash.com'],
  },
  // Netlify configuration for Next.js runtime
  trailingSlash: false,
  // Experimental features for better hydration
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },
  // Suppress hydration warnings for browser extensions
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
};

module.exports = nextConfig;
