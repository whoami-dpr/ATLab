"use client";

import { Info, Github, Sun, Moon, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const navItems = [
  { href: "/", label: "Live Timing" },
  { href: "/standings", label: "Standings" },

  { href: "/schedule", label: "Schedule" },
  { href: "/calendar", label: "Calendar" },
];

export function Navbar({ hideLogo = false }: { hideLogo?: boolean }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`w-full h-12 bg-white/90 dark:bg-black/80 border-b border-gray-200 dark:border-gray-800 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 font-inter backdrop-blur-sm transition-colors duration-200`}>
        {/* Logo */}
        <a href="/about-us" className="font-bold text-2xl text-gray-900 dark:text-white cursor-pointer transition-colors duration-200">
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
                  ? "text-gray-900 dark:text-white underline underline-offset-8 decoration-2 transition-colors duration-200"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
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
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
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
          <a href="https://github.com/whoami-dpr/ATLab" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
            <Github className="w-4 h-4" />
            GitHub
          </a>
          <a href="/about-us" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 flex items-center gap-1">
            <Info className="w-4 h-4 mr-1" /> About Us
          </a>
        </div>

        {/* Mobile Actions */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200 p-2"
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
            className="text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200 p-2"
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
            className="absolute inset-0 bg-black/50 dark:bg-black/50" 
            onClick={closeMobileMenu}
          />
          <div className="absolute top-12 left-0 right-0 bg-white/95 dark:bg-black/95 border-b border-gray-200 dark:border-gray-800 shadow-lg backdrop-blur-sm transition-colors duration-200">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation Links */}
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={
                    pathname === item.href
                      ? "block text-gray-900 dark:text-white text-lg font-medium py-2 border-l-4 border-gray-900 dark:border-white pl-4 transition-colors duration-200"
                      : "block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-lg py-2 pl-4 transition-colors duration-200"
                  }
                >
                  {item.label}
                </a>
              ))}
              
              {/* Mobile Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4 transition-colors duration-200">
                <a 
                  href="https://github.com/whoami-dpr/ATLab" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 flex items-center gap-1 py-2 pl-4"
                >
                  <Github className="w-4 h-4 mr-1" /> GitHub
                </a>
                
                <a 
                  href="/about-us" 
                  onClick={closeMobileMenu}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 flex items-center gap-1 py-2 pl-4"
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
