'use client';
import React, { useState, useEffect, useRef } from 'react';
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
import styles from '../../styles/Moderation.module.css';
import { useModeration } from '../../lib/hooks/useModeration';
import { ModerationCampaign, getUICreatorType, getUICampaignType } from '../../lib/types';

const ModerationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const account = useActiveAccount();
  
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
  
  // Fonction pour gérer les clics sur les bulles
  const handleBubbleClick = (bubbleType: string) => {
    if (bubbleType === 'rewards') {
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
    submitModerationDecision, 
    submitCompletionScore,
    checkCampaignsAvailability,
    fetchCampaignById,
    fetchAvailableCampaigns,
    loadCampaignForCriteria,
    refreshData,
    setCurrentSession
  } = useModeration();
  
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
    if (campaignId && account?.address && !currentSession) {
      console.log('Loading campaign from URL:', campaignId);
      setIsLoadingCampaign(true);
      
      // Laisser le hook useModeration gérer le chargement
      fetchCampaignById(campaignId).finally(() => {
        setIsLoadingCampaign(false);
      });
    }
  }, [campaignId, account?.address, currentSession, fetchCampaignById]);

  // Fonction pour charger automatiquement la première campagne disponible
  const loadFirstAvailableCampaign = async () => {
    if (!account?.address) return;
    
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
  const handleTabChange = async (newTab: 'initial' | 'completion') => {
    setActiveTab(newTab);
    console.log('Tab changed to:', newTab);
    
    // Réinitialiser le sous-onglet selon le nouvel onglet
    const newSubTab = newTab === 'initial' ? 'b2c-agencies' : 'for-b2c';
    setActiveSubTab(newSubTab);
    
    // Réinitialiser la session actuelle
    setCurrentSession(null);
    
    // Charger immédiatement la première campagne disponible pour ce type
    try {
      setIsLoadingCampaign(true);
      const session = await loadCampaignForCriteria(newTab, newSubTab);
      
      if (session) {
        console.log('Loaded campaign for new tab:', session.campaign.title);
        // Mettre à jour l'URL sans redirection
        window.history.replaceState({}, '', `/moderation?campaignId=${session.campaign.id}&type=${newTab}&subtype=${newSubTab}`);
      } else {
        console.log('No campaigns available for:', newTab, newSubTab);
        // Mettre à jour l'URL sans campaignId
        window.history.replaceState({}, '', `/moderation?type=${newTab}&subtype=${newSubTab}`);
      }
    } catch (error) {
      console.error('Error loading campaign for new tab:', error);
    } finally {
      setIsLoadingCampaign(false);
    }
  };

  const handleSubTabChange = async (newSubTab: string) => {
    setActiveSubTab(newSubTab);
    console.log('Sub tab changed to:', newSubTab);
    
    // Réinitialiser la session actuelle
    setCurrentSession(null);
    
    // Charger immédiatement la première campagne disponible pour ce sous-type
    try {
      setIsLoadingCampaign(true);
      const session = await loadCampaignForCriteria(activeTab, newSubTab);
      
      if (session) {
        console.log('Loaded campaign for new sub tab:', session.campaign.title);
        // Mettre à jour l'URL sans redirection
        window.history.replaceState({}, '', `/moderation?campaignId=${session.campaign.id}&type=${activeTab}&subtype=${newSubTab}`);
      } else {
        console.log('No campaigns available for:', activeTab, newSubTab);
        // Mettre à jour l'URL sans campaignId
        window.history.replaceState({}, '', `/moderation?type=${activeTab}&subtype=${newSubTab}`);
      }
    } catch (error) {
      console.error('Error loading campaign for new sub tab:', error);
    } finally {
      setIsLoadingCampaign(false);
    }
  };

  // Gestionnaires pour les actions de modération
  const handleInitialValid = async () => {
    if (!currentSession) return;
    
    try {
      const success = await submitModerationDecision('valid', 'creation');
      if (success) {
        console.log('Initial story validated successfully');
        // Recharger les données ou rediriger
        router.push('/moderation');
      }
    } catch (error) {
      console.error('Error validating initial story:', error);
    }
  };

  const handleCompletionValid = async () => {
    if (!currentSession) return;
    
    try {
      const success = await submitModerationDecision('valid', 'completion');
      if (success) {
        console.log('Completion validated successfully');
        // Recharger les données ou rediriger
        router.push('/moderation');
      }
    } catch (error) {
      console.error('Error validating completion:', error);
    }
  };

  const handleCompletionRefuse = async () => {
    if (!currentSession) return;
    
    try {
      const success = await submitModerationDecision('refuse', 'completion');
      if (success) {
        console.log('Completion refused successfully');
        // Recharger les données ou rediriger
        router.push('/moderation');
      }
    } catch (error) {
      console.error('Error refusing completion:', error);
    }
  };

  const handleCompletionScore = async (score: number) => {
    if (!currentSession) return;
    
    try {
      const success = await submitCompletionScore(score);
      if (success) {
        console.log('Completion score submitted successfully:', score);
        setShowScoringModal(false);
        // Recharger les données ou rediriger
        router.push('/moderation');
      }
    } catch (error) {
      console.error('Error submitting completion score:', error);
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

  // Debug: Afficher l'état actuel
  console.log('DEBUG: Current state', { 
    campaignId, 
    isLoading, 
    error, 
    currentSession, 
    account: !!account?.address 
  });

  // VÉRIFIER L'AUTHENTIFICATION EN PREMIER
  if (!account?.address) {
    return (
      <div className={styles.moderationBg}>
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
            Connect your wallet to access the moderation interface and start moderating campaigns.
          </p>
          <WalletConnect isBothLogin={true} />
        </div>
      </div>
    );
  }

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
          />
          
          <div className={styles.moderationContainer}>
            {/* Colonne bulles à gauche */}
            <ModerationBubbles
              userType={getUICreatorType(campaign)}
              onBubbleClick={handleBubbleClick}
              bubbleSize={110}
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
              )}

              {/* Zone vidéo */}
              <div className={styles.videoSection} style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <video 
                  ref={videoRef} 
                  src={campaign.content.videoUrl} 
                  controls 
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  className={`${styles.campaignVideo} ${(campaign.content.videoOrientation === 'vertical' || detectedOrientation === 'vertical') ? styles.vertical : ''}`}
                  style={{ margin: '0 0' }} 
                />
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
                userType={getUICreatorType(campaign)}
                onValid={activeTab === 'initial' ? handleInitialValid : handleCompletionValid}
                onRefuse={activeTab === 'initial' ? handleCompletionRefuse : handleCompletionRefuse}
                onValidWithScore={handleCompletionScore}
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
      // Si pas de session et pas en chargement, essayer de charger la campagne
      if (account?.address) {
        fetchCampaignById(campaignId);
      }
      return (
        <div className={styles.moderationBg}>
          <ModeratorHeader
            activeTab={activeTab}
            activeSubTab={activeSubTab}
            onTabChange={handleTabChange}
            onSubTabChange={handleSubTabChange}
            onIconClick={() => router.push('/welcome')}
            onBulbClick={() => setShowBulbPopup(true)}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '60vh',
            color: '#FFD600',
            fontSize: '18px'
          }}>
            {account?.address ? 'Loading campaign...' : 'Please connect your wallet'}
          </div>
        </div>
      );
    }
  }

  // Si pas de campaignId, charger automatiquement la première campagne disponible

  // Si pas de session en cours, charger automatiquement la première campagne disponible
  if (!currentSession && !isLoading && account?.address) {
    loadFirstAvailableCampaign();
    return (
      <div className={styles.moderationBg}>
        <ModeratorHeader
          activeTab={activeTab}
          activeSubTab={activeSubTab}
          onTabChange={handleTabChange}
          onSubTabChange={handleSubTabChange}
          onIconClick={() => router.push('/welcome')}
          onBulbClick={() => setShowBulbPopup(true)}
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
        <ModeratorHeader
          activeTab={activeTab}
          activeSubTab={activeSubTab}
          onTabChange={handleTabChange}
          onSubTabChange={handleSubTabChange}
          onIconClick={() => router.push('/welcome')}
          onBulbClick={() => setShowBulbPopup(true)}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '60vh',
          color: '#999',
          fontSize: '18px'
        }}>
          No campaigns available for moderation
        </div>
      </div>
    );
  }

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
      />
      
      <div className={styles.moderationContainer}>
        {/* Colonne bulles à gauche */}
        <ModerationBubbles
          userType={getUICreatorType(campaign)}
          onBubbleClick={handleBubbleClick}
                        bubbleSize={85}
          bubbleGap={14}
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
            <video 
              ref={videoRef} 
              src={campaign.content.videoUrl} 
              controls 
              onLoadedMetadata={handleVideoLoadedMetadata}
              className={`${styles.campaignVideo} ${(campaign.content.videoOrientation === 'vertical' || detectedOrientation === 'vertical') ? styles.vertical : ''}`}
              style={{ margin: '0 0' }} 
            />
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
            onClick={() => setShowStatsModal(true)}
          />
          
          <ModerationButtons
            activeTab={activeTab}
            userType={getUICreatorType(campaign)}
            onValid={activeTab === 'initial' ? handleInitialValid : handleCompletionValid}
            onRefuse={activeTab === 'initial' ? handleCompletionRefuse : handleCompletionRefuse}
            onValidWithScore={handleCompletionScore}
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
      />
    </div>
  );
};

export default ModerationPage;
