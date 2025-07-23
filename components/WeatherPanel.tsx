import { useWeather } from "../hooks/useWeather";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const weatherIcons: Record<number, string> = {
  0: "☀️", // Clear
  1: "🌤️", // Mainly clear
  2: "⛅", // Partly cloudy
  3: "☁️", // Overcast
  45: "🌫️", // Fog
  48: "🌫️", // Depositing rime fog
  51: "🌦️", // Drizzle: Light
  53: "🌦️", // Drizzle: Moderate
  55: "🌦️", // Drizzle: Dense
  61: "🌧️", // Rain: Slight
  63: "🌧️", // Rain: Moderate
  65: "🌧️", // Rain: Heavy
  71: "❄️", // Snow: Slight
  73: "❄️", // Snow: Moderate
  75: "❄️", // Snow: Heavy
  80: "🌦️", // Rain showers: Slight
  81: "🌦️", // Rain showers: Moderate
  82: "🌦️", // Rain showers: Violent
  95: "⛈️", // Thunderstorm: Slight/Moderate
  96: "⛈️", // Thunderstorm with hail: Slight
  99: "⛈️", // Thunderstorm with hail: Heavy
};

function WeatherSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Skeleton para título principal */}
      <div className="mb-2">
        <div className="h-9 w-[60%] rounded-2xl bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer mb-2 ml-0" />
      </div>
      {/* Skeleton para subtítulo y ubicación */}
      <div className="mb-2">
        <div className="h-6 w-[40%] rounded-xl bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer mb-2 ml-0" />
        <div className="h-4 w-[30%] rounded-xl bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-shimmer mb-2 ml-0" />
      </div>
      {/* Skeleton para tarjetas */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mt-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center rounded-xl p-3 md:p-4 min-w-[90px]"
          >
            {/* Día y fecha */}
            <div className="h-5 w-20 mb-1 rounded bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 animate-shimmer" />
            {/* Icono de clima */}
            <div className="h-14 w-14 mb-2 rounded-full bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 animate-shimmer" />
            {/* Temperatura máxima y mínima */}
            <div className="flex flex-row items-end w-full justify-center mb-1 gap-1">
              <div className="h-7 w-10 rounded bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 animate-shimmer" />
              <div className="h-4 w-6 rounded bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 animate-shimmer ml-1" />
            </div>
            <div className="h-4 w-16 mb-1 rounded bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 animate-shimmer" />
            {/* Lluvia */}
            <div className="h-4 w-20 mb-1 rounded bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 animate-shimmer" />
            {/* Viento */}
            <div className="h-4 w-24 rounded bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 animate-shimmer" />
          </div>
        ))}
      </div>
      {/* Skeleton para el mapa Windy */}
      <div className="w-full mt-8 rounded-2xl overflow-hidden shadow-lg border border-[#232336]" style={{height: 400, maxHeight: 500}}>
        <div className="w-full h-full min-h-[300px] rounded-2xl bg-gradient-to-r from-gray-700/60 via-gray-600/60 to-gray-700/60 animate-shimmer flex items-center justify-center" style={{height: 400}}>
          <svg className="w-10 h-10 text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

