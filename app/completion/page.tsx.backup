"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CompletionPopup from '../../components/CompletionPopup';
import CompletionVideoNavigator from '../../components/CompletionVideoNavigator';
import CompletionInfo from '../../components/CompletionInfo';
import CompletionTooltip from '../../components/CompletionTooltip';
import { mockCampaigns } from '../../lib/mockData';
import { Campaign, ModerationCampaign } from '../../lib/types';

const CompletionPage = () => {
  const [activeTab, setActiveTab] = useState<'b2c' | 'individual'>('b2c');
  const [showTooltip, setShowTooltip] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [availableCampaigns, setAvailableCampaigns] = useState<any[]>([]);
  const router = useRouter();

  // Filter campaigns based on active tab
  useEffect(() => {
    const filtered = mockCampaigns.filter(campaign => {
      // Only show approved campaigns for completion
      if (campaign.status !== 'APPROVED') return false;
      
      if (activeTab === 'b2c') {
        return campaign.creatorType === 'B2C_AGENCIES' || campaign.creatorType === 'FOR_B2C';
      } else {
        return campaign.creatorType === 'INDIVIDUAL_CREATORS' || campaign.creatorType === 'FOR_INDIVIDUALS';
      }
    });
    setAvailableCampaigns(filtered);
    setCurrentVideoIndex(0); // Reset to first video when tab changes
  }, [activeTab]);

  // Nettoyer le localStorage au chargement de la page principale de completion
  React.useEffect(() => {
    // Vérifier si on vient de la page recap (via la flèche de gauche)
    const isFromRecap = localStorage.getItem('fromRecap') === 'true';
    const shouldOpenPopup = localStorage.getItem('openCompletionPopup') === 'true';
    
    if (isFromRecap && shouldOpenPopup) {
      // Si on vient du recap, charger les données sauvegardées
      const savedText = localStorage.getItem("completionText");
      const savedVideo = window.__completionVideo;
      const savedType = localStorage.getItem("completionType") as 'b2c' | 'individual';
      
      if (savedText || savedVideo) {
        setActiveTab(savedType || 'b2c');
        setShowComplete(true);
      }
      
      // Nettoyer les flags
      localStorage.removeItem('fromRecap');
      localStorage.removeItem('openCompletionPopup');
    } else {
      // Si on arrive directement sur la page principale, nettoyer le localStorage
      localStorage.removeItem('completionText');
      localStorage.removeItem('completionType');
      if (typeof window !== 'undefined') {
        window.__completionVideo = null;
      }
    }
  }, []);

  // Mettre à jour le localStorage quand on change d'onglet
  React.useEffect(() => {
    localStorage.setItem("completionType", activeTab);
  }, [activeTab]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showTooltip || showInfo || showComplete) return; // Don't navigate when modals are open
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousVideo();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextVideo();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setShowComplete(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showTooltip, showInfo, showComplete, availableCampaigns.length]);

  // Navigation functions
  const goToPreviousVideo = () => {
    if (availableCampaigns.length > 0) {
      setCurrentVideoIndex((prev) => 
        prev === 0 ? availableCampaigns.length - 1 : prev - 1
      );
    }
  };

  const goToNextVideo = () => {
    if (availableCampaigns.length > 0) {
      setCurrentVideoIndex((prev) => 
        prev === availableCampaigns.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Get current campaign data
  const currentCampaign = availableCampaigns[currentVideoIndex];
  
  // Dynamic identity based on campaign type
  const getIdentity = () => {
    if (!currentCampaign) return activeTab === 'b2c' ? '@Company' : '@0x12...89AB';
    
    if (currentCampaign.creatorType === 'B2C_AGENCIES' || currentCampaign.creatorType === 'FOR_B2C') {
      return `@${currentCampaign.creatorInfo?.companyName || 'Company'}`;
    } else {
      const wallet = currentCampaign.creatorInfo?.walletAddress || '0x1234567890123456789012345678901234567890';
      return `@${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
    }
  };

  // Calculate time left (mock implementation)
  const getTimeLeft = () => {
    if (!currentCampaign) return "7 days left";
    // Mock calculation - in real app this would be based on campaign end date
    return `${Math.floor(Math.random() * 14) + 1} days left`;
  };

  // Get completion stats
  const getCompletionStats = () => {
    if (!currentCampaign) return { minted: 0, available: 100 };
    const minted = currentCampaign.metadata?.totalCompletions || 0;
    const available = 100; // Mock total available
    return { minted, available };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#FFD600', fontFamily: 'inherit', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 0 24px' }}>
        {/* Logo à gauche */}
        <Image src="/individual.svg" alt="logo" width={56} height={56} style={{ borderRadius: '50%' }} />
        {/* Titre + tooltip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center', position: 'relative' }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: '#FFD600', letterSpacing: 1 }}>Complete</span>
          <button onClick={() => setShowTooltip(true)} style={{ background: 'none', border: 'none', marginLeft: 8, cursor: 'pointer' }}>
            <Image src="/tooltip.svg" alt="tooltip" width={32} height={32} />
          </button>
        </div>
        {/* Croix rouge à droite */}
        <button onClick={() => router.push('/welcome')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <span style={{ fontSize: 40, color: '#FF2D2D', fontWeight: 700, lineHeight: 1 }}>&times;</span>
        </button>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 24 }}>
        <button
          onClick={() => setActiveTab('b2c')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'b2c' ? '#FFD600' : '#6A5F1C',
            fontWeight: 700,
            fontSize: 22,
            borderBottom: activeTab === 'b2c' ? '3px solid #FFD600' : 'none',
            cursor: 'pointer',
            paddingBottom: 4,
            transition: 'color 0.2s',
          }}
        >
          B2C Companies
        </button>
        <button
          onClick={() => setActiveTab('individual')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'individual' ? '#FFD600' : '#6A5F1C',
            fontWeight: 700,
            fontSize: 22,
            borderBottom: activeTab === 'individual' ? '3px solid #FFD600' : 'none',
            cursor: 'pointer',
            paddingBottom: 4,
            transition: 'color 0.2s',
          }}
        >
          Individuals
        </button>
      </div>

      {/* Identité + info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 16 }}>
        <div style={{ background: '#FFD600', color: '#222', borderRadius: 12, padding: '8px 18px', fontWeight: 700, fontSize: 16 }}>
          {getIdentity()}
        </div>
        <button onClick={() => setShowInfo(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <div style={{ background: '#FFD600', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#111', fontWeight: 700, fontSize: 24, fontFamily: 'serif' }}>i</span>
          </div>
        </button>
      </div>

      {/* Titre de campagne (dynamique) */}
      <div style={{ textAlign: 'center', marginTop: 2, fontStyle: 'italic', color: '#FFD600', fontSize: 13 }}>
        {currentCampaign?.title || 'Title'}
      </div>

            {/* Vidéo avec navigation */}
      <div style={{ marginTop: 20 }}>
        <CompletionVideoNavigator
          campaigns={availableCampaigns}
          currentIndex={currentVideoIndex}
          onPrevious={goToPreviousVideo}
          onNext={goToNextVideo}
          onCampaignInfo={() => setShowInfo(true)}
        />
      </div>

      {/* Campaign details */}
      <CompletionInfo
        campaign={currentCampaign}
        getTimeLeft={getTimeLeft}
        getCompletionStats={getCompletionStats}
      />

      {/* Bouton Complete ou message d'aide */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 10 }}>
        {availableCampaigns.length > 0 ? (
          <>
            <button
              onClick={() => setShowComplete(true)}
              style={{ 
                background: '#4ECB71', 
                color: '#111', 
                fontWeight: 700, 
                fontSize: 22, 
                border: 'none', 
                borderRadius: 14, 
                padding: '12px 36px', 
                cursor: 'pointer', 
                boxShadow: '0 2px 8px #0008',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 16px #0008';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px #0008';
              }}
              title="Start completing this campaign (Enter or Space)"
            >
              Complete
            </button>
            <div style={{
              marginTop: 8,
              fontSize: 11,
              color: '#666',
              textAlign: 'center'
            }}>
              Press Enter or Space to complete • Use ← → to navigate
            </div>
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            color: '#666',
            fontSize: 16,
            padding: '20px',
            border: '2px dashed #333',
            borderRadius: 16,
            maxWidth: 400
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ marginBottom: 8 }}>No approved campaigns available</div>
            <div style={{ fontSize: 14 }}>
              Check back later or switch to {activeTab === 'b2c' ? 'Individuals' : 'B2C Companies'} tab
            </div>
          </div>
        )}
      </div>

      {/* Tooltip modal */}
      <CompletionTooltip
        isOpen={showTooltip}
        onClose={() => setShowTooltip(false)}
      />

      {/* Campaign info modal */}
      {showInfo && currentCampaign && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000A', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowInfo(false)}>
          <div 
            style={{ 
              background: '#222', 
              color: '#FFD600', 
              padding: 32, 
              borderRadius: 18, 
              maxWidth: 500,
              width: '90vw',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: 16, color: '#FFD600' }}>{currentCampaign.title}</h2>
            <div style={{ marginBottom: 12, color: '#fff' }}>
              <strong>Starting Story:</strong>
              <p style={{ marginTop: 8, lineHeight: 1.4 }}>{currentCampaign.content?.startingStory}</p>
            </div>
            {currentCampaign.content?.guidelines && (
              <div style={{ marginBottom: 12, color: '#fff' }}>
                <strong>Guidelines:</strong>
                <p style={{ marginTop: 8, lineHeight: 1.4 }}>{currentCampaign.content.guidelines}</p>
              </div>
            )}
            {currentCampaign.rewards?.standardReward && (
              <div style={{ marginBottom: 12, color: '#fff' }}>
                <strong>Standard Reward:</strong>
                <p style={{ marginTop: 8, color: '#4ECB71' }}>{currentCampaign.rewards.standardReward}</p>
              </div>
            )}
            {currentCampaign.rewards?.premiumReward && (
              <div style={{ marginBottom: 12, color: '#fff' }}>
                <strong>Premium Reward:</strong>
                <p style={{ marginTop: 8, color: '#FFD600' }}>{currentCampaign.rewards.premiumReward}</p>
              </div>
            )}
            <button 
              onClick={() => setShowInfo(false)}
              style={{ 
                background: '#FFD600', 
                color: '#000', 
                border: 'none', 
                borderRadius: 8, 
                padding: '8px 16px', 
                cursor: 'pointer',
                marginTop: 16,
                fontWeight: 600
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showComplete && (
        <CompletionPopup
          open={showComplete}
          onClose={() => setShowComplete(false)}
          activeTab={activeTab}
          identity={getIdentity()}
          currentCampaign={currentCampaign}
          getTimeLeft={getTimeLeft}
          getCompletionStats={getCompletionStats}
        />
      )}
    </div>
  );
};

export default CompletionPage;
