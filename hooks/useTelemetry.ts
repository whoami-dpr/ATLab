import { useState, useCallback } from "react";

export interface TelemetryData {
  distance: number[];
  speed: number[];
  throttle: number[];
  brake: number[];
  rpm: number[];
  gear: number[];
  drs: number[];
  time: string[];
}

export function useTelemetry() {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTelemetry = useCallback(async (params: {
    year: number;
    gp: string;
    session: string;
    driver: string;
    lap?: number;
  }) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      let url = `https://atlab-backend-production.up.railway.app/api/telemetry/lap-data?year=${params.year}&gp=${encodeURIComponent(params.gp)}&session=${params.session}&driver=${params.driver}`;
      if (params.lap) {
        url += `&lap=${params.lap}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (json.error) {
        setError(json.error);
        setData(null);
      } else {
        setData(json);
      }
    } catch (e: any) {
      setError(e.message || "Error fetching telemetry");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchTelemetry };
}

export interface LapInfo {
  lapNumber: number;
  lapTimeSeconds: number | null;
  lapTimeStr: string | null;
  lapStartTime: string;
  isValid: boolean;
  compound?: string | null;
  isPit?: boolean;
}

export function useLapChart() {
  const [laps, setLaps] = useState<LapInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLaps = useCallback(async (params: {
    year: number;
    gp: string;
    session: string;
    driver: string;
  }) => {
    console.log("fetchLaps called with:", params);
    setLoading(true);
    setError(null);
    setLaps([]);
    try {
      const url = `https://atlab-backend-production.up.railway.app/api/telemetry/laps?year=${params.year}&gp=${encodeURIComponent(params.gp)}&session=${params.session}&driver=${params.driver}`;
      console.log("fetchLaps URL:", url);
      const res = await fetch(url);
      const json = await res.json();
      console.log("fetchLaps response:", json);
      if (json.error) {
        setError(json.error);
        setLaps([]);
      } else {
        setLaps(json.laps);
      }
    } catch (e: any) {
      console.error("fetchLaps error:", e);
      setError(e.message || "Error fetching laps");
      setLaps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { laps, loading, error, fetchLaps };
} 