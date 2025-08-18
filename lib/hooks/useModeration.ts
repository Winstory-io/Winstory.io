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

      // Pour les tests, utiliser directement les données mockées
      const { mockCampaigns } = await import('../mockData');
      console.log('Using mock campaigns:', mockCampaigns);
      
      // Filtrer les campagnes selon le type et créateur spécifiés
      let filteredCampaigns = mockCampaigns;
      
      if (type && creatorType) {
        filteredCampaigns = mockCampaigns.filter((campaign: any) => {
          // Vérifier que le type de campagne correspond
          const typeMatch = campaign.type === type;
          
          // Vérifier que le type de créateur correspond
          const creatorMatch = campaign.creatorType === creatorType;
          
          return typeMatch && creatorMatch;
        });
      }
      
      setAvailableCampaigns(filteredCampaigns);
      return filteredCampaigns;
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
      console.log('DEBUG: fetchCampaignById called with:', campaignId);
      setIsLoading(true);
      setError(null);

      console.log('Fetching campaign with ID:', campaignId);

      // Utiliser directement les données mockées
      const { mockCampaigns } = await import('../mockData');
      console.log('Available mock campaigns:', mockCampaigns);
      
      const campaign = mockCampaigns.find(c => c.id === campaignId);
      console.log('Found campaign:', campaign);

      if (campaign) {
        // Créer une session simple sans transformation complexe
        const session: ModerationSession = {
          id: `session_${campaign.id}`,
          campaignId: campaign.id,
          moderatorWallet: account?.address || '',
          isEligible: true,
          startedAt: new Date(),
          campaign: campaign as any, // Utiliser any pour éviter les conflits de type
          progress: campaign.progress as any
        };

        console.log('Created session:', session);
        setCurrentSession(session);
        setIsLoading(false); // S'assurer que isLoading est mis à false
        return session;
      } else {
        throw new Error(`Campaign with ID ${campaignId} not found`);
      }
    } catch (err) {
      console.error('Error in fetchCampaignById:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch campaign');
      setIsLoading(false); // S'assurer que isLoading est mis à false même en cas d'erreur
      return null;
    }
  }, [account?.address]);

  // Fonction pour vérifier la disponibilité des campagnes par type
  const checkCampaignsAvailability = useCallback(async () => {
    try {
      // Utiliser l'API pour vérifier la disponibilité
      const campaigns = await fetchAvailableCampaigns();
      
      // Analyser les campagnes disponibles par type
      const availability = {
        hasInitialB2CCampaigns: campaigns.some(c => c.type === 'INITIAL' && c.creatorType === 'B2C_AGENCIES'),
        hasInitialIndividualCampaigns: campaigns.some(c => c.type === 'INITIAL' && c.creatorType === 'INDIVIDUAL_CREATORS'),
        hasCompletionB2CCampaigns: campaigns.some(c => c.type === 'COMPLETION' && c.creatorType === 'FOR_B2C'),
        hasCompletionIndividualCampaigns: campaigns.some(c => c.type === 'COMPLETION' && c.creatorType === 'FOR_INDIVIDUALS')
      };

      return availability;
    } catch (err) {
      console.error('Error checking campaigns availability:', err);
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
      const type = urlParams.get('type');
      const subtype = urlParams.get('subtype');
      
      if (campaignId && account?.address) {
        console.log('Loading campaign from URL:', campaignId, 'type:', type, 'subtype:', subtype);
        await fetchCampaignById(campaignId);
      } else if (account?.address && type && subtype) {
        // Si pas de campaignId spécifique, charger la première campagne disponible pour ce type/sous-type
        console.log('No specific campaignId, loading first available for:', type, subtype);
        const campaigns = await fetchAvailableCampaigns(
          type === 'completion' ? 'COMPLETION' : 'INITIAL',
          subtype === 'b2c-agencies' ? 'B2C_AGENCIES' :
          subtype === 'individual-creators' ? 'INDIVIDUAL_CREATORS' :
          subtype === 'for-b2c' ? 'FOR_B2C' : 'FOR_INDIVIDUALS'
        );
        
        if (campaigns && campaigns.length > 0) {
          const firstCampaign = campaigns[0];
          console.log('Loading first available campaign:', firstCampaign.title);
          await fetchCampaignById(firstCampaign.id);
        }
      }
    };

    // Charger immédiatement si on a déjà un account
    if (account?.address) {
      loadCampaignFromUrl();
    }
  }, [account?.address, fetchCampaignById, fetchAvailableCampaigns]);

  // Charger aussi quand l'URL change (pour les navigations)
  useEffect(() => {
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const campaignId = urlParams.get('campaignId');
      const type = urlParams.get('type');
      const subtype = urlParams.get('subtype');
      
      if (campaignId && account?.address) {
        console.log('URL changed, loading campaign:', campaignId);
        fetchCampaignById(campaignId);
      } else if (account?.address && type && subtype && !campaignId) {
        // Charger la première campagne disponible pour ce type/sous-type
        console.log('URL changed, loading first available for:', type, subtype);
        fetchAvailableCampaigns(
          type === 'completion' ? 'COMPLETION' : 'INITIAL',
          subtype === 'b2c-agencies' ? 'B2C_AGENCIES' :
          subtype === 'individual-creators' ? 'INDIVIDUAL_CREATORS' :
          subtype === 'for-b2c' ? 'FOR_B2C' : 'FOR_INDIVIDUALS'
        ).then(campaigns => {
          if (campaigns && campaigns.length > 0) {
            const firstCampaign = campaigns[0];
            console.log('Loading first available campaign:', firstCampaign.title);
            fetchCampaignById(firstCampaign.id);
          }
        });
      }
    };

    // Écouter les changements d'URL
    window.addEventListener('popstate', handleUrlChange);
    
    // Vérifier l'URL actuelle
    handleUrlChange();

    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [account?.address, fetchCampaignById, fetchAvailableCampaigns]);

  // Fonction utilitaire pour charger une campagne selon les critères
  const loadCampaignForCriteria = useCallback(async (type: string, subtype: string) => {
    if (!account?.address) return null;
    
    try {
      console.log('Loading campaign for criteria:', type, subtype);
      
      // Convertir les paramètres UI vers les types Prisma
      const prismaType = type === 'completion' ? 'COMPLETION' : 'INITIAL';
      const prismaCreatorType = subtype === 'b2c-agencies' ? 'B2C_AGENCIES' :
                               subtype === 'individual-creators' ? 'INDIVIDUAL_CREATORS' :
                               subtype === 'for-b2c' ? 'FOR_B2C' : 'FOR_INDIVIDUALS';
      
      const campaigns = await fetchAvailableCampaigns(prismaType, prismaCreatorType);
      
      if (campaigns && campaigns.length > 0) {
        const firstCampaign = campaigns[0];
        console.log('Found campaign for criteria:', firstCampaign.title);
        const session = await fetchCampaignById(firstCampaign.id);
        return session;
      } else {
        console.log('No campaigns found for criteria:', type, subtype);
        setCurrentSession(null);
        return null;
      }
    } catch (error) {
      console.error('Error loading campaign for criteria:', error);
      setCurrentSession(null);
      return null;
    }
  }, [account?.address, fetchAvailableCampaigns, fetchCampaignById]);

  // Charger la campagne au montage si on a un campaignId dans l'URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const campaignId = urlParams.get('campaignId');
      const type = urlParams.get('type');
      const subtype = urlParams.get('subtype');
      
      if (campaignId && account?.address && !currentSession) {
        console.log('Initial load, campaign ID found:', campaignId);
        fetchCampaignById(campaignId);
      } else if (!campaignId && type && subtype && account?.address && !currentSession) {
        console.log('Initial load, no campaign ID, loading for:', type, subtype);
        loadCampaignForCriteria(type, subtype);
      }
    }
  }, [account?.address, currentSession, fetchCampaignById, loadCampaignForCriteria]);

  return {
    currentSession,
    isLoading,
    error,
    availableCampaigns,
    submitModerationDecision,
    submitCompletionScore,
    fetchCampaignById,
    fetchAvailableCampaigns,
    checkCampaignsAvailability,
    loadCampaignForCriteria,
    refreshData: () => checkCampaignsAvailability(),
    setCurrentSession
  };
}; 