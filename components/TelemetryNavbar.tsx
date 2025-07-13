"use client";

export function TelemetryNavbar() {
  return (
    <nav className="w-full bg-black/80 border-b border-gray-800 px-8 py-3 flex items-center gap-8 sticky top-0 z-20">
      <a href="/telemetry" className="font-bold text-2xl bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent cursor-pointer">Telemetry</a>
      <a href="/telemetry" className="text-blue-400">Overview</a>
      <a href="/telemetry/lap-comparison" className="text-white hover:text-blue-400 transition">Lap Comparison</a>
      <a href="/telemetry/sector-analysis" className="text-white hover:text-blue-400 transition">Sector Analysis</a>
      <a href="/telemetry/settings" className="text-white hover:text-blue-400 transition">Settings</a>
    </nav>
  );
} 