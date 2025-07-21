import React, { useEffect, useState } from 'react';

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
        <TimeUnit value={timeLeft.days} label="days" />
        <TimeUnit value={timeLeft.hours} label="hrs" />
        <TimeUnit value={timeLeft.minutes} label="min" />
        <TimeUnit value={timeLeft.seconds} label="sec" />
      </div>
    </div>
  );
};

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[60px] font-inter">
      <span className="transition-all duration-300 ease-in-out text-white drop-shadow-sm font-inter">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-xs text-gray-400 font-normal mt-1 uppercase tracking-wider font-inter">{label}</span>
    </div>
  );
} 