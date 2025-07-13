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
          <div>Distancia: {point.distance} m</div>
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

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <CartesianGrid stroke="#222" />
          <XAxis
            dataKey="distance"
            type="number"
            domain={[Math.min(...chartData.map(d => d.distance)), Math.max(...chartData.map(d => d.distance))]}
            tick={{ fill: "#fff" }}
            label={{ value: "Distancia (m)", position: "insideBottom", fill: "#fff", fontWeight: 600, offset: 0 }}
          />
          <YAxis
            dataKey="value"
            type="number"
            domain={[Math.floor(Math.min(...chartData.map(d => d.value)) - 1), Math.ceil(Math.max(...chartData.map(d => d.value)) + 1)]}
            tick={{ fill: "#fff" }}
            label={{ value: label, angle: -90, position: "insideLeft", fill: "#fff", fontWeight: 600 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: color, strokeWidth: 2, fill: color, fillOpacity: 0.1 }} />
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