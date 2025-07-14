import React from "react";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { LapInfo } from "../../hooks/useTelemetry";

interface LapChartProps {
  laps: LapInfo[];
  selectedLap: number | null;
  setSelectedLap: (lap: number) => void;
}

function formatLapTime(seconds: number | null) {
  if (seconds === null) return "-";
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toFixed(3).padStart(6, '0')}`;
}

export function LapChart({ laps, selectedLap, setSelectedLap }: LapChartProps) {
  if (!laps || laps.length === 0) return null;
  const validLaps = laps.filter(lap => lap.lapTimeSeconds !== null && lap.isValid);
  const minLap = Math.min(...validLaps.map(l => l.lapTimeSeconds ?? Infinity));

  // Prepara los datos para Recharts
  const data = laps.map(lap => ({
    lapNumber: lap.lapNumber,
    lapTimeSeconds: lap.lapTimeSeconds,
    isValid: lap.isValid,
    isFastest: lap.lapTimeSeconds === minLap && lap.isValid,
    isSelected: lap.lapNumber === selectedLap,
    compound: lap.compound,
    isPit: lap.isPit, // Added isPit to data
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const lap = payload[0].payload;
      console.log('Tooltip lap:', lap); // <-- log para depuración
      return (
        <div style={{ background: "#232336", color: "#fff", padding: 10, borderRadius: 8, boxShadow: "0 2px 8px #0008" }}>
          <div style={{ fontWeight: 600 }}>Vuelta {lap.lapNumber}</div>
          <div>Tiempo: {formatLapTime(lap.lapTimeSeconds)}</div>
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
    let fill = payload.isValid ? "#fff" : "#888";
    if (payload.isFastest) fill = "#ffe066";
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
      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <CartesianGrid stroke="#222" />
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
            domain={[Math.floor(Math.min(...laps.map(l => l.lapTimeSeconds ?? 0)) - 1), Math.ceil(Math.max(...laps.map(l => l.lapTimeSeconds ?? 0)) + 1)]}
            tick={{ fill: "#fff" }}
            label={{ value: "Tiempo (s)", angle: -90, position: "insideLeft", fill: "#fff", fontWeight: 600 }}
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