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
};

export default nextConfig;
