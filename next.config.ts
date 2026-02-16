import type { NextConfig } from "next";

const indexNowKey = process.env.INDEXNOW_API_KEY;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "pbs.twimg.com" },
    ],
  },
  async rewrites() {
    return indexNowKey
      ? [{ source: `/${indexNowKey}.txt`, destination: "/api/indexnow-key" }]
      : [];
  },
  async headers() {
    return [
      {
        source: "/p/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=120, stale-while-revalidate=600",
          },
        ],
      },
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=120, stale-while-revalidate=600",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
