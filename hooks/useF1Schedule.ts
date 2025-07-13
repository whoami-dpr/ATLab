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
    fetch("https://atlab-backend-production.up.railway.app/api/f1/years")
      .then(res => res.json())
      .then(data => {
        console.log("AÑOS RECIBIDOS:", data.years);
        setYears(data.years);
        // Selecciona automáticamente el primer año si no hay uno seleccionado
        setYear(y => y ?? data.years[0]);
      })
      .catch((e) => {
        console.error("ERROR FETCH AÑOS:", e);
        setError("Error cargando años")
      })
      .finally(() => {
        console.log("FINALIZA FETCH AÑOS");
        setLoading(l => ({ ...l, years: false }));
      });
  }, []);

  // Fetch GPs when year changes
  useEffect(() => {
    if (!year) return;
    setLoading(l => ({ ...l, gps: true }));
    fetch(`https://atlab-backend-production.up.railway.app/api/f1/gps?year=${year}`)
      .then(res => res.json())
      .then(data => setGps(data.gps))
      .catch(() => setError("Error cargando GPs"))
      .finally(() => setLoading(l => ({ ...l, gps: false })));
  }, [year]);

  // Fetch sessions when GP changes
  useEffect(() => {
    if (!year || !gp) return;
    setLoading(l => ({ ...l, sessions: true }));
    fetch(`https://atlab-backend-production.up.railway.app/api/f1/sessions?year=${year}&gp=${encodeURIComponent(gp)}`)
      .then(res => res.json())
      .then(data => setSessions(data.sessions))
      .catch(() => setError("Error cargando sesiones"))
      .finally(() => setLoading(l => ({ ...l, sessions: false })));
  }, [year, gp]);

  // Fetch drivers when session changes
  useEffect(() => {
    // Validación extra: year debe ser número, gp y session no vacíos
    if (
      typeof year !== "number" ||
      !year ||
      !gp ||
      typeof gp !== "string" ||
      !session ||
      typeof session !== "string"
    ) {
      return;
    }
    console.log("Fetching drivers with:", { year, gp, session });
    setLoading(l => ({ ...l, drivers: true }));
    fetch(`https://atlab-backend-production.up.railway.app/api/f1/drivers?year=${year}&gp=${encodeURIComponent(gp)}&session=${session}`)
      .then(res => res.json())
      .then(data => setDrivers(data.drivers))
      .catch(() => setError("Error cargando pilotos"))
      .finally(() => setLoading(l => ({ ...l, drivers: false })));
  }, [year, gp, session]);

  return {
    years, gps, sessions, drivers,
    year, setYear,
    gp, setGp,
    session, setSession,
    loading, error
  };
} 