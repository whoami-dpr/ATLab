import React from "react";
import ReactECharts from 'echarts-for-react';
import { TelemetryData } from '../../hooks/useTelemetry';

export interface TelemetryChartProps {
  data: TelemetryData;
  data2?: TelemetryData | null;
  yKey?: keyof TelemetryData;
  label?: string;
  color?: string;
  color2?: string;
}

export function TelemetryChart({ data, data2, yKey = "speed", label = "Speed", color = "#2196f3", color2 = "#22d3ee" }: TelemetryChartProps) {
  // Prepara los datos para ECharts
  const chartData = data.distance.map((distance, i) => [
    Number(distance),
    Number(data[yKey][i])
  ]).filter(point => Number.isFinite(point[1]));
  const chartData2 = data2 && data2.distance && data2[yKey] ? data2.distance.map((distance, i) => [
    Number(distance),
    Number(data2[yKey][i])
  ]).filter(point => Number.isFinite(point[1])) : null;

  if ((!chartData || chartData.length === 0) && (!chartData2 || chartData2.length === 0)) return null;

  // Calcular ticks uniformemente distribuidos (por ejemplo, 12 ticks)
  const minDist = Math.min(...chartData.map(d => d[0]), ...(chartData2 ? chartData2.map(d => d[0]) : []));
  const maxDist = Math.max(...chartData.map(d => d[0]), ...(chartData2 ? chartData2.map(d => d[0]) : []));
  const numTicks = 12;
  const tickStep = (maxDist - minDist) / (numTicks - 1);
  const ticks = Array.from({ length: numTicks }, (_, i) => Number((minDist + i * tickStep).toFixed(1)));

  const series = [
    {
      type: 'line',
      data: chartData,
      showSymbol: false,
      lineStyle: { color, width: 2 },
      emphasis: { focus: 'series' },
      smooth: true,
      name: 'Vuelta 1',
    }
  ];
  if (chartData2 && chartData2.length > 0) {
    series.push({
      type: 'line',
      data: chartData2,
      showSymbol: false,
      lineStyle: { color: color2, width: 2, type: 'dashed' } as any,
      emphasis: { focus: 'series' },
      smooth: true,
      name: 'Vuelta 2',
    });
  }

  const option = {
    grid: { left: 90, right: 20, top: 20, bottom: 40 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: '#232336',
      borderRadius: 8,
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        let html = `<div style="font-weight:600;">${label}</div>`;
        params.forEach((p: any, idx: number) => {
          html += `<div style='color:${p.color};font-weight:600;'>${p.seriesName}: ${p.data[1]}</div>`;
        });
        return html;
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
      nameGap: 60,
      axisLabel: { color: '#fff', fontSize: 11 },
      nameTextStyle: { color: '#fff', fontSize: 13, fontWeight: 600 },
      axisLine: { lineStyle: { color: '#888' } },
      splitLine: { show: true, lineStyle: { color: 'rgba(136,136,136,0.7)', type: 'dashed' } },
    },
    series
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