import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Workspace packages ship compiled JS, but keep these transpiled so a
  // change in `packages/*/src` is picked up without a rebuild during dev.
  transpilePackages: ['@gorosary/content', '@gorosary/ui'],
};

export default nextConfig;
