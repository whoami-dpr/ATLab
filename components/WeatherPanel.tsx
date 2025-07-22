import { useWeather } from "../hooks/useWeather";

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
      <div className="grid grid-cols-2 md:grid-cols-7 gap-6 mt-4">
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
  const { weather, loading, error, location, nextRace } = useWeather();

  if (loading) return <WeatherSkeleton />;
  if (error) return <div className="text-center text-red-400 py-8 text-lg font-semibold">{error}</div>;
  if (!weather || weather.length === 0) return <div className="text-center text-gray-400 py-8 text-lg">No hay datos de clima disponibles.</div>;

  return (
    <div className="bg-gradient-to-br from-[#232336]/80 to-[#181824]/90 rounded-2xl p-8 shadow-2xl border border-[#232336] w-full max-w-4xl mx-auto backdrop-blur-xl">
      <h2 className="text-3xl font-extrabold mb-4 text-white flex items-center gap-2 tracking-tight drop-shadow-lg">
        <span className="text-blue-400">Weather</span> for <span className="text-cyan-300">{nextRace?.round?.name}</span>
        <span className="text-base text-gray-400 font-normal ml-2">{location && `(${location})`}</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-7 gap-6 mt-6">
        {weather.map((day) => (
          <div
            key={day.date}
            className="flex flex-col items-center bg-[#232336]/80 rounded-xl p-4 min-w-[90px] shadow-md transition-transform hover:scale-105 hover:bg-[#232336]/90 cursor-pointer border border-[#2a2a3a]/40"
          >
            <span className="text-lg font-bold mb-1 text-white drop-shadow">
              {new Date(day.date).toLocaleDateString("en-GB", { weekday: "short" })}
            </span>
            <span className="text-4xl mb-2 animate-pulse-slow">
              {weatherIcons[day.weathercode] || "❓"}
            </span>
            <span className="text-2xl font-extrabold text-white mb-1 drop-shadow">
              {day.temp_max}°<span className="text-base font-medium text-gray-300">/{day.temp_min}°</span>
            </span>
            <span className="text-blue-300 text-sm font-medium mb-1 flex items-center gap-1">
              💧 {day.precipitation} mm
            </span>
            <span className="text-cyan-300 text-sm font-medium flex items-center gap-1">
              💨 {day.windspeed} km/h
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Animación pulse lenta para iconos
// Agrega esto a tu CSS global si usás Tailwind
// .animate-pulse-slow {
//   animation: pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
// } 