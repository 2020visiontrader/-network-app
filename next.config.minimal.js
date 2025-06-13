/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: 'build',
  experimental: {
    optimizeCss: false
  },
  // Headers for proper MIME types
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/html; charset=utf-8',
          },
        ],
      },
    ];
  }
}

module.exports = nextConfig
