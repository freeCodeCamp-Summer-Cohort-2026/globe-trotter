import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import path from "node:path";

loadEnvConfig(path.resolve(process.cwd(), "../../"), undefined, undefined, true);

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  output: "standalone",
};

export default nextConfig;