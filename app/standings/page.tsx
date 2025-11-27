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
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0E14] text-gray-900 dark:text-white font-sans transition-colors duration-200">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with Year Selection */}
        <div className="mb-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                Championship Standings
              </h1>
              <div className="h-1 w-20 bg-red-600 rounded-full mt-2"></div>
            </div>
            
            {/* Year Input */}
            <div className="flex items-center gap-2">
              <label htmlFor="year-input" className="text-sm text-gray-600 dark:text-gray-300 font-semibold transition-colors duration-200">Year:</label>
              <input
                id="year-input"
                type="number"
                min="1950"
                max="2025"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-20 px-3 py-1.5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white font-bold text-sm text-center focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all hover:border-gray-400 dark:hover:border-gray-600 shadow-md"
              />
            </div>
          </div>
          
          {/* Quick Year Selection Buttons */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-500 transition-colors duration-200">Quick select:</span>
            <div className="relative">
              <div className="flex items-center gap-1 bg-gray-200/80 dark:bg-gray-800/50 p-1 rounded-full border border-gray-300 dark:border-gray-700/50 transition-colors duration-200">
                {['2025', '2024', '2023', '2022', '2021'].map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`
                      px-5 py-2 rounded-full font-semibold text-sm transition-all
                      ${selectedYear === year 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/50' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
          <div className="text-center py-12 bg-red-100 dark:bg-red-900/20 rounded-xl border border-red-300 dark:border-red-900/50 transition-colors duration-200">
            <p className="text-red-700 dark:text-red-400 text-lg transition-colors duration-200">Error loading standings: {error}</p>
            <button 
              onClick={() => fetchStandings(selectedYear)}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-bold"
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
