"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useF1Standings } from "@/hooks/useF1Standings";
import { StandingsList } from "@/components/StandingsList";
import { ChampionshipProgressChart } from "@/components/ChampionshipProgressChart";
import { RaceResultsTable } from "@/components/RaceResultsTable";

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
        {/* Header with Year Selection */}
        <div className="mb-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white">
                Championship Standings
              </h1>
              <div className="h-1 w-20 bg-red-600 rounded-full mt-2"></div>
            </div>
            
            {/* Year Input */}
            <div className="flex items-center gap-2">
              <label htmlFor="year-input" className="text-sm text-gray-400 font-medium">Year:</label>
              <input
                id="year-input"
                type="number"
                min="1950"
                max="2025"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-24 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white font-bold text-center focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/50 transition-all"
              />
            </div>
          </div>
          
          {/* Quick Year Selection Buttons */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Quick select:</span>
            <div className="relative">
              <div className="flex items-center gap-1 bg-gray-800/50 p-1 rounded-full border border-gray-700/50">
                {['2025', '2024', '2023', '2022', '2021'].map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`
                      px-5 py-2 rounded-full font-semibold text-sm transition-all
                      ${selectedYear === year 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/50' 
                        : 'text-gray-400 hover:text-white'
                      }
                    `}
                  >
                    {year}
                  </button>
                ))}
              </div>
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/20 via-red-500/20 to-red-600/20 rounded-full blur opacity-50 -z-10"></div>
            </div>
          </div>
        </div>

        {/* Championship Progress Chart and Race Results */}
        <div className="flex flex-col gap-8 max-w-6xl mx-auto mb-12">
          <ChampionshipProgressChart year={selectedYear} />
          <RaceResultsTable year={selectedYear} />
        </div>

        {/* Standings Content Section */}
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
