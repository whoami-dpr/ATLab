"use client";

import React from 'react';

const HeroBanner = () => {
  return (
    <div className="w-full bg-white dark:bg-transparent">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header - Same style as Standings */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight leading-none text-gray-900 dark:text-white">
              Race Calendar
            </h1>
            <p className="mt-3 text-base md:text-lg text-gray-500 dark:text-gray-400 font-regular max-w-2xl leading-relaxed">
              Complete 2025 Formula 1 season schedule. All sessions, sprint weekends, and race dates at a glance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
