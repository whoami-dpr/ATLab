/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configuración para Cloudflare Pages
  // trailingSlash: true, // Comentado porque causa problemas con las APIs
  // Asegurar que las rutas de API funcionen correctamente
  async rewrites() {
    const rewrites = [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]



    return rewrites
  },
}

export default nextConfig
