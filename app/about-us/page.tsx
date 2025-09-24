"use client";

import { Navbar } from "../../components/Navbar";
import { useThemeOptimized } from "../../hooks/useThemeOptimized";
import React from "react";
import { ArrowRight, Github, Linkedin, Gauge, Target, Timer, Building2, Cpu, Database, Wifi, BarChart3, Clock } from "lucide-react";

export default function AboutUs() {
  const { theme } = useThemeOptimized();

  const features = [
    {
      title: "Live Timing Data",
      description: "Real-time driver positions, lap times, sector times, and gap calculations updated every 100ms during F1 sessions",
      icon: <Gauge className="w-6 h-6" />
    },
    {
      title: "Driver Analytics",
      description: "Track driver performance with positions gained/lost, fastest laps, pit stop times, and retirement status",
      icon: <Target className="w-6 h-6" />
    },
    {
      title: "Session Management",
      description: "Complete F1 weekend schedule with practice, qualifying, sprint, and race sessions with accurate timing",
      icon: <Timer className="w-6 h-6" />
    },
    {
      title: "Team Information",
      description: "Real-time team standings, driver assignments, and team-specific color coding for easy identification",
      icon: <Building2 className="w-6 h-6" />
    }
  ];

  const techStack = [
    { name: "Next.js 15", category: "Frontend", icon: <Cpu className="w-4 h-4" /> },
    { name: "TypeScript", category: "Language", icon: <Database className="w-4 h-4" /> },
    { name: "SignalR", category: "Real-time", icon: <Wifi className="w-4 h-4" /> },
    { name: "Tailwind CSS", category: "Styling", icon: <BarChart3 className="w-4 h-4" /> }
  ];

  return (
    <div className={`min-h-screen w-full relative theme-transition ${
      theme === 'light' 
        ? 'text-gray-900' 
        : 'bg-black text-white'
    }`}>
      {/* Background gradient */}
      <div className="absolute inset-0 z-0" style={{
        background: theme === 'light'
          ? "linear-gradient(180deg, #f0f8ff 0%, #cce7ff 100%)"
          : "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.15), transparent 70%), #000000"
      }} />
      
      <div className="relative z-10">
        <Navbar />
        
        
        {/* Hero Section */}
        <section className="pt-20 pb-32 px-6 max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className={`text-6xl md:text-7xl font-bold mb-6 tracking-tight transition-colors duration-500 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              ATLab
            </h1>
            <p className={`text-xl md:text-2xl font-light leading-relaxed max-w-3xl mx-auto transition-colors duration-500 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Professional Formula 1 live timing and telemetry dashboard. 
              Built for enthusiasts who demand precision and performance.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <a 
              href="https://github.com/whoami-dpr" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-medium text-lg transition-all duration-300 hover:scale-105 ${
                theme === 'light'
                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              <Github className="w-5 h-5" />
              View on GitHub
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a 
              href="https://www.linkedin.com/in/joaquinmontes10/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`group inline-flex items-center justify-center gap-3 px-8 py-4 border rounded-full font-medium text-lg transition-all duration-300 hover:scale-105 ${
                theme === 'light'
                  ? 'border-gray-300 text-gray-900 hover:border-gray-900 hover:bg-gray-900 hover:text-white'
                  : 'border-gray-600 text-white hover:border-white hover:bg-white hover:text-black'
              }`}
            >
              <Linkedin className="w-5 h-5" />
              Connect
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 transition-colors duration-500 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Built for Performance
            </h2>
            <p className={`text-xl max-w-2xl mx-auto transition-colors duration-500 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Every feature designed with Formula 1 professionals in mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 mb-6 transition-all duration-300 group-hover:scale-110 ${
                  theme === 'light'
                    ? 'text-gray-600 group-hover:text-blue-600'
                    : 'text-gray-400 group-hover:text-blue-400'
                }`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-base leading-relaxed transition-colors duration-300 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="py-10 px-6 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 transition-colors duration-500 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Technology Stack
            </h2>
            <p className={`text-xl transition-colors duration-500 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Modern tools for modern performance
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {techStack.map((tech, index) => (
              <div key={index} className={`group text-center p-6 rounded-2xl border transition-all duration-300 ${
                theme === 'light'
                  ? 'bg-white/30 border-gray-200/30 hover:border-gray-300/50 hover:bg-white/50'
                  : 'bg-gray-900/20 border-gray-800/30 hover:border-gray-700/50 hover:bg-gray-900/40'
              }`}>
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  theme === 'light'
                    ? 'bg-gray-200/50 text-gray-600 group-hover:text-gray-900 group-hover:bg-gray-300/50'
                    : 'bg-gray-800/50 text-gray-400 group-hover:text-white group-hover:bg-gray-700/50'
                }`}>
                  {tech.icon}
                </div>
                <h3 className={`font-semibold mb-1 transition-colors duration-500 ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}>{tech.name}</h3>
                <p className={`text-sm transition-colors duration-500 ${
                  theme === 'light' ? 'text-gray-500' : 'text-gray-500'
                }`}>{tech.category}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 px-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 transition-colors duration-500 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>99.9%</div>
              <div className={`transition-colors duration-500 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>Uptime</div>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 transition-colors duration-500 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>&lt;100ms</div>
              <div className={`transition-colors duration-500 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>Latency</div>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 transition-colors duration-500 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}>24/7</div>
              <div className={`transition-colors duration-500 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>Monitoring</div>
            </div>
          </div>
        </section>

        {/* Developer Section */}
        <section className="py-12 px-6 max-w-2xl mx-auto">
          <div className="text-center">
            <h2 className={`text-2xl font-bold mb-8 transition-colors duration-500 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Meet the Developer
            </h2>
            
            <div className={`w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 ${
              theme === 'light' ? 'ring-2 ring-gray-200' : 'ring-2 ring-gray-700'
            }`}>
              <img 
                src="https://github.com/whoami-dpr.png" 
                alt="Joaquín Montes" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <h3 className={`text-xl font-semibold mb-1 transition-colors duration-500 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Joaquín Montes
            </h3>
            
            <p className={`text-sm font-medium mb-3 transition-colors duration-500 ${
              theme === 'light' ? 'text-blue-600' : 'text-blue-400'
            }`}>
              Systems Engineer
            </p>

            <p className={`text-sm leading-relaxed mb-6 max-w-md mx-auto transition-colors duration-500 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Specialized in cybersecurity and real-time data processing. 
              Passionate about Formula 1 and building tools that bring fans closer to the action.
            </p>

            <div className="flex justify-center gap-3">
              <a 
                href="https://github.com/whoami-dpr" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/25 ${
                  theme === 'light'
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-white text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Github className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-sm font-medium">GitHub</span>
              </a>
              <a 
                href="https://www.linkedin.com/in/joaquinmontes10/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 ${
                  theme === 'light'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <Linkedin className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-sm font-medium">LinkedIn</span>
              </a>
            </div>
          </div>
        </section>

      {/* Footer */}
         <footer className={`border-t backdrop-blur-sm transition-all duration-500 ${
           theme === 'light'
             ? 'border-gray-800/50 bg-black/80'
             : 'border-gray-800/50 bg-black/50'
         }`}>
          <div className="max-w-4xl mx-auto px-6 py-12 text-center">
            <div className="mb-6">
              <h3 className={`text-2xl font-bold mb-2 transition-colors duration-500 ${
                theme === 'light' ? 'text-white' : 'text-white'
              }`}>ATLab</h3>
              <p className={`transition-colors duration-500 ${
                theme === 'light' ? 'text-gray-300' : 'text-gray-400'
              }`}>ARSIM Telemetry Lab</p>
      </div>

            <p className={`text-sm max-w-2xl mx-auto leading-relaxed mb-8 transition-colors duration-500 ${
              theme === 'light' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Unofficial project. F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, 
              GRAND PRIX and related marks are trademarks of Formula One Licensing B.V.
            </p>
            
            <div className="flex justify-center gap-8">
              <a 
                href="https://github.com/whoami-dpr" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`transition-colors duration-300 ${
                  theme === 'light'
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://www.linkedin.com/in/joaquinmontes10/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`transition-colors duration-300 ${
                  theme === 'light'
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                <Linkedin className="w-5 h-5" />
              </a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
} 