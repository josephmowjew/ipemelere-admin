/**
 * Next.js configuration with development proxy rewrites.
 * This avoids browser CORS by routing relative /api/v1 requests through Next to the backend origin.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Allow overriding the backend origin via env.
    // Example: API_PROXY_TARGET=http://localhost:3002
    const target = process.env.API_PROXY_TARGET || 'https://www.ganyuipemelere.com/api/v1';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${target}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
