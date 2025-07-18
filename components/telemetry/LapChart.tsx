import React, { useState } from "react";
import ReactECharts from 'echarts-for-react';
import { LapInfo } from "../../hooks/useTelemetry";
import { Skeleton } from "../ui/skeleton";

interface LapChartProps {
  laps: LapInfo[];
  selectedLap: number | null;
  setSelectedLap: (lap: number | null) => void;
  selectedLap2?: number | null;
  setSelectedLap2?: (lap: number | null) => void;
  loading?: boolean;
  comparisonMode?: boolean;
}

const compoundColors: Record<string, string> = {
  soft: '#ff4650',
  medium: '#ffd12a',
  hard: '#f3f3f3',
  intermediate: '#43d675',
  wet: '#00aaff',
  unknown: '#888',
};

function LapChartInner({ laps, selectedLap, setSelectedLap, selectedLap2, setSelectedLap2, loading, comparisonMode }: LapChartProps) {
  if (loading) {
    return (
      <div className="w-full mb-6 relative flex flex-col items-start">
        <div role="status" className="space-y-3 animate-pulse w-full h-[260px] flex flex-col justify-center">
          {[...Array(10)].map((_, row) => (
            <div key={row} className="flex items-center w-full gap-3">
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

  // Filtrar los datos a mostrar
  const filteredLaps = laps.filter(lap => true); // Show all laps

  // Determinar el rango de vueltas
  const minLapNumber = Math.min(...laps.map(l => l.lapNumber));
  const maxLapNumber = Math.max(...laps.map(l => l.lapNumber));
  // Mapeo vuelta -> objeto lap
  const lapMap = new Map(laps.map(lap => [lap.lapNumber, lap]));
  // Construir arrays completos para ECharts
  const lapNumbers: number[] = [];
  const lapTimes: (number|null)[] = [];
  const colors: string[] = [];
  const pitLaps: number[] = [];
  const [showInvalidLaps, setShowInvalidLaps] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  for (let n = minLapNumber; n <= maxLapNumber; n++) {
    const lap = lapMap.get(n);
    lapNumbers.push(n);
    if (!lap) {
      lapTimes.push(null);
      colors.push('#888');
      continue;
    }
    // Solo mostrar tiempo si es válida o PIT, o si el toggle está activado
    const isVisible = showInvalidLaps || lap.isValid || lap.isPit;
    lapTimes.push(isVisible ? lap.lapTimeSeconds : null);
    if (lap.lapTimeSeconds === minLap && (lap.isValid || lap.isPit)) {
      colors.push('#b266ff');
    } else if (n === selectedLap) {
      colors.push('#2563eb'); // azul para la vuelta principal
    } else if (selectedLap2 && n === selectedLap2) {
      colors.push('#22d3ee'); // cian para la segunda vuelta
    } else if (!lap.isValid && !lap.isPit) {
      colors.push('#888');
    } else {
      colors.push(compoundColors[(lap.compound || 'unknown').toLowerCase()] || '#fff');
    }
    if (lap.isPit) pitLaps.push(n);
  }

  // Tooltip personalizado
  function formatLapTimeMs(seconds: number | null) {
    if (seconds === null) return "-";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
    return `${min}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }

  // Calcular dominio Y dinámico según el toggle
  let yMin = 0, yMax = 0, minLapTime = 0;
  if (showInvalidLaps) {
    const allLapTimes = laps.map(l => l.lapTimeSeconds).filter((v): v is number => typeof v === 'number' && isFinite(v));
    minLapTime = Math.min(...allLapTimes);
    const maxLapTime = Math.max(...allLapTimes);
    yMin = Math.max(0, Math.floor(minLapTime - 1));
    yMax = Math.ceil(maxLapTime + 1);
  } else {
    minLapTime = Math.min(...validLaps.map(l => l.lapTimeSeconds ?? Infinity));
    const maxLapTime = Math.max(...validLaps.map(l => l.lapTimeSeconds ?? 0));
    yMin = Math.max(0, Math.floor(minLapTime - 1));
    yMax = Math.ceil(maxLapTime + 1);
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
        const p = params[0];
        const lap = lapMap.get(lapNumbers[p.dataIndex]);
        if (!lap) return `<div>Sin datos para esta vuelta</div>`;
        const compound = lap.compound ? lap.compound.toLowerCase() : 'unknown';
        const compoundImg = `/images/${compound}.svg`;
        return `
          <div style="font-weight:600;">Vuelta ${lap.lapNumber}</div>
          <div>Tiempo: ${formatLapTimeMs(lap.lapTimeSeconds)}</div>
          <div>${lap.isValid ? "Válida" : "Inválida"}</div>
          <div style="margin-top:6px;display:flex;align-items:center;gap:6px;">
            <img src='${compoundImg}' alt='${compound}' style='width:22px;height:22px;vertical-align:middle;' />
            <span style='color:#aaa;'>${lap.compound ? lap.compound : 'Neumático no disponible'}</span>
          </div>
        `;
      }
    },
    xAxis: {
      type: 'category',
      data: lapNumbers,
      name: 'Vuelta',
      nameLocation: 'middle',
      nameGap: 28,
      axisLabel: { color: '#fff', fontSize: 11 },
      axisLine: { lineStyle: { color: '#888' } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: 'Tiempo (min:s)',
      nameLocation: 'middle',
      nameGap: 60,
      nameTextStyle: { color: '#fff', fontSize: 13, fontWeight: 600 },
      min: yMin,
      max: yMax,
      axisLabel: { color: '#fff', fontSize: 11, formatter: (v: number) => {
        if (v < 0) return '-';
        const min = Math.floor(v / 60);
        const sec = Math.floor(v % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
      } },
      axisLine: { lineStyle: { color: '#888' } },
      splitLine: { show: true, lineStyle: { color: 'rgba(136,136,136,0.7)', type: 'dashed' } },
    },
    series: [
      // Línea curva
      {
        type: 'line',
        data: lapTimes,
        showSymbol: false,
        lineStyle: { color: '#3b82f6', width: 2 },
        emphasis: { focus: 'series' },
        smooth: true,
        z: 1,
      },
      // Puntos de cada vuelta
      {
        type: 'scatter',
        data: lapTimes,
        symbolSize: 10,
        itemStyle: {
          color: (params: any) => colors[params.dataIndex],
          borderColor: '#232336',
          borderWidth: 2,
          opacity: 1,
        },
        z: 2,
      },
      // Líneas de PIT
      ...pitLaps.map((lapNum) => ({
        type: 'line',
        markLine: {
          symbol: 'none',
          data: [
            { xAxis: lapNum }
          ],
          lineStyle: { color: '#fbbf24', type: 'dashed', width: 2 },
          label: { show: true, formatter: 'PIT', position: 'top', color: '#fbbf24', fontWeight: 700, fontSize: 10 }
        },
        z: 0,
      })),
    ]
  };

  const [selectMode, setSelectMode] = useState<'main' | 'secondary'>('main');

  // onEvents para selección explícita
  const onEvents = {
    click: (params: any) => {
      if (typeof params.dataIndex === 'number') {
        const lapNum = lapNumbers[params.dataIndex];
        if (!lapNum) return;
        if (selectMode === 'main') {
          if (lapNum === selectedLap) {
            setSelectedLap(null);
          } else {
            setSelectedLap(lapNum);
          }
        } else if (selectMode === 'secondary') {
          if (lapNum === selectedLap2) {
            setSelectedLap2 && setSelectedLap2(null);
          } else {
            setSelectedLap2 && setSelectedLap2(lapNum);
          }
        }
      }
    }
  };

  return (
    <div className="w-full mb-6 relative">
      {/* Barra de acciones mejorada */}
      <div className="flex flex-wrap gap-3 p-3 bg-[#181824] rounded-2xl shadow mb-6 items-center">
        <button
          className={`px-4 py-2 rounded-lg font-semibold border-2 transition-all duration-150 ${showInvalidLaps ? 'bg-blue-700 border-blue-400 text-white shadow' : 'bg-[#232336] border-gray-500 text-gray-200 hover:bg-blue-900 hover:text-white'}`}
          onClick={() => setShowInvalidLaps(v => !v)}
        >
          {showInvalidLaps ? 'Ocultar vueltas inválidas' : 'Mostrar vueltas inválidas'}
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold border-2 transition-all duration-150 ${showComparison ? 'bg-blue-700 border-blue-400 text-white shadow' : 'bg-[#232336] border-gray-500 text-gray-200 hover:bg-blue-900 hover:text-white'}`}
          onClick={() => setShowComparison(v => !v)}
        >
          {showComparison ? 'Ocultar comparación' : 'Comparar vueltas'}
        </button>
        {showComparison && (
          <>
            <button
              className={`px-4 py-2 rounded-lg font-semibold border-2 transition-all duration-150 ${selectMode === 'main' ? 'bg-blue-600 border-blue-300 text-white shadow' : 'bg-[#232336] border-gray-500 text-gray-200 hover:bg-blue-900 hover:text-white'}`}
              onClick={() => setSelectMode('main')}
            >
              Seleccionar vuelta principal
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold border-2 transition-all duration-150 ${selectMode === 'secondary' ? 'bg-cyan-600 border-cyan-300 text-white shadow' : 'bg-[#232336] border-gray-500 text-gray-200 hover:bg-cyan-900 hover:text-white'}`}
              onClick={() => setSelectMode('secondary')}
            >
              Seleccionar vuelta secundaria
            </button>
          </>
        )}
      </div>
      {/* Gráfico */}
      <ReactECharts
        option={option}
        style={{ height: 260, width: '100%' }}
        notMerge
        lazyUpdate
        theme={undefined}
        onEvents={onEvents}
      />
      {/* Leyenda y ayuda */}
      <div className="flex gap-2 mt-2 items-center">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ borderLeft: '3px dashed #fbbf24', height: 16, marginRight: 6, display: 'inline-block' }}></span>
          <span className="text-xs text-yellow-300 font-semibold">PIT (parada en boxes)</span>
        </span>
        <span className="ml-4 text-xs text-blue-400 font-semibold">● Vuelta principal</span>
        <span className="ml-2 text-xs text-cyan-300 font-semibold">● Vuelta secundaria</span>
      </div>
      <div className="flex gap-2 mt-2">
        <span className="ml-4 text-sm text-gray-400">Haz clic en un punto para asignar la vuelta seleccionada ({selectMode === 'main' ? 'principal' : 'secundaria'}).</span>
      </div>
    </div>
  );
}

// Memo para evitar rerender innecesario
export const LapChart = React.memo(LapChartInner, (prev, next) => {
  return prev.laps === next.laps && prev.loading === next.loading;
}); 