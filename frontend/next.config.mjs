/** @type {import('next').NextConfig} */

const nextConfig = {
  serverExternalPackages: ['pg', 'pg-connection-string'],

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
    // ✅ 新增：显式允许 Next.js 优化本地/私有 IP 地址上的图片（防止 localhost 被解析为 ::1 拦截）
    dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
    remotePatterns: [
      // ✅ 本地 Strapi 图片
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/**',
      },
      // 保留你原有规则：任意 https 图片
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
    ],
  },

  reactStrictMode: true,
};

export default nextConfig;
