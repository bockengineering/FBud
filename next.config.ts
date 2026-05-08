import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/source-pdf": ["./data/FY2027_Weapons.pdf"],
  },
};

export default nextConfig;
