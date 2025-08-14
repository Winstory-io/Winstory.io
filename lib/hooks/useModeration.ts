import { useState, useEffect, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { ModerationCampaign, ModerationProgress, ModerationSession } from '../types';

export const useModeration = () => {
  const account = useActiveAccount();
  const [currentSession, setCurrentSession] = useState<ModerationSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableCampaigns, setAvailableCampaigns] = useState<any[]>([]);

  // Fonction pour récupérer les campagnes disponibles depuis l'API
  const fetchAvailableCampaigns = useCallback(async (type?: string, creatorType?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (creatorType) params.append('creatorType', creatorType);

      const response = await fetch(`/api/moderation/campaigns?${params}`);
      const result = await response.json();

      if (result.success) {
        setAvailableCampaigns(result.data);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch campaigns');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fonction pour récupérer une campagne spécifique
  const fetchCampaignById = useCallback(async (campaignId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching campaign with ID:', campaignId);

      const campaigns = await fetchAvailableCampaigns();
      console.log('Available campaigns:', campaigns);

      const campaign = campaigns.find(c => c.id === campaignId);
      console.log('Found campaign:', campaign);

      if (campaign) {
        // Transformer les données Prisma en format ModerationSession
        const session: ModerationSession = {
          id: `session_${campaign.id}`,
          campaignId: campaign.id,
          moderatorWallet: account?.address || '',
          isEligible: true,
          startedAt: new Date(),
          campaign: {
            id: campaign.id,
            title: campaign.title,
            description: campaign.description,
            status: campaign.status,
            type: campaign.type,
            creatorType: campaign.creatorType,
            createdAt: campaign.createdAt,
            updatedAt: campaign.updatedAt,
            creatorInfo: campaign.creatorInfo,
            content: campaign.content,
            rewards: campaign.rewards,
            metadata: campaign.metadata,
            progress: campaign.progress
          },
          progress: campaign.progress
        };

        console.log('Created session:', session);
        setCurrentSession(session);
        return session;
      } else {
        throw new Error(`Campaign with ID ${campaignId} not found`);
      }
    } catch (err) {
      console.error('Error in fetchCampaignById:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch campaign');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchAvailableCampaigns, account?.address]);

  // Fonction pour vérifier la disponibilité des campagnes par type
  const checkCampaignsAvailability = useCallback(async () => {
    try {
      // Initial Story : modération du contenu créé par des entreprises B2C
      const initialB2CCampaigns = await fetchAvailableCampaigns('INITIAL', 'B2C_AGENCIES');
      
      // Initial Story : modération du contenu créé par des individus
      const initialIndividualCampaigns = await fetchAvailableCampaigns('INITIAL', 'INDIVIDUAL_CREATORS');
      
      // Completion : modération de contenus d'individus qui complètent des campagnes d'entreprises B2C
      const completionForB2CCampaigns = await fetchAvailableCampaigns('COMPLETION', 'FOR_B2C');
      
      // Completion : modération de contenus d'individus qui complètent des campagnes d'autres individus
      const completionForIndividualsCampaigns = await fetchAvailableCampaigns('COMPLETION', 'FOR_INDIVIDUALS');

      // Vérifier que chaque campagne a au minimum 22 modérateurs différents
      const filterEligibleCampaigns = (campaigns: any[]) => {
        return campaigns.filter(campaign => {
          if (!campaign.progress) return false;
          
          // Vérifier le nombre de modérateurs uniques
          const uniqueModerators = new Set();
          
          // Ajouter les modérateurs existants (si des sessions existent)
          if (campaign.moderations) {
            campaign.moderations.forEach((session: any) => {
              if (session.moderatorWallet) {
                uniqueModerators.add(session.moderatorWallet);
              }
            });
          }
          
          // Vérifier si on a au moins 22 modérateurs
          return uniqueModerators.size >= 22;
        });
      };

      return {
        hasInitialB2CCampaigns: filterEligibleCampaigns(initialB2CCampaigns).length > 0,
        hasInitialIndividualCampaigns: filterEligibleCampaigns(initialIndividualCampaigns).length > 0,
        hasCompletionB2CCampaigns: filterEligibleCampaigns(completionForB2CCampaigns).length > 0,
        hasCompletionIndividualCampaigns: filterEligibleCampaigns(completionForIndividualsCampaigns).length > 0
      };
    } catch (error) {
      console.error('Error checking campaigns availability:', error);
      return {
        hasInitialB2CCampaigns: false,
        hasInitialIndividualCampaigns: false,
        hasCompletionB2CCampaigns: false,
        hasCompletionIndividualCampaigns: false
      };
    }
  }, [fetchAvailableCampaigns]);

  // Fonction pour soumettre une décision de modération
  const submitModerationDecision = useCallback(async (
    decision: 'valid' | 'refuse', 
    contentType: 'creation' | 'completion'
  ) => {
    if (!currentSession) return false;

    try {
      // TODO: Implémenter la vraie logique de soumission vers la blockchain
      // Pour l'instant, on met à jour localement
      setCurrentSession(prev => {
        if (!prev) return null;
        const newProgress = { ...prev.progress };
        if (decision === 'valid') {
          newProgress.validVotes += 1;
        } else {
          newProgress.refuseVotes += 1;
        }
        newProgress.totalVotes += 1;
        
        return {
          ...prev,
          progress: newProgress
        };
      });

      return true;
    } catch (err) {
      console.error('Failed to submit moderation decision:', err);
      return false;
    }
  }, [currentSession]);

  // Fonction pour soumettre un score de complétion
  const submitCompletionScore = useCallback(async (score: number) => {
    if (!currentSession) return false;

    try {
      // TODO: Implémenter la vraie logique de soumission de score
      setCurrentSession(prev => {
        if (!prev) return null;
        const newProgress = { ...prev.progress };
        if (!newProgress.completionScores) {
          newProgress.completionScores = [];
        }
        newProgress.completionScores.push(score);
        
        return {
          ...prev,
          progress: newProgress
        };
      });

      return true;
    } catch (err) {
      console.error('Failed to submit completion score:', err);
      return false;
    }
  }, [currentSession]);

  // Charger les campagnes disponibles au montage du composant
  useEffect(() => {
    if (account?.address) {
      checkCampaignsAvailability();
    }
  }, [account?.address]);

  // Charger automatiquement la campagne quand campaignId change
  useEffect(() => {
    const loadCampaignFromUrl = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const campaignId = urlParams.get('campaignId');
      
      if (campaignId && account?.address) {
        console.log('Loading campaign from URL:', campaignId);
        await fetchCampaignById(campaignId);
      }
    };

    loadCampaignFromUrl();
  }, [account?.address]);

  return {
    currentSession,
    isLoading,
    error,
    availableCampaigns,
    submitModerationDecision,
    submitCompletionScore,
    fetchCampaignById,
    checkCampaignsAvailability,
    refreshData: () => checkCampaignsAvailability()
  };
}; 