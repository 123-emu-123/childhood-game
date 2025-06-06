/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
      appDir: true, // 告訴 Next 使用 `app/` 資料夾作為 App Router
    },
  };
  
  module.exports = nextConfig;
  