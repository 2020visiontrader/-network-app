/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Netlify configuration
  trailingSlash: false,
};

module.exports = nextConfig;