export function WeatherPanel() {
  const { weather, loading, error, nextRace } = useWeather();
  const [expanded, setExpanded] = useState(false);

  // Overlay y scroll lock para modo expandido
  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [expanded]);

  // Nombre amigable del circuito y país
  const location = "Spa-Francorchamps, Belgium";
  const eventName = nextRace?.round?.name || "Belgian Grand Prix";
  // Obtener el año de la primera fecha de weather si existe
  const year = weather && weather.length > 0 ? new Date(weather[0].date).getFullYear() : "";

  // Altura del navbar (ajusta si tu navbar es más alto)
  const NAVBAR_HEIGHT = 48; // px

  if (loading) return <WeatherSkeleton />;
  if (error) return <div className="text-center text-red-400 py-8 text-lg font-semibold">{error}</div>;
  if (!weather) return <WeatherSkeleton />;
  if (!loading && weather.length === 0) return <div className="text-center text-gray-400 py-8 text-lg">No hay datos de clima disponibles.</div>;

  return (
    <>
      <div className="w-full max-w-4xl mx-auto font-inter">
        <div className="mb-2">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-1 tracking-tight drop-shadow-lg">
            Tiempo en Spa-Francorchamps
          </h2>
          <div className="text-base md:text-lg text-gray-300 font-normal mb-1">
            Pronóstico para el Gran Premio de Bélgica {year}
          </div>
          <div className="text-sm text-gray-400 font-normal mb-2">
            {location}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mt-2">
          {weather.map((day) => {
            const dateObj = new Date(day.date);
            const dayName = dateObj.toLocaleDateString("es-ES", { weekday: "short" });
            const dayNum = dateObj.getDate();
            return (
              <div
                key={day.date}
                className="flex flex-col items-center bg-[#232336]/80 rounded-xl p-3 md:p-4 min-w-[90px] shadow-md border border-[#2a2a3a]/40"
              >
                <span className="text-base md:text-lg mb-1 text-white drop-shadow">
                  {dayName.charAt(0).toUpperCase() + dayName.slice(1)} {dayNum}
                </span>
                <span className="text-4xl mb-2 animate-pulse-slow">
                  {weatherIcons[day.weathercode] || "❓"}
                </span>
                <span className="text-xl md:text-2xl font-semibold text-white mb-1 drop-shadow">
                  {day.temp_max}°<span className="text-base font-normal text-gray-300"> / {day.temp_min}°</span>
                </span>
                <span className="text-blue-300 text-sm font-normal mb-1 flex items-center gap-1">
                  💧 {day.precipitation} mm
                </span>
                <span className="text-cyan-300 text-sm font-normal flex items-center gap-1">
                  💨 {day.windspeed} km/h
                </span>
              </div>
            );
          })}
        </div>
        {/* Mapa Windy con overlay y scroll lock en modo expandido, respetando el navbar */}
        <div className="w-full mt-8 rounded-2xl overflow-hidden shadow-lg border border-[#232336] transition-all duration-300" style={{height: 400, maxHeight: 500}}>
          <div className="relative w-full h-full">
            <iframe
              title="Mapa Windy Spa-Francorchamps"
              width="100%"
              height="400"
              src="https://embed.windy.com/embed2.html?lat=50.4372&lon=5.9714&detailLat=50.4372&detailLon=5.9714&width=650&height=350&zoom=10&level=surface&overlay=rain&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=false&metricWind=km%2Fh&metricTemp=%C2%B0C&metricRain=mm&radarRange=-1"
              frameBorder="0"
              className="w-full h-full min-h-[300px] bg-[#232336]"
              allowFullScreen
            ></iframe>
            <button
              onClick={() => setExpanded(true)}
              className="absolute top-4 left-4 z-10 px-4 py-2 rounded-lg font-semibold text-white bg-black/70 hover:bg-black/90 shadow-lg border border-gray-700 transition-all duration-200 text-base"
            >
              Expandir mapa
            </button>
          </div>
        </div>
      </div>
      {expanded && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed left-0 right-0 z-[100] flex items-center justify-center bg-black/90"
          style={{top: NAVBAR_HEIGHT, height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, width: '100vw'}}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <iframe
              title="Mapa Windy Spa-Francorchamps Expandido"
              width="100%"
              height="100%"
              src="https://embed.windy.com/embed2.html?lat=50.4372&lon=5.9714&detailLat=50.4372&detailLon=5.9714&width=650&height=350&zoom=10&level=surface&overlay=rain&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=false&metricWind=km%2Fh&metricTemp=%C2%B0C&metricRain=mm&radarRange=-1"
              frameBorder="0"
              className="w-full h-full min-h-[300px] bg-[#232336]"
              allowFullScreen
            ></iframe>
            <button
              onClick={() => setExpanded(false)}
              className="absolute top-6 left-6 z-20 px-4 py-2 rounded-xl font-semibold text-lg text-white bg-black/80 hover:bg-black/90 shadow-lg border border-gray-700 transition-all duration-200"
            >
              Cerrar mapa
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// .animate-pulse-slow {
//   animation: pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
// } 