import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/studio/index.html" },
        { source: "/about", destination: "/studio/about.html" },
        { source: "/culture", destination: "/studio/culture.html" },
        { source: "/careers", destination: "/studio/careers.html" },
        { source: "/careers/video-editor", destination: "/studio/career-video-editor.html" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [{
      source: "/version-zero/:path*",
      headers: [{ key: "X-Robots-Tag", value: "noindex" }],
    }];
  },
};

export default nextConfig;
