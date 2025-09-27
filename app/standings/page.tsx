/* TEMPORARILY DISABLED - STANDINGS PAGE
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Navbar } from "../../components/Navbar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from "../../components/ui/select";
import { useF1Schedule } from "../../hooks/useF1Schedule";
import { useF1Standings } from "../../hooks/useF1Standings";
import { useF1Drivers } from "../../hooks/useF1Drivers";
import { Progress, ProgressLabel, ProgressTrack, ProgressValue } from "../../components/animate-ui/base/progress";
import { EnhancedStandingsTable } from "../../components/EnhancedStandingsTable";

// Utilidad mejorada para parsear standings de Wikipedia (ahora acepta ronda)
function useWikipediaStandings(year: number | undefined, enabled: boolean, round?: number | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [standings, setStandings] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);

  const fetchStandings = useCallback(async () => {
    if (!year) return;
    setLoading(true);
    setError(null);
    setStandings([]);
    setProgress(0);
    try {
      setProgress(10);
      const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${year}_Formula_One_World_Championship&format=json&prop=text&origin=*`;
      const res = await fetch(url);
      setProgress(30);
      if (!res.ok) throw new Error("No se pudo obtener la página de Wikipedia");
      const data = await res.json();
      setProgress(50);
      const html = data.parse.text["*"];
      const doc = new DOMParser().parseFromString(html, "text/html");
      // 1. Buscar tabla por caption
      const tables = Array.from(doc.querySelectorAll("table.wikitable"));
      let standingsTable: HTMLTableElement | null = null;
      for (const table of tables) {
        const caption = table.querySelector("caption");
        if (caption && /drivers?.*standings?/i.test(caption.textContent || "")) {
          standingsTable = table as HTMLTableElement;
          break;
        }
      }
      // 2. Si no hay caption, buscar la primera tabla después del heading relevante
      if (!standingsTable) {
        // Buscar heading
        const headings = Array.from(doc.querySelectorAll("h3, h4, h2"));
        let targetHeading: Element | null = null;
        for (const h of headings) {
          if (/drivers?.*standings?/i.test(h.textContent || "")) {
            targetHeading = h;
            break;
          }
        }
        if (targetHeading) {
          // Buscar la siguiente tabla después del heading
          let el = targetHeading.nextElementSibling;
          while (el) {
            if (el.tagName === "TABLE" && el.classList.contains("wikitable")) {
              standingsTable = el as HTMLTableElement;
              break;
            }
            el = el.nextElementSibling;
          }
        }
      }
      // 3. Si aún no hay tabla, buscar la primera tabla con headers que incluyan 'Driver' o 'Pos'
      if (!standingsTable) {
        for (const table of tables) {
          const ths = Array.from(table.querySelectorAll("th")).map(th => th.textContent?.toLowerCase() || "");
          if (ths.some(t => t.includes("driver")) && ths.some(t => t.includes("pos"))) {
            standingsTable = table as HTMLTableElement;
            break;
          }
        }
      }
      if (!standingsTable) throw new Error("No se encontró la tabla de standings de pilotos en Wikipedia");
      setProgress(70);
      // Parsear filas
      const rows = Array.from(standingsTable.querySelectorAll("tbody > tr")).slice(1); // saltar header
      const parsed: any[] = [];
      for (const row of rows) {
        const cells = row.querySelectorAll("td");
        if (cells.length < 3) continue;
        const position = cells[0].textContent?.trim() || "";
        const driver = cells[1].textContent?.replace(/\[.*?\]/g, "").trim() || "";
        const points = cells[cells.length - 2].textContent?.trim() || "";
        // Buscar variación si existe (algunas tablas la tienen, otras no)
        let change = "-";
        if (cells.length > 3) {
          const changeCell = cells[cells.length - 1].textContent?.trim() || "";
          if (/^[+-]?\d+$/.test(changeCell)) change = changeCell.startsWith("-") ? changeCell : "+" + changeCell;
        }
        parsed.push({ position, driver, points, change });
      }
      setProgress(100);
      setStandings(parsed);
    } catch (e: any) {
      setError(e.message || "Error al parsear Wikipedia");
    } finally {
      setLoading(false);
    }
  }, [year, round]);

  useEffect(() => {
    if (enabled && year) {
      fetchStandings();
    }
    // eslint-disable-next-line
  }, [enabled, year, round]);

  return { standings, loading, error, progress };
}

// Hook para obtener carreras (Grand Prix) de Wikipedia para un año
function useWikipediaRaces(year: number | undefined, enabled: boolean) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [races, setRaces] = useState<{ round: number, name: string }[]>([]);

  useEffect(() => {
    if (!enabled || !year) return;
    setLoading(true);
    setError(null);
    setRaces([]);
    (async () => {
      try {
        const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${year}_Formula_One_World_Championship&format=json&prop=text&origin=*`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("No se pudo obtener la página de Wikipedia");
        const data = await res.json();
        const html = data.parse.text["*"];
        const doc = new DOMParser().parseFromString(html, "text/html");
        // Buscar la tabla de calendario
        const tables = Array.from(doc.querySelectorAll("table.wikitable"));
        let calendarTable: HTMLTableElement | null = null;
        for (const table of tables) {
          const caption = table.querySelector("caption");
          if (caption && /calendar/i.test(caption.textContent || "")) {
            calendarTable = table as HTMLTableElement;
            break;
          }
        }
        // Si no hay caption, buscar la primera tabla con headers que incluyan 'Grand Prix' y 'Date'
        if (!calendarTable) {
          for (const table of tables) {
            const ths = Array.from(table.querySelectorAll("th")).map(th => th.textContent?.toLowerCase() || "");
            if (ths.some(t => t.includes("grand prix")) && ths.some(t => t.includes("date"))) {
              calendarTable = table as HTMLTableElement;
              break;
            }
          }
        }
        if (!calendarTable) throw new Error("No se encontró la tabla de calendario en Wikipedia");
        // Parsear filas
        const rows = Array.from(calendarTable.querySelectorAll("tbody > tr")).slice(1);
        const parsed: { round: number, name: string }[] = [];
        for (const row of rows) {
          const cells = row.querySelectorAll("td");
          if (cells.length < 2) continue;
          const roundText = cells[0].textContent?.trim() || "";
          const name = cells[1].textContent?.replace(/\[.*?\]/g, "").trim() || "";
          const round = parseInt(roundText);
          if (!isNaN(round) && name) {
            parsed.push({ round, name });
          }
        }
        setRaces(parsed);
      } catch (e: any) {
        setError(e.message || "Error al parsear Wikipedia");
      } finally {
        setLoading(false);
      }
    })();
  }, [enabled, year]);

  return { races, loading, error };
}

// Mapeo de Grand Prix a códigos de bandera
const GP_TO_FLAG: { [key: string]: string } = {
  "Australian": "aus",
  "Austrian": "aut",
  "Azerbaijan": "aze",
  "Belgian": "bel",
  "Brazilian": "bra",
  "British": "gbr",
  "Canadian": "can",
  "Chinese": "chn",
  "Dutch": "ned",
  "French": "fra",
  "German": "ger",
  "Hungarian": "hun",
  "Italian": "ita",
  "Japanese": "jpn",
  "Mexican": "mex",
  "Monaco": "mon",
  "Portuguese": "por",
  "Qatar": "qat",
  "Russian": "rus",
  "Saudi Arabian": "saudi",
  "Singapore": "sgp",
  "Spanish": "esp",
  "Turkish": "tur",
  "United States": "usa",
  "Abu Dhabi": "uae"
};

function getFlagCodeFromGP(name: string): string | null {
  for (const [key, value] of Object.entries(GP_TO_FLAG)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return GP_TO_FLAG[key];
    }
  }
  return null;
}

export default function StandingsPage() {
  const [mode, setMode] = useState<'actual' | 'past'>('actual');
  const { years, year, setYear, loading: loadingYears } = useF1Schedule();
  const { drivers: standingsDrivers, constructors, loading, error } = useF1Standings();
  const { drivers: driverImages, teams: teamImages, loading: loadingImages } = useF1Drivers();

  // Estado para la carrera seleccionada
  const [selectedRace, setSelectedRace] = useState<number | null>(null);
  // Hook para carreras de Wikipedia
  const { races, loading: loadingRaces, error: errorRaces } = useWikipediaRaces(year, mode === 'past');
  // Hook para standings de Wikipedia (ahora por ronda)
  const { standings: pastStandings, loading: loadingPast, error: errorPast, progress } = useWikipediaStandings(year && selectedRace ? year : undefined, mode === 'past' && !!selectedRace, selectedRace);

  // Función para combinar datos de standings con imágenes
  const getEnhancedDrivers = () => {
    if (!standingsDrivers || !driverImages) return standingsDrivers;
    
    return standingsDrivers.map(driver => {
      const driverImage = driverImages.find(img => 
        img.name.toLowerCase() === driver.driver.toLowerCase()
      );
      
      return {
        ...driver,
        driverPhoto: driverImage?.driverImage || driver.driverPhoto,
        nationality: driverImage?.nationality || undefined
      };
    });
  };

  const enhancedDrivers = getEnhancedDrivers();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Standings</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            Consultá el estado del campeonato mundial de pilotos y constructores de F1 2025 o explorá los resultados históricos de la Fórmula 1
          </p>

          {/* Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setMode('actual')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                mode === 'actual'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600'
              }`}
            >
              <h3 className="text-lg font-semibold mb-1">Campeonato Actual</h3>
              <p className="text-xs opacity-80">Ver el campeonato en curso</p>
            </button>
            
            <button
              onClick={() => setMode('past')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                mode === 'past'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600'
              }`}
            >
              <h3 className="text-lg font-semibold mb-1">Campeonatos Pasados</h3>
              <p className="text-xs opacity-80">Explorar temporadas anteriores</p>
            </button>
          </div>


          {/* Content */}
          {mode === 'actual' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Drivers Table */}
              <div>
                <EnhancedStandingsTable 
                  drivers={enhancedDrivers || []} 
                  loading={loading || loadingImages} 
                  error={error} 
                />
              </div>
              
              {/* Constructors Table */}
              <div>
                <div className="w-full bg-white dark:bg-[#111213] rounded-xl shadow-lg border border-gray-200 dark:border-[#23272b] overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-[#23272b] text-base font-semibold text-gray-900 dark:text-white">
                    F1 2025 Constructor Championship
                  </div>
                  
                  {loading ? (
                    <div className="flex items-center justify-center h-32 text-gray-600 dark:text-gray-400 text-base">
                      Cargando clasificaciones...
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center h-32 text-red-600 dark:text-red-400 text-base">
                      Error: {error}
                    </div>
                  ) : (
                    <>
                      {/* Header */}
                      <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-gray-50 dark:bg-[#1a1b1d] text-gray-600 dark:text-gray-400 text-xs font-medium border-b border-gray-200 dark:border-[#23272b]">
                        <div className="text-center">Pos</div>
                        <div>Constructor</div>
                        <div className="text-center">Logo</div>
                        <div className="text-right">Pts</div>
                      </div>

                      {/* Constructor Rows */}
                      <div className="divide-y divide-gray-200 dark:divide-[#23272b]">
                        {constructors?.map((constructor, index) => {
                          // Buscar el logo del equipo en los datos de equipos
                          const teamData = teamImages?.find(team => 
                            team.name.toLowerCase() === constructor.team.toLowerCase()
                          );
                          
                          return (
                            <div 
                              key={constructor.position} 
                              className="grid grid-cols-4 gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#1a1b1d]/50 transition-colors duration-200"
                            >
                              <div className="flex items-center justify-center">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">{constructor.position}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-gray-900 dark:text-white font-medium text-sm">{constructor.team}</span>
                              </div>
                              <div className="flex items-center justify-center">
                                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                                  <Image
                                    src={teamData?.carLogo || `/team-logos/${constructor.team.toLowerCase().replace(/\s+/g, '-')}.svg`}
                                    alt={constructor.team}
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                    onError={(e) => {
                                      // Fallback to placeholder if logo fails to load
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/placeholder-logo.svg';
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center justify-end">
                                <span className="text-gray-900 dark:text-white font-bold text-lg">{constructor.points}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Past Championships */}
          {mode === 'past' && (
            <div className="space-y-4">
              {/* Coming Soon Message */}
              <div className="text-center py-16">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Próximamente</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                  Estamos trabajando en traerte los campeonatos históricos de F1. ¡Mantente atento para las próximas actualizaciones!
                </p>
              </div>

              {/* Race Selection */}
              {races.length > 0 && (
                <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-base font-semibold mb-2 text-gray-900 dark:text-white">Seleccionar Carrera</h3>
                  <Select value={selectedRace?.toString()} onValueChange={(value) => setSelectedRace(parseInt(value))}>
                    <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 h-10">
                      <SelectValue placeholder="Seleccionar carrera" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {races.map((race) => (
                          <SelectItem key={race.round} value={race.round.toString()}>
                            {race.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Progress Bar */}
              {loadingPast && (
                <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Cargando datos históricos...</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full">
                    <ProgressTrack className="bg-gray-200 dark:bg-gray-700">
                      <ProgressValue className="bg-blue-500" />
                    </ProgressTrack>
                  </Progress>
                </div>
              )}

              {/* Historical Standings */}
              {pastStandings.length > 0 && (
                <div className="w-full max-w-4xl mx-auto bg-white dark:bg-[#111213] rounded-xl shadow-lg border border-gray-200 dark:border-[#23272b] overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-[#23272b] text-base font-semibold text-gray-900 dark:text-white">
                    {year} Driver Championship Standings
                  </div>
                  
                  {/* Header */}
                  <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-gray-50 dark:bg-[#1a1b1d] text-gray-600 dark:text-gray-400 text-xs font-medium border-b border-gray-200 dark:border-[#23272b]">
                    <div className="text-center">Pos</div>
                    <div>Driver</div>
                    <div className="text-right">Points</div>
                    <div className="text-right">Change</div>
                  </div>

                  {/* Driver Rows */}
                  <div className="divide-y divide-gray-200 dark:divide-[#23272b]">
                    {pastStandings.map((standing, index) => (
                      <div 
                        key={index} 
                        className="grid grid-cols-4 gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#1a1b1d]/50 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{standing.position}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-900 dark:text-white font-medium">{standing.driver}</span>
                        </div>
                        <div className="flex items-center justify-end">
                          <span className="text-gray-900 dark:text-white font-bold text-lg">{standing.points}</span>
                        </div>
                        <div className="flex items-center justify-end">
                          <span className={`text-xs font-medium ${
                            standing.change === '-' ? 'text-gray-500 dark:text-gray-400' : 
                            standing.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {standing.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Display */}
              {errorPast && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 rounded-lg p-4">
                  <div className="text-red-600 dark:text-red-400 text-base">
                    Error al cargar datos históricos: {errorPast}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
*/

// TEMPORARY PLACEHOLDER - STANDINGS PAGE DISABLED
export default function StandingsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Standings</h1>
          <p className="text-gray-400">Esta página está temporalmente deshabilitada.</p>
        </div>
      </div>
    </div>
  );
}