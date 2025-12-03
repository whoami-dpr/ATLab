"use client";

import React from 'react';

const HeroBanner = () => {
  return (
    <div className="relative w-full overflow-hidden bg-white dark:bg-[#111827]">
      
      {/* Compact Content */}
      <div className="relative py-6 md:py-8 px-6">
        <div className="max-w-2xl mx-auto text-center">
          
          {/* Eyebrow */}
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1.5">
            Motorsport 2025
          </p>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-black dark:text-white tracking-tight mb-1.5">
            Calendario
          </h1>

          {/* Subtitle */}
          <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
            Todas las fechas del motorsport
          </p>

        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gray-200 dark:bg-gray-800"></div>
    </div>
  );
};

export default HeroBanner;
