"use client";

import { useTheme } from "../hooks/useTheme";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen w-full relative font-sans antialiased ${theme}`}>
      {/* Background with theme-based styling */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: theme === "dark" 
            ? "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.25), transparent 70%), #000000"
            : "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.15), transparent 70%), #ffffff"
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
