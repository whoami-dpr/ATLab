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
  ReferenceLine,
} from "recharts";
import { Eye, EyeOff } from "lucide-react";

interface ChartDataPoint {
  round: number;
  raceName: string;
  isFinished?: boolean;
  [key: string]: number | string | boolean | undefined;
}

interface ChampionshipProgressChartProps {
  year: string;
  data: any;
  loading: boolean;
  chartMode: 'drivers' | 'constructors';
  onChartModeChange: (mode: 'drivers' | 'constructors') => void;
}

const TEAM_COLORS: Record<string, string> = {
  "red_bull": "#1e41ff",
  "ferrari": "#dc0000",
  "mercedes": "#00d2be",
  "mclaren": "#ff8700",
  "aston_martin": "#229971",
  "alpine": "#2293d1",
  "williams": "#003d82",
  "haas": "#b6babd",
  "rb": "#6692ff",
  "alpha_tauri": "#6692ff",
  "sauber": "#52e252",
  "kick_sauber": "#52e252",
  "stake_f1_team_kick_sauber": "#52e252",
  "audi": "#52e252",
  "alfa": "#900000",
  "racing_bulls": "#6692ff",
};

const DRIVER_COLORS: Record<string, string> = {
  VER: "#1e41ff",
  PER: "#1e41ff",
  NOR: "#ff8700",
  PIA: "#ff8700",
  LEC: "#dc0000",
  HAM: "#dc0000",
  RUS: "#00d2be",
  SAI: "#003d82",
  ALO: "#229971",
  STR: "#229971",
  GAS: "#2293d1",
  OCO: "#b6babd",
  ALB: "#003d82",
  COL: "#2293d1",
  HUL: "#52e252",
  MAG: "#b6babd",
  TSU: "#6692ff",
  LAW: "#6692ff",
  BOT: "#52e252",
  ZHO: "#52e252",
  ANT: "#00d2be",
  BEA: "#b6babd",
  DOO: "#2293d1",
  BOR: "#52e252",
  HAD: "#6692ff",
};

const DEFAULT_VISIBLE_DRIVERS = ["VER", "NOR", "LEC", "PIA", "RUS"];

// Second drivers per team (will have dashed lines)
const SECOND_DRIVERS = new Set([
  "PER", // Red Bull
  "PIA", // McLaren
  "HAM", // Ferrari (2025)
  "SAI", // Ferrari (2024) / Williams (2025)
  "ANT", // Mercedes (2025)
  "STR", // Aston Martin
  "DOO", // Alpine (2025)
  "COL", // Williams (2024)
  "BEA", // Haas (2025)
  "MAG", // Haas (2024)
  "LAW", // RB
  "TSU", // RB (2024)
  "BOR", // Sauber (2025)
  "ZHO", // Sauber (2024)
]);

