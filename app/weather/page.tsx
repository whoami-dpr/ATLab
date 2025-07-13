"use client";

import { useState } from "react";
import { Navbar } from "../../components/Navbar";
import { CloudSun, Droplets, Wind, RefreshCw, MapPin } from "lucide-react";

// Datos de ejemplo (mock)
const MOCK_CIRCUIT = {
  name: "Monza",
  country: "Italy",
  date: "2024-09-08T15:00:00Z",
  lat: 45.6156,
  lon: 9.2811,
};

const MOCK_WEATHER = {
  temperature: 27,
  windspeed: 12,
  humidity: 54,
  condition: "Clear",
  icon: <CloudSun className="w-12 h-12 text-yellow-300" />,
  forecast: [
    { hour: "15:00", temp: 27, icon: <CloudSun className="w-6 h-6 text-yellow-300" /> },
    { hour: "16:00", temp: 26, icon: <CloudSun className="w-6 h-6 text-yellow-300" /> },
    { hour: "17:00", temp: 25, icon: <CloudSun className="w-6 h-6 text-yellow-300" /> },
    { hour: "18:00", temp: 24, icon: <CloudSun className="w-6 h-6 text-yellow-300" /> },
    { hour: "19:00", temp: 22, icon: <CloudSun className="w-6 h-6 text-yellow-300" /> },
  ],
};

export default function WeatherPage() {
  const [circuit] = useState(MOCK_CIRCUIT);
  const [weather] = useState(MOCK_WEATHER);

  return (
    <div className="min-h-screen w-full relative flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-start p-8">
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-7 h-7 text-blue-400" />
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Weather at <span className="text-blue-400">{circuit.name}</span>
              </h1>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500 text-blue-400 hover:bg-blue-500/10 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Update
            </button>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Panel clima actual */}
            <div className="flex-1 bg-gray-900 rounded-2xl p-8 shadow-xl flex flex-col gap-4 items-center justify-center min-w-[260px]">
              <div className="flex flex-col items-center gap-2">
                {weather.icon}
                <div className="text-5xl font-bold text-white">{weather.temperature}°C</div>
                <div className="text-lg text-gray-300">{weather.condition}</div>
              </div>
              <div className="flex gap-6 mt-4 text-base">
                <div className="flex items-center gap-2 text-blue-300">
                  <Wind className="w-5 h-5" /> {weather.windspeed} km/h
                </div>
                <div className="flex items-center gap-2 text-cyan-300">
                  <Droplets className="w-5 h-5" /> {weather.humidity}%
                </div>
              </div>
              <div className="mt-6 w-full">
                <div className="text-xs text-gray-400 mb-2 font-semibold">Next hours</div>
                <div className="flex gap-2 overflow-x-auto">
                  {weather.forecast.map((f) => (
                    <div key={f.hour} className="bg-gray-800 rounded-lg px-3 py-2 flex flex-col items-center min-w-[70px]">
                      <span className="text-xs text-gray-400">{f.hour}</span>
                      <span className="text-lg font-bold text-white flex items-center gap-1">{f.icon} {f.temp}°</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Mapa y detalles del circuito */}
            <div className="flex-1 flex flex-col gap-4 items-center justify-center min-w-[260px]">
              <iframe
                title="Circuit Map"
                width="100%"
                height="220"
                className="rounded-xl border-0 shadow"
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${circuit.lon-0.01}%2C${circuit.lat-0.01}%2C${circuit.lon+0.01}%2C${circuit.lat+0.01}&layer=mapnik&marker=${circuit.lat}%2C${circuit.lon}`}
                style={{ minWidth: 200 }}
              ></iframe>
              <div className="w-full flex flex-col gap-1 text-gray-300 text-sm mt-2">
                <div><b>Circuit:</b> {circuit.name}</div>
                <div><b>Country:</b> {circuit.country}</div>
                <div><b>Date:</b> {new Date(circuit.date).toLocaleString()}</div>
                <div><b>Lat/Lon:</b> {circuit.lat}, {circuit.lon}</div>
              </div>
              <a
                href={`https://www.openstreetmap.org/?mlat=${circuit.lat}&mlon=${circuit.lon}#map=15/${circuit.lat}/${circuit.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 mt-2 hover:underline"
              >
                View full map
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 