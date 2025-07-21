/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: process.env.NEXT_PUBLIC_PROTOCOL,
        hostname: process.env.NEXT_PUBLIC_API_HOSTNAME,
        pathname: '/**'
      },
      {
        protocol: process.env.NEXT_PUBLIC_PROTOCOL,
        hostname: process.env.NEXT_PUBLIC_STORAGE_HOSTNAME,
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'demo-api.foodyman.org',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'imageproxy.wolt.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'cdn.getqo.az',
        pathname: '/**'
      }
    ],
    minimumCacheTTL: 3600,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};



module.exports = nextConfig;

module.exports = withBundleAnalyzer(nextConfig);
