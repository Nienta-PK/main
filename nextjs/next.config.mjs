/** @type {import('next').NextConfig} */

const API_URL = "http://fastapi:8000";

const nextConfig = {
  reactStrictMode: true, //Normally true
  // output: 'export',
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      // Exclude /api/auth/* from being rewritten to FastAPI
      {
        source: "/api/auth/:path*",
        destination: "/api/auth/:path*", // Remain within Next.js
      },
      // Proxy other /api/* requests to FastAPI
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 800,
      aggregateTimeout: 300,
    };
    return config;
  },
};

export default nextConfig;
