import type { NextConfig } from "next";
const config: NextConfig = {
  turbopack: { root: process.cwd() },
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  productionBrowserSourceMaps: false,
  generateBuildId: async () => "research-atlas-v1",
};
export default config;
