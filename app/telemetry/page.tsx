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
import { LapChart } from '../../components/telemetry/LapChart';
import { Skeleton } from "../../components/ui/skeleton";

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

  // Resetear selectedLap cuando cambian los selects principales
  useEffect(() => {
    setSelectedLap(null);
  }, [year, gp, session, driver]);

  // Cuando llegan las vueltas, setear la primera vuelta automáticamente
  useEffect(() => {
    if (laps.length > 0 && !selectedLap) {
      setSelectedLap(laps[0].lapNumber);
    }
  }, [laps, selectedLap]);

  // Cargar telemetría automáticamente cuando hay una vuelta seleccionada y selects completos
  useEffect(() => {
    if (year && gp && session && driver && selectedLap) {
      fetchTelemetry({ year, gp, session, driver, lap: selectedLap });
    }
  }, [year, gp, session, driver, selectedLap]);

  // Llamar a fetchLaps automáticamente cuando cambian los selects principales
  useEffect(() => {
    if (year && gp && session && driver) {
      fetchLaps({ year, gp, session, driver });
    }
  }, [year, gp, session, driver, fetchLaps]);

  // Eliminar lógica de submitted, ya no se usa

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
          <form className="flex flex-wrap gap-6 items-end bg-[#13131a] border border-[#232336] rounded-2xl p-8 mb-8 shadow-xl">
        <div className="flex flex-col gap-2">
          <label className="block text-gray-300 text-sm mb-1">Año</label>
          <YearSelect years={years} year={year} setYear={setYear} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="block text-gray-300 text-sm mb-1">GP</label>
          <GPSelect gps={gps || []} gp={gp} setGp={setGp} disabled={!year || loading.gps} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="block text-gray-300 text-sm mb-1">Sesión</label>
          <SessionSelect sessions={sessions || []} session={session} setSession={setSession} disabled={!gp || loading.sessions} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="block text-gray-300 text-sm mb-1">Piloto</label>
          <DriverSelect drivers={drivers || []} driver={driver} setDriver={setDriver} disabled={!session || loading.drivers} />
        </div>
      </form>
      
      {loading.years || loading.gps || loading.sessions || loading.drivers ? (
        <div className="text-blue-400 mb-4">Cargando opciones...</div>
      ) : null}
      
      {error && <div className="text-red-400 mb-4">{error}</div>}
      
          {(year && gp && session && driver) && (
        <div className="mb-8">
              <LapChart laps={laps} selectedLap={selectedLap} setSelectedLap={setSelectedLap} loading={loadingLaps} />
        </div>
      )}
      
          {data && selectedLap && !loadingTelemetry && (
        <div className="mb-8">
          <TelemetryPanel data={data} />
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