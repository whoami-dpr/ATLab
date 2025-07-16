import React from "react";
import ReactECharts from 'echarts-for-react';
import { TelemetryData } from '../../hooks/useTelemetry';

export interface TelemetryChartProps {
  data: TelemetryData;
  yKey?: keyof TelemetryData;
  label?: string;
  color?: string;
}

export function TelemetryChart({ data, yKey = "speed", label = "Speed", color = "#2196f3" }: TelemetryChartProps) {
  // Prepara los datos para ECharts
  const chartData = data.distance.map((distance, i) => [
    Number(distance),
    Number(data[yKey][i])
  ]).filter(point => Number.isFinite(point[1]));

  if (!chartData || chartData.length === 0) return null;

  // Calcular ticks uniformemente distribuidos (por ejemplo, 12 ticks)
  const minDist = Math.min(...chartData.map(d => d[0]));
  const maxDist = Math.max(...chartData.map(d => d[0]));
  const numTicks = 12;
  const tickStep = (maxDist - minDist) / (numTicks - 1);
  const ticks = Array.from({ length: numTicks }, (_, i) => Number((minDist + i * tickStep).toFixed(1)));

  const option = {
    grid: { left: 90, right: 20, top: 20, bottom: 40 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: '#232336',
      borderRadius: 8,
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        const p = params[0];
        return `<div style="font-weight:600;">${label}</div><div>Valor: ${p.data[1]}</div>`;
      }
    },
    xAxis: {
      type: 'value',
      name: 'Distancia (m)',
      nameLocation: 'middle',
      nameGap: 28,
      min: minDist,
      max: maxDist,
      splitNumber: numTicks,
      axisLabel: { color: '#fff', fontSize: 11, formatter: (v: number) => v.toFixed(1) },
      axisLine: { lineStyle: { color: '#888' } },
      splitLine: { show: true, lineStyle: { color: 'rgba(136,136,136,0.7)', type: 'dashed' } },
      interval: tickStep,
    },
    yAxis: {
      type: 'value',
      name: label,
      nameLocation: 'middle',
      nameGap: 36,
      axisLabel: { color: '#fff', fontSize: 11 },
      axisLine: { lineStyle: { color: '#888' } },
      splitLine: { show: true, lineStyle: { color: 'rgba(136,136,136,0.7)', type: 'dashed' } },
    },
    series: [
      {
        type: 'line',
        data: chartData,
        showSymbol: false,
        lineStyle: { color, width: 2 },
        emphasis: { focus: 'series' },
        smooth: true,
      }
    ]
  };

  return (
    <div className="w-full">
      <ReactECharts
        option={option}
        style={{ height: yKey === "speed" ? 340 : 200, width: '100%' }}
        notMerge
        lazyUpdate
        theme={undefined}
      />
    </div>
  );
} 