import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    // Властивість `images` тут
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rickandmortyapi.com",
        port: "", // Залиште порожнім, якщо порт не використовується
        pathname: "/api/character/avatar/**", // Дозволяє будь-який шлях після /avatar/
      },
    ],
  },
};

export default nextConfig;
