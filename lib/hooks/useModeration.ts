import { useState, useEffect, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { ModerationCampaign, ModerationProgress, ModerationSession } from '../types';
import { transformCampaignFromAPI } from '../campaignTransformers';

export const useModeration = () => {
  const account = useActiveAccount(); // Utilise useAddress au lieu de useActiveAccount
  const [currentSession, setCurrentSession] = useState<ModerationSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableCampaigns, setAvailableCampaigns] = useState<any[]>([]);
  // Liste complète de toutes les campagnes pour le calcul des badges
  const [allCampaigns, setAllCampaigns] = useState<any[]>([]);
  // Nouveau state pour les scores utilisés par le modérateur actuel
  const [moderatorUsedScores, setModeratorUsedScores] = useState<number[]>([]);
  // Suivi des contenus déjà votés par ce modérateur (client-side)
  const [votedContentIds, setVotedContentIds] = useState<Set<string>>(new Set());
  // Compteurs par sous-onglet pour badges
  const [subTabCounts, setSubTabCounts] = useState<{
    initial: { 'b2c-agencies': number; 'individual-creators': number };
    completion: { 'for-b2c': number; 'for-individuals': number };
  }>({ initial: { 'b2c-agencies': 0, 'individual-creators': 0 }, completion: { 'for-b2c': 0, 'for-individuals': 0 } });

  // Fonction pour récupérer les campagnes disponibles depuis l'API
  const fetchAvailableCampaigns = useCallback(async (type?: string, creatorType?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 [FETCH CAMPAIGNS] Fetching from API...', { type, creatorType });

      // Construire les paramètres de requête
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (creatorType) params.append('creatorType', creatorType);

      const url = `/api/moderation/campaigns?${params.toString()}`;
      console.log('📡 [FETCH CAMPAIGNS] API URL:', url);

      const response = await fetch(url);

      if (!response.ok) {
        // Lire le texte de l'erreur pour plus de détails
        let errorText = '';
        try {
          errorText = await response.text();
          const errorData = errorText ? JSON.parse(errorText) : {};
          console.error('❌ [FETCH CAMPAIGNS] API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData.error || errorData.details || errorText
          });
          throw new Error(errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`);
        } catch (parseError) {
          throw new Error(`Failed to fetch campaigns: ${response.status} ${response.statusText} - ${errorText || 'Unknown error'}`);
        }
      }

      const result = await response.json();

      if (!result.success) {
        console.error('❌ [FETCH CAMPAIGNS] API returned success: false', result);
        throw new Error(result.error || result.details || 'Failed to fetch campaigns');
      }

      console.log('✅ [FETCH CAMPAIGNS] Received campaigns:', result.count);

      // Transformer les campagnes de l'API vers le format ModerationCampaign
      const transformedCampaigns = (result.data || []).map((apiCampaign: any) => 
        transformCampaignFromAPI(apiCampaign)
      );

      console.log('✅ [FETCH CAMPAIGNS] Transformed campaigns:', transformedCampaigns.length);

      // Mémoriser la liste complète pour les compteurs
      setAllCampaigns(transformedCampaigns);
      setAvailableCampaigns(transformedCampaigns);
      
      return transformedCampaigns;
    } catch (err) {
      console.error('❌ [FETCH CAMPAIGNS] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
      
      // Fallback vers les données mockées en cas d'erreur (pour le dev)
      try {
        const { mockCampaigns } = await import('../mockData');
        console.warn('⚠️ [FETCH CAMPAIGNS] Using fallback mock data');
        setAvailableCampaigns(mockCampaigns);
        return mockCampaigns;
      } catch (mockErr) {
        return [];
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fonction pour récupérer les scores utilisés par le modérateur actuel pour une campagne
  const fetchModeratorUsedScores = useCallback(async (campaignId: string) => {
    if (!account?.address || !campaignId) {
      setModeratorUsedScores([]);
      return [];
    }

    try {
      console.log('🔍 Récupération des scores utilisés pour la campagne:', campaignId);
      
      const response = await fetch(
        `/api/moderation/moderator-scores?campaignId=${campaignId}&moderatorWallet=${account.address}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const scores = data.usedScores || [];
        console.log('✅ Scores utilisés récupérés:', scores);
        setModeratorUsedScores(scores);
        return scores;
      } else {
        console.warn('⚠️ Échec de récupération des scores utilisés:', response.status);
        // En cas d'erreur, on met un tableau vide pour éviter de bloquer l'interface
        setModeratorUsedScores([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des scores utilisés:', error);
      // En cas d'erreur réseau, on met un tableau vide pour éviter de bloquer l'interface
      setModeratorUsedScores([]);
      return [];
    }
  }, [account]);

  // Fonction pour récupérer une campagne spécifique
  const fetchCampaignById = useCallback(async (campaignId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 [FETCH CAMPAIGN BY ID] Fetching campaign:', campaignId);

      // Vérifier si c'est un ID de session (commence par "session_") et extraire l'ID de campagne
      let actualCampaignId = campaignId;
      if (campaignId.startsWith('session_')) {
        actualCampaignId = campaignId.replace('session_', '');
        console.log('⚠️ [FETCH CAMPAIGN BY ID] Detected session ID, extracted campaign ID:', actualCampaignId);
      }

      // Essayer d'abord de récupérer depuis les campagnes déjà chargées
      const cachedCampaign = availableCampaigns.find(c => c.id === actualCampaignId) || 
                            allCampaigns.find(c => c.id === actualCampaignId);

      if (cachedCampaign) {
        console.log('✅ [FETCH CAMPAIGN BY ID] Found in cache:', cachedCampaign.title);
        const session: ModerationSession = {
          id: `session_${cachedCampaign.id}`,
          campaignId: cachedCampaign.id,
          moderatorWallet: account?.address || '',
          isEligible: true,
          startedAt: new Date(),
          campaign: cachedCampaign,
          progress: cachedCampaign.progress
        };

        setCurrentSession(session);
        
        if (cachedCampaign.type === 'COMPLETION') {
          await fetchModeratorUsedScores(actualCampaignId);
        }
        
        setIsLoading(false);
        return session;
      }

      // Sinon, récupérer depuis l'API
      console.log('📡 [FETCH CAMPAIGN BY ID] Fetching from API...');
      
      try {
        // Récupérer toutes les campagnes et trouver celle avec l'ID
        const campaigns = await fetchAvailableCampaigns();
        const campaign = campaigns.find(c => c.id === actualCampaignId);

        if (campaign) {
          console.log('✅ [FETCH CAMPAIGN BY ID] Found campaign:', campaign.title);
          const session: ModerationSession = {
            id: `session_${campaign.id}`,
            campaignId: campaign.id,
            moderatorWallet: account?.address || '',
            isEligible: true,
            startedAt: new Date(),
            campaign,
            progress: campaign.progress
          };

          setCurrentSession(session);
          
          if (campaign.type === 'COMPLETION') {
            await fetchModeratorUsedScores(actualCampaignId);
          }
          
          setIsLoading(false);
          return session;
        } else {
          console.warn(`⚠️ [FETCH CAMPAIGN BY ID] Campaign ${actualCampaignId} not found in ${campaigns.length} campaigns`);
          throw new Error(`Campaign with ID ${actualCampaignId} not found`);
        }
      } catch (fetchError) {
        console.error('❌ [FETCH CAMPAIGN BY ID] Error fetching campaigns:', fetchError);
        // Si fetchAvailableCampaigns échoue, essayer de lire l'erreur plus en détail
        if (fetchError instanceof Error) {
          throw new Error(`Failed to fetch campaigns: ${fetchError.message}`);
        }
        throw fetchError;
      }
    } catch (err) {
      console.error('❌ [FETCH CAMPAIGN BY ID] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch campaign';
      setError(errorMessage);
      setIsLoading(false);
      // Ne pas throw, retourner null pour éviter de bloquer l'UI
      return null;
    }
  }, [account, fetchModeratorUsedScores, availableCampaigns, allCampaigns, fetchAvailableCampaigns]);

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

  // Fonction pour soumettre une décision de modération avec intégration du staking
  const submitModerationDecision = useCallback(async (
    decision: 'valid' | 'refuse', 
    contentType: 'creation' | 'completion',
    score?: number,
    stakingData?: {
      stakedAmount: number;
      stakeAgeDays: number;
      moderatorXP: number;
    }
  ) => {
    if (!currentSession) return false;
    
    // Empêcher un second vote pour ce contenu par ce modérateur (client-side)
    const contentId = currentSession.campaignId;
    const wallet = account?.address || '';
    const storageKey = `winstory_moderation_voted_${wallet}`;
    const votedSet = new Set<string>(votedContentIds);
    if (votedSet.has(contentId)) {
      console.warn('⚠️ Vote déjà enregistré pour ce contenu par ce modérateur.');
      return false;
    }

    try {
      console.log('🔍 [MODERATION DECISION] Starting submission:', {
        decision,
        contentType,
        score,
        campaignId: currentSession.campaignId,
        moderatorWallet: wallet,
        stakingData
      });

      // Préparer les données pour l'API
      const voteData = {
        campaignId: currentSession.campaignId,
        moderatorWallet: wallet,
        completionId: contentType === 'completion' ? currentSession.campaignId : undefined,
        voteDecision: decision === 'valid' ? 'VALID' : 'REFUSE',
        score: score,
        stakedAmount: stakingData?.stakedAmount || 0,
        stakeAgeDays: stakingData?.stakeAgeDays || 0,
        moderatorXP: stakingData?.moderatorXP || 0,
        transactionHash: undefined // TODO: Ajouter le hash de transaction blockchain
      };

      console.log('📤 [MODERATION DECISION] Sending to API:', voteData);

      // Call the new vote API with staking
      const response = await fetch('/api/moderation/vote-staking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voteData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ [MODERATION DECISION] Vote registered successfully:', result);
        
        // Display API logs
        if (result.consoleLogs) {
          result.consoleLogs.forEach((log: string) => {
            console.log(log);
          });
        }

        // Mettre à jour la session locale
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

        // Marquer comme voté côté client
        votedSet.add(contentId);
        setVotedContentIds(votedSet);
        try {
          const serialized = JSON.stringify(Array.from(votedSet));
          localStorage.setItem(storageKey, serialized);
        } catch {}

        console.log('🎉 [MODERATION DECISION] Vote finalized successfully');
        
        // Après un vote réussi, vérifier si une décision finale est atteinte
        // Cela déclenchera automatiquement le déplacement/suppression des vidéos S3
        try {
          const checkFinalResponse = await fetch('/api/moderation/check-final-decision', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              campaignId: currentSession.campaignId,
              completionId: contentType === 'completion' ? currentSession.campaignId : undefined,
              campaignType: contentType === 'creation' ? 'INITIAL' : 'COMPLETION',
            }),
          });

          if (checkFinalResponse.ok) {
            const checkResult = await checkFinalResponse.json();
            if (checkResult.decision) {
              console.log(`✅ [FINAL DECISION] Décision finale: ${checkResult.decision}`);
              if (checkResult.consoleLogs) {
                checkResult.consoleLogs.forEach((log: string) => {
                  console.log(log);
                });
              }
            }
          }
        } catch (checkError) {
          // Ne pas bloquer le processus si la vérification échoue
          console.warn('⚠️ [FINAL DECISION] Erreur lors de la vérification:', checkError);
        }
        
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ [MODERATION DECISION] API Error:', errorData);
        
        // Display API error logs
        if (errorData.consoleLogs) {
          errorData.consoleLogs.forEach((log: string) => {
            console.error(log);
          });
        }
        
        return false;
      }
    } catch (err) {
      console.error('❌ [MODERATION DECISION] Error during submission:', err);
      return false;
    }
  }, [currentSession, account?.address, votedContentIds]);

  // Function to load scores already used by moderator for a campaign
  const loadModeratorUsedScores = useCallback(async (campaignId: string, moderatorWallet: string) => {
    try {
      const response = await fetch(`/api/moderation/moderator-scores?campaignId=${campaignId}&moderatorWallet=${moderatorWallet}`);
      if (response.ok) {
        const data = await response.json();
        setModeratorUsedScores(data.usedScores || []);
        console.log('📊 Scores déjà utilisés chargés:', data.usedScores);
      } else {
        console.error('Erreur lors du chargement des scores utilisés:', response.statusText);
        setModeratorUsedScores([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des scores utilisés:', error);
      setModeratorUsedScores([]);
    }
  }, []);

  // Fonction pour soumettre un score de complétion avec validation par modérateur et staking
  const submitCompletionScore = useCallback(async (
    score: number, 
    completionId?: string,
    stakingData?: {
      stakedAmount: number;
      stakeAgeDays: number;
      moderatorXP: number;
    }
  ) => {
    if (!currentSession || !account?.address) return false;

    // 0 = Refus (ne pas soumettre comme score)
    if (score === 0) {
      console.error('❌ 0/100 équivaut à un refus. Utilisez l\'option Refuser.');
      return false;
    }

    try {
      console.log('🔍 [COMPLETION SCORE] Starting submission:', {
        score,
        completionId,
        campaignId: currentSession.campaignId,
        moderatorWallet: account.address,
        stakingData
      });

      // Empêcher un second vote pour ce contenu par ce modérateur (client-side)
      const contentId = currentSession.campaignId;
      const wallet = account.address;
      const storageKey = `winstory_moderation_voted_${wallet}`;
      const votedSet = new Set<string>(votedContentIds);
      if (votedSet.has(contentId)) {
        console.warn('⚠️ Vote déjà enregistré pour ce contenu par ce modérateur.');
        return false;
      }

      // Vérifier localement si le score est déjà utilisé
      if (moderatorUsedScores.includes(score)) {
        console.error('❌ Score déjà utilisé par ce modérateur:', score);
        return false;
      }

      // Utiliser la nouvelle API de vote avec staking pour les scores
      const voteData = {
        campaignId: currentSession.campaignId,
        moderatorWallet: account.address,
        completionId: completionId || currentSession.campaignId,
        voteDecision: 'VALID' as const,
        score: score,
        stakedAmount: stakingData?.stakedAmount || 0,
        stakeAgeDays: stakingData?.stakeAgeDays || 0,
        moderatorXP: stakingData?.moderatorXP || 0,
        transactionHash: undefined // TODO: Ajouter le hash de transaction blockchain
      };

      console.log('📤 [COMPLETION SCORE] Sending to API:', voteData);

      const response = await fetch('/api/moderation/vote-staking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voteData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ [COMPLETION SCORE] Score registered successfully:', result);
        
        // Display API logs
        if (result.consoleLogs) {
          result.consoleLogs.forEach((log: string) => {
            console.log(log);
          });
        }

        // Mettre à jour la liste locale des scores utilisés
        setModeratorUsedScores(prev => [...prev, score]);
        
        // Mettre à jour la session locale (pour l'affichage)
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

        // Marquer comme voté côté client
        votedSet.add(contentId);
        setVotedContentIds(votedSet);
        try {
          const serialized = JSON.stringify(Array.from(votedSet));
          localStorage.setItem(storageKey, serialized);
        } catch {}

        console.log('🎉 [COMPLETION SCORE] Score finalized successfully:', score);
        
        // Après un score réussi, vérifier si une décision finale est atteinte
        // Cela déclenchera automatiquement le déplacement/suppression des vidéos S3
        try {
          const checkFinalResponse = await fetch('/api/moderation/check-final-decision', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              campaignId: currentSession.campaignId,
              completionId: completionId || currentSession.campaignId,
              campaignType: 'COMPLETION',
            }),
          });

          if (checkFinalResponse.ok) {
            const checkResult = await checkFinalResponse.json();
            if (checkResult.decision) {
              console.log(`✅ [FINAL DECISION] Décision finale: ${checkResult.decision}`);
              if (checkResult.consoleLogs) {
                checkResult.consoleLogs.forEach((log: string) => {
                  console.log(log);
                });
              }
            }
          }
        } catch (checkError) {
          // Ne pas bloquer le processus si la vérification échoue
          console.warn('⚠️ [FINAL DECISION] Erreur lors de la vérification:', checkError);
        }
        
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ [COMPLETION SCORE] API Error:', errorData);
        
        // Display API error logs
        if (errorData.consoleLogs) {
          errorData.consoleLogs.forEach((log: string) => {
            console.error(log);
          });
        }
        
        // Si le score est déjà utilisé côté serveur, recharger les scores utilisés
        if (response.status === 409) {
          console.log('🔄 Rechargement des scores utilisés...');
          if (currentSession && account?.address) {
            await loadModeratorUsedScores(currentSession.id, account.address);
          }
        }
        
        return false;
      }
    } catch (err) {
      console.error('❌ [COMPLETION SCORE] Error during submission:', err);
      return false;
    }
  }, [currentSession, account, moderatorUsedScores, loadModeratorUsedScores, votedContentIds]);

  // Load used scores when a campaign is selected
  useEffect(() => {
    if (currentSession && account?.address) {
      loadModeratorUsedScores(currentSession.id, account.address);
      // Load list of content already voted for this wallet
      try {
        const storageKey = `winstory_moderation_voted_${account.address}`;
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const arr = JSON.parse(raw) as string[];
          setVotedContentIds(new Set(arr));
        } else {
          setVotedContentIds(new Set());
        }
      } catch {
        setVotedContentIds(new Set());
      }
    }
  }, [currentSession, account?.address, loadModeratorUsedScores]);

  // Charger les campagnes disponibles au montage du composant
  useEffect(() => {
    if (account?.address) {
      checkCampaignsAvailability();
    }
  }, [account]);

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
  }, [account, fetchCampaignById, fetchAvailableCampaigns]);

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
  }, [account, fetchCampaignById, fetchAvailableCampaigns]);

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
  }, [account, fetchAvailableCampaigns, fetchCampaignById]);

  // Sélection rapide et synchrone (optimistic) depuis les listes déjà chargées
  const quickSelectCampaignFor = useCallback((type: string, subtype: string): ModerationSession | null => {
    if (!account?.address) return null;

    const prismaType = type === 'completion' ? 'COMPLETION' : 'INITIAL';
    const prismaCreatorType = subtype === 'b2c-agencies' ? 'B2C_AGENCIES' :
                             subtype === 'individual-creators' ? 'INDIVIDUAL_CREATORS' :
                             subtype === 'for-b2c' ? 'FOR_B2C' : 'FOR_INDIVIDUALS';

    const source = (availableCampaigns && availableCampaigns.length > 0) ? availableCampaigns : allCampaigns;
    if (!source || source.length === 0) return null;

    const candidate = source.find((c: any) => c.type === prismaType && c.creatorType === prismaCreatorType);
    if (!candidate) return null;

    const session: ModerationSession = {
      id: `session_${candidate.id}`,
      campaignId: candidate.id,
      moderatorWallet: account.address,
      isEligible: true,
      startedAt: new Date(),
      campaign: candidate as any,
      progress: candidate.progress as any
    };
    setCurrentSession(session);

    // Précharger les scores utilisés si nécessaire
    if (candidate.type === 'COMPLETION') {
      fetchModeratorUsedScores(candidate.id);
    }

    return session;
  }, [account, availableCampaigns, allCampaigns, fetchModeratorUsedScores]);

  // Mettre à jour les compteurs à partir de toutes les campagnes (pour afficher aussi les non-sélectionnées)
  useEffect(() => {
    const all = allCampaigns && allCampaigns.length > 0 ? allCampaigns : (availableCampaigns || []);
    const nextCounts = {
      initial: {
        'b2c-agencies': all.filter((c: any) => c.type === 'INITIAL' && c.creatorType === 'B2C_AGENCIES').length,
        'individual-creators': all.filter((c: any) => c.type === 'INITIAL' && c.creatorType === 'INDIVIDUAL_CREATORS').length,
      },
      completion: {
        'for-b2c': all.filter((c: any) => c.type === 'COMPLETION' && c.creatorType === 'FOR_B2C').length,
        'for-individuals': all.filter((c: any) => c.type === 'COMPLETION' && c.creatorType === 'FOR_INDIVIDUALS').length,
      }
    };
    // Éviter les mises à jour inutiles
    const prev = subTabCounts;
    const changed =
      prev.initial['b2c-agencies'] !== nextCounts.initial['b2c-agencies'] ||
      prev.initial['individual-creators'] !== nextCounts.initial['individual-creators'] ||
      prev.completion['for-b2c'] !== nextCounts.completion['for-b2c'] ||
      prev.completion['for-individuals'] !== nextCounts.completion['for-individuals'];
    if (changed) setSubTabCounts(nextCounts);
  }, [availableCampaigns, allCampaigns, subTabCounts]);

  // Charger les campagnes disponibles au montage
  useEffect(() => {
    if (account?.address) {
      console.log('🔄 [INIT] Loading available campaigns on mount...');
      fetchAvailableCampaigns();
    }
  }, [account?.address, fetchAvailableCampaigns]);

  // Charger la campagne au montage si on a un campaignId dans l'URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const campaignId = urlParams.get('campaignId');
      const type = urlParams.get('type');
      const subtype = urlParams.get('subtype');
      
      if (campaignId && account?.address && !currentSession) {
        console.log('🔄 [INIT] Campaign ID found in URL:', campaignId);
        fetchCampaignById(campaignId);
      } else if (!campaignId && type && subtype && account?.address && !currentSession) {
        console.log('🔄 [INIT] Loading campaign for:', type, subtype);
        loadCampaignForCriteria(type, subtype);
      }
    }
  }, [account, currentSession, fetchCampaignById, loadCampaignForCriteria]);

  return {
    currentSession,
    isLoading,
    error,
    availableCampaigns,
    moderatorUsedScores, // Exposer les scores utilisés par le modérateur
    submitModerationDecision,
    submitCompletionScore,
    fetchCampaignById,
    fetchAvailableCampaigns,
    checkCampaignsAvailability,
    loadCampaignForCriteria,
    quickSelectCampaignFor,
    fetchModeratorUsedScores, // Exposer la fonction pour recharger les scores
    refreshData: () => checkCampaignsAvailability(),
    setCurrentSession,
    // Exposer infos pour UI
    hasAlreadyVoted: currentSession ? votedContentIds.has(currentSession.campaignId) : false,
    subTabCounts
  };
}; 