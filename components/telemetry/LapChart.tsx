import React, { useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { LapInfo } from "../../hooks/useTelemetry";
import { Skeleton } from "../ui/skeleton";

interface LapChartProps {
  laps: LapInfo[];
  selectedLap: number | null;
  setSelectedLap: (lap: number) => void;
  loading?: boolean;
}

function formatLapTime(seconds: number | null) {
  if (seconds === null) return "-";
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

// Formato con milisegundos para el tooltip
function formatLapTimeMs(seconds: number | null) {
  if (seconds === null) return "-";
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
  return `${min}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

// Mapeo de color para compuestos
const compoundColors: Record<string, string> = {
  soft: '#ff4650',
  medium: '#ffd12a',
  hard: '#f3f3f3',
  intermediate: '#43d675',
  wet: '#00aaff',
  unknown: '#888',
};

export function LapChart({ laps, selectedLap, setSelectedLap, loading }: LapChartProps) {
  const [showInvalidLaps, setShowInvalidLaps] = useState(false);
  if (loading) {
    return (
      <div className="w-full mb-6 relative flex flex-col items-start">
        <div role="status" className="space-y-3 animate-pulse w-full h-[260px] flex flex-col justify-center">
          {/* 10 filas de barras, distribuidas verticalmente */}
          {[...Array(10)].map((_, row) => (
            <div key={row} className="flex items-center w-full gap-3">
              {/* Cada fila tiene de 2 a 5 barras de diferentes anchos, pero todas usan flex-grow para ocupar el ancho */}
              {Array.from({length: 2 + (row % 4)}).map((_, col, arr) => (
                <div
                  key={col}
                  className={`h-3 rounded-full ${col % 2 === 0 ? 'bg-gray-700' : 'bg-gray-600'} w-full`}
                  style={{
                    flexGrow: 1 + Math.abs(Math.sin(row * col + col)),
                    maxWidth: `${100 / arr.length + Math.abs(Math.sin(row * col + col)) * 20}%`,
                  }}
                />
              ))}
            </div>
          ))}
          <span className="sr-only">Loading...</span>
        </div>
        <div className="flex gap-2 mt-2">
          <span className="ml-4 text-sm text-gray-400">Cargando gráfico de vueltas...</span>
        </div>
      </div>
    );
  }
  if (!laps || laps.length === 0) return null;
  // Ahora una vuelta es válida si es isValid o isPit
  const validLaps = laps.filter(lap => lap.lapTimeSeconds !== null && (lap.isValid || lap.isPit));
  const minLap = Math.min(...validLaps.map(l => l.lapTimeSeconds ?? Infinity));

  // Prepara los datos para Recharts
  const data = laps
    .filter(lap => showInvalidLaps || lap.isValid || lap.isPit)
    .map(lap => ({
      lapNumber: lap.lapNumber,
      lapTimeSeconds: lap.lapTimeSeconds,
      isValid: lap.isValid,
      isFastest: lap.lapTimeSeconds === minLap && (lap.isValid || lap.isPit),
      isSelected: lap.lapNumber === selectedLap,
      compound: lap.compound,
      isPit: lap.isPit,
    }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const lap = payload[0].payload;
      return (
        <div style={{ background: "#232336", color: "#fff", padding: 10, borderRadius: 8, boxShadow: "0 2px 8px #0008" }}>
          <div style={{ fontWeight: 600 }}>Vuelta {lap.lapNumber}</div>
          <div>Tiempo: {formatLapTimeMs(lap.lapTimeSeconds)}</div>
          <div>{lap.isValid ? "Válida" : "Inválida"}</div>
          {lap.compound ? (
            <img
              src={`/images/${lap.compound.toLowerCase()}.svg`}
              alt={lap.compound}
              style={{ width: 28, height: 28, marginTop: 8 }}
            />
          ) : (
            <div style={{ color: '#aaa', marginTop: 8 }}>Neumático no disponible</div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom dot
  const renderDot = (props: any) => {
    const { cx, cy, payload } = props;
    let fill = payload.isValid ? (compoundColors[(payload.compound || 'unknown').toLowerCase()] || '#fff') : "#888";
    if (payload.isFastest) fill = "#b266ff"; // Vuelta más rápida en violeta
    if (payload.isSelected) fill = "#3b82f6";
    const r = payload.isSelected ? 7 : 5;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={fill}
        stroke="#232336"
        strokeWidth={payload.isSelected ? 3 : 1}
        style={{ cursor: "pointer" }}
        onClick={() => setSelectedLap(payload.lapNumber)}
      />
    );
  };

  return (
    <div className="w-full mb-6 relative">
      <div className="flex gap-4 mb-2">
        <button
          className={`border px-4 py-2 rounded text-white ${showInvalidLaps ? 'border-blue-400' : 'border-gray-400'}`}
          onClick={() => setShowInvalidLaps(v => !v)}
        >
          {showInvalidLaps ? 'HIDE INVALID LAPS' : 'SHOW INVALID LAPS'}
        </button>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <CartesianGrid stroke="#888" strokeDasharray="3 3" />
          {data.filter(lap => lap.isPit).map(lap => (
            <ReferenceLine
              key={`pit-${lap.lapNumber}`}
              x={lap.lapNumber}
              stroke="#fbbf24"
              strokeDasharray="4 4"
              label={{ value: "PIT", position: "top", fill: "#fbbf24", fontWeight: 700, fontSize: 10 }}
            />
          ))}
          <XAxis
            dataKey="lapNumber"
            type="number"
            domain={[Math.min(...laps.map(l => l.lapNumber)), Math.max(...laps.map(l => l.lapNumber))]}
            tick={{ fill: "#fff" }}
            label={{ value: "Vuelta", position: "insideBottom", fill: "#fff", fontWeight: 600, offset: 0 }}
          />
          <YAxis
            dataKey="lapTimeSeconds"
            type="number"
            domain={[
              Math.floor(Math.min(...validLaps.map(l => l.lapTimeSeconds!)) - 1),
              Math.ceil(Math.max(...validLaps.map(l => l.lapTimeSeconds!)) + 1)
            ]}
            tick={{ fill: "#fff" }}
            label={{ value: "Tiempo (min:s)", angle: -90, position: "insideLeft", fill: "#fff", fontWeight: 600 }}
            tickFormatter={formatLapTime}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#3b82f6", strokeWidth: 2, fill: "#3b82f6", fillOpacity: 0.1 }} />
          <Scatter
            data={data}
            shape={renderDot}
            line={{ stroke: "#3b82f6", strokeWidth: 2 }}
          />
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex gap-2 mt-2">
        <span className="ml-4 text-sm text-gray-400">Haz clic en un punto para ver la telemetría de esa vuelta.</span>
      </div>
    </div>
  );
} 