/** @type {import('next').NextConfig} */

// Explicit origins prevent the image optimizer from fetching arbitrary remote URLs.
const origins = [
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
  ...(process.env.NEXT_PUBLIC_MEDIA_ORIGINS || '').split(',').filter(Boolean),
];
const remotePatterns = origins.map((origin) => {
  const url = new URL(origin.trim());
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error(`Invalid media origin: ${origin}`);
  }
  return { protocol: url.protocol.slice(0, -1), hostname: url.hostname, port: url.port, pathname: '/**' };
});

const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },

  images: {
    remotePatterns,
  },

  reactStrictMode: true,
};

export default nextConfig;
