import type { NextConfig } from "next";
import { getApiRewrites } from "../../packages/utils/src/api-config";

import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ["@uxin/artifact-ui", "@uxin/finance", "@uxin/projects", "@uxin/worker-service", "@uxin/shared-employee", "@uxin/agent-lib", "@uxin/types", "streamdown", "@uxin/ui", "@uxin/auth", "@uxin/requirement-lib", "@uxin/utils"],
  experimental: {
    // esmExternals: 'loose'
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
      {
        protocol: "https",
        //https://nextjs.org/docs/messages/next-image-unconfigured-host
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async rewrites() {
    return getApiRewrites();
  },
};

export default nextConfig;
