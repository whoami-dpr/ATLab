"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Default to dark theme (team theme)
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Update document class and localStorage
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
    
    // Dispatch custom event for pages without ThemeProvider
    window.dispatchEvent(new CustomEvent('themeChange', { detail: theme }));
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return a default theme context if used outside provider
    // This prevents errors when Navbar is used in pages without ThemeProvider
    return {
      theme: "dark" as Theme,
      toggleTheme: () => {
        console.warn("toggleTheme called outside ThemeProvider");
      },
    };
  }
  return context;
}
