/** @type {import('next').NextConfig} */
const isDevelopment = process.env.NODE_ENV === "development";
const devDistDir = process.env.NEXT_DEV_DIST_DIR || ".next-local-current";

const nextConfig = {
  reactStrictMode: true,
  // Keep the developer-owned cache separate from caches created by tools or CI.
  distDir: isDevelopment ? devDistDir : ".next-build"
};

export default nextConfig;
