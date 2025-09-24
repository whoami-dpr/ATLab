"use client";

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

// Cache global para evitar re-renders innecesarios
let globalTheme: Theme = 'dark';
let listeners: Set<() => void> = new Set();

// Función para notificar a todos los listeners
const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

// Función optimizada para aplicar tema
const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  
  // Deshabilitar transiciones temporalmente
  root.classList.add('theme-changing');
  
  // Aplicar tema
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  
  // Re-habilitar transiciones
  requestAnimationFrame(() => {
    root.classList.remove('theme-changing');
  });
};

export function useThemeOptimized() {
  const [theme, setTheme] = useState<Theme>(globalTheme);

  const toggleTheme = useCallback(() => {
    const newTheme = globalTheme === 'light' ? 'dark' : 'light';
    
    // Actualizar cache global
    globalTheme = newTheme;
    
    // Aplicar tema inmediatamente
    applyTheme(newTheme);
    
    // Guardar en localStorage de forma asíncrona
    requestIdleCallback(() => {
      localStorage.setItem('theme', newTheme);
    });
    
    // Notificar a todos los listeners
    notifyListeners();
  }, []);

  useEffect(() => {
    // Leer tema del localStorage solo una vez
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && savedTheme !== globalTheme) {
      globalTheme = savedTheme;
      applyTheme(savedTheme);
    }
    
    // Registrar listener
    const listener = () => setTheme(globalTheme);
    listeners.add(listener);
    
    // Cleanup
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    theme,
    toggleTheme
  };
}
