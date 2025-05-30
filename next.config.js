/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Netlify configuration for Next.js runtime
  trailingSlash: false,
};

module.exports = nextConfig;
