"use client";

import { Navbar } from "../../components/Navbar";
import { WeatherPanel } from "../../components/WeatherPanel";

export default function WeatherPage() {
  return (
    <div className="min-h-screen w-full relative flex flex-col bg-black dark:bg-[#181824]">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-start p-8">
        <div className="w-full max-w-4xl">
          <WeatherPanel />
        </div>
      </main>
    </div>
  );
} 