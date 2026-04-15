import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '*.worf.replit.dev',
    '*.replit.dev',
    '*.kirk.replit.dev',
    '*.replit.app',
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ["localhost:5000", process.env.REPLIT_DOMAINS || ""] },
  },
};

export default nextConfig;
