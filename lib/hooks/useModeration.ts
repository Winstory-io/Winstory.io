import { useState, useEffect } from 'react';
import { ModerationStats, CompletionData } from '../../types/moderation';

// Mock data - in production, this would come from your backend
const mockModerationStats: ModerationStats = {
  stakers: {
    current: 15,
    required: 22
  },
  staking: {
    stakedAmount: 1240,
    mintPrice: 1000
  },
  voting: {
    validVotes: 67,
    refuseVotes: 33,
    requiredRatio: 2
  }
};

const mockCompletionData: CompletionData = {
  contentType: 'b2c',
  companyName: 'Acme Corp',
  agencyName: '',
  campaignTitle: "La grande aventure de l'innovation",
  startingText: "Ceci est le texte initial de l'utilisateur dans /yourwinstory.",
  guideline: "Consignes de l'utilisateur dans /yourwinstory.",
  standardRewards: "Récompenses standard renseignées ou non.",
  premiumRewards: "Récompenses premium renseignées ou non.",
  completingText: "Ceci est le texte de complétion soumis par la communauté.",
  videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  usedScores: [25, 75, 90]
};

export const useModeration = () => {
  const [stats, setStats] = useState<ModerationStats>(mockModerationStats);
  const [completionData, setCompletionData] = useState<CompletionData>(mockCompletionData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch moderation stats from backend
  const fetchModerationStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In production, this would be an API call
      // const response = await fetch('/api/moderation/stats');
      // const data = await response.json();
      
      // For now, simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update with new data (could be real-time updates)
      setStats(prevStats => ({
        ...prevStats,
        stakers: {
          ...prevStats.stakers,
          current: Math.min(prevStats.stakers.current + Math.floor(Math.random() * 3), prevStats.stakers.required)
        },
        voting: {
          ...prevStats.voting,
          validVotes: Math.max(0, prevStats.voting.validVotes + Math.floor(Math.random() * 10) - 5),
          refuseVotes: Math.max(0, prevStats.voting.refuseVotes + Math.floor(Math.random() * 10) - 5)
        }
      }));
    } catch (err) {
      setError('Failed to fetch moderation stats');
      console.error('Error fetching moderation stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to submit a completion score
  const submitCompletionScore = async (score: number) => {
    try {
      // In production, this would be an API call
      // const response = await fetch('/api/moderation/complete', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ score, completionId: 'completion-123' })
      // });
      
      // For now, just log the score
      console.log(`Completion scored with ${score}/100`);
      
      // Update used scores
      setCompletionData(prev => ({
        ...prev,
        usedScores: [...prev.usedScores, score]
      }));
      
      return true;
    } catch (err) {
      console.error('Error submitting completion score:', err);
      return false;
    }
  };

  // Function to submit a moderation decision
  const submitModerationDecision = async (decision: 'valid' | 'refuse', contentType: 'initial' | 'completion') => {
    try {
      // In production, this would be an API call
      // const response = await fetch('/api/moderation/decision', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ decision, contentType, contentId: 'content-123' })
      // });
      
      // For now, just log the decision
      console.log(`${contentType} content ${decision}ed`);
      
      return true;
    } catch (err) {
      console.error('Error submitting moderation decision:', err);
      return false;
    }
  };

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchModerationStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    completionData,
    loading,
    error,
    fetchModerationStats,
    submitCompletionScore,
    submitModerationDecision
  };
}; 