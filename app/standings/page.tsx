"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "../../components/Navbar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from "../../components/ui/select";
import { useF1Schedule } from "../../hooks/useF1Schedule";
import { useF1Standings } from "../../hooks/useF1Standings";
import { Progress, ProgressLabel, ProgressTrack, ProgressValue } from "../../components/animate-ui/base/progress";

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
  }, [year]);

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
        const rows = Array.from(calendarTable.querySelectorAll("tbody > tr")).slice(1); // saltar header
        const parsed: { round: number, name: string }[] = [];
        let round = 1;
        for (const row of rows) {
          const cells = row.querySelectorAll("td");
          if (cells.length < 2) continue;
          // Buscar nombre de la carrera
          let name = cells[0].textContent?.replace(/\[.*?\]/g, "").replace(/\n/g, " ").trim() || "";
          // Si el nombre está vacío, intentar con el siguiente cell
          if (!name && cells.length > 1) name = cells[1].textContent?.replace(/\[.*?\]/g, "").replace(/\n/g, " ").trim() || "";
          if (name) {
            parsed.push({ round, name });
            round++;
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

// Utilidad para mapear nombre de Grand Prix a código de país (para bandera)
const GP_TO_FLAG: Record<string, string> = {
  "Australian": "aus",
  "Austria": "aut",
  "Azerbaijan": "aze",
  "Belgian": "bel",
  "Brazilian": "bra",
  "Bahrain": "brn",
  "Canadian": "can",
  "Chinese": "chn",
  "Spanish": "esp",
  "French": "fra",
  "British": "gbr",
  "German": "ger",
  "Hungarian": "hun",
  "Italian": "ita",
  "Japanese": "jpn",
  "Saudi": "ksa",
  "Mexican": "mex",
  "Monaco": "mon",
  "Dutch": "ned",
  "Portuguese": "por",
  "Qatar": "qat",
  "Russian": "rus",
  "Singapore": "sgp",
  "Abu Dhabi": "uae",
  "United States": "usa",
  // Agregar más si es necesario
};

function getFlagCodeFromGP(name: string): string | null {
  // Buscar la palabra clave del GP en el nombre
  for (const key in GP_TO_FLAG) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return GP_TO_FLAG[key];
    }
  }
  return null;
}

