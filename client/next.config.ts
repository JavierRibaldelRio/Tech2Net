import type { NextConfig } from "next";
// Configure multimodule https://github.com/vercel/next.js/issues/71886
const nextConfig: NextConfig = {
  experimental: {

    externalDir: true,


  },
  turbopack: {
    root: '..',
    resolveAlias: {

      // Mapeo principal para todo el módulo common
      ":neth4tech/*": "../common/*",
    }
  },
  // Habilita el monitoreo de cambios en módulos externos
};

export default nextConfig;