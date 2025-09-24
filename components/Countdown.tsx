import React, { useEffect, useState } from 'react';
import { useThemeOptimized } from '../hooks/useThemeOptimized';

interface CountdownProps {
  targetDate: Date | string;
  label?: string;
  className?: string;
}

function getTimeLeft(target: Date) {
  const now = new Date();
  const diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export const Countdown: React.FC<CountdownProps> = ({ targetDate, label, className }) => {
  const { theme } = useThemeOptimized();
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(target));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className={`flex flex-col items-start font-inter ${className || ''}`}>
      {label && <span className="text-lg font-medium mb-1">{label}</span>}
      <div className="flex gap-4 text-4xl font-inter font-bold tracking-widest select-none">
        <TimeUnit value={timeLeft.days} label="days" theme={theme} />
        <TimeUnit value={timeLeft.hours} label="hrs" theme={theme} />
        <TimeUnit value={timeLeft.minutes} label="min" theme={theme} />
        <TimeUnit value={timeLeft.seconds} label="sec" theme={theme} />
      </div>
    </div>
  );
};

function TimeUnit({ value, label, theme }: { value: number; label: string; theme: string }) {
  return (
    <div className="flex flex-col items-center min-w-[60px] font-inter">
      <span className={`transition-all duration-300 ease-in-out drop-shadow-sm font-inter ${
        theme === 'light' ? 'text-black' : 'text-white'
      }`}>
        {value.toString().padStart(2, '0')}
      </span>
      <span className={`text-xs font-normal mt-1 uppercase tracking-wider font-inter ${
        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
      }`}>{label}</span>
    </div>
  );
} 