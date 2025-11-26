"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  round: number;
  raceName: string;
  [key: string]: number | string;
}

interface ChampionshipProgressChartProps {
  year: string;
}

const DRIVER_COLORS: Record<string, string> = {
  VER: "#1e41ff", // Red Bull
  PER: "#1e41ff",
  NOR: "#ff8700", // McLaren
  PIA: "#ff8700",
  LEC: "#dc0000", // Ferrari
  HAM: "#dc0000", // Ferrari (2025) / Mercedes (2024) - handling generic red for now or specific
  RUS: "#00d2be", // Mercedes
  SAI: "#003d82", // Williams (2025) / Ferrari (2024) - let's stick to team colors if possible, or generic
  ALO: "#229971", // Aston Martin
  STR: "#229971",
  GAS: "#2293d1", // Alpine
  OCO: "#b6babd",
  ALB: "#003d82", // Williams
  COL: "#2293d1",
  HUL: "#b6babd", // Haas
  MAG: "#b6babd",
  TSU: "#6692ff", // RB
  LAW: "#6692ff",
  BOT: "#52e252", // Sauber
  ZHO: "#52e252",
  ANT: "#00d2be", // Mercedes (Antonelli)
  BEA: "#b6babd", // Haas (Bearman)
  DOO: "#2293d1", // Alpine (Doohan)
  BOR: "#52e252", // Sauber (Bortoleto)
  HAD: "#6692ff", // RB (Hadjar)
};

const DEFAULT_VISIBLE_DRIVERS = ["VER", "NOR", "LEC", "PIA", "RUS"];

export function ChampionshipProgressChart({ year }: ChampionshipProgressChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleDrivers, setVisibleDrivers] = useState<Set<string>>(new Set(DEFAULT_VISIBLE_DRIVERS));
  const [driverNames, setDriverNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/f1/championship-progress?year=${year}`);
        if (!response.ok) {
          throw new Error("Failed to fetch chart data");
        }
        const result = await response.json();
        if (result.success) {
          setData(result.data);
          setDriverNames(result.driverNames || {});
          
          // Sort drivers by total points in the last round to determine default visibility order or just list them
          const allDrivers = result.drivers as string[];
          
          // Sort drivers based on points in the last round
          if (result.data.length > 0) {
            const lastRound = result.data[result.data.length - 1];
            allDrivers.sort((a, b) => (lastRound[b] as number) - (lastRound[a] as number));
            
            // Update default visible drivers to top 5 if it's a new year load
            // or just keep the default list but ensure they exist
             setVisibleDrivers(new Set(allDrivers.slice(0, 5)));
          }
          
          setDrivers(allDrivers);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  const toggleDriver = (driver: string) => {
    const newVisible = new Set(visibleDrivers);
    if (newVisible.has(driver)) {
      newVisible.delete(driver);
    } else {
      newVisible.add(driver);
    }
    setVisibleDrivers(newVisible);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Sort payload by value (points) descending
      const sortedPayload = [...payload].sort((a, b) => b.value - a.value);

      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded shadow-lg">
          <p className="text-gray-200 font-bold mb-2">Round {label}</p>
          {sortedPayload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2 mb-1">
              <span 
                className="w-3 h-3 block" 
                style={{ backgroundColor: entry.color }}
              ></span>
              <span className="text-gray-300 text-sm">
                {driverNames[entry.name] || entry.name}: <span className="text-white font-medium">{entry.value} pts</span>
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-900/30 rounded-xl border border-gray-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-900/30 rounded-xl border border-gray-800">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900/30 rounded-xl border border-gray-800 p-6 mb-8">
      <h2 className="text-xl font-bold text-white mb-6 pl-2 border-l-4 border-red-600">
        Championship Progress
      </h2>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Chart Area */}
        <div className="flex-1 h-[400px] min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid stroke="#374151" opacity={0.4} vertical={true} horizontal={true} />
              <XAxis 
                dataKey="round" 
                stroke="#ffffffff" 
                tick={{ fill: '#9CA3AF' }}
                label={{ value: 'Championship Round', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
              />
              <YAxis 
                stroke="#9CA3AF" 
                tick={{ fill: '#9CA3AF' }}
                label={{ value: 'Points', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
              />
              <Tooltip content={<CustomTooltip />} />
              {drivers.map((driver) => (
                visibleDrivers.has(driver) && (
                  <Line
                    key={driver}
                    type="monotone"
                    dataKey={driver}
                    stroke={DRIVER_COLORS[driver] || "#ffffff"}
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Area */}
        <div className="lg:w-64 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Drivers</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {drivers.map((driver) => (
              <button
                key={driver}
                onClick={() => toggleDriver(driver)}
                className={`
                  flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all
                  ${visibleDrivers.has(driver) 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-transparent border-gray-800 text-gray-500 hover:bg-gray-800/50'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: DRIVER_COLORS[driver] || "#ffffff" }}
                  ></span>
                  <span className="font-medium">{driver}</span>
                </div>
                {visibleDrivers.has(driver) ? (
                  <span className="text-xs opacity-70">Hide</span>
                ) : (
                  <span className="text-xs opacity-50">Show</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
