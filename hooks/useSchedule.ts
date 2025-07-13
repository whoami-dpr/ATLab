"use client";

import { useState, useEffect } from "react";

interface ScheduleSession {
  kind: string;
  start: string;
  end: string;
}

interface ScheduleRound {
  name: string;
  country: string;
  start: string;
  end: string;
  sessions: ScheduleSession[];
  over: boolean;
}

interface ScheduleResponse {
  schedule: ScheduleRound[];
  success: boolean;
}

export function useSchedule() {
  const [schedule, setSchedule] = useState<ScheduleRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/schedule');
        const data: ScheduleResponse = await response.json();
        
        if (!data.success) {
          throw new Error('Failed to fetch schedule');
        }
        
        setSchedule(data.schedule);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch schedule';
        setError(errorMessage);
        console.error('Schedule fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // Calculate next session and next race
  const now = new Date();
  const nextSession = schedule
    .flatMap(round => 
      round.sessions.map(session => ({
        ...session,
        round
      }))
    )
    .filter(session => new Date(session.start) > now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];

  const nextRace = schedule
    .filter(round => 
      round.sessions.some(session => 
        session.kind &&
        session.kind.toLowerCase() === 'race' &&
        new Date(session.start) > now
      )
    )
    .map(round => {
      const raceSession = round.sessions.find(session => 
        session.kind &&
        session.kind.toLowerCase() === 'race' &&
        new Date(session.start) > now
      );
      return raceSession ? { ...raceSession, round } : null;
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a!.start).getTime() - new Date(b!.start).getTime())[0];

  return {
    schedule,
    loading,
    error,
    nextSession,
    nextRace
  };
} 