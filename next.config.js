/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'images.unsplash.com'],
  },
  // Netlify configuration for Next.js runtime
  trailingSlash: false,
};

module.exports = nextConfig;
