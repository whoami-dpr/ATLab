"use client";

import { useState, useEffect } from "react";
import { Navbar } from "../../components/Navbar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from "../../components/ui/select";
import { useF1Standings } from "../../hooks/useF1Standings";
import { StandingsList } from "../../components/StandingsList";

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
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 tracking-tight">Championship Standings</h1>
            <p className="text-gray-400 text-lg">Season {selectedYear}</p>
          </div>
          
          <div className="w-full md:w-48">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white h-12">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectGroup>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
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
        )}
      </div>
    </div>
  );
}
