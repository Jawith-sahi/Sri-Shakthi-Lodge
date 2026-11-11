import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");

// Allow next/image to optimise pictures served by the .NET API / media host.
// Add extra hosts (comma separated) with NEXT_PUBLIC_IMAGE_HOSTS, e.g. "cdn.example.com".
function buildRemotePatterns() {
  const patterns = [];
  const add = (value) => {
    try {
      const url = new URL(value.includes("://") ? value : `https://${value}`);
      patterns.push({
        protocol: url.protocol.replace(":", ""),
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
      });
    } catch {
      /* ignore invalid entries */
    }
  };
  if (process.env.NEXT_PUBLIC_API_BASE_URL) add(process.env.NEXT_PUBLIC_API_BASE_URL);
  (process.env.NEXT_PUBLIC_IMAGE_HOSTS || "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean)
    .forEach(add);
  return patterns;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      ...buildRemotePatterns(),
      {
        protocol: "http",
        hostname: "localhost",
        port: "5005",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5005",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async rewrites() {
    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5005").replace(/\/+$/, "");
    return [
      {
        source: "/uploads/:path*",
        destination: `${apiBase}/uploads/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
