import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hace que todas las rutas estén bajo /actualizacion
  basePath: "/actualizacion",

  // Prefijo de assets (chunks, css, imágenes públicas)
  assetPrefix: "/actualizacion/",

  // Genera build lista para docker
  output: "standalone",
};

export default nextConfig;
