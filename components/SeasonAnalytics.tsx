"use client";

import { useState, useEffect, useCallback } from "react";
import { DriverStanding, ConstructorStanding } from "@/hooks/useF1Standings";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface SeasonAnalyticsProps {
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  year: string;
  progressData: any;
  loading: boolean;
}

interface ChartDataPoint {
  round: number;
  raceName: string;
  isFinished?: boolean;
  [key: string]: number | string | boolean | undefined;
}

const TEAM_COLORS: Record<string, string> = {
  "red_bull": "#3671C6",
  "ferrari": "#E8002D",
  "mercedes": "#27F4D2",
  "mclaren": "#FF8700",
  "aston_martin": "#229971",
  "alpine": "#FF87BC",
  "williams": "#64C4FF",
  "haas": "#B6BABD",
  "rb": "#6692FF",
  "sauber": "#52E252",
  "kick_sauber": "#52E252",
};

const DRIVER_COLORS: Record<string, string> = {
  VER: "#3671C6", PER: "#3671C6",
  NOR: "#FF8700", PIA: "#FF8700",
  LEC: "#E8002D", HAM: "#E8002D",
  RUS: "#27F4D2", ANT: "#27F4D2",
  SAI: "#64C4FF", ALB: "#64C4FF", COL: "#64C4FF",
  ALO: "#229971", STR: "#229971",
  GAS: "#FF87BC", OCO: "#FF87BC", DOO: "#FF87BC",
  HUL: "#B6BABD", MAG: "#B6BABD", BEA: "#B6BABD",
  TSU: "#6692FF", LAW: "#6692FF", HAD: "#6692FF",
  BOT: "#52E252", ZHO: "#52E252", BOR: "#52E252",
};

const RACE_CONFIG: Record<string, { abbr: string, flag: string }> = {
  "Bahrain": { abbr: "BHR", flag: "bhr" },
  "Saudi": { abbr: "SAU", flag: "sau" },
  "Australia": { abbr: "AUS", flag: "aus" },
  "Japan": { abbr: "JPN", flag: "jpn" },
  "China": { abbr: "CHI", flag: "chn" },
  "Miami": { abbr: "MIA", flag: "usa" },
  "Emilia": { abbr: "EMI", flag: "emi" },
  "Monaco": { abbr: "MON", flag: "mon" },
  "Canada": { abbr: "CAN", flag: "can" },
  "Spain": { abbr: "SPA", flag: "esp" },
  "Austria": { abbr: "AUT", flag: "aut" },
  "Great Britain": { abbr: "GBR", flag: "gbr" },
  "British": { abbr: "GBR", flag: "gbr" },
  "Hungary": { abbr: "HUN", flag: "hun" },
  "Belgium": { abbr: "BEL", flag: "bel" },
  "Netherlands": { abbr: "DUT", flag: "ned" },
  "Italy": { abbr: "ITA", flag: "ita" },
  "Azerbaijan": { abbr: "AZE", flag: "aze" },
  "Singapore": { abbr: "SIN", flag: "sin" },
  "United States": { abbr: "USA", flag: "usa" },
  "Mexico": { abbr: "MEX", flag: "mex" },
  "Brazil": { abbr: "SÃO", flag: "bra" },
  "São Paulo": { abbr: "SÃO", flag: "bra" },
  "Las Vegas": { abbr: "LVG", flag: "usa" },
  "Qatar": { abbr: "QAT", flag: "qat" },
  "Abu Dhabi": { abbr: "ABU", flag: "abu" },
};

// Helper to map abbreviation back to flag code
const ABBR_TO_FLAG: Record<string, string> = {};
Object.values(RACE_CONFIG).forEach(config => {
  ABBR_TO_FLAG[config.abbr] = config.flag;
});

