import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const isProduction = process.env.NODE_ENV === "production";

    const baseHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
    ];

    const prodHeaders = isProduction
      ? [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ]
      : [];

    return [
      {
        source: "/(.*)",
        headers: [...baseHeaders, ...prodHeaders],
      },
    ];
  },
};

export default nextConfig;
