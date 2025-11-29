import React from 'react';
import { Github, Linkedin } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white py-16 border-t border-white/10 mt-auto relative z-20">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
        
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-2">ATLab</h2>
          <p className="text-gray-400 text-lg">ARSIM Telemetry Lab</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-5xl mb-16">
          
          {/* Legal Disclaimer */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4">Legal Disclaimer</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              This platform operates as an independent, unofficial service and maintains no affiliation with Formula 1 companies. All trademarks including F1®, FORMULA ONE®, FORMULA 1®, FIA FORMULA ONE WORLD CHAMPIONSHIP®, GRAND PRIX®, and associated marks remain the exclusive property of Formula One Licensing B.V.
            </p>
          </div>

          {/* Data & Privacy */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4">Data & Privacy</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              We prioritize user privacy and data security. All telemetry data is sourced from publicly available feeds and processed in real-time without permanent storage of personal viewing patterns.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center gap-6 w-full border-t border-white/5 pt-8">
          
          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <span>© 2025 ATLab</span>
          </div>

          {/* Credits */}
          <div className="text-gray-500 text-sm">
            Built with passion by <span className="text-yellow-500 font-medium">Joaquin G. Montes</span>
          </div>

          {/* Social Icons */}
          <div className="flex gap-6 mt-2">
            <a 
              href="https://github.com/joaquingmontes" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Github size={20} />
            </a>
            <a 
              href="https://linkedin.com/in/joaquingmontes" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
