import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // versione mostrata nelle impostazioni (Vercel imposta lo SHA del commit)
    NEXT_PUBLIC_BUILD_ID: (process.env.VERCEL_GIT_COMMIT_SHA ?? "locale").slice(0, 7),
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
