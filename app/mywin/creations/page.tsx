"use client";

import { useActiveAccount } from 'thirdweb/react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import DevControls from '@/components/DevControls';

// Lazy load client-only components
const ActiveCampaignDashboard = dynamic(() => import('../../../components/ActiveCampaignDashboard'), { ssr: false });
const ValidatedCampaignDashboard = dynamic(() => import('../../../components/ValidatedCampaignDashboard'), { ssr: false });

// Helper to detect validated state from ActiveCampaignDashboard
import { computeValidationState } from '../../../components/ActiveCampaignDashboard';

interface Campaign {
  id: string;
  title: string;
  description: string;
  creationDate: string;
  targetCompletions: number;
  currentCompletions: number;
  averageScore: number;
  rewardsDistributed: number;
  roi: number;
  status: 'active' | 'completed' | 'paused';
}

export default function MyCreationsPage() {
  const router = useRouter();
  const account = useActiveAccount();
  const walletAddress = account?.address;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'previous' | 'universe'>('active');
  const [activeInitialProgress, setActiveInitialProgress] = useState<any | null>(null);
  const [devForceValidated, setDevForceValidated] = useState(false);
  const [moderationData, setModerationData] = useState<any[]>([]);
  const [currentCampaignIndex, setCurrentCampaignIndex] = useState(0);

  useEffect(() => {
    if (account) {
      // Récupérer les campagnes créées par cet utilisateur avec leurs données de modération
      const fetchUserCampaigns = async () => {
        try {
          console.log('Fetching created campaigns with moderation data for wallet:', account.address);
          
          // Récupérer les données de modération
          const moderationResponse = await fetch(`/api/campaigns/moderation?walletAddress=${account.address}`);
          
          if (!moderationResponse.ok) {
            throw new Error('Failed to fetch moderation data');
          }
          
          const moderationResult = await moderationResponse.json();
          
          if (moderationResult.success) {
            setModerationData(moderationResult.moderationData);
            
            // Transformer les données pour l'interface
            const transformedCampaigns: Campaign[] = moderationResult.moderationData.map((data: any) => {
              const progress = data.progress;
              const currentScore = progress.current_score || 0;
              const requiredScore = progress.required_score || 7.0;
              const totalVotes = progress.total_votes || 0;
              const validVotes = progress.valid_votes || 0;
              
              return {
                id: data.campaignId,
                title: data.campaignTitle,
                description: '', // Pas de description dans les données de modération
                creationDate: data.createdAt,
                targetCompletions: 100, // Valeur par défaut pour les campagnes B2C avec options payantes
                currentCompletions: totalVotes, // Utiliser le nombre de votes comme proxy pour les complétions
                averageScore: currentScore, // Score actuel de modération
                rewardsDistributed: 0, // TODO: Calculer depuis les récompenses distribuées
                roi: 0, // TODO: Calculer depuis les métadonnées réelles
                status: data.campaignStatus === 'PENDING_MODERATION' ? 'active' : 
                       data.campaignStatus === 'APPROVED' ? 'active' : 
                       data.campaignStatus === 'COMPLETED' ? 'completed' : 'paused'
              };
            });
            
            setCampaigns(transformedCampaigns);
            
            // Utiliser toutes les campagnes pour la navigation
            setModerationData(moderationResult.moderationData);
            
            // Initialiser avec la première campagne
            if (moderationResult.moderationData.length > 0) {
              const firstCampaign = moderationResult.moderationData[0];
              console.log('=== Setting activeInitialProgress ===');
              console.log('firstCampaign:', firstCampaign);
              console.log('firstCampaign.progress:', firstCampaign.progress);
              
              const progressData = {
                ...firstCampaign.progress,
                campaignId: firstCampaign.campaignId,
                campaignTitle: firstCampaign.campaignTitle,
                // Ajouter les propriétés manquantes avec des valeurs par défaut
                validVotes: firstCampaign.progress.valid_votes || 0,
                refuseVotes: firstCampaign.progress.refuse_votes || 0,
                totalVotes: firstCampaign.progress.total_votes || 0,
                stakedAmount: firstCampaign.progress.staking_pool_total || 0,
                mintPrice: 100, // Valeur par défaut de 100 USDC
                stakeYes: 0,
                stakeNo: 0
              };
              
              console.log('progressData to set:', progressData);
              setActiveInitialProgress(progressData);
              setCurrentCampaignIndex(0);
            }
            
            console.log('✅ User campaigns with moderation data loaded:', transformedCampaigns.length);
          } else {
            throw new Error(moderationResult.error || 'Failed to fetch moderation data');
          }
          
        } catch (error) {
          console.error('Error fetching user campaigns with moderation data:', error);
          setCampaigns([]);
          setModerationData([]);
        }
      };
      
      fetchUserCampaigns();
    }
  }, [account]);


  const isValidated = useMemo(() => {
    if (devForceValidated) return true;
    if (!activeInitialProgress) return false;
    const s = computeValidationState(activeInitialProgress);
    return s.allOk;
  }, [activeInitialProgress, devForceValidated]);

  // Fonctions de navigation entre les campagnes
  const goToPreviousCampaign = () => {
    if (moderationData.length > 0) {
      const newIndex = currentCampaignIndex > 0 ? currentCampaignIndex - 1 : moderationData.length - 1;
      setCurrentCampaignIndex(newIndex);
      updateActiveProgress(newIndex);
    }
  };

  const goToNextCampaign = () => {
    if (moderationData.length > 0) {
      const newIndex = currentCampaignIndex < moderationData.length - 1 ? currentCampaignIndex + 1 : 0;
      setCurrentCampaignIndex(newIndex);
      updateActiveProgress(newIndex);
    }
  };

  const updateActiveProgress = (index: number) => {
    if (moderationData[index]) {
      const campaign = moderationData[index];
      const progressData = {
        ...campaign.progress,
        campaignId: campaign.campaignId,
        campaignTitle: campaign.campaignTitle,
        validVotes: campaign.progress.valid_votes || 0,
        refuseVotes: campaign.progress.refuse_votes || 0,
        totalVotes: campaign.progress.total_votes || 0,
        stakedAmount: campaign.progress.staking_pool_total || 0,
        mintPrice: 100,
        stakeYes: 0,
        stakeNo: 0
      };
      setActiveInitialProgress(progressData);
    }
  };

  const separatorStyle = {
    height: 1,
    width: '100%',
    background: 'linear-gradient(90deg, rgba(255,214,0,0.9), rgba(255,255,255,0.5))'
  } as React.CSSProperties;

  // Loading state while wallet connects
  if (!account) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        width: '100vw', 
        background: '#000', 
        color: '#00FF00',
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
        <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
          Loading your creations...
        </h1>
        <p style={{ fontSize: '16px', color: '#ccc' }}>
          Please wait while we fetch your campaign data.
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw', 
      background: '#000', 
      color: '#00FF00',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      alignItems: 'start',
      paddingTop: 16,
      paddingLeft: 16,
      paddingRight: 16
    }}>
      {/* Left sidebar mini-menu */}
      <div style={{ 
        position: 'sticky', 
        top: '50%', 
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: 'fit-content',
        width: 260,
        flexShrink: 0,
        marginRight: 24
      }}>
        <div style={{ color: activeTab === 'active' ? '#18C964' : '#C0C0C0', fontWeight: 900, fontSize: 18, cursor: 'pointer', marginBottom: 10 }} onClick={() => setActiveTab('active')}>Active Campaign</div>
        <div style={separatorStyle} />
        <div style={{ marginTop: 10, marginBottom: 10, color: activeTab === 'previous' ? '#18C964' : '#C0C0C0', fontWeight: 900, fontSize: 18, cursor: 'pointer' }} onClick={() => setActiveTab('previous')}>Previous Campaign(s)</div>
        <div style={separatorStyle} />
        <div style={{ marginTop: 10, color: activeTab === 'universe' ? '#18C964' : '#C0C0C0', fontWeight: 900, fontSize: 18, cursor: 'pointer' }} onClick={() => setActiveTab('universe')}>Your Universe x Winstory</div>
        <div style={separatorStyle} />
      </div>

      {/* Right content area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        maxWidth: 1400,
        margin: '0 auto'
      }}>
        {activeTab === 'active' && (
          <>
            {/* Navigation Controls - Centered */}
            {moderationData.length > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                marginTop: 0,
                marginRight: 0,
                marginBottom: 24,
                marginLeft: 0,
                position: 'relative',
                width: '100%'
              }}>
                {/* Previous Button */}
                <button
                  onClick={goToPreviousCampaign}
                  style={{
                    background: 'rgba(255, 214, 0, 0.1)',
                    border: '2px solid #FFD600',
                    borderRadius: '50%',
                    width: 50,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#FFD600',
                    fontSize: 24,
                    fontWeight: 700,
                    transition: 'all 0.2s',
                    position: 'relative',
                    zIndex: 10,
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 214, 0, 0.2)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 214, 0, 0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  aria-label="Previous campaign"
                  title="Previous campaign"
                >
                  ←
                </button>
                
                {/* Campaign Counter - Compact */}
                <div style={{
                  color: '#FFD600',
                  fontSize: '14px',
                  fontWeight: 600,
                  textAlign: 'center',
                  minWidth: 80,
                  padding: '8px 12px',
                  background: 'rgba(255, 214, 0, 0.05)',
                  border: '1px solid rgba(255, 214, 0, 0.2)',
                  borderRadius: '20px'
                }}>
                  {currentCampaignIndex + 1} / {moderationData.length}
                </div>
                
                {/* Next Button */}
                <button
                  onClick={goToNextCampaign}
                  style={{
                    background: 'rgba(255, 214, 0, 0.1)',
                    border: '2px solid #FFD600',
                    borderRadius: '50%',
                    width: 50,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#FFD600',
                    fontSize: 24,
                    fontWeight: 700,
                    transition: 'all 0.2s',
                    position: 'relative',
                    zIndex: 10,
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 214, 0, 0.2)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 214, 0, 0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  aria-label="Next campaign"
                  title="Next campaign"
                >
                  →
                </button>
              </div>
            )}
            
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              {isValidated ? (
                <ValidatedCampaignDashboard 
                  forceValidated={devForceValidated}
                  onForceValidated={setDevForceValidated}
                  campaignId={activeInitialProgress?.campaignId}
                  creatorType={moderationData[currentCampaignIndex]?.creatorType}
                />
              ) : (
            <ActiveCampaignDashboard 
              externalProgressData={activeInitialProgress}
              campaignTitle={activeInitialProgress?.campaignTitle || 'Campaign Title'}
              devForceValidated={devForceValidated}
            />
              )}
            </div>
          </>
        )}

        {activeTab === 'previous' && (
          <div style={{ color: '#fff', textAlign: 'center', paddingTop: 40 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Previous Campaign(s)</h2>
            <p style={{ color: '#C0C0C0' }}>Coming soon</p>
          </div>
        )}

        {activeTab === 'universe' && (
          <div style={{ color: '#fff', textAlign: 'center', paddingTop: 40 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Your Universe x Winstory</h2>
            <p style={{ color: '#C0C0C0' }}>Coming soon</p>
          </div>
        )}

        {/* Dev Controls page-level: seulement quand NON validé pour forcer l'accès */}
        {!isValidated && (
          <DevControls 
            onForceValidated={setDevForceValidated}
            forceValidated={devForceValidated}
          />
        )}
      </div>
    </div>
  );
}
