import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/studio',
        destination: '/studio/structure',
        permanent: false,
      },
    ]
  },

  // Serve WebP/AVIF to modern browsers, aggressively cache optimized images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year
  },

  // Long-lived cache headers for static room images
  async headers() {
    return [
      {
        source: '/rooms/:file*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
