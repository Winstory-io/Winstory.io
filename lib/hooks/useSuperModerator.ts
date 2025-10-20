import { useState, useCallback, useEffect } from 'react';

interface SuperModeratorVoteData {
  campaignId: string;
  superModeratorWallet: string;
  completionId: string;
  voteDecision: 'VALID' | 'REFUSE';
  score?: number;
  timestamp?: number;
  transactionHash?: string;
}

interface SuperModeratorVoteResult {
  success: boolean;
  voteId?: string;
  finalScore?: number;
  finalDecision?: 'VALID' | 'REFUSE';
  communityScore?: number;
  communityDecision?: 'VALID' | 'REFUSE';
  consoleLogs?: string[];
  error?: string;
}

interface CommunityModerationData {
  validVotes: number;
  refuseVotes: number;
  averageScore: number;
  decision: 'VALID' | 'REFUSE';
  stakersCount: number;
  stakingPool: number;
}

interface UseSuperModeratorReturn {
  submitSuperModeratorVote: (voteData: SuperModeratorVoteData) => Promise<SuperModeratorVoteResult>;
  verifySuperModeratorRole: (campaignId: string, wallet: string) => Promise<boolean>;
  getCommunityModerationData: (campaignId: string, completionId: string) => Promise<CommunityModerationData | null>;
  calculateFinalScore: (communityScore: number, superModeratorScore: number) => number;
  calculateFinalDecision: (communityDecision: 'VALID' | 'REFUSE', superModeratorDecision: 'VALID' | 'REFUSE') => 'VALID' | 'REFUSE';
  isLoading: boolean;
  error: string | null;
}

export const useSuperModerator = (): UseSuperModeratorReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour soumettre un vote Super-Modérateur
  const submitSuperModeratorVote = useCallback(async (voteData: SuperModeratorVoteData): Promise<SuperModeratorVoteResult> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 [SUPER MODERATOR HOOK] Soumission du vote:', voteData);

      const response = await fetch('/api/moderation/super-moderator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voteData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la soumission du vote');
      }

      console.log('✅ [SUPER MODERATOR HOOK] Vote soumis avec succès:', result);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('❌ [SUPER MODERATOR HOOK] Erreur:', err);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fonction pour vérifier le rôle de Super-Modérateur
  const verifySuperModeratorRole = useCallback(async (campaignId: string, wallet: string): Promise<boolean> => {
    try {
      console.log('🔍 [SUPER MODERATOR HOOK] Vérification du rôle:', { campaignId, wallet });

      const response = await fetch(`/api/moderation/verify-super-moderator?campaignId=${campaignId}&wallet=${wallet}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la vérification');
      }

      console.log('✅ [SUPER MODERATOR HOOK] Vérification réussie:', result.isAuthorized);
      return result.isAuthorized;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('❌ [SUPER MODERATOR HOOK] Erreur de vérification:', err);
      return false;
    }
  }, []);

  // Fonction pour récupérer les données de modération communautaire
  const getCommunityModerationData = useCallback(async (campaignId: string, completionId: string): Promise<CommunityModerationData | null> => {
    try {
      console.log('🔍 [SUPER MODERATOR HOOK] Récupération des données communautaires:', { campaignId, completionId });

      const response = await fetch(`/api/moderation/community-data?campaignId=${campaignId}&completionId=${completionId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la récupération');
      }

      console.log('✅ [SUPER MODERATOR HOOK] Données communautaires récupérées:', result.data);
      return result.data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('❌ [SUPER MODERATOR HOOK] Erreur de récupération:', err);
      return null;
    }
  }, []);

  // Fonction pour calculer le score final avec pondération 51/49
  const calculateFinalScore = useCallback((communityScore: number, superModeratorScore: number): number => {
    const finalScore = (communityScore * 0.49) + (superModeratorScore * 0.51);
    console.log(`📊 [SUPER MODERATOR HOOK] Score final calculé: (${communityScore} × 0.49) + (${superModeratorScore} × 0.51) = ${finalScore.toFixed(2)}`);
    return Math.round(finalScore * 100) / 100; // Arrondir à 2 décimales
  }, []);

  // Fonction pour calculer la décision finale (avec pouvoir de basculement)
  const calculateFinalDecision = useCallback((communityDecision: 'VALID' | 'REFUSE', superModeratorDecision: 'VALID' | 'REFUSE'): 'VALID' | 'REFUSE' => {
    // Le Super-Modérateur peut basculer la décision communautaire
    const finalDecision = superModeratorDecision;
    
    if (superModeratorDecision !== communityDecision) {
      console.log(`🔄 [SUPER MODERATOR HOOK] Basculement de ${communityDecision} vers ${superModeratorDecision}`);
    } else {
      console.log(`✅ [SUPER MODERATOR HOOK] Confirmation de la décision communautaire: ${communityDecision}`);
    }
    
    return finalDecision;
  }, []);

  return {
    submitSuperModeratorVote,
    verifySuperModeratorRole,
    getCommunityModerationData,
    calculateFinalScore,
    calculateFinalDecision,
    isLoading,
    error
  };
};

// Hook spécialisé pour l'interface Super-Modérateur
export const useSuperModeratorInterface = (campaignId: string, completionId: string) => {
  const superModerator = useSuperModerator();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [communityData, setCommunityData] = useState<CommunityModerationData | null>(null);

  // Vérifier l'autorisation au montage
  useEffect(() => {
    const checkAuthorization = async () => {
      // TODO: Récupérer l'adresse wallet depuis le contexte
      const wallet = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'; // Mock
      
      const authorized = await superModerator.verifySuperModeratorRole(campaignId, wallet);
      setIsAuthorized(authorized);
    };

    checkAuthorization();
  }, [campaignId, superModerator]);

  // Charger les données communautaires au montage
  useEffect(() => {
    const loadCommunityData = async () => {
      const data = await superModerator.getCommunityModerationData(campaignId, completionId);
      setCommunityData(data);
    };

    loadCommunityData();
  }, [campaignId, completionId, superModerator]);

  return {
    ...superModerator,
    isAuthorized,
    communityData
  };
};
