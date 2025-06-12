/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Changed from 'export' to handle API routes
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
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
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }
};

module.exports = nextConfig;
