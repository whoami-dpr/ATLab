"use client";

import { Navbar } from "../../components/Navbar";
import React from "react";

export default function AboutUs() {
  return (
    <div className="min-h-screen w-full relative">
      {/* Fondo sólido #131313 */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "#131313",
        }}
      />
      <Navbar hideLogo />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12">
        {/* Logo tipo hero */}
        <div className="mb-8 flex items-center justify-center">
          <span className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent select-none transition-transform duration-200 cursor-pointer active:scale-110 hover:scale-105">ATLab</span>
        </div>
        {/* Título principal */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-white">Real-time Formula 1 telemetry and timing</h1>
        {/* Subtítulo */}
        <p className="text-lg md:text-2xl text-center mb-10 max-w-2xl text-white">
          ATLab (ARSIM Telemetry Lab) es un dashboard moderno de F1 en tiempo real, inspirado en los paneles profesionales de la Fórmula 1. Visualiza datos de timing, clima, posiciones y mucho más.
        </p>
        {/* Animaciones de aparición para la info personal */}
        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <a href="https://github.com/whoami-dpr" target="_blank" rel="noopener noreferrer" className="bg-gray-900 hover:bg-gray-800 text-white text-lg font-semibold px-8 py-4 rounded-xl shadow transition-all text-center border border-gray-700 flex items-center gap-2">
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            GitHub
          </a>
          <a href="mailto:joaquin@email.com" className="bg-gray-900 hover:bg-gray-800 text-white text-lg font-semibold px-8 py-4 rounded-xl shadow transition-all text-center border border-gray-700 flex items-center gap-2">
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M12 13.065l-11.99-7.065v14h23.98v-14zm11.99-8.065h-23.98l11.99 7.065z"/></svg>
            Contacto
          </a>
        </div>
      </div>
      {/* Footer legal */}
      <footer className="w-full flex justify-center items-center text-center text-xs py-6 border-t relative z-20 text-gray-400 border-gray-800 bg-black/80">
        <span className="max-w-xl mx-auto block whitespace-pre-line">
          This project/website is unofficial and is not associated in any way with the Formula 1 companies. F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are trademarks of Formula One Licensing B.V.
        </span>
      </footer>
    </div>
  );
} 