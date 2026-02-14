import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  assetPrefix: process.env.NEXT_PUBLIC_CDN_URL || undefined,
  typedRoutes: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" }
    ]
  },
  async headers() {
    return [
      {
        source: "/p/:slug*",
        headers: [{ key: "Cache-Control", value: "public, s-maxage=120, stale-while-revalidate=600" }]
      },
      {
        source: "/",
        headers: [{ key: "Cache-Control", value: "public, s-maxage=120, stale-while-revalidate=600" }]
      }
    ];
  },
};

export default nextConfig;
