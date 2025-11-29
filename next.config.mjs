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

    // Only add the F1 WebSocket proxy in development mode
    // In production, this is handled by Cloudflare Pages Functions
    if (process.env.NODE_ENV === 'development') {
      rewrites.push({
        source: '/f1-ws/:path*',
        destination: 'https://livetiming.formula1.com/signalr/:path*',
      })
    }

    return rewrites
  },
}

export default nextConfig