export function SeasonAnalytics({ driverStandings, constructorStandings, year, progressData: result, loading }: SeasonAnalyticsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rankingData, setRankingData] = useState<any[]>([]);
  const [racePointsData, setRacePointsData] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [driverTeams, setDriverTeams] = useState<Record<string, string>>({});
  const [hoveredDriver, setHoveredDriver] = useState<string | null>(null);

  // Reset data when year changes
  useEffect(() => {
    setRankingData([]);
    setRacePointsData([]);
    setDrivers([]);
  }, [year]);

  const getRaceConfig = (raceName: string): { abbr: string, flag: string } => {
    for (const [key, config] of Object.entries(RACE_CONFIG)) {
      if (raceName.includes(key)) return config;
    }
    return { abbr: raceName.substring(0, 3).toUpperCase(), flag: "" };
  };

  useEffect(() => {
    if (result && result.success && result.data) {
      const finishedRaces = result.data.filter((race: ChartDataPoint) => race.isFinished);
      const allDrivers = result.drivers as string[];
      setDriverTeams(result.driverTeams || {});
      
      // Process data to calculate rankings per round
      const processedData = finishedRaces.map((race: any) => {
        const raceConfig = getRaceConfig(race.raceName);
        const raceRanks: any = {
          round: race.round,
          raceName: race.raceName,
          abbr: raceConfig.abbr,
          hasSprint: race.hasSprint
        };

        // If backend provides ranks (with tie-breaker logic), use them
        if (race.ranks) {
          allDrivers.forEach(driver => {
            if (race.ranks[driver]) {
              raceRanks[driver] = race.ranks[driver];
            }
          });
        } else {
          // Fallback to frontend calculation (points only)
          const raceStandings = allDrivers.map(driver => ({
            driver,
            points: (race[driver] as number) || 0
          }));

          // Sort by points descending to get rank
          raceStandings.sort((a, b) => b.points - a.points);

          // Assign rank
          raceStandings.forEach((item, index) => {
            raceRanks[item.driver] = index + 1;
          });
        }

        return raceRanks;
      });

      setRankingData(processedData);
      
      // Add a starting point (Round 0) that matches the first race results
      // This creates a visual "start" for the season
      if (processedData.length > 0) {
          const firstRace = processedData[0];
          const startPoint = {
              ...firstRace,
              round: 0,
              raceName: "Season Start",
              abbr: "" 
          };
          processedData.unshift(startPoint);
      }
      
      // Sort drivers by final standing for the legend/rendering order
      if (processedData.length > 0) {
          const lastRace = processedData[processedData.length - 1];
          const sortedDrivers = [...allDrivers].sort((a, b) => lastRace[a] - lastRace[b]);
          setDrivers(sortedDrivers);
      } else {
          setDrivers(allDrivers);
      }

      // Calculate points per round for the distribution chart using RAW cumulative data (finishedRaces)
      // processedData contains RANKS, so we cannot use it for points calculation.
      const sortedRaces = [...finishedRaces].sort((a: any, b: any) => a.round - b.round);
      
      const pointsDistribution = sortedRaces.map((data: any, index: number) => {
          const prevData = index > 0 ? sortedRaces[index - 1] : null;
          const raceConfig = getRaceConfig(data.raceName);
          
          const roundPoints: any = {
              round: data.round,
              raceName: data.raceName,
              abbr: raceConfig.abbr,
              total: 0
          };

          allDrivers.forEach(driver => {
              const currentPoints = (data[driver] as number) || 0;
              const prevPoints = prevData ? ((prevData[driver] as number) || 0) : 0;
              const gained = currentPoints - prevPoints;
              
              // Only record positive gains (ignore corrections or weird data)
              if (gained > 0) {
                  roundPoints[driver] = gained;
                  roundPoints.total += gained;
              } else {
                  roundPoints[driver] = 0;
              }
          });

          return roundPoints;
      });

      setRacePointsData(pointsDistribution);
    }
  }, [result, year]);

  const getDriverColor = useCallback((driver: string) => {
    if (driverTeams[driver]) {
      const teamId = driverTeams[driver];
      if (TEAM_COLORS[teamId]) {
        return TEAM_COLORS[teamId];
      }
      if (teamId === "sauber" || teamId === "kick_sauber") return "#52E252";
    }
    return DRIVER_COLORS[driver] || "#ffffff";
  }, [driverTeams]);

  const handleDriverHover = useCallback((driver: string) => {
    if (hoveredDriver !== driver) {
      setHoveredDriver(driver);
    }
  }, [hoveredDriver]);

  const handleChartLeave = useCallback(() => {
    setHoveredDriver(null);
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && hoveredDriver) {
      // If a driver is hovered, show only their info
      // Otherwise show the winner or top sorted
      const targetDriver = hoveredDriver || payload[0].name;
      const driverData = payload.find((p: any) => p.name === targetDriver);
      
      if (!driverData) return null;

      const raceName = driverData.payload.raceName;
      const round = driverData.payload.round;
      const position = driverData.value;
      const abbr = driverData.payload.abbr;
      const flagCode = ABBR_TO_FLAG[abbr];
      const flagUrl = flagCode ? `/country-flags/${flagCode}.svg` : null;

      // Helper for ordinal suffix
      const getOrdinal = (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
      };

      return (
        <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 p-3 rounded-md shadow-2xl min-w-[180px]">
          <div className="flex items-center justify-between gap-4 mb-2 border-b border-gray-200 dark:border-gray-800 pb-2">
            <div className="flex items-center gap-2">
              {flagUrl && <img src={flagUrl} alt="flag" className="w-5 h-3.5 object-cover rounded-[2px]" />}
              <span className="text-gray-900 dark:text-white font-bold text-sm whitespace-nowrap">{raceName}</span>
            </div>
            <span className="text-gray-500 dark:text-gray-400 text-xs font-mono whitespace-nowrap">R{round}</span>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">{targetDriver}</span>
            <span className={`text-lg font-bold`} style={{ color: getDriverColor(targetDriver) }}>
              {getOrdinal(position)} <span className="text-xs text-gray-500 font-normal ml-0.5">pos.</span>
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const PointsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      // If we have a hovered driver, show their specific stats
      if (hoveredDriver && data[hoveredDriver] !== undefined) {
          const points = data[hoveredDriver];
          const raceName = data.raceName;
          const round = data.round;
          const abbr = data.abbr;
          const flagCode = ABBR_TO_FLAG[abbr];
          const flagUrl = flagCode ? `/country-flags/${flagCode}.svg` : null;
          
          return (
            <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 p-3 rounded-md shadow-2xl min-w-[180px]">
              <div className="flex items-center justify-between gap-4 mb-2 border-b border-gray-200 dark:border-gray-800 pb-2">
                <div className="flex items-center gap-2">
                  {flagUrl && <img src={flagUrl} alt="flag" className="w-5 h-3.5 object-cover rounded-[2px]" />}
                  <span className="text-gray-900 dark:text-white font-bold text-sm whitespace-nowrap">{raceName}</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-xs font-mono whitespace-nowrap">R{round}</span>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">{hoveredDriver}</span>
                <span className="text-lg font-bold" style={{ color: getDriverColor(hoveredDriver) }}>
                  {points} <span className="text-xs text-gray-500 font-normal ml-0.5">points</span>
                </span>
              </div>
            </div>
          );
      }

      // Fallback: Show total points
      return (
        <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 p-3 rounded-md shadow-2xl min-w-[180px]">
          <div className="mb-2 border-b border-gray-200 dark:border-gray-800 pb-2 flex justify-between items-center">
            <span className="text-gray-900 dark:text-white font-bold text-sm">{data.raceName}</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs">Total: {data.total} pts</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 ${isExpanded ? 'rounded-t-xl border-b-0' : 'rounded-xl'} hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-200 group`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-300 transition-colors group-hover:bg-blue-500/20 group-hover:text-blue-400`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-bold text-gray-900 dark:text-white">More Analytics</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Deep dive into season statistics and trends</span>
          </div>
        </div>
        <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4 bg-gray-50/50 dark:bg-black/20 backdrop-blur-md rounded-b-xl border-x border-b border-gray-200 dark:border-white/10 p-4 flex flex-col gap-8">
              {loading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1 px-2">Driver Ranking Evolution</h3>
                  <div className="h-[500px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={rankingData}
                        margin={{ top: 5, right: 60, left: 20, bottom: 40 }}
                        onMouseLeave={handleChartLeave}
                      >
                        <CartesianGrid stroke="var(--text-secondary)" vertical={true} horizontal={true} strokeDasharray="2 2" opacity={0.2} />
                        <XAxis 
                          dataKey="abbr" 
                          stroke="var(--text-secondary)" 
                          interval={0}
                          padding={{ left: 0, right: 0 }}
                          axisLine={false}
                          tickLine={false}
                          tick={({ x, y, payload }) => {
                            const flagCode = ABBR_TO_FLAG[payload.value];
                            const flagUrl = flagCode ? `/country-flags/${flagCode}.svg` : null;
                            return (
                              <g transform={`translate(${x},${y})`}>
                                {flagUrl ? (
                                  <image x={-10} y={10} width={20} height={15} href={flagUrl} preserveAspectRatio="xMidYMid slice" />
                                ) : (
                                  <text x={0} y={20} dy={0} textAnchor="middle" fill="var(--text-secondary)" fontSize={10}>{payload.value}</text>
                                )}
                              </g>
                            );
                          }}
                        />
                        <YAxis 
                          yAxisId="left"
                          reversed={true} 
                          domain={[1, 'dataMax']} 
                          stroke="var(--text-secondary)"
                          tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 'bold' }}
                          axisLine={false}
                          tickLine={false}
                          width={30}
                          ticks={drivers.length > 0 ? Array.from({ length: drivers.length }, (_, i) => i + 1) : undefined}
                          interval={0}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          reversed={true} 
                          domain={[1, 'dataMax']} 
                          stroke="var(--text-secondary)"
                          axisLine={false}
                          tickLine={false}
                          width={40}
                          ticks={drivers.length > 0 ? Array.from({ length: drivers.length }, (_, i) => i + 1) : undefined}
                          interval={0}
                          tick={({ x, y, payload }) => {
                            // Since drivers is sorted by final standing, we can just grab the driver at the index
                            // payload.value is 1-based rank, so subtract 1 for 0-based index
                            const driver = drivers[payload.value - 1];
                            
                            if (!driver) return <g />;
                            
                            return (
                              <text x={x} y={y} dy={4} textAnchor="start" fill={getDriverColor(driver)} fontSize={11} fontWeight="bold">
                                {driver}
                              </text>
                            );
                          }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        
                        {/* Visual Lines (No Interaction) */}
                        {drivers.map((driver) => (
                          <Line
                            key={`visual-${driver}`}
                            yAxisId="left"
                            type="monotone"
                            dataKey={driver}
                            stroke={getDriverColor(driver)}
                            strokeWidth={hoveredDriver === driver ? 4 : 2}
                            strokeOpacity={hoveredDriver && hoveredDriver !== driver ? 0.35 : 1}
                            dot={(props: any) => {
                              if (props.payload.round === 0) return <g key={props.key} />;
                              return <circle key={props.key} cx={props.cx} cy={props.cy} r={2} fill={getDriverColor(driver)} fillOpacity={hoveredDriver && hoveredDriver !== driver ? 0.35 : 1} strokeWidth={0} />;
                            }}
                            activeDot={(props: any) => {
                              // Only show active dot on the visual line if this driver is hovered
                              // But since this line has pointerEvents: none, it won't trigger active state itself
                              // However, Recharts might pass active payload if the interaction line triggers it
                              if (props.payload.round === 0 || hoveredDriver !== driver) return <g key={props.key} />;
                              return <circle key={props.key} cx={props.cx} cy={props.cy} r={5} fill={getDriverColor(driver)} strokeWidth={2} stroke="#fff" />;
                            }}
                            connectNulls
                            isAnimationActive={false}
                            style={{ pointerEvents: 'none' }}
                          />
                        ))}

                        {/* Interaction Lines (Invisible, Thick) */}
                        {drivers.map((driver) => (
                          <Line
                            key={`interaction-${driver}`}
                            yAxisId="left"
                            type="monotone"
                            dataKey={driver}
                            stroke="transparent"
                            strokeWidth={20}
                            onMouseEnter={() => handleDriverHover(driver)}
                            dot={false}
                            activeDot={false}
                            connectNulls
                            isAnimationActive={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Points Distribution Chart */}
                  <div className="w-full">
                    <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1 px-2">Points Distribution</h3>
                    <div className="h-[600px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={racePointsData}
                          margin={{ top: 5, right: 60, left: 20, bottom: 20 }}
                          barCategoryGap={2}
                          onMouseLeave={handleChartLeave}
                        >
                          <CartesianGrid stroke="var(--text-secondary)" horizontal={false} strokeDasharray="3 3" opacity={0.2} />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="abbr" 
                            type="category" 
                            stroke="var(--text-secondary)" 
                            tick={({ x, y, payload }) => {
                                const flagCode = ABBR_TO_FLAG[payload.value];
                                const flagUrl = flagCode ? `/country-flags/${flagCode}.svg` : null;
                                return (
                                    <g transform={`translate(${x},${y})`}>
                                        {flagUrl && (
                                            <image x={-25} y={-8} width={22} height={16} href={flagUrl} preserveAspectRatio="xMidYMid slice" className="rounded-[2px]" />
                                        )}
                                    </g>
                                );
                            }}
                            axisLine={false}
                            tickLine={false}
                            width={40}
                            interval={0}
                          />
                          <YAxis 
                            yAxisId="right"
                            orientation="right"
                            dataKey="total"
                            type="category"
                            stroke="var(--text-secondary)"
                            tick={({ x, y, payload, index }) => {
                                const total = racePointsData[index]?.total || 0;
                                return (
                                    <text x={x} y={y} dy={4} textAnchor="start" fill="var(--text-primary)" fontSize={11} fontWeight="bold">
                                        {total}
                                    </text>
                                );
                            }}
                            axisLine={false}
                            tickLine={false}
                            width={40}
                            interval={0}
                          />
                          <Tooltip content={<PointsTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                          {drivers.map((driver) => (
                            <Bar
                              key={driver}
                              dataKey={driver}
                              stackId="a"
                              fill={getDriverColor(driver)}
                              stroke="#000"
                              strokeWidth={1}
                              onMouseEnter={() => handleDriverHover(driver)}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
