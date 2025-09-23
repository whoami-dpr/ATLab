import type React from "react"
import type { Metadata } from "next"
import { Poppins, Inter } from "next/font/google"
import "./globals.css"
import { ClientLayout } from "../components/ClientLayout"

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
          <body>
            <ClientLayout>
              {children}
            </ClientLayout>
          </body>
        </html>
  );
}
