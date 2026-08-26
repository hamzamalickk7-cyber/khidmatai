import type { NextConfig } from "next";
import path from "node:path";

const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/$/, "");

if (!backendApiUrl) {
  throw new Error("NEXT_PUBLIC_BACKEND_API_URL is required.");
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  outputFileTracingRoot: path.resolve(process.cwd(), ".."),
  turbopack: { root: path.resolve(process.cwd(), "..") },
  images: { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }] },
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${backendApiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
