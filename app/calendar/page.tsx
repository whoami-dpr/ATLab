"use client";

import React from 'react';
import { Navbar } from '../../components/Navbar';
import CalendarView from '../../components/CalendarView';
import HeroBanner from '../../components/HeroBanner';

const CalendarPage = () => {
  return (
    <div className="bg-white dark:bg-[#111827] min-h-screen transition-colors duration-200">
      <Navbar />
      <HeroBanner />
      <main>
        <CalendarView />
      </main>
    </div>
  );
};

export default CalendarPage;
