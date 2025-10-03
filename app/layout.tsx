import type React from "react"
import type { Metadata } from "next"
import { Poppins, Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "ATLab - F1 Live Timing",
  description: "Real-time Formula 1 telemetry and timing data",
  other: {
    "google-adsense-account": "ca-pub-4944595008155827",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
        <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
          <head>
            <link rel="stylesheet" href="/fonts/formula1-display.css" />
          </head>
          <body className="min-h-screen w-full relative font-sans antialiased bg-black text-white">
            <Script
              async
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4944595008155827"
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
            <div className="absolute inset-0 z-0" style={{
              background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.25), transparent 70%), #000000"
            }} />
            <div className="relative z-10">
              {children}
            </div>
          </body>
        </html>
  );
}
