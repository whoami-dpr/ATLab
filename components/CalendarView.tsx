"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useThemeOptimized } from '@/hooks/useThemeOptimized';

type CalendarEvent = {
  category: string;
  logo: string;
  times: string[];
  date: string;
  color: string;
  darkColor: string;
};

// Empty events array - ready for real data
const mockEvents: CalendarEvent[] = [];


const CalendarView = () => {
  const { theme } = useThemeOptimized();
  const [currentDate, setCurrentDate] = useState(new Date('2025-11-09T00:00:00'));

  const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const weekStartDate = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStartDate, i));

  const monthName = currentDate.toLocaleString('es-ES', { month: 'long' });
  const year = currentDate.getFullYear();

  const handlePrevWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="container mx-auto p-4 dark:text-gray-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <Button variant="ghost" className="hover:bg-gray-100 dark:hover:bg-slate-700">Mes</Button>
          <Button variant="ghost" className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">Semana</Button>
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{`${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`}</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handlePrevWeek} className="hover:bg-gray-100 dark:hover:bg-slate-700">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" onClick={handleToday} className="hover:bg-gray-100 dark:hover:bg-slate-700 px-4">
            Hoy
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextWeek} className="hover:bg-gray-100 dark:hover:bg-slate-700">
            <ChevronRight className="h-5 w-5" />
          </Button>
          <div className="w-px h-6 bg-gray-300 dark:bg-slate-600 mx-2" />
          <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-slate-700">
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-px bg-gray-200 dark:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
        {/* Day Headers */}
        {weekDays.map(day => (
          <div key={`${day.toISOString()}-header`} className="p-2 text-center bg-gray-50 dark:bg-slate-800/50">
            <p className="text-sm font-semibold uppercase text-gray-600 dark:text-gray-400">{day.toLocaleString('es-ES', { weekday: 'long' })}</p>
          </div>
        ))}

        {/* Day Cells */}
        {weekDays.map(day => {
          const dayEvents = mockEvents.filter(event => {
            const eventDate = new Date(event.date + 'T00:00:00');
            return eventDate.toDateString() === day.toDateString();
          });
          const isToday = day.toDateString() === new Date('2025-11-09T00:00:00').toDateString();

          return (
            <div key={day.toISOString()} className="flex flex-col bg-white dark:bg-slate-800 min-h-[120px]">
              <div className={`p-2 text-right ${isToday ? 'font-bold' : ''}`}>
                <p className="text-lg">{day.getDate()}</p>
              </div>
              <div className="flex-grow p-1 space-y-1">
                {dayEvents.length > 0 ? (
                  dayEvents.map((event, index) => (
                    <div key={index} className={`p-2 rounded-md text-white ${theme === 'dark' ? event.darkColor : event.color}`}>
                      <img src={event.logo} alt={event.category} className="h-4 mx-auto mb-1 brightness-0 invert" />
                      <div className="text-center text-xs font-bold">
                        {event.times.map(time => <div key={time}>{time}</div>)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