export function ChampionshipProgressChart({ year, data: result, loading, chartMode, onChartModeChange }: ChampionshipProgressChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [constructorData, setConstructorData] = useState<ChartDataPoint[]>([]);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [constructors, setConstructors] = useState<string[]>([]);
  const [visibleDrivers, setVisibleDrivers] = useState<Set<string>>(new Set(DEFAULT_VISIBLE_DRIVERS));
  const [visibleConstructors, setVisibleConstructors] = useState<Set<string>>(new Set());
  const [driverNames, setDriverNames] = useState<Record<string, string>>({});
  const [driverTeams, setDriverTeams] = useState<Record<string, string>>({});
  const [constructorNames, setConstructorNames] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (result && result.success) {
      // Filter out future races for the chart
      const finishedRaces = result.data.filter((race: ChartDataPoint) => race.isFinished);
      setData(finishedRaces);
      setDriverNames(result.driverNames || {});
      setDriverTeams(result.driverTeams || {});
      setConstructorNames(result.constructorNames || {});
      
      // Process drivers
      const allDrivers = result.drivers as string[];
      if (result.data.length > 0) {
        const lastRound = result.data[result.data.length - 1];
        allDrivers.sort((a, b) => (lastRound[b] as number) - (lastRound[a] as number));
        setVisibleDrivers(new Set(allDrivers.slice(0, 5)));
      }
      setDrivers(allDrivers);

      // Process constructors
      if (result.constructorData) {
        const finishedConstructorRaces = result.constructorData.filter((race: ChartDataPoint) => race.isFinished);
        setConstructorData(finishedConstructorRaces);
        
        const allConstructors = result.constructors as string[];
        if (result.constructorData.length > 0) {
          const lastRound = result.constructorData[result.constructorData.length - 1];
          allConstructors.sort((a, b) => (lastRound[b] as number) - (lastRound[a] as number));
          setVisibleConstructors(new Set(allConstructors.slice(0, 5)));
        }
        setConstructors(allConstructors);
      }
    } else if (result && result.error) {
      setError(result.error);
    }
  }, [result]);

  const toggleDriver = (driver: string) => {
    const newVisible = new Set(visibleDrivers);
    if (newVisible.has(driver)) {
      newVisible.delete(driver);
    } else {
      newVisible.add(driver);
    }
    setVisibleDrivers(newVisible);
  };

  const toggleConstructor = (constructor: string) => {
    const newVisible = new Set(visibleConstructors);
    if (newVisible.has(constructor)) {
      newVisible.delete(constructor);
    } else {
      newVisible.add(constructor);
    }
    setVisibleConstructors(newVisible);
  };

  const getDriverColor = (driver: string) => {
    const teamId = driverTeams[driver];
    if (teamId && TEAM_COLORS[teamId]) {
      return TEAM_COLORS[teamId];
    }
    return DRIVER_COLORS[driver] || "#ffffff";
  };

  const getConstructorColor = (constructorId: string) => {
    return TEAM_COLORS[constructorId] || "#ffffff";
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
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
      <div className="w-full bg-white dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-800 p-6 overflow-hidden transition-colors duration-200">
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 flex flex-col">
            <div className="mb-6">
              <div className="relative h-7 w-56 bg-gray-800/80 rounded-lg mb-2 overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"></div>
              </div>
              <div className="h-0.5 w-full bg-gray-800/60"></div>
            </div>
            
            <div className="h-[500px] min-h-[300px] pr-6 relative bg-gray-800/30 rounded-lg border border-gray-800/50 overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-gray-700/20 to-transparent"></div>
              
              <div className="absolute inset-0 opacity-30">
                <div className="h-full flex flex-col justify-around p-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-px bg-gray-700/40"></div>
                  ))}
                </div>
                <div className="absolute inset-0 flex justify-around p-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-px h-full bg-gray-700/30"></div>
                  ))}
                </div>
              </div>
              
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-2">
                {[65, 85, 70, 90, 75, 95, 80, 88].map((height, i) => (
                  <div 
                    key={i}
                    className="flex-1 bg-gray-700/40 rounded-t"
                    style={{ height: `${height}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:w-72 flex flex-col lg:border-l lg:border-gray-800 lg:pl-6 mt-6 lg:mt-0">
            <div className="mb-3">
              <div className="relative h-5 w-20 bg-gray-800/80 rounded-md mb-2 overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"></div>
              </div>
              <div className="h-0.5 w-full bg-transparent"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-1">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i}
                  className="relative h-8 bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden"
                >
                  <div 
                    className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-700/30 to-transparent" 
                    style={{ animationDelay: `${i * 0.1}s` }}
                  ></div>
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-1 rounded-full bg-gray-700/60"></div>
                  <div className="absolute left-7 top-1/2 -translate-y-1/2 w-8 h-2 rounded bg-gray-700/50"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-red-100 dark:bg-gray-900/30 rounded-xl border border-red-300 dark:border-gray-800 transition-colors duration-200">
        <p className="text-red-700 dark:text-red-400 transition-colors duration-200">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-white/5 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/10 p-6 transition-colors duration-200">
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
              {chartMode === 'drivers' ? 'Drivers' : 'Constructors'} Championship {year} Progress
            </h2>
            <div className="h-0.5 w-full bg-red-600"></div>
          </div>
          
          <div className="h-[400px] min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartMode === 'drivers' ? data : constructorData} 
                margin={{ top: 5, right: 15, left: 0, bottom: 5 }}
              >
                <CartesianGrid stroke="#9CA3AF" className="dark:stroke-gray-600" opacity={0.3} vertical={true} horizontal={true} />
                <XAxis 
                  dataKey="round" 
                  stroke="#6B7280" 
                  tick={{ fill: '#6B7280' }}
                  label={{ value: 'Championship Round', position: 'insideBottom', offset: -5, fill: '#6B7280' }}
                />
                <YAxis 
                  stroke="#6B7280" 
                  tick={{ fill: '#6B7280' }}
                  label={{ value: 'Points', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
                  domain={[0, (dataMax: number) => {
                    return Math.ceil(dataMax / 100) * 100;
                  }]}
                  ticks={(() => {
                    const currentData = chartMode === 'drivers' ? data : constructorData;
                    const items = chartMode === 'drivers' ? drivers : constructors;
                    const visibleItems = chartMode === 'drivers' ? visibleDrivers : visibleConstructors;
                    const maxPoints = Math.max(
                      ...currentData.flatMap(race => 
                        items
                          .filter(d => visibleItems.has(d))
                          .map(d => (race[d] as number) || 0)
                      ),
                      0
                    );
                    const step = chartMode === 'constructors' ? 100 : 50;
                    const maxRounded = Math.ceil(maxPoints / step) * step;
                    const tickArray = [];
                    for (let i = 0; i <= maxRounded; i += step) {
                      tickArray.push(i);
                    }
                    return tickArray;
                  })()}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Reference lines */}
                {(() => {
                  const currentData = chartMode === 'drivers' ? data : constructorData;
                  const items = chartMode === 'drivers' ? drivers : constructors;
                  const visibleItems = chartMode === 'drivers' ? visibleDrivers : visibleConstructors;
                  const maxPoints = Math.max(
                    ...currentData.flatMap(race => 
                      items
                        .filter(d => visibleItems.has(d))
                        .map(d => (race[d] as number) || 0)
                    ),
                    0
                  );
                  const step = chartMode === 'constructors' ? 100 : 50;
                  const maxRounded = Math.ceil(maxPoints / step) * step;
                  const referenceLines = [];
                  for (let i = step; i <= maxRounded; i += step) {
                    referenceLines.push(
                      <ReferenceLine 
                        key={i}
                        y={i} 
                        stroke="#6B7280" 
                        strokeDasharray="3 3"
                        opacity={0.4}
                      />
                    );
                  }
                  return referenceLines;
                })()}
                
                {chartMode === 'drivers' ? (
                  drivers.map((driver) => (
                    visibleDrivers.has(driver) && (
                      <Line
                        key={driver}
                        type="linear"
                        dataKey={driver}
                        stroke={getDriverColor(driver)}
                        strokeWidth={2}
                        strokeDasharray={SECOND_DRIVERS.has(driver) ? "5 5" : undefined}
                        dot={{ r: 3, strokeWidth: 1, fill: getDriverColor(driver) }}
                        activeDot={{ r: 6, fill: getDriverColor(driver) }}
                        connectNulls
                        isAnimationActive={false}
                      />
                    )
                  ))
                ) : (
                  constructors.map((constructor) => (
                    visibleConstructors.has(constructor) && (
                      <Line
                        key={constructor}
                        type="linear"
                        dataKey={constructor}
                        stroke={getConstructorColor(constructor)}
                        strokeWidth={2}
                        dot={{ r: 3, strokeWidth: 1, fill: getConstructorColor(constructor) }}
                        activeDot={{ r: 6, fill: getConstructorColor(constructor) }}
                        connectNulls
                        isAnimationActive={false}
                      />
                    )
                  ))
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:w-72 flex flex-col lg:border-l lg:border-gray-200 dark:lg:border-gray-800 lg:pl-6 transition-colors duration-200">
          <div className="mb-3">
            <div className="relative flex rounded-full bg-white dark:bg-white/10 p-0.5 border border-gray-200 dark:border-white/10">
              {/* Sliding indicator */}
              <div 
                className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-gray-900 dark:bg-white rounded-full shadow-sm transition-all duration-300 ease-out"
                style={{ left: chartMode === 'drivers' ? '2px' : 'calc(50% + 2px)' }}
              />
              <button
                onClick={() => onChartModeChange('drivers')}
                className={`relative z-10 flex-1 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 ${
                  chartMode === 'drivers'
                    ? 'text-white dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Drivers
              </button>
              <button
                onClick={() => onChartModeChange('constructors')}
                className={`relative z-10 flex-1 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 ${
                  chartMode === 'constructors'
                    ? 'text-white dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Teams
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-1 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar">
            {chartMode === 'drivers' ? (
              drivers.map((driver) => (
                <button
                  key={driver}
                  onClick={() => toggleDriver(driver)}
                  className={`
                    flex items-center justify-between px-2 py-1 rounded border transition-all
                    ${visibleDrivers.has(driver) 
                      ? 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white' 
                      : 'bg-transparent border-gray-300 dark:border-gray-800 text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/30'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    {SECOND_DRIVERS.has(driver) ? (
                      <svg width="12" height="4" className={visibleDrivers.has(driver) ? '' : 'opacity-50'}>
                        <line 
                          x1="0" 
                          y1="2" 
                          x2="12" 
                          y2="2" 
                          stroke={getDriverColor(driver)} 
                          strokeWidth="2"
                          strokeDasharray="3 2"
                        />
                      </svg>
                    ) : (
                      <span 
                        className={`w-3 h-1 rounded-full ${visibleDrivers.has(driver) ? '' : 'opacity-50'}`}
                        style={{ backgroundColor: getDriverColor(driver) }}
                      ></span>
                    )}
                    <span className="font-bold text-xs tracking-wide">{driver}</span>
                  </div>
                  {visibleDrivers.has(driver) ? (
                    <Eye className="w-3 h-3 text-green-500" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-gray-400 dark:text-gray-600" />
                  )}
                </button>
              ))
            ) : (
              constructors.map((constructor) => (
                <button
                  key={constructor}
                  onClick={() => toggleConstructor(constructor)}
                  className={`
                    flex items-center justify-between px-2 py-1 rounded border transition-all
                    ${visibleConstructors.has(constructor) 
                      ? 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white' 
                      : 'bg-transparent border-gray-300 dark:border-gray-800 text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/30'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className={`w-3 h-1 rounded-full ${visibleConstructors.has(constructor) ? '' : 'opacity-50'}`}
                      style={{ backgroundColor: getConstructorColor(constructor) }}
                    ></span>
                    <span className="font-bold text-xs tracking-wide truncate">
                      {constructorNames[constructor] || constructor}
                    </span>
                  </div>
                  {visibleConstructors.has(constructor) ? (
                    <Eye className="w-3 h-3 text-green-500" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-gray-400 dark:text-gray-600" />
                  )}
                </button>
              ))
            )}
          </div>
          
          {/* Legend explanation - only show for drivers */}
          {chartMode === 'drivers' && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800/50 transition-colors duration-200">
              <div className="flex flex-col gap-1.5 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-gray-400 rounded-full"></span>
                  <span>First driver</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="16" height="2">
                    <line x1="0" y1="1" x2="16" y2="1" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="3 2" />
                  </svg>
                  <span>Second driver</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
