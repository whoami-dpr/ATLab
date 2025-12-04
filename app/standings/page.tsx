"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useF1Standings } from "@/hooks/useF1Standings";
import { StandingsList } from "@/components/StandingsList";
import { ChampionshipProgressChart } from "@/components/ChampionshipProgressChart";
import { RaceResultsTable } from "@/components/RaceResultsTable";
import { SeasonAnalytics } from "@/components/SeasonAnalytics";

export default function StandingsPage() {
  const { driverStandings, constructorStandings, loading, error, fetchStandings } = useF1Standings();
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [yearInput, setYearInput] = useState<string>("2025");
  const [progressData, setProgressData] = useState<any>(null);
  const [progressLoading, setProgressLoading] = useState(true);

  useEffect(() => {
    fetchStandings(selectedYear);
  }, [selectedYear, fetchStandings]);

  useEffect(() => {
    const fetchProgress = async () => {
      setProgressLoading(true);
      try {
        const response = await fetch(`/api/f1/championship-progress?year=${selectedYear}`);
        const result = await response.json();
        if (result.success) {
          setProgressData(result);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setProgressLoading(false);
      }
    };

    fetchProgress();
  }, [selectedYear]);

  return (
    <div className="min-h-screen text-gray-900 dark:text-white font-sans transition-colors duration-200">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with Year Selection */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight leading-none text-gray-900 dark:text-white">
              Championship Standings
            </h1>
            <p className="mt-3 text-base md:text-lg text-gray-500 dark:text-gray-400 font-regular max-w-2xl leading-relaxed">
              Explore the full drivers' and constructors' standings, follow the championship battles with detailed progress charts, driver standings evolution, points distribution, and more.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end px-1 w-full">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 font-inter">Quick Select</span>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 font-inter">Select Season</span>
            </div>
            {/* Year Selector - Monochrome Minimalist */}
            <div className="flex flex-wrap items-center gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
            {['2025', '2024', '2023', '2022'].map((year) => (
              <button
                key={year}
                onClick={() => {
                  setSelectedYear(year);
                  setYearInput(year);
                }}
                className={`
                  px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300
                  ${selectedYear === year 
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md transform scale-105' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                  }
                `}
              >
                {year}
              </button>
            ))}
            
            <div className="w-px h-6 bg-gray-300 dark:bg-white/10 mx-1"></div>

            <div className="relative group">
              <input
                type="number"
                min="1950"
                max="2025"
                value={yearInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setYearInput(val);
                  if (val.length === 4 && parseInt(val) >= 1950 && parseInt(val) <= 2026) {
                    setSelectedYear(val);
                  }
                }}
                className="w-20 px-2 py-2 rounded-xl bg-transparent text-center text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5 focus:bg-white dark:focus:bg-white/10 focus:text-gray-900 dark:focus:text-white transition-all outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                placeholder="..."
              />
              <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-gray-200 dark:group-hover:border-white/10 pointer-events-none transition-colors"></div>
            </div>
          </div>
          </div>
        </div>

        {/* Championship Progress Chart and Race Results */}
        <div className="flex flex-col gap-8 max-w-6xl mx-auto mb-12">
          <ChampionshipProgressChart 
            year={selectedYear} 
            data={progressData} 
            loading={progressLoading} 
          />
          
          <SeasonAnalytics 
            driverStandings={driverStandings} 
            constructorStandings={constructorStandings} 
            year={selectedYear}
            progressData={progressData}
            loading={progressLoading}
          />

          <RaceResultsTable 
            year={selectedYear} 
            data={progressData} 
            loading={progressLoading} 
          />
        </div>

        {/* Standings Content Section */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 backdrop-blur-sm">
            <p className="text-red-600 dark:text-red-400 text-lg font-medium">Error loading standings: {error}</p>
            <button 
              onClick={() => fetchStandings(selectedYear)}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-bold shadow-lg shadow-red-600/20"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-8 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Drivers Column */}
              <StandingsList 
                title="Drivers Championship" 
                data={driverStandings} 
                type="driver" 
              />
              
              {/* Constructors Column */}
              <StandingsList 
                title="Constructors Championship" 
                data={constructorStandings} 
                type="constructor" 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
