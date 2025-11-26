"use client";

import { useState, useEffect } from "react";
import { Navbar } from "../../components/Navbar";
import { useF1Standings } from "../../hooks/useF1Standings";
import { StandingsList } from "../../components/StandingsList";
import { ChampionshipProgressChart } from "../../components/ChampionshipProgressChart";

export default function StandingsPage() {
  const { driverStandings, constructorStandings, loading, error, fetchStandings } = useF1Standings();
  const [selectedYear, setSelectedYear] = useState<string>("2025");

  useEffect(() => {
    fetchStandings(selectedYear);
  }, [selectedYear, fetchStandings]);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white font-sans">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-12 gap-6">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-3 tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Championship Standings
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-red-600 to-red-500 mx-auto rounded-full"></div>
          </div>
          
          {/* Year Selector - Pill Style */}
          <div className="flex items-center gap-2 bg-gray-800/40 p-1.5 rounded-full border border-gray-700/50">
            {['2025', '2024', '2023', '2022', '2021'].map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`
                  px-5 py-2 rounded-full font-semibold text-sm transition-all duration-200
                  ${selectedYear === year 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }
                `}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-900/20 rounded-xl border border-red-900/50">
            <p className="text-red-400 text-lg">Error loading standings: {error}</p>
            <button 
              onClick={() => fetchStandings(selectedYear)}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-bold"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-8 max-w-6xl mx-auto">
            {/* Championship Progress Chart */}
            <ChampionshipProgressChart year={selectedYear} />

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
