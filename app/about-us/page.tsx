"use client";

import { Navbar } from "../../components/Navbar";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";

export default function AboutUs() {
  const features = [
    {
      title: "Real-time Timing",
      description: "Positions, lap times, gaps and sector times updated every second",
      icon: "⏱️"
    },
    {
      title: "Race Telemetry",
      description: "Speed, RPM, tire temperature and fuel data",
      icon: "📊"
    },
    {
      title: "Weather & Conditions",
      description: "Temperature, humidity, atmospheric pressure and track status",
      icon: "🌤️"
    },
    {
      title: "Flags & Incidents",
      description: "Flag alerts, DRS, VSC, SC and incident notifications",
      icon: "🏁"
    }
  ];

  const dataSources = [
    { name: "SignalR", category: "Official Timing" },
    { name: "Weather APIs", category: "Weather" },
    { name: "FastF1", category: "Telemetry Data" }
  ];

  return (
    <div className="min-h-screen w-full relative">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      
      {/* Subtle background pattern */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="font-inter"><Navbar hideLogo /></div>
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-[50vh] px-4 py-12 text-center">
          <div className="mb-6 flex items-center justify-center">
            <span className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent select-none cursor-pointer">
              ATLab
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-white leading-tight">
            Live Timing & Telemetry
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-6 max-w-4xl leading-relaxed">
            ATLab (ARSIM Telemetry Lab) is a modern real-time F1 dashboard, inspired by professional Formula 1 panels. 
            Visualizes timing, weather, positions and much more data.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <a 
              href="https://github.com/whoami-dpr" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 text-center border-0 flex items-center justify-center gap-3 group"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              GitHub Profile
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <a 
              href="https://www.linkedin.com/in/joaquinmontes10/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 text-center border-0 flex items-center justify-center gap-3 group"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z"/>
              </svg>
              LinkedIn
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </section>

        <Separator className="my-12 bg-gray-800" />

        {/* Data Sources Section */}
        <section className="px-4 py-12 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Data Sources
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              APIs and services providing official F1 information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dataSources.map((source, index) => (
              <div key={index} className="text-center">
                <Badge variant="outline" className="text-sm px-3 py-2 border-gray-700 text-gray-300 hover:border-blue-500 hover:text-blue-400 transition-colors">
                  {source.name}
                </Badge>
                <p className="text-xs text-gray-500 mt-1">{source.category}</p>
              </div>
            ))}
          </div>
        </section>

        <Separator className="my-12 bg-gray-800" />

        {/* Technical Details Section */}
        <section className="px-4 py-12 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Technical Specifications
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Frontend</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li>• Next.js 15 with App Router</li>
                  <li>• React 19 with Server Components</li>
                  <li>• TypeScript for type safety</li>
                  <li>• Tailwind CSS for styling</li>
                  <li>• Radix UI for components</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Backend & APIs</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li>• Python with FastAPI</li>
                  <li>• SignalR for real-time</li>
                  <li>• F1 Live Timing API</li>
                  <li>• Weather APIs</li>
                  <li>• WebSocket connections</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-12 bg-gray-800" />

        {/* About Developer Section */}
        <section className="px-4 py-12 max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Developer
            </h2>
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden">
                <img 
                  src="https://github.com/whoami-dpr.png" 
                  alt="GitHub Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-gray-400 leading-relaxed mb-4">
                Systems Engineer specialized in cybersecurity.
              </p>
              <div className="flex justify-center gap-4 mb-4">
                <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs">
                  Real-time
                </Badge>
                <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/30 text-xs">
                  Data
                </Badge>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                <a 
                  href="https://github.com/whoami-dpr" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                  @whoami-dpr
                </a>
                <a 
                  href="https://www.linkedin.com/in/joaquinmontes10/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z"/>
                  </svg>
                  @joaquinmontes10
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-gray-800 bg-black/80 relative z-20 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-3">
              ATLab - ARSIM Telemetry Lab
            </p>
            <p className="text-xs text-gray-500 max-w-xl mx-auto leading-relaxed">
              Unofficial project. F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, 
              GRAND PRIX and related marks are trademarks of Formula One Licensing B.V.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 