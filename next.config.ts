import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Local /public images don't need a domain — unoptimized allows them
    // to render without a loader while staying in the Next.js Image component.
    unoptimized: true,
  },
};

export default nextConfig;
