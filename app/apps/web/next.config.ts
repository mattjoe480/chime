import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    images: {
    domains: [
      'lh3.googleusercontent.com',  // For Google profile images
      'avatars.githubusercontent.com',
      "i.pravatar.cc"
    ],
  },
};

export default nextConfig;
