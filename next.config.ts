import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/app_horarios",
  // Permite que la app funcione bajo la subruta /app_horarios en Vercel
  // Si prefieres usar un subdominio (ej: app.lavidaeszuaina.es), elimina basePath
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
