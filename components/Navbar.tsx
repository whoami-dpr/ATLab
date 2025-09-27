"use client";

import { Info, Github, Sun, Moon, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GitHubStarsButton } from "./animate-ui/buttons/github-stars";
import { useThemeOptimized } from "../hooks/useThemeOptimized";

const navItems = [
  { href: "/", label: "Live Timing" },
  { href: "/telemetry", label: "Telemetry" },
  // { href: "/standings", label: "Standings" }, // TEMPORARILY DISABLED
  { href: "/schedule", label: "Schedule" },
  { href: "/weather", label: "Weather" },
];

export function Navbar({ hideLogo = false }: { hideLogo?: boolean }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeOptimized();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`w-full h-12 bg-black/80 border-b border-gray-800 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 font-inter theme-transition`}>
        {/* Logo */}
        <a href="/about-us" className="font-bold text-2xl text-white cursor-pointer">
          ATLab
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 ml-4">
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
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex ml-auto gap-4 items-center">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 theme-transition text-gray-300 hover:text-white"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <span className="text-xs font-light tracking-wide">
              {theme === 'light' ? 'Light' : 'Dark'}
            </span>
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
          <GitHubStarsButton username="whoami-dpr" repo="ATLab" className="bg-transparent text-white hover:bg-transparent hover:scale-100" />
          <a href="/about-us" className="text-gray-400 hover:text-white transition flex items-center gap-1">
            <Info className="w-4 h-4 mr-1" /> About Us
          </a>
        </div>

        {/* Mobile Actions */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="text-white hover:text-gray-200 transition p-2"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={toggleMobileMenu}
            className="text-white hover:text-gray-200 transition p-2"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={closeMobileMenu}
          />
          <div className="absolute top-12 left-0 right-0 bg-black/95 border-b border-gray-800 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation Links */}
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={
                    pathname === item.href
                      ? "block text-white text-lg font-medium py-2 border-l-4 border-white pl-4"
                      : "block text-gray-300 hover:text-white text-lg py-2 pl-4 transition"
                  }
                >
                  {item.label}
                </a>
              ))}
              
              {/* Mobile Actions */}
              <div className="pt-4 border-t border-gray-700 space-y-4">
                <div className="pl-4">
                  <GitHubStarsButton 
                    username="whoami-dpr" 
                    repo="ATLab" 
                    className="bg-transparent text-white hover:bg-transparent hover:scale-100 text-left" 
                  />
                </div>
                
                <a 
                  href="/about-us" 
                  onClick={closeMobileMenu}
                  className="text-gray-400 hover:text-white transition flex items-center gap-1 py-2 pl-4"
                >
                  <Info className="w-4 h-4 mr-1" /> About Us
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 