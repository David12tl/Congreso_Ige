import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilitar optimización de imágenes (WebP/AVIF) para imágenes locales y externas
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
