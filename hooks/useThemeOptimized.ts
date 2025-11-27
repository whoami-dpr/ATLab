"use client";

import { useState, useEffect } from "react";

export function useThemeOptimized() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Read theme from localStorage or default to dark
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Listen for theme changes
    const handleThemeChange = (e: CustomEvent) => {
      setTheme(e.detail);
    };

    window.addEventListener("themeChange" as any, handleThemeChange);
    
    return () => {
      window.removeEventListener("themeChange" as any, handleThemeChange);
    };
  }, []);

  return { theme };
}
