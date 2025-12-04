"use client";

import { useState, useEffect } from "react";

interface ChartDataPoint {
  round: number;
  raceName: string;
  [key: string]: number | string;
}

interface RaceResultsTableProps {
  year: string;
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

const RACE_ABBREVIATIONS: Record<string, string> = {
  "Bahrain": "BHR",
  "Saudi": "SAU",
  "Australia": "AUS",
  "Japan": "JPN",
  "China": "CHN",
  "Miami": "MIA",
  "Emilia": "EMI",
  "Monaco": "MON",
  "Canada": "CAN",
  "Spain": "ESP",
  "Austria": "AUT",
  "Great Britain": "GBR",
  "British": "GBR",
  "Hungary": "HUN",
  "Belgium": "BEL",
  "Netherlands": "NED",
  "Italy": "ITA",
  "Azerbaijan": "AZE",
  "Singapore": "SIN",
  "United States": "USA",
  "Mexico": "MEX",
  "Brazil": "BRA",
  "Las Vegas": "LVG",
  "Qatar": "QAT",
  "Abu Dhabi": "ABU",
};

const COUNTRY_FLAGS: Record<string, string> = {
  "BHR": "/country-flags/brn.svg",
  "SAU": "/country-flags/ksa.svg",
  "AUS": "/country-flags/aus.svg",
  "JPN": "/country-flags/jpn.svg",
  "CHN": "/country-flags/chn.svg",
  "MIA": "/country-flags/usa.svg",
  "EMI": "/country-flags/ita.svg",
  "MON": "/country-flags/mon.svg",
  "CAN": "/country-flags/can.svg",
  "ESP": "/country-flags/esp.svg",
  "AUT": "/country-flags/aut.svg",
  "GBR": "/country-flags/gbr.svg",
  "HUN": "/country-flags/hun.svg",
  "BEL": "/country-flags/bel.svg",
  "NED": "/country-flags/ned.svg",
  "ITA": "/country-flags/ita.svg",
  "AZE": "/country-flags/aze.svg",
  "SIN": "/country-flags/sgp.svg",
  "USA": "/country-flags/usa.svg",
  "MEX": "/country-flags/mex.svg",
  "BRA": "/country-flags/bra.svg",
  "LVG": "/country-flags/usa.svg",
  "QAT": "/country-flags/qat.svg",
  "ABU": "/country-flags/uae.svg",
  // Fallback aliases
  "CHI": "/country-flags/chn.svg",
  "SAO": "/country-flags/bra.svg",
  "SÃO": "/country-flags/bra.svg",
  "SPA": "/country-flags/esp.svg",
  "DUT": "/country-flags/ned.svg",
};

export function RaceResultsTable({ year }: RaceResultsTableProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [raceResults, setRaceResults] = useState<Record<number, Record<string, any>>>({});
  const [drivers, setDrivers] = useState<string[]>([]);
  const [driverNames, setDriverNames] = useState<Record<string, string>>({});
  const [driverTeams, setDriverTeams] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/f1/championship-progress?year=${year}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const result = await response.json();
        
        setChartData(result.data || []);
        setRaceResults(result.raceResults || {});
        setDrivers(result.drivers || []);
        setDriverNames(result.driverNames || {});
        setDriverTeams(result.driverTeams || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  const getRaceAbbreviation = (raceName: string): string => {
    for (const [key, abbr] of Object.entries(RACE_ABBREVIATIONS)) {
      if (raceName.includes(key)) return abbr;
    }
    return raceName.substring(0, 3).toUpperCase();
  };

  const getDriverColor = (driverCode: string): string => {
    const teamId = driverTeams[driverCode];
    return TEAM_COLORS[teamId] || "#666666";
  };

  const getResultForRace = (driverCode: string, round: number): any | null => {
    if (!raceResults[round] || !raceResults[round][driverCode]) return null;
    return raceResults[round][driverCode];
  };

  const getDriverFinalPoints = (driverCode: string): number => {
    if (chartData.length === 0) return 0;
    const lastRace = chartData[chartData.length - 1];
    return (lastRace[driverCode] as number) || 0;
  };

  const getSortedDrivers = (): string[] => {
    return [...drivers].sort((a, b) => getDriverFinalPoints(b) - getDriverFinalPoints(a));
  };

  const getCellBackground = (result: any): string => {
    if (!result) return "#2d3e50";
    
    // Handle non-numeric positions (RET, DSQ, etc.)
    const posText = result.positionText;
    if (isNaN(parseInt(posText))) {
      if (posText === "R" || posText === "RET") return "#9b1c1c"; // Red for RET
      if (posText === "D" || posText === "DSQ") return "#000000"; // Black for DSQ
      if (posText === "W") return "#4b5563"; // Gray for Withdrawn
      return "#2d3e50";
    }

    const position = parseInt(result.position);
    if (position === 1) return "#e6b000ff"; // Metallic Gold for P1
    if (position === 2) return "#C0C0C0"; // Silver for P2
    if (position === 3) return "#CD7F32"; // Bronze for P3
    if (position <= 10) return "#1E2642"; // Requested color for P4-10
    return "#2d3e50"; // Dark gray for all other positions
  };

  const getCellTextColor = (result: any): string => {
    if (!result) return "#6b7280";
    return "#ffffff";
  };

  const getPointsColumnColor = (position: number): string => {
    if (position === 1) return "#e6b000ff"; // Metallic Gold
    if (position === 2) return "#C0C0C0"; // Silver
    if (position === 3) return "#CD7F32"; // Bronze
    return "#2d3e50"; // Default background
  };

  if (loading) {
    return (
      <div className="w-full bg-[#1a2332] rounded-lg p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="w-full bg-[#1a2332] rounded-lg p-8">
        <div className="text-center py-12 text-gray-400">
          No race data available for {year}
        </div>
      </div>
    );
  }

  const sortedDrivers = getSortedDrivers();

  return (
    <div className="w-full bg-[#1a2332] rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ backgroundColor: '#2d3e50' }}>
              <th className="sticky left-0 z-[2] px-2 py-1.5 text-center font-bold border-r border-b border-white/20" 
                  style={{ backgroundColor: '#2d3e50', color: '#ffffff', fontSize: '14px', width: '70px', minWidth: '70px' }}>
                Driver
              </th>
              {chartData.map((race) => {
                const abbr = getRaceAbbreviation(race.raceName);
                const flagUrl = COUNTRY_FLAGS[abbr];
                return (
                  <th key={race.round} className="px-0 py-0.5 text-center border-r border-b border-white/20" 
                      style={{ width: '24px', minWidth: '24px', maxWidth: '24px' }}>
                    <div className="flex flex-col items-center gap-0.5">
                      {flagUrl ? (
                        <img src={flagUrl} alt={abbr} style={{ width: '20px', height: '15px', objectFit: 'cover', borderRadius: '1px' }} />
                      ) : (
                        <span style={{ fontSize: '16px', lineHeight: '1' }}>🏁</span>
                      )}
                      <span style={{ fontSize: '10px', color: '#ffffff', fontWeight: 600, lineHeight: '1.2' }}>{abbr}</span>
                    </div>
                  </th>
                );
              })}
              <th className="sticky right-0 z-[2] px-2 py-1.5 text-center font-bold border-l border-b border-white/20" 
                  style={{ backgroundColor: '#2d3e50', color: '#ffffff', fontSize: '12px', width: '55px', minWidth: '55px' }}>
                Pts
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedDrivers.map((driverCode, index) => (
              <tr key={driverCode} className="border-b border-white/20" style={{ height: '32px' }}>
                <td className="sticky left-0 z-[1] border-r border-white/20" style={{ backgroundColor: '#2d3e50', padding: '2px 6px' }}>
                  <div className="flex items-center gap-2">
                    <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '13px', minWidth: '18px' }}>{index + 1}</span>
                    <div style={{ width: '4px', height: '22px', backgroundColor: getDriverColor(driverCode), borderRadius: '1px' }}></div>
                    <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '13px' }}>{driverCode}</span>
                  </div>
                </td>
                {chartData.map((race) => {
                  const result = getResultForRace(driverCode, race.round);
                  const cellBg = result ? getCellBackground(result) : '#2d3e50';
                  
                  return (
                    <td key={race.round} className="text-center border-r border-white/20" style={{ padding: '0', backgroundColor: cellBg }}>
                      {result ? (
                        <div style={{ 
                          color: getCellTextColor(result),
                          fontSize: '12px',
                          fontWeight: 'bold',
                          padding: '4px 2px',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {result.positionText === "R" ? "RET" : result.positionText === "D" ? "DSQ" : result.positionText}
                        </div>
                      ) : (
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#6b7280', 
                          padding: '4px 2px',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>-</div>
                      )}
                    </td>
                  );
                })}
                <td className="sticky right-0 z-[1] text-center border-l border-white/20" style={{ backgroundColor: getPointsColumnColor(index + 1), padding: '2px 4px' }}>
                  <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '13px' }}>{getDriverFinalPoints(driverCode)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
