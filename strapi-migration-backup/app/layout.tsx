import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "吉林大学国家卓越工程师学院(珠海)",
  description: "吉林大学国家卓越工程师学院(珠海)官方网站",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

