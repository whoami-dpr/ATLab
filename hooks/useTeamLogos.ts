import { useState, useEffect } from 'react';

export const useTeamLogos = () => {
  const [teamLogos, setTeamLogos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const response = await fetch('/api/f1/teams');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.teams) {
            setTeamLogos(data.teams);
          }
        }
      } catch (error) {
        console.error('Failed to fetch team logos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogos();
  }, []);

  const getTeamLogo = (teamName: string) => {
    if (!teamName) return null;
    
    // Try exact match
    if (teamLogos[teamName]) return teamLogos[teamName];
    
    // Try partial match or aliases
    const normalizedName = teamName.toLowerCase();
    const foundTeam = Object.keys(teamLogos).find(key => {
      const normalizedKey = key.toLowerCase();
      return normalizedName.includes(normalizedKey) || normalizedKey.includes(normalizedName);
    });
    
    return foundTeam ? teamLogos[foundTeam] : null;
  };

  return { teamLogos, getTeamLogo, loading };
};
