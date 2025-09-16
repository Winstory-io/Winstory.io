import { useState, useEffect, useCallback } from 'react';
import { 
  evaluateModeration, 
  computePayoutsAndXP, 
  ContentType, 
  ModerationStatus,
  ParticipantData,
  ModerationResult,
  PayoutResult
} from '../moderation-engine';

interface UseHybridModerationProps {
  votesYes: number;
  votesNo: number;
  stakeYes: number;
  stakeNo: number;
  mintPriceUSDC: number;
  contentType: ContentType;
  priceUSDC: number;
  participantsActive?: ParticipantData[];
  participantsPassive?: ParticipantData[];
  wincPerUSDC?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseHybridModerationReturn {
  moderationResult: ModerationResult | null;
  payoutResult: PayoutResult | null;
  isLoading: boolean;
  error: string | null;
  refreshModeration: () => Promise<void>;
  isDecisionFinal: boolean;
  victoryFactor: number;
  scores: {
    scoreYes: number;
    scoreNo: number;
    demYes: number;
    demNo: number;
    plutoYes: number;
    plutoNo: number;
  };
}

export const useHybridModeration = ({
  votesYes,
  votesNo,
  stakeYes,
  stakeNo,
  mintPriceUSDC,
  contentType,
  priceUSDC,
  participantsActive = [],
  participantsPassive = [],
  wincPerUSDC = '1000000000000000000', // 1 WINC = 1 USDC par défaut
  autoRefresh = true,
  refreshInterval = 30000 // 30 secondes
}: UseHybridModerationProps): UseHybridModerationReturn => {
  const [moderationResult, setModerationResult] = useState<ModerationResult | null>(null);
  const [payoutResult, setPayoutResult] = useState<PayoutResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshModeration = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Évaluation de la modération
      const result = evaluateModeration(
        votesYes,
        votesNo,
        BigInt(Math.floor(stakeYes * 1e18)),
        BigInt(Math.floor(stakeNo * 1e18)),
        mintPriceUSDC,
        Date.now(),
        Date.now() + 7 * 24 * 3600 * 1000, // 7 jours
        BigInt(wincPerUSDC)
      );

      setModerationResult(result);

      // Si décision finale, calculer les paiements
      if (result.status === ModerationStatus.VALIDATED || 
          result.status === ModerationStatus.REJECTED) {
        
        const payout = computePayoutsAndXP(
          contentType,
          priceUSDC,
          votesYes,
          votesNo,
          BigInt(Math.floor(stakeYes * 1e18)),
          BigInt(Math.floor(stakeNo * 1e18)),
          participantsActive,
          participantsPassive,
          BigInt(wincPerUSDC)
        );
        
        setPayoutResult(payout);
      } else {
        setPayoutResult(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error in hybrid moderation evaluation:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    votesYes, 
    votesNo, 
    stakeYes, 
    stakeNo, 
    mintPriceUSDC, 
    contentType, 
    priceUSDC, 
    participantsActive, 
    participantsPassive, 
    wincPerUSDC
  ]);

  // Auto-refresh si activé
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refreshModeration, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshModeration]);

  // Évaluation initiale
  useEffect(() => {
    refreshModeration();
  }, [refreshModeration]);

  // Calculs dérivés
  const isDecisionFinal = moderationResult ? 
    (moderationResult.status === ModerationStatus.VALIDATED || 
     moderationResult.status === ModerationStatus.REJECTED) : 
    false;

  const victoryFactor = moderationResult?.victoryFactor ? 
    Number(moderationResult.victoryFactor) / 1e18 : 0;

  // Calcul des scores détaillés
  const totalVotes = votesYes + votesNo;
  const totalStake = stakeYes + stakeNo;
  
  const demYes = totalVotes > 0 ? votesYes / totalVotes : 0;
  const demNo = totalVotes > 0 ? votesNo / totalVotes : 0;
  const plutoYes = totalStake > 0 ? stakeYes / totalStake : 0;
  const plutoNo = totalStake > 0 ? stakeNo / totalStake : 0;
  
  const scoreYes = moderationResult ? Number(moderationResult.scoreYes) / 1e18 : (demYes + plutoYes) / 2;
  const scoreNo = moderationResult ? Number(moderationResult.scoreNo) / 1e18 : (demNo + plutoNo) / 2;

  return {
    moderationResult,
    payoutResult,
    isLoading,
    error,
    refreshModeration,
    isDecisionFinal,
    victoryFactor,
    scores: {
      scoreYes,
      scoreNo,
      demYes,
      demNo,
      plutoYes,
      plutoNo
    }
  };
};

// Hook pour l'API de modération hybride
export const useHybridModerationAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluateModerationAPI = useCallback(async (data: {
    votesYes: number;
    votesNo: number;
    stakeYes: string;
    stakeNo: string;
    mintPriceUSDC: number;
    contentType: ContentType;
    priceUSDC: number;
    participantsActive?: ParticipantData[];
    participantsPassive?: ParticipantData[];
    wincPerUSDC?: string;
    currentTimestamp?: number;
    voteWindowEnd?: number;
    autoResolvePolicy?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/moderation/hybrid-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    evaluateModerationAPI,
    isLoading,
    error
  };
};
