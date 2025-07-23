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
    <div className="bg-gradient-to-br from-[#232336]/80 to-[#181824]/90 rounded-2xl p-8 shadow-2xl border border-[#232336] w-full max-w-4xl mx-auto animate-pulse backdrop-blur-xl">
      <div className="h-8 w-1/3 bg-gray-700/60 rounded mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mt-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center bg-[#232336]/80 rounded-xl p-4 min-w-[90px] shadow-md">
            <div className="h-5 w-12 bg-gray-700/60 rounded mb-2" />
            <div className="h-12 w-12 bg-gray-700/60 rounded-full mb-2" />
            <div className="h-4 w-16 bg-gray-700/60 rounded mb-1" />
            <div className="h-3 w-10 bg-gray-700/60 rounded mb-1" />
            <div className="h-3 w-10 bg-gray-700/60 rounded" />
          </div>
        ))}
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