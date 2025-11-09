"use client";

"use client";
import React from 'react';
import { Navbar } from '../../components/Navbar';
import CalendarView from '../../components/CalendarView';
import HeroBanner from '../../components/HeroBanner';
import { useThemeOptimized } from '../../hooks/useThemeOptimized';

const CalendarPage = () => {
  const { theme } = useThemeOptimized();
  return (
    <div className={`${theme === 'dark' ? 'bg-[#111827]' : 'bg-white'} min-h-screen`}>
      <Navbar />
      <HeroBanner />
      <main>
        <CalendarView />
      </main>
    </div>
  );
};

export default CalendarPage;
