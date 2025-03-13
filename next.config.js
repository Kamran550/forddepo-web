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
      },
      {
        protocol: process.env.NEXT_PUBLIC_PROTOCOL,
        hostname: process.env.NEXT_PUBLIC_STORAGE_HOSTNAME,
      },
      {
        protocol: process.env.NEXT_PUBLIC_PROTOCOL,
        hostname: "demo-api.foodyman.org",
      },
      {
        protocol: process.env.NEXT_PUBLIC_PROTOCOL,
        hostname: "lh3.googleusercontent.com",
      },
	    {
        protocol: process.env.NEXT_PUBLIC_PROTOCOL,
        hostname: "imageproxy.wolt.com", // Wolt'un image proxy servisi
	pathname: "/**", // Tüm resim yollarını kapsar

      },
    ],
    minimumCacheTTL: 3600,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};



module.exports = nextConfig;

module.exports = withBundleAnalyzer(nextConfig);
