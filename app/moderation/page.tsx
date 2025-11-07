'use client';
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useActiveAccount } from 'thirdweb/react';
import WalletConnect from '../../components/WalletConnect';
import ModeratorHeader, { CloseButton } from '../../components/ModeratorHeader';
import ModerationBubbles from '../../components/ModerationBubbles';
import ModerationProgressPanel from '../../components/ModerationProgressPanel';
import ModerationTooltip from '../../components/ModerationTooltip';
import ModerationButtons from '../../components/ModerationButtons';
import ModerationInfoModal from '../../components/ModerationInfoModal';
import CompletionScoringModal from '../../components/CompletionScoringModal';
import CompletionRateModal from '../../components/CompletionRateModal';
import RewardsModal from '../../components/RewardsModal';
import InfoModal from '../../components/InfoModal';
import ModerationStatsModal from '../../components/ModerationStatsModal';
import ModerationStatsDevControlsButton from '../../components/ModerationStatsDevControlsButton';
import DevControlsButton from '../../components/DevControlsButton';
import UltimateDevControls from '../../components/UltimateDevControls';
import styles from '../../styles/Moderation.module.css';
import { useModeration } from '../../lib/hooks/useModeration';
import { ModerationCampaign, getUICreatorType, getUICampaignType } from '../../lib/types';
import { useS3VideoUrl } from '../../hooks/useS3VideoUrl';
import { extractS3KeyFromUrl } from '../../lib/s3Utils';

const ModerationPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const address = useActiveAccount();
  
  // Récupérer l'ID de campagne et les paramètres depuis l'URL
  const campaignId = searchParams.get('campaignId');
  const campaignType = searchParams.get('type') as 'initial' | 'completion' | null;
  const campaignSubType = searchParams.get('subtype') as string | null;
  
  // États pour la gestion des onglets et de la disponibilité
  const [activeTab, setActiveTab] = useState<'initial' | 'completion'>('initial');
  const [activeSubTab, setActiveSubTab] = useState<string>('b2c-agencies');
  const [showInfo, setShowInfo] = useState(false);
  const [showBubble, setShowBubble] = useState<string | null>(null);
  const [showBulbPopup, setShowBulbPopup] = useState(false);
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  
  // States for staker data
  const [stakerData, setStakerData] = useState<{
    stakedAmount: number;
    stakeAgeDays: number;
    moderatorXP: number;
    isEligible: boolean;
  } | null>(null);
  
  const [showInfoModal, setShowInfoModal] = useState<{
    isOpen: boolean;
    title: string;
    icon: string;
    content: string;
    videoUrl?: string;
  }>({
    isOpen: false,
    title: '',
    icon: '',
    content: '',
    videoUrl: undefined
  });
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const switchTokenRef = useRef(0);
  const [isForceDisconnected, setIsForceDisconnected] = useState(false);

  // Only render videos from explicitly allowed prefixes in production
  const DEBUG_VIDEO = process.env.NEXT_PUBLIC_DEBUG_VIDEO === 'true' && process.env.NODE_ENV !== 'production';
  const isVideoAllowed = (url?: string) => {
    if (!url) {
      if (DEBUG_VIDEO) console.log('⚠️ [VIDEO] No video URL provided');
      return false;
    }
    // En développement, toujours autoriser (pour tester les vidéos S3)
    if (process.env.NODE_ENV !== 'production') {
      if (DEBUG_VIDEO) console.log('✅ [VIDEO] Video allowed in development:', url);
      return true;
    }
    // En production, vérifier les préfixes autorisés
    const prefixes = (process.env.NEXT_PUBLIC_ALLOWED_VIDEO_PREFIXES || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    if (prefixes.length === 0) {
      if (DEBUG_VIDEO) console.warn('⚠️ [VIDEO] No allowed prefixes configured in production');
      return false;
    }
    const isAllowed = prefixes.some(prefix => url.startsWith(prefix));
    if (!isAllowed && DEBUG_VIDEO) {
      console.warn('⚠️ [VIDEO] URL not in allowed prefixes:', url);
    }
    return isAllowed;
  };
  
  // Fonction pour gérer les clics sur les bulles
  const handleBubbleClick = (bubbleType: string) => {
    if (bubbleType === 'rewards') {
      // Pour toutes les campagnes (y compris individuelles), ouvrir le RewardsModal
      // Le RewardsModal gère automatiquement l'affichage des données économiques pour les campagnes individuelles
      setShowRewardsModal(true);
    } else if (bubbleType === 'startingText') {
      setShowInfoModal({
        isOpen: true,
        title: 'Starting Story',
        icon: '📝',
        content: currentSession?.campaign.content.startingStory || '',
        videoUrl: undefined
      });
    } else if (bubbleType === 'guideline') {
      setShowInfoModal({
        isOpen: true,
        title: 'Guideline',
        icon: '📋',
        content: currentSession?.campaign.content.guidelines || '',
        videoUrl: undefined
      });
    } else if (bubbleType === 'initialVideo') {
      setShowInfoModal({
        isOpen: true,
        title: 'Initial Video',
        icon: '🎬',
        content: '',
        videoUrl: currentSession?.campaign.content.videoUrl
      });
    } else if (bubbleType === 'completingStory') {
      setShowInfoModal({
        isOpen: true,
        title: 'Completing Story',
        icon: '🟡',
        content: (currentSession?.campaign?.content as any)?.completingStory || 'No completing story provided.',
        videoUrl: undefined
      });
    } else {
      setShowBubble(bubbleType);
    }
  };
  
  // Fonction pour convertir les clés de sous-type en labels lisibles
  const getSubTypeLabel = (subType: string) => {
    switch (subType) {
      case 'b2c-agencies': return 'B2C & Agencies';
      case 'individual-creators': return 'Individual Creators';
      case 'for-b2c': return 'For B2C';
      case 'for-individuals': return 'For Individuals';
      default: return subType;
    }
  };
  
  const activeSubTypeLabel = getSubTypeLabel(activeSubTab);
  
  // Libellé lisible pour l'onglet principal
  const getMainTabLabel = (tab: 'initial' | 'completion') =>
    tab === 'initial' ? 'Initial Story' : 'Completion';
  
  // Fonctions de conversion des types Prisma vers types familiers
  const convertPrismaCampaignType = (prismaType: string): 'creation' | 'completion' => {
    if (prismaType === 'INITIAL') {
      return 'creation';
    } else if (prismaType === 'COMPLETION') {
      return 'completion';
    } else {
      return 'creation';
    }
  };

  // Fonction de mapping pour convertir les types de campagne
  const mapCampaignType = (uiType: string): 'creation' | 'completion' => {
    return uiType === 'initial' ? 'creation' : 'completion';
  };
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoHeight, setVideoHeight] = useState(0);
  const [detectedOrientation, setDetectedOrientation] = useState<'horizontal' | 'vertical' | null>(null);

  // Fonction pour détecter l'orientation réelle de la vidéo
  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const aspectRatio = video.videoWidth / video.videoHeight;
      const orientation = aspectRatio > 1 ? 'horizontal' : 'vertical';
      setDetectedOrientation(orientation);
      console.log(`Vidéo détectée: ${video.videoWidth}x${video.videoHeight} - Orientation: ${orientation}`);
    }
  };

  // Utiliser le hook de modération dynamique
  const { 
    currentSession, 
    isLoading, 
    error, 
    availableCampaigns,
    moderatorUsedScores,
    submitModerationDecision, 
    submitCompletionScore,
    checkCampaignsAvailability,
    fetchCampaignById,
    fetchAvailableCampaigns,
    loadCampaignForCriteria,
    quickSelectCampaignFor,
    refreshData,
    setCurrentSession,
    hasAlreadyVoted,
    subTabCounts,
    updateSubTabCounts,
    decrementSubTabCount
  } = useModeration();

  // Utiliser le hook pour générer une presigned URL si nécessaire (appelé au niveau supérieur)
  const { videoUrl: s3VideoUrl, isLoading: isLoadingVideoUrl } = useS3VideoUrl(currentSession?.campaign?.content?.videoUrl);

  // Auto-load guard to avoid multiple triggers (placed after currentSession is defined)
  const didAutoLoadRef = useRef(false);
  useEffect(() => {
    if (!currentSession && !isLoading && address?.address && !didAutoLoadRef.current) {
      didAutoLoadRef.current = true;
      loadFirstAvailableCampaign();
    }
  }, [currentSession, isLoading, address?.address]);

  // Function to fetch staker data
  const fetchStakerData = useCallback(async (wallet: string, campaignId?: string) => {
    if (!wallet) return;
    
    try {
      console.log('🔍 [STAKER DATA] Fetching staker data:', { wallet, campaignId });
      // Respect Dev Controls override first (do not overwrite with API)
      try {
        const overrideRaw = typeof window !== 'undefined' ? localStorage.getItem('dev-controls-staker-data') : null;
        if (overrideRaw) {
          const overrideData = JSON.parse(overrideRaw);
          console.log('🎮 [STAKER DATA] Dev Controls override detected, using it:', overrideData);
          setStakerData(overrideData);
          return;
        }
      } catch (e) {
        console.warn('⚠️ [STAKER DATA] Failed reading Dev Controls override:', e);
      }
      
      const params = new URLSearchParams({ wallet });
      if (campaignId) params.append('campaignId', campaignId);
      
      const response = await fetch(`/api/moderation/staker-data?${params}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ [STAKER DATA] Data retrieved:', result);
        
        // Display API logs
        if (result.consoleLogs) {
          result.consoleLogs.forEach((log: string) => {
            console.log(log);
          });
        }
        
        if (result.stakerData) {
          const newStakerData = {
            stakedAmount: result.stakerData.stakedAmount,
            stakeAgeDays: result.stakerData.stakeAgeDays,
            moderatorXP: result.stakerData.xp,
            isEligible: result.stakerData.isActive
          };
          console.log('🎯 [STAKER DATA] Setting staker data:', newStakerData);
          setStakerData(newStakerData);
        } else {
          console.log('⚠️ [STAKER DATA] No staker data in response');
          // Keep null so gating can block access – do not force eligibility
          setStakerData(null);
        }
      } else {
        console.error('❌ [STAKER DATA] Error during retrieval:', response.status);
        // Keep null so gating can block access – do not force eligibility
        setStakerData(null);
      }
    } catch (error) {
      console.error('❌ [STAKER DATA] Error:', error);
      // Keep null so gating can block access – do not force eligibility
      setStakerData(null);
    }
  }, []);
  
  // Fetch staker data when user connects
  useEffect(() => {
    if (address?.address) {
      fetchStakerData(address.address, campaignId || undefined);
    }
  }, [address?.address, campaignId, fetchStakerData]);

  // Listen for Dev Controls updates
  useEffect(() => {
    const handleDevControlsUpdate = (event: CustomEvent) => {
      console.log('🎮 [MODERATION PAGE] Received Dev Controls update:', event.detail);
      setStakerData(event.detail);
    };

    window.addEventListener('dev-controls-staker-update', handleDevControlsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('dev-controls-staker-update', handleDevControlsUpdate as EventListener);
    };
  }, []);

  // Load staker data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('dev-controls-staker-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        console.log('🎮 [MODERATION PAGE] Loaded staker data from localStorage:', parsed);
        setStakerData(parsed);
      } catch (error) {
        console.error('🎮 [MODERATION PAGE] Error loading staker data:', error);
      }
    }
  }, []);
  
  // Mettre à jour les onglets quand les paramètres d'URL changent
  useEffect(() => {
    if (campaignType) {
      setActiveTab(campaignType);
      console.log('Active tab updated to:', campaignType);
    }
    if (campaignSubType) {
      setActiveSubTab(campaignSubType);
      console.log('Active sub tab updated to:', campaignSubType);
    }
  }, [campaignType, campaignSubType]);

  // Charger la campagne quand campaignId est présent dans l'URL
  useEffect(() => {
    if (campaignId && address?.address && !currentSession) {
      console.log('Loading campaign from URL:', campaignId);
      setIsLoadingCampaign(true);
      
      // Laisser le hook useModeration gérer le chargement
      fetchCampaignById(campaignId).then((session) => {
        // Si la campagne n'a pas pu être chargée (déjà votée ou filtrée), charger la suivante
        if (!session) {
          console.log('⚠️ [MODERATION PAGE] Campaign from URL not available, loading next available...');
          // Charger la première campagne disponible pour le type/sous-type actuel
          loadCampaignForCriteria(activeTab, activeSubTab).then((nextSession) => {
            if (nextSession) {
              window.history.replaceState({}, '', `/moderation?campaignId=${nextSession.campaign.id}&type=${activeTab}&subtype=${activeSubTab}`);
            } else {
              window.history.replaceState({}, '', `/moderation?type=${activeTab}&subtype=${activeSubTab}`);
            }
          });
        }
      }).finally(() => {
        setIsLoadingCampaign(false);
      });
    }
  }, [campaignId, address, currentSession, fetchCampaignById, loadCampaignForCriteria, activeTab, activeSubTab]);

  // Fonction pour charger automatiquement la première campagne disponible
  const loadFirstAvailableCampaign = async () => {
    if (!address?.address) return;
    
    try {
      setIsLoadingCampaign(true);
      console.log('Loading first available campaign for:', activeTab, activeSubTab);
      
      // Utiliser la nouvelle fonction du hook
      const session = await loadCampaignForCriteria(activeTab, activeSubTab);
      
      if (session) {
        console.log('Loaded campaign:', session.campaign.title);
        // Rediriger vers cette campagne
        router.push(`/moderation?campaignId=${session.campaign.id}&type=${activeTab}&subtype=${activeSubTab}`);
      } else {
        console.log('No campaigns available for current selection');
        // Réinitialiser la session actuelle si aucune campagne n'est disponible
        setCurrentSession(null);
      }
    } catch (error) {
      console.error('Error loading first available campaign:', error);
      setCurrentSession(null);
    } finally {
      setIsLoadingCampaign(false);
    }
  };

  // Gestionnaires d'événements pour les onglets
  const handleTabChange = async (newTab: 'initial' | 'completion', desiredSubTab?: string) => {
    // Mettre à jour l'état immédiatement pour un feedback instantané
    setActiveTab(newTab);
    console.log('Tab changed to:', newTab);
    
    // Réinitialiser le sous-onglet selon le nouvel onglet
    const defaultSubTab = newTab === 'initial' ? 'b2c-agencies' : 'for-b2c';
    const newSubTab = desiredSubTab || defaultSubTab;
    setActiveSubTab(newSubTab);
    
    // VIDER IMMÉDIATEMENT la session pour éviter l'affichage de l'ancien contenu
    setCurrentSession(null);
    
    // Afficher un overlay de chargement pour éviter un contenu temporairement incorrect
    try {
      setIsSwitching(true);
      setIsLoadingCampaign(true);
      // Mettre à jour l'URL sans campaignId immédiatement
      window.history.replaceState({}, '', `/moderation?type=${newTab}&subtype=${newSubTab}`);
      
      const token = ++switchTokenRef.current;
      const session = await loadCampaignForCriteria(newTab, newSubTab);
      
      if (token !== switchTokenRef.current) return; // requête périmée
      if (session) {
        console.log('Loaded campaign for new tab:', session.campaign.title);
        // Mettre à jour l'URL sans redirection
        window.history.replaceState({}, '', `/moderation?campaignId=${session.campaign.id}&type=${newTab}&subtype=${newSubTab}`);
      } else {
        console.log('No campaigns available for:', newTab, newSubTab);
        // Mettre à jour l'URL sans campaignId
        window.history.replaceState({}, '', `/moderation?type=${newTab}&subtype=${newSubTab}`);
        // S'assurer que la session est bien vide
        setCurrentSession(null);
      }
    } catch (error) {
      console.error('Error loading campaign for new tab:', error);
      // En cas d'erreur, s'assurer que la session est vide
      setCurrentSession(null);
      window.history.replaceState({}, '', `/moderation?type=${newTab}&subtype=${newSubTab}`);
    } finally {
      setIsLoadingCampaign(false);
      setIsSwitching(false);
    }
  };

  const handleSubTabChange = async (newSubTab: string) => {
    // Mettre à jour l'état immédiatement pour un feedback instantané
    setActiveSubTab(newSubTab);
    console.log('Sub tab changed to:', newSubTab);
    
    // VIDER IMMÉDIATEMENT la session pour éviter l'affichage de l'ancien contenu
    setCurrentSession(null);
    
    // Afficher un overlay de chargement pour éviter un contenu temporairement incorrect
    try {
      setIsSwitching(true);
      setIsLoadingCampaign(true);
      // Optimistic: si on a déjà des campagnes en mémoire, sélectionner immédiatement
      const optimistic = quickSelectCampaignFor(activeTab, newSubTab);
      if (optimistic) {
        setCurrentSession(optimistic);
        window.history.replaceState({}, '', `/moderation?campaignId=${optimistic.campaign.id}&type=${activeTab}&subtype=${newSubTab}`);
      } else {
        // Si pas de campagne optimiste, mettre à jour l'URL sans campaignId immédiatement
        window.history.replaceState({}, '', `/moderation?type=${activeTab}&subtype=${newSubTab}`);
      }
      const token = ++switchTokenRef.current;
      const session = await loadCampaignForCriteria(activeTab, newSubTab);
      
      if (token !== switchTokenRef.current) return; // requête périmée
      if (session) {
        console.log('Loaded campaign for new sub tab:', session.campaign.title);
        // Mettre à jour l'URL sans redirection
        window.history.replaceState({}, '', `/moderation?campaignId=${session.campaign.id}&type=${activeTab}&subtype=${newSubTab}`);
      } else {
        console.log('No campaigns available for:', activeTab, newSubTab);
        // Mettre à jour l'URL sans campaignId
        window.history.replaceState({}, '', `/moderation?type=${activeTab}&subtype=${newSubTab}`);
        // S'assurer que la session est bien vide
          setCurrentSession(null);
      }
    } catch (error) {
      console.error('Error loading campaign for new sub tab:', error);
      // En cas d'erreur, s'assurer que la session est vide
      setCurrentSession(null);
      window.history.replaceState({}, '', `/moderation?type=${activeTab}&subtype=${newSubTab}`);
    } finally {
      setIsLoadingCampaign(false);
      setIsSwitching(false);
    }
  };

  // Gestionnaires pour les actions de modération
  const goToNextAvailable = useCallback(async () => {
    // Charger immédiatement un autre contenu disponible dans le même onglet/sous-onglet
    try {
      console.log('🔄 [GO TO NEXT] Loading next available campaign...');
      setIsLoadingCampaign(true);
      
      // Rafraîchir les compteurs en appelant l'API avec les mêmes filtres que loadCampaignForCriteria
      // Cela garantit que les compteurs correspondent exactement aux campagnes réellement disponibles
      console.log('🔄 [GO TO NEXT] Updating notification counts...');
      await updateSubTabCounts();
      
      // Charger la prochaine campagne disponible
      const session = await loadCampaignForCriteria(activeTab, activeSubTab);
      if (session) {
        console.log('✅ [GO TO NEXT] Next campaign loaded:', session.campaign.title);
        // Mettre à jour l'URL et la session est déjà mise à jour par fetchCampaignById
        window.history.replaceState({}, '', `/moderation?campaignId=${session.campaign.id}&type=${activeTab}&subtype=${activeSubTab}`);
      } else {
        console.log('⚠️ [GO TO NEXT] No more campaigns available');
        // Sinon, effacer la session et laisser l'écran d'attente
        setCurrentSession(null);
        window.history.replaceState({}, '', `/moderation?type=${activeTab}&subtype=${activeSubTab}`);
      }
    } catch (error) {
      console.error('❌ [GO TO NEXT] Error loading next campaign:', error);
      setCurrentSession(null);
      window.history.replaceState({}, '', `/moderation?type=${activeTab}&subtype=${activeSubTab}`);
    } finally {
      setIsLoadingCampaign(false);
    }
  }, [activeTab, activeSubTab, loadCampaignForCriteria, setCurrentSession, fetchAvailableCampaigns, updateSubTabCounts]);

  const handleInitialValid = async () => {
    if (!currentSession) return;
    
    try {
      console.log('🔍 [INITIAL VALID] Starting validation:', {
        campaignId: currentSession.campaignId,
        stakerData
      });
      
      const success = await submitModerationDecision(
        'valid', 
        'creation',
        undefined, // No score for initial content
        stakerData ? {
          stakedAmount: stakerData.stakedAmount,
          stakeAgeDays: stakerData.stakeAgeDays,
          moderatorXP: stakerData.moderatorXP
        } : undefined
      );
      
      if (success) {
        console.log('✅ [INITIAL VALID] Initial content validated successfully');
        // Décrémenter immédiatement le compteur pour un feedback instantané
        decrementSubTabCount('initial', activeSubTab);
        // Automatically go to next content immediately
        await goToNextAvailable();
      } else {
        console.error('❌ [INITIAL VALID] Failed to validate initial content');
        // Même en cas d'échec, essayer de charger le suivant si possible
        console.log('🔄 [INITIAL VALID] Attempting to load next campaign anyway...');
        await goToNextAvailable();
      }
    } catch (error) {
      console.error('❌ [INITIAL VALID] Error during validation:', error);
    }
  };

  const handleCompletionValid = async () => {
    if (!currentSession) return;
    
    try {
      console.log('🔍 [COMPLETION VALID] Starting validation:', {
        campaignId: currentSession.campaignId,
        stakerData
      });
      
      const success = await submitModerationDecision(
        'valid', 
        'completion',
        undefined, // Score will be handled by scoring modal
        stakerData ? {
          stakedAmount: stakerData.stakedAmount,
          stakeAgeDays: stakerData.stakeAgeDays,
          moderatorXP: stakerData.moderatorXP
        } : undefined
      );
      
      if (success) {
        console.log('✅ [COMPLETION VALID] Completion validated successfully');
        // Décrémenter immédiatement le compteur pour un feedback instantané
        decrementSubTabCount('completion', activeSubTab);
        // Automatically go to next content immediately
        await goToNextAvailable();
      } else {
        console.error('❌ [COMPLETION VALID] Failed to validate completion');
        // Même en cas d'échec, essayer de charger le suivant si possible
        console.log('🔄 [COMPLETION VALID] Attempting to load next campaign anyway...');
        await goToNextAvailable();
      }
    } catch (error) {
      console.error('❌ [COMPLETION VALID] Error during validation:', error);
    }
  };

  const handleInitialRefuse = async () => {
    if (!currentSession) {
      console.error('❌ [INITIAL REFUSE] No current session');
      return;
    }
    
    try {
      console.log('🔍 [INITIAL REFUSE] Starting refusal:', {
        campaignId: currentSession.campaignId,
        campaignType: currentSession.campaign?.type,
        stakerData: stakerData ? {
          stakedAmount: stakerData.stakedAmount,
          stakeAgeDays: stakerData.stakeAgeDays,
          moderatorXP: stakerData.moderatorXP,
          isEligible: stakerData.isEligible
        } : null
      });
      
      console.log('📤 [INITIAL REFUSE] Calling submitModerationDecision...');
      const success = await submitModerationDecision(
        'refuse', 
        'creation',
        undefined, // No score for refusals
        stakerData ? {
          stakedAmount: stakerData.stakedAmount,
          stakeAgeDays: stakerData.stakeAgeDays,
          moderatorXP: stakerData.moderatorXP
        } : undefined
      );
      
      console.log('📥 [INITIAL REFUSE] submitModerationDecision returned:', success);
      console.log('📥 [INITIAL REFUSE] success type:', typeof success);
      console.log('📥 [INITIAL REFUSE] success value:', success);
      
      if (success) {
        console.log('✅ [INITIAL REFUSE] Initial content refused successfully');
        // Décrémenter immédiatement le compteur pour un feedback instantané
        decrementSubTabCount('initial', activeSubTab);
        // Automatically go to next content immediately
        await goToNextAvailable();
      } else {
        console.error('❌ [INITIAL REFUSE] Failed to refuse initial content');
        console.error('❌ [INITIAL REFUSE] Check the network tab and console logs above for details');
        // Même en cas d'échec, essayer de charger le suivant si possible
        console.log('🔄 [INITIAL REFUSE] Attempting to load next campaign anyway...');
        await goToNextAvailable();
        
        // Vérifier si c'est un problème de vote déjà enregistré
        const wallet = address?.address || '';
        const storageKey = `winstory_moderation_voted_${wallet}`;
        try {
          const votedData = localStorage.getItem(storageKey);
          if (votedData) {
            const votedIds = JSON.parse(votedData);
            if (votedIds.includes(currentSession.campaignId)) {
              alert('Ce contenu a déjà été modéré.\n\nSi vous pensez que c\'est une erreur, le système va vérifier dans la base de données et autoriser le vote si nécessaire.\n\nVeuillez réessayer.');
              return;
            }
          }
        } catch (e) {
          // Ignorer les erreurs de parsing
        }
        
        // Afficher un message d'erreur à l'utilisateur avec plus de détails
        alert('Erreur lors du refus de la création initiale.\n\nVeuillez:\n1. Ouvrir la console du navigateur (F12)\n2. Vérifier les logs précédents\n3. Vérifier l\'onglet Network pour voir la réponse de l\'API\n4. Réessayer si le problème persiste');
      }
    } catch (error) {
      console.error('❌ [INITIAL REFUSE] Error during refusal:', error);
      console.error('❌ [INITIAL REFUSE] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      // Afficher un message d'erreur à l'utilisateur
      alert(`Erreur lors du refus: ${error instanceof Error ? error.message : 'Erreur inconnue'}\n\nVérifiez la console pour plus de détails.`);
    }
  };

  const handleCompletionRefuse = async () => {
    if (!currentSession) return;
    
    try {
      console.log('🔍 [COMPLETION REFUSE] Starting refusal:', {
        campaignId: currentSession.campaignId,
        stakerData
      });
      
      const success = await submitModerationDecision(
        'refuse', 
        'completion',
        undefined, // No score for refusals
        stakerData ? {
          stakedAmount: stakerData.stakedAmount,
          stakeAgeDays: stakerData.stakeAgeDays,
          moderatorXP: stakerData.moderatorXP
        } : undefined
      );
      
      if (success) {
        console.log('✅ [COMPLETION REFUSE] Completion refused successfully');
        // Décrémenter immédiatement le compteur pour un feedback instantané
        decrementSubTabCount('completion', activeSubTab);
        // Automatically go to next content immediately
        await goToNextAvailable();
      } else {
        console.error('❌ [COMPLETION REFUSE] Failed to refuse completion');
        // Même en cas d'échec, essayer de charger le suivant si possible
        console.log('🔄 [COMPLETION REFUSE] Attempting to load next campaign anyway...');
        await goToNextAvailable();
      }
    } catch (error) {
      console.error('❌ [COMPLETION REFUSE] Error during refusal:', error);
      // Afficher un message d'erreur à l'utilisateur
      alert(`Erreur lors du refus: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const handleCompletionScore = async (score: number) => {
    if (!currentSession) return;
    
    // If 0, it's an explicit refusal
    if (score === 0) {
      await handleCompletionRefuse();
      return;
    }

    try {
      console.log('🔍 [COMPLETION SCORE] Starting scoring:', {
        score,
        campaignId: currentSession.campaignId,
        stakerData
      });
      
      const success = await submitCompletionScore(
        score,
        currentSession.campaignId, // completionId
        stakerData ? {
          stakedAmount: stakerData.stakedAmount,
          stakeAgeDays: stakerData.stakeAgeDays,
          moderatorXP: stakerData.moderatorXP
        } : undefined
      );
      
      if (success) {
        console.log('✅ [COMPLETION SCORE] Score submitted successfully:', score);
        setShowScoringModal(false);
        // Décrémenter immédiatement le compteur pour un feedback instantané
        decrementSubTabCount('completion', activeSubTab);
        // Automatically go to next content immediately
        await goToNextAvailable();
      } else {
        console.error('❌ [COMPLETION SCORE] Failed to submit score:', score);
        // Même en cas d'échec, essayer de charger le suivant si possible
        console.log('🔄 [COMPLETION SCORE] Attempting to load next campaign anyway...');
        await goToNextAvailable();
      }
    } catch (error) {
      console.error('❌ [COMPLETION SCORE] Error during submission:', error);
    }
  };

  // Calculer le style du panneau droit
  const panelRightStyle = {
    justifyContent: 'flex-start',
    minHeight: 420,
    maxHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '0' // Réduire l'espacement entre les éléments
  } as React.CSSProperties;

  // Vérifier si l'utilisateur a été déconnecté de force
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const forceDisconnected = localStorage.getItem('winstory_force_disconnected') === 'true';
      if (forceDisconnected) {
        setIsForceDisconnected(true);
        // Si déconnecté de force, rediriger vers welcome
        router.push('/welcome');
      }
    }
  }, [router]);

  // Debug: Afficher l'état actuel
    console.log('DEBUG: Current state', { 
    campaignId, 
    isLoading, 
    error, 
    currentSession, 
        address: !!address?.address 
  });

  // VÉRIFIER L'AUTHENTIFICATION EN PREMIER
  if (!address?.address || isForceDisconnected) {
    return (
      <div className={styles.moderationBg}>
        {/* Dev Controls - TOUJOURS VISIBLE */}
      <UltimateDevControls />
        
        {/* Bouton de debug temporaire pour forcer l'affichage */}
        {process.env.NODE_ENV !== 'production' && (
          <div style={{
            position: 'fixed',
            right: 20,
            bottom: 200,
            zIndex: 200,
            background: '#FF0000',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 'bold'
          }}>
            DEBUG: Dev Controls Active
          </div>
        )}
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem'
        }}>
          <h1 style={{
            color: '#FFD600',
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            Moderation Dashboard
          </h1>
          <p style={{
            color: '#fff',
            fontSize: '1.2rem',
            marginBottom: '2rem',
            textAlign: 'center',
            maxWidth: '600px'
          }}>
            {isForceDisconnected 
              ? 'You have been disconnected. Please reconnect your wallet to access moderation.'
              : 'Connect your wallet to access the moderation interface and start moderating campaigns.'}
          </p>
          {!isForceDisconnected && <WalletConnect isBothLogin={true} />}
        </div>
      </div>
    );
  }

  // VÉRIFICATION D'ÉLIGIBILITÉ APRÈS AUTHENTIFICATION
  console.log('🔍 [ELIGIBILITY CHECK] stakerData:', stakerData);
  console.log('🔍 [ELIGIBILITY CHECK] isEligible:', stakerData?.isEligible);
  console.log('🔍 [ELIGIBILITY CHECK] campaignId:', campaignId);
  console.log('🔍 [ELIGIBILITY CHECK] address:', address?.address);

  // Note: Les stakers inéligibles peuvent maintenant voter mais sans rémunération
  // L'éligibilité est vérifiée au niveau des récompenses, pas de l'accès à la modération
  console.log('✅ [ELIGIBILITY CHECK] User can access moderation (eligible or not)');

  // FORCER l'affichage de l'interface de modération optimisée
  // Cette condition doit être vérifiée APRÈS l'authentification
  if (campaignId) {
    console.log('DEBUG: Forcing moderation interface display with optimizations');
    
    // Au lieu de simuler, utiliser les vraies données si disponibles
    if (currentSession) {
      const { campaign, progress } = currentSession;
      
      return (
        <div className={styles.moderationBg}>
          <ModeratorHeader
            activeTab={activeTab}
            activeSubTab={activeSubTab}
            onTabChange={handleTabChange}
            onSubTabChange={handleSubTabChange}
            onIconClick={() => router.push('/welcome')}
            onBulbClick={() => setShowBulbPopup(true)}
            subTabCounts={subTabCounts}
            stakerData={stakerData}
          />
          
          <div className={styles.moderationContainer}>
            {/* Colonne bulles à gauche */}
            <ModerationBubbles
              userType={getUICreatorType(campaign)}
              onBubbleClick={handleBubbleClick}
              bubbleSize={100}
              bubbleGap={24}
              campaignType={getUICampaignType(campaign)}
              hasRewards={!!(campaign.rewards?.standardReward || campaign.rewards?.premiumReward)}
            />

            {/* Panneau gauche : vidéo */}
            <div className={styles.moderationPanelLeft}>
              {/* Interface optimisée - Initial Story */}
              {campaign.type === 'INITIAL' ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  padding: '8px 12px',
                  background: 'rgba(255, 215, 0, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 215, 0, 0.3)'
                }}>
                  {/* Titre de la campagne */}
                  <h2 style={{
                    fontSize: '14px',
                    fontWeight: 'normal',
                    fontStyle: 'italic',
                    color: '#FFD600',
                    margin: '0'
                  }}>
                    {campaign.title}
                  </h2>
                  
                  {/* Icône et nom de l'entreprise/créateur */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '17px',
                    fontWeight: 'bold',
                    color: '#00FF00'
                  }}>
                    {campaign.creatorType === 'B2C_AGENCIES' ? (
                      <>
                        <img 
                          src="/company.svg" 
                          alt="Company" 
                          style={{ width: '32px', height: '32px' }}
                        />
                        <span>{campaign.creatorInfo.companyName || 'B2C Company'}</span>
                      </>
                    ) : (
                      <>
                        <img 
                          src="/individual.svg" 
                          alt="Individual" 
                          style={{ width: '32px', height: '32px' }}
                        />
                        <span>{campaign.creatorInfo.walletAddress ? 
                          `${campaign.creatorInfo.walletAddress.slice(0, 4)}...${campaign.creatorInfo.walletAddress.slice(-4)}` : 
                          'Individual'
                        }</span>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                // Interface optimisée - Completion compacte
                <div style={{ position: 'relative' }} key={`completion-header-${campaign.id || ''}-${activeTab}-${activeSubTab}`}>
                  <div style={{
                    padding: '8px 12px',
                    marginBottom: '8px',
                    background: 'rgba(255, 215, 0, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 215, 0, 0.3)'
                  }}>
                  {/* Titre plus compact */}
                  <h2 style={{
                    fontSize: '14px',
                    fontWeight: 'normal',
                    fontStyle: 'italic',
                    color: '#FFD600',
                    marginBottom: '6px',
                    textAlign: 'center'
                  }}>
                    {campaign.title}
                  </h2>
                  
                  {/* Informations sur une seule ligne compacte avec icônes */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#fff'
                  }}>
                    {campaign.creatorType === 'FOR_B2C' ? (
                      <>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          color: '#00FF00' 
                        }}>
                          <img 
                            src="/company.svg" 
                            alt="Company" 
                            style={{ width: '28px', height: '28px' }}
                          />
                          <span>{campaign.originalCampaignCompanyName || 'B2C Company'}</span>
                        </div>
                        <span style={{ color: '#FFD600' }}>→</span>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          color: '#FFD600' 
                        }}>
                          <img 
                            src="/individual.svg" 
                            alt="Individual" 
                            style={{ width: '28px', height: '28px' }}
                          />
                          <span>{campaign.completerWallet ? 
                            `${campaign.completerWallet.slice(0, 4)}...${campaign.completerWallet.slice(-4)}` : 
                            'Individual'
                          }</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          color: '#00FF00' 
                        }}>
                          <img 
                            src="/individual.svg" 
                            alt="Individual" 
                            style={{ width: '28px', height: '28px' }}
                          />
                          <span>{campaign.originalCreatorWallet ? 
                            `${campaign.originalCreatorWallet.slice(0, 4)}...${campaign.originalCreatorWallet.slice(-4)}` : 
                            'Individual'
                          }</span>
                        </div>
                        <span style={{ color: '#FFD600' }}>→</span>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          color: '#FFD600' 
                        }}>
                          <img 
                            src="/individual.svg" 
                            alt="Individual" 
                            style={{ width: '28px', height: '28px' }}
                          />
                          <span>{campaign.completerWallet ? 
                            `${campaign.completerWallet.slice(0, 4)}...${campaign.completerWallet.slice(-4)}` : 
                            'Individual'
                          }</span>
                        </div>
                      </>
                    )}
                  </div>
                  </div>

                  {/* Yellow Completing Story bubble aligned to the right of the header box */}
                  {!isSwitching && (
                  <div
                    role="button"
                    onClick={() => handleBubbleClick('completingStory')}
                    style={{
                      position: 'absolute',
                      right: -140,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 100,
                      height: 100,
                      background: 'linear-gradient(135deg, #FFD60020 0%, #FFD60010 100%)',
                      border: '2px solid #FFD60060',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFD600',
                      fontWeight: 600,
                      fontSize: 12,
                      textAlign: 'center',
                      lineHeight: 1.1,
                      padding: '4px',
                      transition: '0.3s ease',
                      textShadow: '0 0 10px #FFD60050',
                      boxShadow: '0 4px 20px #FFD60020',
                      userSelect: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 6px 25px #FFD60030';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 20px #FFD60020';
                    }}
                  >
                    Completing Story
                  </div>
                  )}
                </div>
              )}

              {/* Zone vidéo (render only if provided, otherwise neutral placeholder) */}
              <div className={styles.videoSection} style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {(() => {
                  // Utiliser la presigned URL si disponible, sinon l'URL originale
                  const originalVideoUrl = campaign?.content?.videoUrl;
                  const finalVideoUrl = s3VideoUrl || originalVideoUrl;
                  
                  console.log('🎬 [VIDEO] Video URL check (first instance):', {
                    hasContent: !!campaign?.content,
                    originalUrl: originalVideoUrl,
                    s3VideoUrl: s3VideoUrl,
                    finalVideoUrl: finalVideoUrl,
                    isLoadingVideoUrl: isLoadingVideoUrl,
                    isAllowed: isVideoAllowed(finalVideoUrl),
                    campaignId: campaign?.id,
                    videoUrlType: finalVideoUrl ? (finalVideoUrl.startsWith('http') ? 'HTTP' : finalVideoUrl.startsWith('indexeddb') ? 'IndexedDB' : 'Other') : 'None'
                  });
                  
                  // Vérifier si la vidéo est déléguée à Winstory
                  if (originalVideoUrl === 'winstory_delegated' || originalVideoUrl === null || originalVideoUrl === 'null') {
                    return (
                      <div style={{
                        width: '100%',
                        maxWidth: 480,
                        height: 270,
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                        borderRadius: 16,
                        border: '2px solid rgba(255, 214, 0, 0.3)',
                        color: '#FFD600',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        fontWeight: 600,
                        textAlign: 'center',
                        padding: 24,
                        gap: 12
                      }}>
                        <div style={{ fontSize: 48 }}>🎬</div>
                        <div>Video creation delegated to Winstory</div>
                        <div style={{ fontSize: 13, color: '#999', fontWeight: 400, marginTop: 4 }}>
                          This video will be created by Winstory and will be available for moderation once completed.
                        </div>
                      </div>
                    );
                  }
                  
                  if (isLoadingVideoUrl) {
                    return (
                      <div style={{
                        width: '100%',
                        maxWidth: 480,
                        height: 270,
                        background: '#111',
                        borderRadius: 16,
                        border: '2px dashed rgba(255,255,255,0.15)',
                        color: '#999',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14
                      }}>
                        Loading video...
                      </div>
                    );
                  }
                  
                  // Vérifier si on a une URL valide
                  if (!finalVideoUrl || finalVideoUrl === 'null' || finalVideoUrl === null) {
                    return (
                      <div style={{
                        width: '100%',
                        maxWidth: 480,
                        height: 270,
                        background: '#111',
                        borderRadius: 16,
                        border: '2px dashed rgba(255,255,255,0.15)',
                        color: '#999',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14
                      }}>
                        No video available
                      </div>
                    );
                  }
                  
                  // Vérifier si c'est une URL HTTP valide (pas indexeddb ou autre)
                  const isValidHttpUrl = typeof finalVideoUrl === 'string' && (finalVideoUrl.startsWith('http://') || finalVideoUrl.startsWith('https://'));
                  
                  if (!isValidHttpUrl && finalVideoUrl.startsWith('indexeddb:')) {
                    return (
                      <div style={{
                        width: '100%',
                        maxWidth: 480,
                        height: 270,
                        background: '#111',
                        borderRadius: 16,
                        border: '2px dashed rgba(255,255,255,0.15)',
                        color: '#999',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        gap: 8
                      }}>
                        <div>⚠️ Video in IndexedDB format</div>
                        <div style={{ fontSize: 12, color: '#666' }}>This video needs to be uploaded to S3 for moderation</div>
                      </div>
                    );
                  }
                  
                  if (!isValidHttpUrl) {
                    return (
                      <div style={{
                        width: '100%',
                        maxWidth: 480,
                        height: 270,
                        background: '#111',
                        borderRadius: 16,
                        border: '2px dashed rgba(255,255,255,0.15)',
                        color: '#999',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14
                      }}>
                        Invalid video URL format
                      </div>
                    );
                  }
                  
                  return isVideoAllowed(finalVideoUrl) ? (
                    <video 
                      ref={videoRef} 
                      src={finalVideoUrl} 
                      controls 
                      onLoadedMetadata={handleVideoLoadedMetadata}
                      onError={(e) => {
                        console.error('❌ [VIDEO] Video load error (first):', e);
                        console.error('❌ [VIDEO] Video src was:', finalVideoUrl);
                        console.error('❌ [VIDEO] Original URL:', originalVideoUrl);
                        console.error('❌ [VIDEO] S3 URL:', s3VideoUrl);
                      }}
                      onLoadStart={() => {
                        console.log('✅ [VIDEO] Video load started (first):', finalVideoUrl);
                      }}
                      className={`${styles.campaignVideo} ${(campaign.content.videoOrientation === 'vertical' || detectedOrientation === 'vertical') ? styles.vertical : ''}`}
                      style={{ 
                        margin: '0 0',
                        backgroundColor: '#000',
                        width: '100%',
                        maxWidth: '100%',
                        height: 'auto'
                      }}
                      preload="metadata"
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      maxWidth: 480,
                      height: 270,
                      background: '#111',
                      borderRadius: 16,
                      border: '2px dashed rgba(255,255,255,0.15)',
                      color: '#999',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      gap: 8,
                      padding: 16,
                      textAlign: 'center'
                    }}>
                      <div>⚠️ Video URL not allowed</div>
                      <div style={{ fontSize: 12, color: '#666', wordBreak: 'break-all' }}>
                        {finalVideoUrl ? `${finalVideoUrl.substring(0, 60)}...` : 'No video URL provided'}
                      </div>
                    </div>
                  );
                })()}
                {/* moved Completing Story bubble above, beside header block */}
              </div>
            </div>

            {/* Panneau de droite : progression de modération */}
            <div className={styles.moderationPanelRight}>
              <ModerationProgressPanel
                stakers={progress.stakers}
                stakedAmount={progress.stakedAmount}
                mintPrice={progress.mintPrice}
                validVotes={progress.validVotes}
                refuseVotes={progress.refuseVotes}
                totalVotes={progress.totalVotes}
                averageScore={progress.averageScore}
                campaignType={mapCampaignType(getUICampaignType(campaign))}
                creatorType={getUICreatorType(campaign)}
                stakeYes={progress.stakeYes}
                stakeNo={progress.stakeNo}
                onClick={() => setShowStatsModal(true)}
                style={{
                  justifyContent: 'flex-start',
                  minHeight: 420,
                  maxHeight: '60vh',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              />
              
              {/* Boutons de modération */}
              <ModerationButtons
                activeTab={activeTab}
                activeSubTab={activeSubTab}
                userType={getUICreatorType(campaign)}
                onValid={activeTab === 'initial' ? handleInitialValid : handleCompletionValid}
                onRefuse={activeTab === 'initial' ? handleInitialRefuse : handleCompletionRefuse}
                onValidWithScore={handleCompletionScore}
                usedScores={moderatorUsedScores}
              />
            </div>
          </div>

          {/* Nouveau modal d'information */}
          <InfoModal
            isOpen={showInfoModal.isOpen}
            onClose={() => setShowInfoModal({ ...showInfoModal, isOpen: false })}
            title={showInfoModal.title}
            icon={showInfoModal.icon}
            content={showInfoModal.content}
            videoUrl={showInfoModal.videoUrl}
          />

          {/* Modal d'information sur la modération */}
          <ModerationTooltip
            isOpen={showBulbPopup}
            onClose={() => setShowBulbPopup(false)}
          />

          {/* Modal des récompenses combinées */}
          <RewardsModal
            isOpen={showRewardsModal}
            onClose={() => setShowRewardsModal(false)}
            standardReward={campaign.rewards?.standardReward}
            premiumReward={campaign.rewards?.premiumReward}
            campaignId={campaign.id}
            campaignType={campaign.type}
            creatorType={campaign.creatorType}
          />

          {/* Modal des statistiques de modération */}
          <ModerationStatsModal
            isOpen={showStatsModal}
            onClose={() => setShowStatsModal(false)}
            stakers={progress.stakers}
            stakedAmount={progress.stakedAmount}
            mintPrice={progress.mintPrice}
            validVotes={progress.validVotes}
            refuseVotes={progress.refuseVotes}
            totalVotes={progress.totalVotes}
            averageScore={progress.averageScore}
            campaignType={mapCampaignType(getUICampaignType(campaign))}
            creatorType={getUICreatorType(campaign)}
            stakeYes={progress.stakeYes}
            stakeNo={progress.stakeNo}
          />
        </div>
      );
    } else if (isLoading) {
      // Afficher un état de chargement pendant que la campagne se charge
      return (
        <div className={styles.moderationBg}>
          <ModeratorHeader
            activeTab={activeTab}
            activeSubTab={activeSubTab}
            onTabChange={handleTabChange}
            onSubTabChange={handleSubTabChange}
            onIconClick={() => router.push('/welcome')}
            onBulbClick={() => setShowBulbPopup(true)}
            subTabCounts={subTabCounts}
            stakerData={stakerData}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '60vh',
            color: '#FFD600',
            fontSize: '18px'
          }}>
            Loading campaign...
          </div>
        </div>
      );
    } else {
      // Si pas de session et pas en chargement, attendre l'effet useEffect de chargement
      return (
        <div className={styles.moderationBg}>
          <ModeratorHeader
            activeTab={activeTab}
            activeSubTab={activeSubTab}
            onTabChange={handleTabChange}
            onSubTabChange={handleSubTabChange}
            onIconClick={() => router.push('/welcome')}
            onBulbClick={() => setShowBulbPopup(true)}
            subTabCounts={subTabCounts}
            stakerData={stakerData}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '60vh',
            color: '#FFD600',
            fontSize: '18px'
          }}>
            {address?.address ? 'Loading campaign...' : 'Please connect your wallet'}
          </div>
        </div>
      );
    }
  }

  // Si pas de campaignId, afficher un état de chargement uniquement pendant le fetch auto
  if (!currentSession && isLoading && address?.address) {
    return (
      <div className={styles.moderationBg}>
        {/* Dev Controls - TOUJOURS VISIBLE */}
      <UltimateDevControls />
        
        {/* Bouton de debug temporaire pour forcer l'affichage */}
        {process.env.NODE_ENV !== 'production' && (
          <div style={{
            position: 'fixed',
            right: 20,
            bottom: 200,
            zIndex: 200,
            background: '#FF0000',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 'bold'
          }}>
            DEBUG: Dev Controls Active
          </div>
        )}
        
        <ModeratorHeader
          activeTab={activeTab}
          activeSubTab={activeSubTab}
          onTabChange={handleTabChange}
          onSubTabChange={handleSubTabChange}
          onIconClick={() => router.push('/welcome')}
          onBulbClick={() => setShowBulbPopup(true)}
          subTabCounts={subTabCounts}
          stakerData={stakerData}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '60vh',
          color: '#FFD600',
          fontSize: '18px'
        }}>
          Loading first available campaign...
        </div>
      </div>
    );
  }

  // Interface normale avec session
  if (!currentSession) {
    return (
      <div className={styles.moderationBg}>
        {/* Dev Controls - TOUJOURS VISIBLE */}
      <UltimateDevControls />
        
        {/* Bouton de debug temporaire pour forcer l'affichage */}
        {process.env.NODE_ENV !== 'production' && (
          <div style={{
            position: 'fixed',
            right: 20,
            bottom: 200,
            zIndex: 200,
            background: '#FF0000',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 'bold'
          }}>
            DEBUG: Dev Controls Active
          </div>
        )}
        
        <ModeratorHeader
          activeTab={activeTab}
          activeSubTab={activeSubTab}
          onTabChange={handleTabChange}
          onSubTabChange={handleSubTabChange}
          onIconClick={() => router.push('/welcome')}
          onBulbClick={() => setShowBulbPopup(true)}
          subTabCounts={subTabCounts}
          stakerData={stakerData}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '60vh',
          color: '#999',
            fontSize: '18px',
            textAlign: 'center',
            padding: '0 16px'
        }}>
            No content to moderate for {getMainTabLabel(activeTab)} — {activeSubTypeLabel}
          </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '60vh',
          color: '#999',
          fontSize: '18px',
          textAlign: 'center',
          padding: '0 16px'
        }}>
          No content to moderate for {getMainTabLabel(activeTab)} — {activeSubTypeLabel}
        </div>
      </div>
    );
  }

  const { campaign, progress } = currentSession;

  return (
    <div className={styles.moderationBg}>
      {/* Dev Controls - TOUJOURS VISIBLE */}
      <UltimateDevControls />
      
      {/* Bouton de debug temporaire pour forcer l'affichage */}
      {process.env.NODE_ENV !== 'production' && (
        <div style={{
          position: 'fixed',
          right: 20,
          bottom: 200,
          zIndex: 200,
          background: '#FF0000',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 'bold'
        }}>
          DEBUG: Dev Controls Active
        </div>
      )}
      
      {isSwitching && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            border: '4px solid rgba(255,214,0,0.35)',
            borderTopColor: '#FFD600',
            animation: 'wspin 1s linear infinite',
            boxShadow: '0 0 24px rgba(255,214,0,0.25)'
          }} />
          <style>{`@keyframes wspin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
        </div>
      )}
      <ModeratorHeader
        activeTab={activeTab}
        activeSubTab={activeSubTab}
        onTabChange={handleTabChange}
        onSubTabChange={handleSubTabChange}
        onIconClick={() => router.push('/welcome')}
        onBulbClick={() => setShowBulbPopup(true)}
        subTabCounts={subTabCounts}
        stakerData={stakerData}
      />
      
      <div className={styles.moderationContainer}>
        {/* Colonne bulles à gauche */}
        <ModerationBubbles
          key={`bubbles-${getUICampaignType(campaign)}-${activeTab}-${activeSubTab}`}
          userType={getUICreatorType(campaign)}
          onBubbleClick={handleBubbleClick}
          bubbleSize={100}
          bubbleGap={24}
          campaignType={getUICampaignType(campaign)}
          hasRewards={!!(campaign.rewards?.standardReward || campaign.rewards?.premiumReward)}
        />

        {/* Panneau gauche : vidéo */}
        <div className={styles.moderationPanelLeft}>
          {/* Titre dynamique selon le type de campagne - REMPLACE BrandInfo */}
          {campaign.type === 'INITIAL' ? (
            // Pour les histoires initiales : titre et infos compactes
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px', // Réduit de 16px à 8px
              padding: '8px 12px', // Réduit de 12px 16px à 8px 12px
              background: 'rgba(255, 215, 0, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 215, 0, 0.3)'
            }}>
              {/* Titre de la campagne */}
              <h2 style={{
                fontSize: '14px',
                fontWeight: 'normal',
                fontStyle: 'italic',
                color: '#FFD600',
                margin: '0'
              }}>
                {campaign.title}
              </h2>
              
              {/* Icône et nom de l'entreprise/créateur */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '17px',
                fontWeight: 'bold',
                color: '#00FF00'
              }}>
                {campaign.creatorType === 'B2C_AGENCIES' ? (
                  <>
                    <img 
                      src="/company.svg" 
                      alt="Company" 
                      style={{ width: '32px', height: '32px' }}
                    />
                    <span>{campaign.creatorInfo.companyName || 'B2C Company'}</span>
                  </>
                ) : (
                  <>
                    <img 
                      src="/individual.svg" 
                      alt="Individual" 
                      style={{ width: '32px', height: '32px' }}
                    />
                    <span>{campaign.creatorInfo.walletAddress ? 
                      `${campaign.creatorInfo.walletAddress.slice(0, 4)}...${campaign.creatorInfo.walletAddress.slice(-4)}` : 
                      'Individual'
                    }</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            // Pour les complétions : titre et informations compactes
            <div style={{
              padding: '8px 12px', // Réduit de 16px à 8px/12px
              marginBottom: '8px', // Réduit de 16px à 8px
              background: 'rgba(255, 215, 0, 0.1)',
              borderRadius: '8px', // Réduit de 12px à 8px
              border: '1px solid rgba(255, 215, 0, 0.3)'
            }}>
              {/* Titre plus compact */}
              <h2 style={{
                fontSize: '14px',
                fontWeight: 'normal',
                fontStyle: 'italic',
                color: '#FFD600',
                marginBottom: '6px',
                textAlign: 'center'
              }}>
                {campaign.title}
              </h2>
              
              {/* Informations sur une seule ligne compacte avec icônes */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#fff'
              }}>
                {campaign.creatorType === 'FOR_B2C' ? (
                  <>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      color: '#00FF00' 
                    }}>
                      <img 
                        src="/company.svg" 
                        alt="Company" 
                        style={{ width: '28px', height: '28px' }}
                      />
                      <span>{campaign.originalCampaignCompanyName || 'B2C Company'}</span>
                    </div>
                    <span style={{ color: '#FFD600' }}>→</span>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      color: '#FFD600' 
                    }}>
                      <img 
                        src="/individual.svg" 
                        alt="Individual" 
                        style={{ width: '28px', height: '28px' }}
                      />
                      <span>{campaign.completerWallet ? 
                        `${campaign.completerWallet.slice(0, 4)}...${campaign.completerWallet.slice(-4)}` : 
                        'Individual'
                      }</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      color: '#00FF00' 
                    }}>
                      <img 
                        src="/individual.svg" 
                        alt="Individual" 
                        style={{ width: '28px', height: '28px' }}
                      />
                      <span>{campaign.originalCreatorWallet ? 
                        `${campaign.originalCreatorWallet.slice(0, 4)}...${campaign.originalCreatorWallet.slice(-4)}` : 
                        'Individual'
                      }</span>
                    </div>
                    <span style={{ color: '#FFD600' }}>→</span>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      color: '#FFD600' 
                    }}>
                      <img 
                        src="/individual.svg" 
                        alt="Individual" 
                        style={{ width: '28px', height: '28px' }}
                      />
                      <span>{campaign.completerWallet ? 
                        `${campaign.completerWallet.slice(0, 4)}...${campaign.completerWallet.slice(-4)}` : 
                        'Individual'
                      }</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          
        <div className={styles.videoSection} style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {(() => {
            // Utiliser la même presigned URL générée au niveau supérieur
            const originalVideoUrl2 = campaign?.content?.videoUrl;
            const finalVideoUrl2 = s3VideoUrl || originalVideoUrl2;

            console.log('🎬 [VIDEO] Video URL check (second instance):', {
              hasContent: !!campaign?.content,
              originalUrl: originalVideoUrl2,
              s3VideoUrl: s3VideoUrl,
              finalVideoUrl: finalVideoUrl2,
              isLoadingVideoUrl: isLoadingVideoUrl,
              isAllowed: isVideoAllowed(finalVideoUrl2),
              campaignId: campaign?.id
            });

            // Cas délégué à Winstory
            if (originalVideoUrl2 === 'winstory_delegated' || originalVideoUrl2 === null || originalVideoUrl2 === 'null') {
              return (
                <div style={{
                  width: '100%',
                  maxWidth: 480,
                  height: 270,
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                  borderRadius: 16,
                  border: '2px solid rgba(255, 214, 0, 0.3)',
                  color: '#FFD600',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 600,
                  textAlign: 'center',
                  padding: 24,
                  gap: 12
                }}>
                  <div style={{ fontSize: 48 }}>🎬</div>
                  <div>Video creation delegated to Winstory</div>
                  <div style={{ fontSize: 13, color: '#999', fontWeight: 400, marginTop: 4 }}>
                    This video will be created by Winstory and will be available for moderation once completed.
                  </div>
                </div>
              );
            }

            if (isLoadingVideoUrl) {
              return (
                <div style={{
                  width: '100%',
                  maxWidth: 480,
                  height: 270,
                  background: '#111',
                  borderRadius: 16,
                  border: '2px dashed rgba(255,255,255,0.15)',
                  color: '#999',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14
                }}>
                  Loading video...
                </div>
              );
            }

            // Vérifier URL disponible
            if (!finalVideoUrl2 || finalVideoUrl2 === 'null') {
              return (
                <div style={{
                  width: '100%',
                  maxWidth: 480,
                  height: 270,
                  background: '#111',
                  borderRadius: 16,
                  border: '2px dashed rgba(255,255,255,0.15)',
                  color: '#999',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14
                }}>
                  No video available
                </div>
              );
            }

            const isValidHttpUrl = typeof finalVideoUrl2 === 'string' && (finalVideoUrl2.startsWith('http://') || finalVideoUrl2.startsWith('https://'));
            if (!isValidHttpUrl && finalVideoUrl2.startsWith('indexeddb:')) {
              return (
                <div style={{
                  width: '100%',
                  maxWidth: 480,
                  height: 270,
                  background: '#111',
                  borderRadius: 16,
                  border: '2px dashed rgba(255,255,255,0.15)',
                  color: '#999',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  gap: 8
                }}>
                  <div>⚠️ Video in IndexedDB format</div>
                  <div style={{ fontSize: 12, color: '#666' }}>This video needs to be uploaded to S3 for moderation</div>
                </div>
              );
            }

            if (!isValidHttpUrl) {
              return (
                <div style={{
                  width: '100%',
                  maxWidth: 480,
                  height: 270,
                  background: '#111',
                  borderRadius: 16,
                  border: '2px dashed rgba(255,255,255,0.15)',
                  color: '#999',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14
                }}>
                  Invalid video URL format
                </div>
              );
            }

            return isVideoAllowed(finalVideoUrl2) ? (
              <video 
                ref={videoRef} 
                src={finalVideoUrl2} 
                controls 
                onLoadedMetadata={handleVideoLoadedMetadata}
                onError={(e) => {
                  console.error('❌ [VIDEO] Video load error (second):', e);
                  console.error('❌ [VIDEO] Video src was:', finalVideoUrl2);
                  console.error('❌ [VIDEO] Original URL:', originalVideoUrl2);
                  console.error('❌ [VIDEO] S3 URL:', s3VideoUrl);
                }}
                onLoadStart={() => {
                  console.log('✅ [VIDEO] Video load started (second):', finalVideoUrl2);
                }}
                className={`${styles.campaignVideo} ${(campaign.content.videoOrientation === 'vertical' || detectedOrientation === 'vertical') ? styles.vertical : ''}`}
                style={{ margin: '0 0', backgroundColor: '#000' }} 
                preload="metadata"
              />
            ) : (
              <div style={{
                width: '100%',
                maxWidth: 480,
                height: 270,
                background: '#111',
                borderRadius: 16,
                border: '2px dashed rgba(255,255,255,0.15)',
                color: '#999',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                gap: 8,
                padding: 16,
                textAlign: 'center'
              }}>
                <div>⚠️ Video URL not allowed</div>
                <div style={{ fontSize: 12, color: '#666', wordBreak: 'break-all' }}>
                  {finalVideoUrl2 ? `${finalVideoUrl2.substring(0, 60)}...` : 'No video URL provided'}
                </div>
              </div>
            );
          })()}
        </div>
        </div>

        {/* Panneau droit : barres de progression + boutons */}
        <div className={styles.moderationPanelRight} style={panelRightStyle}>
          <ModerationProgressPanel
            stakers={progress.stakers}
            stakedAmount={progress.stakedAmount}
            mintPrice={progress.mintPrice}
            validVotes={progress.validVotes}
            refuseVotes={progress.refuseVotes}
            totalVotes={progress.totalVotes}
            averageScore={progress.averageScore}
            campaignType={mapCampaignType(getUICampaignType(campaign))}
            creatorType={getUICreatorType(campaign)}
            stakeYes={progress.stakeYes}
            stakeNo={progress.stakeNo}
            onClick={() => setShowStatsModal(true)}
          />
          
          <ModerationButtons
            activeTab={activeTab}
            activeSubTab={activeSubTab}
            userType={getUICreatorType(campaign)}
            onValid={activeTab === 'initial' ? handleInitialValid : handleCompletionValid}
            onRefuse={activeTab === 'initial' ? handleInitialRefuse : handleCompletionRefuse}
            onValidWithScore={handleCompletionScore}
            usedScores={moderatorUsedScores}
          />
        </div>
      </div>

      {/* Nouveau modal d'information */}
      <InfoModal
        isOpen={showInfoModal.isOpen}
        onClose={() => setShowInfoModal({ ...showInfoModal, isOpen: false })}
        title={showInfoModal.title}
        icon={showInfoModal.icon}
        content={showInfoModal.content}
        videoUrl={showInfoModal.videoUrl}
      />

      {/* Popup infos campagne (bulle i) */}
      {showInfo && (
        <ModerationInfoModal 
          info={{
            startingText: campaign.content.startingStory,
            guideline: campaign.content.guidelines || '',
            standardRewards: campaign.rewards?.standardReward,
            premiumRewards: campaign.rewards?.premiumReward,
            completionPrice: campaign.rewards?.completionPrice || '',
            totalCompletions: campaign.metadata.totalCompletions || 0
          }} 
          onClose={() => setShowInfo(false)} 
        />
      )}

      {/* Moderation Tooltip */}
      <ModerationTooltip 
        isOpen={showBulbPopup} 
        onClose={() => setShowBulbPopup(false)} 
      />

      {/* Modal de notation des complétions */}
      <CompletionScoringModal
        isOpen={showScoringModal}
        onClose={() => setShowScoringModal(false)}
        onConfirm={handleCompletionScore}
        usedScores={progress.completionScores || []}
        contentType={getUICreatorType(campaign)}
      />

      {/* Modal des récompenses combinées */}
      <RewardsModal
        isOpen={showRewardsModal}
        onClose={() => setShowRewardsModal(false)}
        standardReward={campaign.rewards?.standardReward}
        premiumReward={campaign.rewards?.premiumReward}
        campaignId={campaign.id}
        campaignType={campaign.type}
        creatorType={campaign.creatorType}
      />

      {/* Modal des statistiques de modération */}
      <ModerationStatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        stakers={progress.stakers}
        stakedAmount={progress.stakedAmount}
        mintPrice={progress.mintPrice}
        validVotes={progress.validVotes}
        refuseVotes={progress.refuseVotes}
        totalVotes={progress.totalVotes}
        averageScore={progress.averageScore}
        campaignType={mapCampaignType(getUICampaignType(campaign))}
        creatorType={getUICreatorType(campaign)}
        stakeYes={progress.stakeYes}
        stakeNo={progress.stakeNo}
      />
      
      {/* Bouton Dev Controls principal */}
      <DevControlsButton />
      
      {/* Dev Controls pour les statistiques de modération */}
      <ModerationStatsDevControlsButton />
    </div>
  );
};

const ModerationPage = () => {
  return (
    <>
      {/* Dev Controls au niveau le plus haut - ne peut jamais disparaître */}
      <UltimateDevControls />
      
      <Suspense fallback={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: '#000',
          color: '#FFD600',
          fontSize: '18px'
        }}>
          Loading moderation interface...
        </div>
      }>
        <ModerationPageContent />
      </Suspense>
    </>
  );
};

export default ModerationPage;
