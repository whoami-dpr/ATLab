import type React from "react"
import type { Metadata } from "next"
import { Poppins, Inter } from "next/font/google"
import Script from "next/script"
import { ThemeProvider } from "@/contexts/ThemeContext"
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
            <script dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  function applyTheme(theme) {
                    console.log('[Theme Script] Applying theme:', theme);
                    document.documentElement.classList.remove('light', 'dark');
                    document.documentElement.classList.add(theme);
                    console.log('[Theme Script] HTML classes:', document.documentElement.className);
                  }
                  
                  const savedTheme = localStorage.getItem('theme') || 'dark';
                  console.log('[Theme Script] Initial theme:', savedTheme);
                  applyTheme(savedTheme);
                  
                  // Listen for theme changes from ThemeProvider
                  window.addEventListener('themeChange', function(e) {
                    console.log('[Theme Script] themeChange event received:', e.detail);
                    applyTheme(e.detail);
                  });
                  
                  // Listen for storage changes (when theme changes in another tab/window)
                  window.addEventListener('storage', function(e) {
                    if (e.key === 'theme' && e.newValue) {
                      console.log('[Theme Script] storage event received:', e.newValue);
                      applyTheme(e.newValue);
                    }
                  });
                })();
              `
            }} />
          </head>
          <body className="min-h-screen w-full relative font-sans antialiased bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-200">
            <Script
              async
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4944595008155827"
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
            <div className="absolute inset-0 z-0 opacity-0 dark:opacity-100 transition-opacity duration-200" style={{
              background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.25), transparent 70%), #000000"
            }} />
            <div className="absolute inset-0 z-0 opacity-100 dark:opacity-0 transition-opacity duration-200" style={{
              background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(239, 68, 68, 0.08), transparent 70%), #ffffff"
            }} />
            <ThemeProvider>
              <div className="relative z-10">
                {children}
              </div>
            </ThemeProvider>
          </body>
        </html>
  );
}
