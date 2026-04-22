import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // 关键新增：显式允许 Next.js 优化本地/私有 IP 地址上的图片
    // 建议只在开发环境中开启，生产环境如果不直连内网 IP，可以改为 false
    dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      // 如果你有生产环境的域名，也加上
      // {
      //   protocol: 'https',
      //   hostname: 'your-production-domain.com',
      //   pathname: '/uploads/**',
      // },
    ],
  },
};

export default nextConfig;