export default function StandingsPage() {
  const [mode, setMode] = useState<'actual' | 'past'>('actual');
  const [actualType, setActualType] = useState<'drivers' | 'constructors'>('drivers');
  const { years, year, setYear, loading: loadingYears } = useF1Schedule();
  const { drivers, constructors, loading, error } = useF1Standings();

  // Estado para la carrera seleccionada
  const [selectedRace, setSelectedRace] = useState<number | null>(null);
  // Hook para carreras de Wikipedia
  const { races, loading: loadingRaces, error: errorRaces } = useWikipediaRaces(year, mode === 'past');
  // Hook para standings de Wikipedia (ahora por ronda)
  const { standings: pastStandings, loading: loadingPast, error: errorPast, progress } = useWikipediaStandings(year && selectedRace ? year : undefined, mode === 'past' && !!selectedRace, selectedRace);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold mb-2">Standings</h1>
        <p className="text-gray-400 mb-8 text-lg">Visualizá el campeonato actual o explorá temporadas pasadas de Fórmula 1 con un diseño visual y moderno.</p>
        {/* Card Toggle */}
        <div className="flex gap-8 mb-8">
          <button
            className={`flex-1 rounded-2xl p-8 bg-gradient-to-br from-[#23272b] to-[#181a1d] border-2 transition-all duration-200 shadow-xl flex flex-col items-center justify-center cursor-pointer
              ${mode === 'actual' ? 'border-blue-500 shadow-blue-500/30 scale-105' : 'border-transparent hover:border-gray-700 hover:scale-102'}`}
            onClick={() => setMode('actual')}
          >
            <span className="text-2xl font-semibold mb-2">Campeonato Actual</span>
            <span className="text-gray-400">Ver el campeonato en curso</span>
          </button>
          <button
            className={`flex-1 rounded-2xl p-8 bg-gradient-to-br from-[#23272b] to-[#181a1d] border-2 transition-all duration-200 shadow-xl flex flex-col items-center justify-center cursor-pointer
              ${mode === 'past' ? 'border-blue-500 shadow-blue-500/30 scale-105' : 'border-transparent hover:border-gray-700 hover:scale-102'}`}
            onClick={() => setMode('past')}
          >
            <span className="text-2xl font-semibold mb-2">Campeonatos Pasados</span>
            <span className="text-gray-400">Explorar temporadas anteriores</span>
          </button>
        </div>
        {/* Tabs minimalistas para pilotos/constructores si es campeonato actual */}
        {mode === 'actual' && (
          <div className="flex gap-8 border-b border-gray-700 mb-8 mt-2">
            <button
              className={`pb-2 px-2 text-lg font-semibold transition-colors duration-150
                ${actualType === 'drivers' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}
              onClick={() => setActualType('drivers')}
            >
              Campeonato de Pilotos
            </button>
            <button
              className={`pb-2 px-2 text-lg font-semibold transition-colors duration-150
                ${actualType === 'constructors' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}
              onClick={() => setActualType('constructors')}
            >
              Campeonato de Constructores
            </button>
          </div>
        )}
        {/* Selector de año si es modo pasado */}
        {mode === 'past' && (
          <div className="mb-8 flex items-center gap-4">
            <Select value={year ? String(year) : ""} onValueChange={v => setYear(Number(v))} disabled={loadingYears?.years}>
              <SelectTrigger className="w-[170px] h-12 bg-[#23272b] border border-[#333] shadow-2xl rounded-xl text-white text-base font-bold uppercase justify-start px-5 focus:ring-2 focus:ring-white focus:border-white transition-all duration-200 hover:bg-[#2d3136] hover:border-white">
                <SelectValue placeholder="AÑO" className="text-left text-white/90" />
              </SelectTrigger>
              <SelectContent className="bg-gradient-to-b from-[#23272b] to-[#181a1d] border border-[#111] shadow-lg rounded-md py-2 animate-fadein">
                <SelectGroup>
                  {years.map(y => (
                    <SelectItem key={y} value={String(y)} className="text-white text-base px-6 py-2 uppercase text-left hover:bg-[#232b44] hover:text-[#e5e5e5] data-[state=checked]:bg-[#2c3138] data-[state=checked]:text-white rounded cursor-pointer transition-all duration-150">
                      {y}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <span className="text-gray-400 text-base">Seleccioná el año</span>
          </div>
        )}
        {/* Espacio para el grid visual de standings */}
        <div className="mt-12 min-h-[300px]">
          {/* Loader animado para carreras */}
          {mode === 'past' && loadingRaces && (
            <div className="flex flex-col items-center justify-center h-40">
              <Progress value={30} className="w-[300px] space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <ProgressLabel className="text-sm font-medium">
                    Cargando carreras...
                  </ProgressLabel>
                  <span className="text-sm">...</span>
                </div>
                <ProgressTrack />
              </Progress>
            </div>
          )}
          {mode === 'past' && errorRaces && (
            <div className="flex items-center justify-center h-40 text-red-400 text-lg">Error: {errorRaces}</div>
          )}
          {/* Tarjetas de carreras para seleccionar */}
          {mode === 'past' && !loadingRaces && !selectedRace && races.length > 0 && (
            <div className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {races.map(race => {
                const flagCode = getFlagCodeFromGP(race.name);
                return (
                  <button key={race.round} onClick={() => setSelectedRace(race.round)}
                    className="rounded-xl bg-gradient-to-br from-[#23272b] to-[#181a1d] border border-[#23272b] hover:border-blue-500 shadow p-3 flex items-center gap-3 cursor-pointer transition-all duration-150 min-h-[56px]">
                    {flagCode ? (
                      <img src={`/country-flags/${flagCode}.svg`} alt={flagCode} className="w-7 h-5 rounded shadow-sm mr-2" />
                    ) : (
                      <span className="w-7 h-5 mr-2 bg-gray-700 rounded" />
                    )}
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className="text-base font-semibold truncate">{race.name}</span>
                      <span className="text-gray-400 text-xs">Ronda {race.round}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {/* Loader animado para standings de la carrera seleccionada */}
          {mode === 'past' && selectedRace && loadingPast && (
            <div className="flex flex-col items-center justify-center h-40">
              <Progress value={progress} className="w-[300px] space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <ProgressLabel className="text-sm font-medium">
                    Cargando standings...
                  </ProgressLabel>
                  <span className="text-sm">
                    <ProgressValue /> %
                  </span>
                </div>
                <ProgressTrack />
              </Progress>
            </div>
          )}
          {mode === 'past' && selectedRace && errorPast && (
            <div className="flex items-center justify-center h-40 text-red-400 text-lg">Error: {errorPast}</div>
          )}
          {/* Standings de Wikipedia para la carrera seleccionada */}
          {mode === 'past' && selectedRace && !loadingPast && pastStandings.length > 0 && (
            <div className="w-full max-w-2xl mx-auto bg-[#111213] rounded-2xl shadow-lg border border-[#23272b] overflow-hidden mt-8">
              <div className="px-6 py-4 border-b border-[#23272b] text-lg font-semibold text-white">Driver Championship Standings ({year}, Ronda {selectedRace})</div>
              <div className="divide-y divide-[#23272b]">
                {pastStandings.map(driver => (
                  <div key={driver.position} className="flex items-center px-6 py-3 text-white text-base">
                    <div className="w-8 text-right font-bold text-xl mr-4">{driver.position}</div>
                    <div className="flex-1 font-medium">{driver.driver}</div>
                    <div className="w-16 text-right font-bold text-lg">{driver.points}</div>
                    <div className={`w-12 text-right ml-4 font-semibold ${driver.change && driver.change.startsWith('+') ? 'text-green-500' : driver.change && driver.change.startsWith('-') ? 'text-red-500' : 'text-gray-400'}`}>{driver.change}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Botón para volver a seleccionar carrera */}
          {mode === 'past' && selectedRace && (
            <div className="flex justify-center mt-6">
              <button onClick={() => setSelectedRace(null)} className="px-6 py-2 rounded-xl bg-[#23272b] text-white border border-gray-700 hover:bg-[#181a1d] transition">Volver a carreras</button>
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-lg">Cargando standings...</div>
          ) : error ? (
            <div className="flex items-center justify-center h-40 text-red-400 text-lg">Error: {error}</div>
          ) : (
            <>
              {mode === 'actual' && actualType === 'drivers' && (
                <div className="w-full max-w-2xl mx-auto bg-[#111213] rounded-2xl shadow-lg border border-[#23272b] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#23272b] text-lg font-semibold text-white">Driver Championship Standings</div>
                  <div className="divide-y divide-[#23272b]">
                    {drivers.map(driver => (
                      <div key={driver.position} className="flex items-center px-6 py-3 text-white text-base">
                        <div className="w-8 text-right font-bold text-xl mr-4">{driver.position}</div>
                        <div className="flex-1 font-medium">{driver.driver}</div>
                        <div className="w-16 text-right font-bold text-lg">{driver.points}</div>
                        <div className="w-12 text-right ml-4 font-semibold text-green-500">-</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {mode === 'actual' && actualType === 'constructors' && (
                <div className="w-full max-w-2xl mx-auto bg-[#111213] rounded-2xl shadow-lg border border-[#23272b] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#23272b] text-lg font-semibold text-white">Constructor Championship Standings</div>
                  <div className="divide-y divide-[#23272b]">
                    {constructors.map(constructor => (
                      <div key={constructor.position} className="flex items-center px-6 py-3 text-white text-base">
                        <div className="w-8 text-right font-bold text-xl mr-4">{constructor.position}</div>
                        <div className="flex-1 font-medium">{constructor.team}</div>
                        <div className="w-16 text-right font-bold text-lg">{constructor.points}</div>
                        <div className="w-12 text-right ml-4 font-semibold text-green-500">-</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
