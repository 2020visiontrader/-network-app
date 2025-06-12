/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    domains: ['localhost', 'images.unsplash.com'],
    unoptimized: true,
  },
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  trailingSlash: false,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },
  compiler: {
    styledComponents: true
  }
}

module.exports = nextConfig
