import { useEffect, useState } from "react";
import { useSchedule } from "./useSchedule";

interface WeatherDay {
  date: string;
  temp_max: number;
  temp_min: number;
  precipitation: number;
  weathercode: number;
  windspeed: number;
}

// Mapeo de nombre de evento a nombre de circuito/ciudad
const eventToCircuit: Record<string, string> = {
  "BELGIAN GRAND PRIX": "Spa-Francorchamps, Belgium",
  "HUNGARIAN GRAND PRIX": "Hungaroring, Hungary",
  "BRITISH GRAND PRIX": "Silverstone, United Kingdom",
  "MONACO GRAND PRIX": "Monte Carlo, Monaco",
  "ITALIAN GRAND PRIX": "Monza, Italy",
  // ...agregá más según tu calendario
};

export function useWeather() {
  const { nextRace } = useSchedule();
  const [weather, setWeather] = useState<WeatherDay[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  useEffect(() => {
    if (!nextRace || !nextRace.round?.name || !nextRace.round?.country) return;

    let cancelled = false;
    async function fetchWeather() {
      setWeather(null);
      setError(null);
      setLoading(true);
      setLocation(null);
      try {
        // 1. Intentar con el mapeo
        const eventNameUpper = nextRace.round.name.toUpperCase();
        const keys = Object.keys(eventToCircuit);
        const foundKey = keys.find(key => eventNameUpper.includes(key));
        let circuitQuery = foundKey ? eventToCircuit[foundKey] : undefined;

        // 2. Si no hay mapeo, intentar con el nombre del evento + país
        if (!circuitQuery) {
          circuitQuery = `${nextRace.round.name}, ${nextRace.round.country}`;
        }

        // 3. Si sigue sin funcionar, intentar solo con el país
        if (!circuitQuery) {
          circuitQuery = nextRace.round.country;
        }

        console.log("[Weather] Geocode query:", circuitQuery);

        // Detectar entorno y armar la URL correcta para geocode
        let geocodeUrl = '';
        if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
          geocodeUrl = `/api/geocode?q=${encodeURIComponent(circuitQuery)}`;
        } else {
          geocodeUrl = `https://atlab-backend-production.up.railway.app/api/geocode?q=${encodeURIComponent(circuitQuery)}`;
        }
        const geoRes = await fetch(geocodeUrl);
        const geoData = await geoRes.json();
        if (!geoData.lat || !geoData.lon) {
          if (!cancelled) setError("No se encontraron coordenadas para el circuito");
          if (!cancelled) setLoading(false);
          return;
        }
        if (!cancelled) setLocation(geoData.display_name);
        // Consultar Open-Meteo
        const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${geoData.lat}&longitude=${geoData.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,windspeed_10m_max&timezone=Europe/Brussels`;
        const meteoRes = await fetch(meteoUrl);
        const meteoData = await meteoRes.json();
        console.log("[Weather] meteoData:", meteoData);
        if (!meteoData.daily) {
          if (!cancelled) setError("No se pudo obtener el pronóstico del clima");
          if (!cancelled) setLoading(false);
          return;
        }
        const days: WeatherDay[] = meteoData.daily.time.map((date: string, i: number) => ({
          date,
          temp_max: meteoData.daily.temperature_2m_max[i],
          temp_min: meteoData.daily.temperature_2m_min[i],
          precipitation: meteoData.daily.precipitation_sum[i],
          weathercode: meteoData.daily.weathercode[i],
          windspeed: meteoData.daily.windspeed_10m_max[i],
        }));
        console.log("[Weather] days:", days);
        if (!cancelled) setWeather(days);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Error obteniendo clima");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchWeather();
    return () => { cancelled = true; };
  }, [nextRace?.round?.name, nextRace?.round?.country, nextRace?.start]);

  return { weather, loading, error, location, nextRace };
} 