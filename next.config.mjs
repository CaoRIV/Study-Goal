/** @type {import('next').NextConfig} */
const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig = {
  reactStrictMode: true,
  // Keep the developer-owned cache separate from caches created by tools or CI.
  distDir: isDevelopment ? ".next-local" : ".next-build"
};

export default nextConfig;
