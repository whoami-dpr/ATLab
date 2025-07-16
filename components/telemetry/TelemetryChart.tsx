import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, DotProps } from "recharts";
import { TelemetryData } from '../../hooks/useTelemetry';

export interface TelemetryChartProps {
  data: TelemetryData;
  yKey?: keyof TelemetryData;
  label?: string;
  color?: string;
}

export function TelemetryChart({ data, yKey = "speed", label = "Speed", color = "#2196f3" }: TelemetryChartProps) {
  // Prepara los datos para Recharts
  const chartData = data.distance.map((distance, i) => ({
    distance,
    value: Number(data[yKey][i]),
  })).filter(point => Number.isFinite(point.value));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div style={{ background: "#232336", color: "#fff", padding: 10, borderRadius: 8, boxShadow: "0 2px 8px #0008" }}>
          <div style={{ fontWeight: 600 }}>{label}</div>
          {/* <div>Distancia: {Number(point.distance).toFixed(1)} m</div> */}
          <div>Valor: {point.value}</div>
        </div>
      );
    }
    return null;
  };

  // Custom dot
  const renderDot = (props: DotProps) => {
    const { cx, cy } = props;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={3}
        fill={color}
        stroke="#232336"
        strokeWidth={1}
      />
    );
  };

  if (!chartData || chartData.length === 0) return null;

  // Calcular ticks uniformemente distribuidos (por ejemplo, 12 ticks)
  const minDist = Math.min(...chartData.map(d => d.distance));
  const maxDist = Math.max(...chartData.map(d => d.distance));
  const numTicks = 12;
  const tickStep = (maxDist - minDist) / (numTicks - 1);
  const ticks = Array.from({ length: numTicks }, (_, i) => Number((minDist + i * tickStep).toFixed(1)));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={yKey === "speed" ? 340 : 200}>
        <LineChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
          <CartesianGrid stroke="#888" strokeDasharray="3 3" />
          <XAxis
            dataKey="distance"
            type="number"
            domain={[minDist, maxDist]}
            tick={{ fill: "#fff", fontSize: 11 }}
            label={{ value: "Distancia (m)", position: "insideBottom", fill: "#fff", fontWeight: 500, fontSize: 12, offset: 0 }}
            tickFormatter={v => v.toFixed(1)}
            ticks={ticks}
          />
          <YAxis
            dataKey="value"
            type="number"
            domain={[Math.floor(Math.min(...chartData.map(d => d.value)) - 1), Math.ceil(Math.max(...chartData.map(d => d.value)) + 1)]}
            tick={{ fill: "#fff", fontSize: 11 }}
            label={{ value: label, angle: -90, position: "insideLeft", fill: "#fff", fontWeight: 500, fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 