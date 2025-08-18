"use client";

import { useState, useEffect } from "react";
import { useTelemetry } from "../../hooks/useTelemetry";
import { TelemetryChart } from "../../components/telemetry/TelemetryChart";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "../../components/ui/select";
import { useF1Schedule } from "../../hooks/useF1Schedule";
import { YearSelect } from "../../components/YearSelect";
import TelemetryPanel from '../../components/telemetry/TelemetryPanel';
import { useLapChart } from '../../hooks/useTelemetry';
import React from 'react';
import { LapChart } from '../../components/telemetry/LapChart';
import { Skeleton } from "../../components/ui/skeleton";
import CardFlip from "../../components/kokonutui/card-flip";

function GPSelect({ gps, gp, setGp, disabled }: { gps: string[]; gp: string | undefined; setGp: (v: string) => void; disabled?: boolean }) {
  return (
    <Select value={gp || ""} onValueChange={setGp} disabled={disabled}>
      <SelectTrigger className="w-[180px] bg-[#232336] text-white border border-[#3b3b4f] rounded-xl text-base px-4 py-3">
        <SelectValue placeholder="GP" />
      </SelectTrigger>
      <SelectContent className="bg-[#232336] border border-[#3b3b4f] rounded-xl mt-2">
        <SelectGroup>
          <SelectLabel className="text-gray-300 text-base px-4 py-2">GPs</SelectLabel>
          {gps.map(g => (
            <SelectItem key={g} value={g} className="cursor-pointer !text-white data-[state=checked]:bg-blue-700 rounded-md px-4 py-2 text-base bg-transparent">
              {g}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function SessionSelect({ sessions, session, setSession, disabled }: { sessions: string[]; session: string | undefined; setSession: (v: string) => void; disabled?: boolean }) {
  return (
    <Select value={session || ""} onValueChange={setSession} disabled={disabled}>
      <SelectTrigger className="w-[180px] bg-[#232336] text-white border border-[#3b3b4f] rounded-xl text-base px-4 py-3">
        <SelectValue placeholder="Sesión" />
      </SelectTrigger>
      <SelectContent className="bg-[#232336] border border-[#3b3b4f] rounded-xl mt-2">
        <SelectGroup>
          <SelectLabel className="text-gray-300 text-base px-4 py-2">Sesiones</SelectLabel>
          {sessions.map(s => (
            <SelectItem key={s} value={s} className="cursor-pointer !text-white data-[state=checked]:bg-blue-700 rounded-md px-4 py-2 text-base bg-transparent">
              {s}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function DriverSelect({ drivers, driver, setDriver, disabled }: { drivers: { code: string; name: string }[]; driver: string; setDriver: (v: string) => void; disabled?: boolean }) {
  return (
    <Select value={driver} onValueChange={setDriver} disabled={disabled}>
      <SelectTrigger className="w-[180px] bg-[#232336] text-white border border-[#3b3b4f] rounded-xl text-base px-4 py-3">
        <SelectValue placeholder="Piloto" />
      </SelectTrigger>
      <SelectContent className="bg-[#232336] border border-[#3b3b4f] rounded-xl mt-2">
        <SelectGroup>
          <SelectLabel className="text-gray-300 text-base px-4 py-2">Pilotos</SelectLabel>
          {drivers.map(d => (
            <SelectItem key={d.code} value={d.code} className="cursor-pointer !text-white data-[state=checked]:bg-blue-700 rounded-md px-4 py-2 text-base bg-transparent">
              {d.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default function TelemetryPage() {
  const {
    years, gps, sessions, drivers,
    year, setYear,
    gp, setGp,
    session, setSession,
    loading, error
  } = useF1Schedule();
  const [driver, setDriver] = useState("");
  const { data, loading: loadingTelemetry, error: errorTelemetry, fetchTelemetry } = useTelemetry();
  const [selectedLap, setSelectedLap] = useState<number | null>(null);
  const { laps, loading: loadingLaps, error: errorLaps, fetchLaps } = useLapChart();
  const [hasTriedLoad, setHasTriedLoad] = useState(false);
  const [showNoDataMessage, setShowNoDataMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'comparison'>('telemetry');
  const [selectedLap2, setSelectedLap2] = useState<number | null>(null);

  // Resetear selectedLap cuando cambian los selects principales
  useEffect(() => {
    setSelectedLap(null);
  }, [year, gp, session, driver]);

  // Cuando llegan las vueltas, setear la vuelta más rápida automáticamente y solo esa
  useEffect(() => {
    if (laps.length > 0) {
      // Buscar la vuelta válida más rápida
      const validLaps = laps.filter(l => l.lapTimeSeconds !== null && (l.isValid || l.isPit));
      if (validLaps.length > 0) {
        const fastest = validLaps.reduce((min, l) => (l.lapTimeSeconds! < min.lapTimeSeconds! ? l : min), validLaps[0]);
        setSelectedLap(fastest.lapNumber);
        setSelectedLap2(null);
      } else {
        setSelectedLap(laps[0].lapNumber);
        setSelectedLap2(null);
      }
    }
  }, [laps]);

  // Cargar telemetría automáticamente para ambas vueltas
  useEffect(() => {
    if (year && gp && session && driver && selectedLap) {
      fetchTelemetry({ year, gp, session, driver, lap: selectedLap });
    }
  }, [year, gp, session, driver, selectedLap]);
  const { data: data2, loading: loadingTelemetry2, fetchTelemetry: fetchTelemetry2 } = useTelemetry();
  useEffect(() => {
    if (year && gp && session && driver && selectedLap2) {
      fetchTelemetry2({ year, gp, session, driver, lap: selectedLap2 });
    }
  }, [year, gp, session, driver, selectedLap2]);

  // Llamar a fetchLaps automáticamente cuando cambian los selects principales
  useEffect(() => {
    if (year && gp && session && driver) {
      fetchLaps({ year, gp, session, driver });
    }
  }, [year, gp, session, driver, fetchLaps]);

  // Eliminar lógica de submitted, ya no se usa

  // Limpiar selectedLap2 cuando se desactiva la comparación desde LapChart
  const handleSetSelectedLap2 = (lap: number | null) => {
    setSelectedLap2(lap);
  };
  const handleShowComparisonChange = (show: boolean) => {
    if (!show) setSelectedLap2(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <section className="mt-8 mb-4">
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Telemetry Dashboard</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Analizá y compará datos de telemetría de F1 con visualizaciones avanzadas. Seleccioná pilotos, vueltas y sectores para descubrir insights únicos de cada sesión.
        </p>
        {/* Mini-navbar tipo tabs */}
        <div className="flex gap-8 border-b border-gray-700 mb-8 mt-6">
          <button
            className={`pb-2 px-2 text-lg font-medium ${
              activeTab === 'telemetry'
                ? 'text-white border-b-2 border-white'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('telemetry')}
          >
            Lap Details
          </button>
          <button
            className={`pb-2 px-2 text-lg font-medium ${
              activeTab === 'comparison'
                ? 'text-white border-b-2 border-white'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('comparison')}
          >
            Pilot Comparison
          </button>
        </div>
        {/* Fin mini-navbar tipo tabs */}
      </section>
      
      {activeTab === 'telemetry' && (
        <>
          <div className="flex flex-wrap md:flex-nowrap gap-8 w-full justify-start items-center mb-8 px-2 bg-[#181a1d] rounded-xl shadow-lg px-8 py-6">
            <Select value={year ? String(year) : ""} onValueChange={v => setYear(Number(v))} disabled={loading.years}>
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
            <Select value={gp ?? ""} onValueChange={setGp} disabled={loading.gps}>
              <SelectTrigger className="w-[170px] h-12 bg-[#23272b] border border-[#333] shadow-2xl rounded-xl text-white text-base font-bold uppercase justify-start px-5 focus:ring-2 focus:ring-white focus:border-white transition-all duration-200 hover:bg-[#2d3136] hover:border-white">
                <SelectValue placeholder="GP" className="text-left text-white/90" />
              </SelectTrigger>
              <SelectContent className="bg-gradient-to-b from-[#23272b] to-[#181a1d] border border-[#111] shadow-lg rounded-md py-2 animate-fadein">
                <SelectGroup>
                  {gps.map(g => (
                    <SelectItem key={g} value={g} className="text-white text-base px-6 py-2 uppercase text-left hover:bg-[#232b44] hover:text-[#e5e5e5] data-[state=checked]:bg-[#2c3138] data-[state=checked]:text-white rounded cursor-pointer transition-all duration-150">
                      {g}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={session ?? ""} onValueChange={setSession} disabled={loading.sessions}>
              <SelectTrigger className="w-[170px] h-12 bg-[#23272b] border border-[#333] shadow-2xl rounded-xl text-white text-base font-bold uppercase justify-start px-5 focus:ring-2 focus:ring-white focus:border-white transition-all duration-200 hover:bg-[#2d3136] hover:border-white">
                <SelectValue placeholder="SESIÓN" className="text-left text-white/90" />
              </SelectTrigger>
              <SelectContent className="bg-gradient-to-b from-[#23272b] to-[#181a1d] border border-[#111] shadow-lg rounded-md py-2 animate-fadein">
                <SelectGroup>
                  {sessions.map(s => (
                    <SelectItem key={s} value={s} className="text-white text-base px-6 py-2 uppercase text-left hover:bg-[#232b44] hover:text-[#e5e5e5] data-[state=checked]:bg-[#2c3138] data-[state=checked]:text-white rounded cursor-pointer transition-all duration-150">
                      {s}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={driver ?? ""} onValueChange={setDriver} disabled={loading.drivers}>
              <SelectTrigger className="w-[170px] h-12 bg-[#23272b] border border-[#333] shadow-2xl rounded-xl text-white text-base font-bold uppercase justify-start px-5 focus:ring-2 focus:ring-white focus:border-white transition-all duration-200 hover:bg-[#2d3136] hover:border-white">
                <SelectValue placeholder="PILOTO" className="text-left text-white/90" />
              </SelectTrigger>
              <SelectContent className="bg-gradient-to-b from-[#23272b] to-[#181a1d] border border-[#111] shadow-lg rounded-md py-2 animate-fadein">
                <SelectGroup>
                  {drivers.map(d => (
                    <SelectItem key={d.code} value={d.code} className="text-white text-base px-6 py-2 uppercase text-left hover:bg-[#232b44] hover:text-[#e5e5e5] data-[state=checked]:bg-[#2c3138] data-[state=checked]:text-white rounded cursor-pointer transition-all duration-150">
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
      
      {loading.years || loading.gps || loading.sessions || loading.drivers ? (
        <div className="text-blue-400 mb-4">Cargando opciones...</div>
      ) : null}
      
      {error && <div className="text-red-400 mb-4">{error}</div>}
      
          {(year && gp && session && driver) && (
        <div className="mb-8 flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 min-w-0">
            <LapChart
              laps={laps}
              selectedLap={selectedLap}
              setSelectedLap={setSelectedLap}
              selectedLap2={selectedLap2}
              setSelectedLap2={handleSetSelectedLap2}
              loading={loadingLaps}
              onShowComparisonChange={handleShowComparisonChange}
            />
            {/* Panel de información de las vueltas seleccionadas */}
            <div className="flex flex-wrap gap-4">
              {selectedLap && laps.length > 0 && (() => {
                const lap = laps.find(l => l.lapNumber === selectedLap);
                if (!lap) return null;
                const formatLapTimeMs = (seconds: number | null | undefined) => {
                  if (seconds === null || seconds === undefined) return "-";
                  const min = Math.floor(seconds / 60);
                  const sec = Math.floor(seconds % 60);
                  const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
                  return `${min}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
                };
                return (
                  <div className="bg-[#23272b] border border-white/60 rounded-xl px-8 py-3 mt-2 flex flex-row gap-8 items-center shadow min-h-[56px]">
                    <span className="text-white text-lg font-bold">Lap {lap.lapNumber}</span>
                    <span className="text-gray-200 text-base">Time: <span className="font-mono text-lg font-bold text-white">{formatLapTimeMs(lap.lapTimeSeconds)}</span></span>
                    <span className="text-gray-300 text-base">{lap.isValid ? 'Valid' : lap.isPit ? 'PIT' : 'Invalid'}</span>
                    <span className="flex items-center gap-2 text-base ml-auto">
                      <img src={`/images/${(lap.compound && lap.compound.toLowerCase() === 'supersoft') ? 'supersoft.png' : (lap.compound || 'unknown').toLowerCase() + '.svg'}`} alt={(lap.compound || 'unknown')} className="w-7 h-7" />
                      <span className="text-gray-200 font-semibold uppercase tracking-wide">{lap.compound || 'Tyre not available'}</span>
                    </span>
                    {lap.isPit && (
                      <span className="text-yellow-300 font-semibold text-base ml-2">PIT STOP</span>
                    )}
                  </div>
                );
              })()}
              {selectedLap2 && laps.length > 0 && selectedLap2 !== selectedLap && (() => {
                const lap = laps.find(l => l.lapNumber === selectedLap2);
                if (!lap) return null;
                const formatLapTimeMs = (seconds: number | null | undefined) => {
                  if (seconds === null || seconds === undefined) return "-";
                  const min = Math.floor(seconds / 60);
                  const sec = Math.floor(seconds % 60);
                  const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
                  return `${min}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
                };
                return (
                  <div className="bg-[#23272b] border border-white/60 rounded-xl px-8 py-3 mt-2 flex flex-row gap-8 items-center shadow min-h-[56px]">
                    <span className="text-white text-lg font-bold">Lap {lap.lapNumber}</span>
                    <span className="text-gray-200 text-base">Time: <span className="font-mono text-lg font-bold text-white">{formatLapTimeMs(lap.lapTimeSeconds)}</span></span>
                    <span className="text-gray-300 text-base">{lap.isValid ? 'Valid' : lap.isPit ? 'PIT' : 'Invalid'}</span>
                    <span className="flex items-center gap-2 text-base ml-auto">
                      <img src={`/images/${(lap.compound && lap.compound.toLowerCase() === 'supersoft') ? 'supersoft.png' : (lap.compound || 'unknown').toLowerCase() + '.svg'}`} alt={(lap.compound || 'unknown')} className="w-7 h-7" />
                      <span className="text-gray-200 font-semibold uppercase tracking-wide">{lap.compound || 'Tyre not available'}</span>
                    </span>
                    {lap.isPit && (
                      <span className="text-yellow-300 font-semibold text-base ml-2">PIT STOP</span>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      
          {data && selectedLap && !loadingTelemetry && (
        <div className="mb-8">
          <TelemetryPanel data={data} data2={data2} selectedLap={selectedLap} selectedLap2={selectedLap2} />
        </div>
      )}
        </>
      )}
      {activeTab === 'comparison' && (
        <div className="bg-[#181824] border border-[#232336] rounded-2xl p-8 my-8 shadow-lg text-white text-xl text-center">
          Pilot Comparison (en desarrollo)
        </div>
      )}
    </div>
  );
}