"use client";

import { Info, Github, Sun, Moon } from "lucide-react";
import { usePathname } from "next/navigation";
import { GitHubStarsButton } from "./animate-ui/buttons/github-stars";
import { useThemeOptimized } from "../hooks/useThemeOptimized";

const navItems = [
  { href: "/", label: "Live Timing" },
  { href: "/telemetry", label: "Telemetry" },
  { href: "/standings", label: "Standings" },
  { href: "/schedule", label: "Schedule" },
  { href: "/weather", label: "Weather" },
];

export function Navbar({ hideLogo = false }: { hideLogo?: boolean }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeOptimized();

  return (
    <nav className={`w-full h-12 bg-black/80 border-b border-gray-800 px-8 flex items-center gap-6 sticky top-0 z-20 font-inter theme-transition`}>
      <a href="/about-us" className="font-bold text-2xl text-white cursor-pointer">ATLab</a>
      {navItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={
            pathname === item.href
              ? "text-white underline underline-offset-8 decoration-2"
              : "text-white hover:text-gray-200 transition"
          }
        >
          {item.label}
        </a>
      ))}
      <div className="ml-auto flex gap-4 items-center">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center theme-transition text-gray-300 hover:text-white"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>
        <GitHubStarsButton username="whoami-dpr" repo="ATLab" className="bg-transparent text-white hover:bg-transparent hover:scale-100" />
        <a href="/about-us" className="text-gray-400 hover:text-white transition flex items-center gap-1"><Info className="w-4 h-4 mr-1" /> About Us</a>
      </div>
    </nav>
  );
} 