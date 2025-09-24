"use client"

import { memo, useEffect, useState } from "react"
import { useSchedule } from "../hooks/useSchedule"
import { Flag, Clock, Play } from "lucide-react"

interface EmptyStateProps {
  reconnect: () => void
}

const EmptyState = memo(({ reconnect }: EmptyStateProps) => {
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
    <div className="absolute left-0 right-0 top-[120px] flex items-center justify-center w-full h-[calc(100vh-120px)] bg-transparent">
      <div className="text-center flex flex-col items-center gap-6 font-inter">
        <Flag className="w-12 h-12 text-gray-500 mb-2" />
        <h2 className="text-2xl font-semibold text-white mb-1 tracking-tight">No F1 Session</h2>
        <p className="text-gray-400 mb-2 max-w-md text-base leading-relaxed">
          No active F1 session detected.
        </p>
        {(nextSession || lastSession) && (
          <div className="flex flex-col items-center gap-1 mb-2">
            <span className="text-gray-300 text-sm">Next session in:</span>
            <span className="text-white font-inter text-lg">
              {countdown
                ? `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`
                : "--"}
            </span>
            <span className="text-gray-400 text-xs">{new Date((nextSession?.start || lastSession?.start)!).toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  )
})

EmptyState.displayName = "EmptyState"

export { EmptyState }
