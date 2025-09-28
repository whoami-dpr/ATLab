/* TEMPORARILY DISABLED - F1 SCHEDULE HOOK
"use client";

import { useState, useEffect } from "react";

export function useF1Schedule() {
  const [years, setYears] = useState<number[]>([]);
  const [gps, setGps] = useState<string[]>([]);
  const [sessions, setSessions] = useState<string[]>([]);
  const [drivers, setDrivers] = useState<{ code: string; name: string }[]>([]);

  const [year, setYear] = useState<number | undefined>(undefined);
  const [gp, setGp] = useState<string | undefined>(undefined);
  const [session, setSession] = useState<string | undefined>(undefined);

  const [loading, setLoading] = useState({ years: false, gps: false, sessions: false, drivers: false });
  const [error, setError] = useState<string | null>(null);

  // Fetch years
  useEffect(() => {
    setLoading(l => ({ ...l, years: true }));
    // Mock data for years
    const mockYears = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
    setYears(mockYears);
    setLoading(l => ({ ...l, years: false }));
  }, []);

  // Fetch GPs when year changes
  useEffect(() => {
    if (year) {
      setLoading(l => ({ ...l, gps: true }));
      // Mock data for GPs
      const mockGps = [
        "Australian Grand Prix",
        "Bahrain Grand Prix", 
        "Saudi Arabian Grand Prix",
        "Azerbaijan Grand Prix",
        "Miami Grand Prix",
        "Monaco Grand Prix",
        "Spanish Grand Prix",
        "Canadian Grand Prix",
        "Austrian Grand Prix",
        "British Grand Prix",
        "Hungarian Grand Prix",
        "Belgian Grand Prix",
        "Dutch Grand Prix",
        "Italian Grand Prix",
        "Singapore Grand Prix",
        "Japanese Grand Prix",
        "Qatar Grand Prix",
        "United States Grand Prix",
        "Mexico City Grand Prix",
        "São Paulo Grand Prix",
        "Las Vegas Grand Prix",
        "Abu Dhabi Grand Prix"
      ];
      setGps(mockGps);
      setLoading(l => ({ ...l, gps: false }));
    }
  }, [year]);

  // Fetch sessions when GP changes
  useEffect(() => {
    if (gp) {
      setLoading(l => ({ ...l, sessions: true }));
      // Mock data for sessions
      const mockSessions = ["Practice 1", "Practice 2", "Practice 3", "Qualifying", "Race"];
      setSessions(mockSessions);
      setLoading(l => ({ ...l, sessions: false }));
    }
  }, [gp]);

  // Fetch drivers when session changes
  useEffect(() => {
    if (session) {
      setLoading(l => ({ ...l, drivers: true }));
      // Mock data for drivers
      const mockDrivers = [
        { code: "VER", name: "Max Verstappen" },
        { code: "LEC", name: "Charles Leclerc" },
        { code: "PER", name: "Sergio Pérez" },
        { code: "RUS", name: "George Russell" },
        { code: "NOR", name: "Lando Norris" },
        { code: "HAM", name: "Lewis Hamilton" },
        { code: "ALO", name: "Fernando Alonso" },
        { code: "SAI", name: "Carlos Sainz" },
        { code: "OCO", name: "Esteban Ocon" },
        { code: "GAS", name: "Pierre Gasly" },
        { code: "BOT", name: "Valtteri Bottas" },
        { code: "MAG", name: "Kevin Magnussen" },
        { code: "ALB", name: "Alexander Albon" },
        { code: "TSU", name: "Yuki Tsunoda" },
        { code: "ZHO", name: "Zhou Guanyu" },
        { code: "HUL", name: "Nico Hülkenberg" },
        { code: "STR", name: "Lance Stroll" },
        { code: "RIC", name: "Daniel Ricciardo" },
        { code: "PIA", name: "Oscar Piastri" },
        { code: "SAR", name: "Logan Sargeant" }
      ];
      setDrivers(mockDrivers);
      setLoading(l => ({ ...l, drivers: false }));
    }
  }, [session]);

  return {
    years,
    gps,
    sessions,
    drivers,
    year,
    setYear,
    gp,
    setGp,
    session,
    setSession,
    loading,
    error
  };
}
*/

// TEMPORARY PLACEHOLDER - F1 SCHEDULE HOOK DISABLED
export function useF1Schedule() {
  return {
    years: [],
    gps: [],
    sessions: [],
    drivers: [],
    year: undefined,
    setYear: () => {},
    gp: undefined,
    setGp: () => {},
    session: undefined,
    setSession: () => {},
    loading: { years: false, gps: false, sessions: false, drivers: false },
    error: "Schedule hook temporarily disabled"
  };
}