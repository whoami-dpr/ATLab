import { NextResponse } from "next/server"

export const runtime = 'edge';

export async function GET() {
  // Map of team names to local logo paths in public/team-logos
  const teamLogos: Record<string, string> = {
    "Red Bull": "/team-logos/red-bull-racing.svg",
    "Mercedes": "/team-logos/mercedes.svg",
    "Ferrari": "/team-logos/ferrari.svg",
    "McLaren": "/team-logos/mclaren.svg",
    "Aston Martin": "/team-logos/aston-martin.svg",
    "Alpine": "/team-logos/alpine.svg",
    "Williams": "/team-logos/williams.svg",
    "Haas": "/team-logos/haas-f1-team.svg",
    "Kick Sauber": "/team-logos/kick-sauber.svg",
    "RB": "/team-logos/racing-bulls.svg",
    "Racing Bulls": "/team-logos/racing-bulls.svg",
  };

  return NextResponse.json({
    teams: teamLogos,
    success: true,
  });
}