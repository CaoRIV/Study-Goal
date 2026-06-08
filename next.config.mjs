/** @type {import('next').NextConfig} */
const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig = {
  reactStrictMode: true,
  distDir: isDevelopment ? ".next-dev" : ".next-build",
  webpack(config, { dev }) {
    if (dev) {
      config.cache = false;
    }

    return config;
  }
};

export default nextConfig;
