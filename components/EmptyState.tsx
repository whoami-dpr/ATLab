"use client"

import { memo, useEffect, useState } from "react"
import { useSchedule } from "../hooks/useSchedule"
import { Flag, Clock, Play } from "lucide-react"
import { useThemeOptimized } from "../hooks/useThemeOptimized"

interface EmptyStateProps {
  reconnect: () => void
}

const EmptyState = memo(({ reconnect }: EmptyStateProps) => {
  const { theme } = useThemeOptimized()
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  const { nextSession } = useSchedule();
  const [countdown, setCountdown] = useState<{days:number, hours:number, minutes:number, seconds:number} | null>(null);
  const [lastSession, setLastSession] = useState<typeof nextSession | null>(null);

useEffect(() => {
  if (nextSession?.start && (
    !lastSession || nextSession.start !== lastSession.start
  )) {
    setLastSession(nextSession);
  }
}, [nextSession, lastSession]);

useEffect(() => {
  const session = nextSession?.start ? nextSession : lastSession;
  if (!session?.start) return;
  const updateCountdown = () => {
    const start = new Date(session.start);
    const now = new Date();
    const diff = start.getTime() - now.getTime();
    if (diff <= 0) {
      setCountdown(null);
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    setCountdown({ days, hours, minutes, seconds });
  };
  updateCountdown();
  const interval = setInterval(updateCountdown, 1000);
  return () => clearInterval(interval);
}, [nextSession?.start, lastSession]);

  return (
    <div className="absolute left-0 right-0 top-[120px] md:top-[120px] flex items-center justify-center w-full h-[calc(100vh-120px)] bg-transparent px-4">
      <div className="text-center flex flex-col items-center gap-4 md:gap-6 font-inter max-w-sm md:max-w-md">
        <Flag className={`w-10 h-10 md:w-12 md:h-12 mb-2 ${
          theme === 'light' ? 'text-gray-600' : 'text-gray-500'
        }`} />
        <h2 className={`text-xl md:text-2xl font-semibold mb-1 tracking-tight ${
          theme === 'light' ? 'text-black' : 'text-white'
        }`}>No F1 Session</h2>
        <p className={`mb-2 text-sm md:text-base leading-relaxed ${
          theme === 'light' ? 'text-gray-600' : 'text-gray-400'
        }`}>
          No active F1 session detected.
        </p>
        {(nextSession || lastSession) && (
          <div className="flex flex-col items-center gap-1 mb-2">
            <span className={`text-xs md:text-sm ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>Next session in:</span>
            <span className={`font-inter text-base md:text-lg ${
              theme === 'light' ? 'text-black' : 'text-white'
            }`}>
              {countdown
                ? `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`
                : "--"}
            </span>
            <span className={`text-xs ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>{new Date((nextSession?.start || lastSession?.start)!).toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  )
})

EmptyState.displayName = "EmptyState"

export { EmptyState }
