"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CompletionPopup from '../../components/CompletionPopup';
import CompletionVideoNavigator from '../../components/CompletionVideoNavigator';
import CompletionInfo from '../../components/CompletionInfo';
import CompletionTooltip from '../../components/CompletionTooltip';
import DevControls from '../../components/DevControls';

// Animation CSS pour l'effet de pulsation
const pulseAnimation = `
  @keyframes pulse {
    0% {
      box-shadow: 0 6px 25px rgba(255, 107, 107, 0.3), 0 0 0 2px rgba(255, 107, 107, 0.1);
    }
    50% {
      box-shadow: 0 6px 25px rgba(255, 107, 107, 0.5), 0 0 0 4px rgba(255, 107, 107, 0.3);
    }
    100% {
      box-shadow: 0 6px 25px rgba(255, 107, 107, 0.3), 0 0 0 2px rgba(255, 107, 107, 0.1);
    }
  }
`;

// Injecter l'animation CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseAnimation;
  document.head.appendChild(style);
}

interface Campaign {
  id: string;
  creatorId: string;
  story: {
    title: string;
    startingStory: string;
    guideline: string;
  };
  film: {
    url?: string;
    videoId?: string;
    fileName?: string;
    fileSize?: number;
    format?: string;
  };
  completions: {
    wincValue: number;
    maxCompletions: number;
  };
  status: 'pending' | 'evaluating' | 'approved' | 'rejected' | 'active' | 'completed';
  evaluation?: {
    score: number;
    tier: 'S' | 'A' | 'B' | 'C' | 'F';
    collaborationProbability: number;
    securityStatus: 'CLEARED' | 'FLAGGED';
  };
  createdAt: string;
  approvedAt?: string;
  availableToCompleters: boolean;
  creatorType?: 'B2C_AGENCIES' | 'FOR_B2C' | 'INDIVIDUAL_CREATORS' | 'FOR_INDIVIDUALS';
}

const CompletionPage = () => {
  const [activeTab, setActiveTab] = useState<'b2c' | 'individual'>('b2c');
  const [showTooltip, setShowTooltip] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  
  // États pour les modals d'informations supplémentaires
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [availableCampaigns, setAvailableCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Dev Controls States
  const [devShowMockData, setDevShowMockData] = useState(false);
  const [devNumberOfCampaigns, setDevNumberOfCampaigns] = useState(8);
  const [devBaseCompletionPercent, setDevBaseCompletionPercent] = useState(45);
  const [devTimeLeftHours, setDevTimeLeftHours] = useState(72);
  const [devVideoOrientation, setDevVideoOrientation] = useState<'16:9' | '9:16' | 'mixed'>('mixed');
  const [devShowB2CCampaigns, setDevShowB2CCampaigns] = useState(true);
  const [devShowIndividualCampaigns, setDevShowIndividualCampaigns] = useState(true);
  const [devRewardRange, setDevRewardRange] = useState({ min: 10, max: 100 });
  const [devCampaignStatus, setDevCampaignStatus] = useState<'active' | 'completed' | 'ending_soon'>('active');
  const [devForceTooltip, setDevForceTooltip] = useState(false);
  const [devForceInfo, setDevForceInfo] = useState(false);
  const [devAutoNavigate, setDevAutoNavigate] = useState(false);
  const [devAutoNavigateSpeed, setDevAutoNavigateSpeed] = useState(3000);

  // Fetch approved campaigns from API
  useEffect(() => {
    fetchApprovedCampaigns();
  }, []);

  // Re-fetch campaigns when Dev Controls parameters change
  useEffect(() => {
    if (devShowMockData) {
      fetchApprovedCampaigns();
    }
  }, [devShowMockData, devNumberOfCampaigns, devBaseCompletionPercent, devTimeLeftHours, devVideoOrientation, devRewardRange, devCampaignStatus]);

  // Filter campaigns based on active tab
  useEffect(() => {
    if (availableCampaigns.length > 0) {
      const filtered = availableCampaigns.filter(campaign => {
        if (activeTab === 'b2c') {
          return campaign.creatorType === 'B2C_AGENCIES' || campaign.creatorType === 'FOR_B2C';
        } else {
          return campaign.creatorType === 'INDIVIDUAL_CREATORS' || campaign.creatorType === 'FOR_INDIVIDUALS';
        }
      });
      setCurrentVideoIndex(0); // Reset to first video when tab changes
    }
  }, [activeTab, availableCampaigns]);

  // Get filtered campaigns (moved before useEffect that uses it)
  const getFilteredCampaigns = () => {
    return availableCampaigns.filter(campaign => {
      // Apply Dev Controls filters
      if (devShowMockData) {
        if (activeTab === 'b2c' && !devShowB2CCampaigns) return false;
        if (activeTab === 'individual' && !devShowIndividualCampaigns) return false;
      }
      
      // Apply normal tab filtering
      if (activeTab === 'b2c') {
        return campaign.creatorType === 'B2C_AGENCIES' || campaign.creatorType === 'FOR_B2C';
      } else {
        return campaign.creatorType === 'INDIVIDUAL_CREATORS' || campaign.creatorType === 'FOR_INDIVIDUALS';
      }
    });
  };

  // Get current campaign data
  const filteredCampaigns = getFilteredCampaigns();
  const currentCampaign = filteredCampaigns[currentVideoIndex];
  
  // Determine if current video is vertical
  const isCurrentVideoVertical = currentCampaign?.film?.format === '9:16' || 
                                 currentCampaign?.film?.url?.includes('720x1280') ||
                                 currentCampaign?.film?.fileName?.includes('vertical') ||
                                 currentCampaign?.film?.fileName?.includes('9:16');

  const fetchApprovedCampaigns = async () => {
    try {
      setLoading(true);
      
      // Use mock data if Dev Controls are enabled
      if (devShowMockData) {
        const mockCampaigns = generateMockCampaigns();
        setAvailableCampaigns(mockCampaigns);
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/campaigns?availableToCompleters=true&status=approved');
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      
      const data = await response.json();
      const campaigns = data.campaigns || [];
      
      // Add creatorType based on campaign data structure
      const campaignsWithType = campaigns.map((campaign: Campaign) => ({
        ...campaign,
        creatorType: determineCreatorType(campaign)
      }));
      
      setAvailableCampaigns(campaignsWithType);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to load available campaigns');
    } finally {
      setLoading(false);
    }
  };

  const determineCreatorType = (campaign: Campaign): string => {
    // Determine creator type based on campaign data
    // This is a simplified logic - you might want to enhance this
    if (campaign.creatorId.includes('b2c') || campaign.creatorId.includes('agency')) {
      return 'B2C_AGENCIES';
    } else {
      return 'INDIVIDUAL_CREATORS';
    }
  };

  // Generate mock campaigns for Dev Controls
  const generateMockCampaigns = (): Campaign[] => {
    const campaigns: Campaign[] = [];
    const companyNames = ['Nike', 'Apple', 'Tesla', 'Spotify', 'Netflix', 'Airbnb', 'Uber', 'Stripe'];
    const individualNames = ['Alex Chen', 'Maria Rodriguez', 'James Wilson', 'Sarah Kim', 'David Brown', 'Emma Davis', 'Michael Johnson', 'Lisa Anderson'];
    const storyTitles = [
      'Revolutionary Product Launch',
      'Behind the Scenes Story',
      'Customer Success Journey',
      'Innovation Spotlight',
      'Community Impact Story',
      'Creative Process Revealed',
      'Future Vision Preview',
      'Team Collaboration Story'
    ];
    const startingStories = [
      'In a world where innovation meets creativity, our story begins with a simple idea that changed everything...',
      'Every great product starts with a problem. Here\'s how we solved one of the biggest challenges in our industry...',
      'From concept to reality, this is the journey of bringing our vision to life...',
      'What happens when passion meets technology? This is our story...',
      'Behind every successful launch, there\'s a team of dedicated individuals working tirelessly...',
      'Innovation isn\'t just about technology—it\'s about understanding what people truly need...',
      'This is the story of how we transformed an industry and created something entirely new...',
      'From the drawing board to the market, here\'s how we made it happen...'
    ];

    for (let i = 0; i < devNumberOfCampaigns; i++) {
      const isB2C = i % 2 === 0;
      const creatorType = isB2C ? 'B2C_AGENCIES' : 'INDIVIDUAL_CREATORS';
      const creatorId = isB2C 
        ? companyNames[i % companyNames.length].toLowerCase()
        : `0x${Math.random().toString(16).substr(2, 40)}`;
      
      const completionVariation = (Math.random() - 0.5) * 40; // ±20%
      const completionPercent = Math.max(0, Math.min(100, devBaseCompletionPercent + completionVariation));
      
      const timeLeftVariation = Math.random() * 24; // ±12h
      const timeLeft = Math.max(0, devTimeLeftHours + timeLeftVariation);
      
      const orientations = ['16:9', '9:16'];
      const videoFormat = devVideoOrientation === 'mixed' 
        ? orientations[Math.floor(Math.random() * orientations.length)]
        : devVideoOrientation;
      
      const rewardAmount = Math.floor(Math.random() * (devRewardRange.max - devRewardRange.min + 1)) + devRewardRange.min;
      
      campaigns.push({
        id: `mock-campaign-${i}`,
        creatorId,
        story: {
          title: storyTitles[i % storyTitles.length],
          startingStory: startingStories[i % startingStories.length],
          guideline: 'Create engaging content that showcases our brand values and connects with our audience. Focus on authenticity and creativity.'
        },
        film: {
          url: `https://sample-videos.com/zip/10/mp4/SampleVideo_${videoFormat === '16:9' ? '1280x720' : '720x1280'}_1mb.mp4`,
          videoId: `video-${i}`,
          fileName: `campaign-${i}.mp4`,
          fileSize: Math.floor(Math.random() * 50000000) + 10000000, // 10-60MB
          format: videoFormat
        },
        completions: {
          wincValue: rewardAmount,
          maxCompletions: 1000
        },
        status: devCampaignStatus === 'active' ? 'active' : devCampaignStatus === 'completed' ? 'completed' : 'active',
        evaluation: {
          score: Math.floor(Math.random() * 40) + 60, // 60-100
          tier: ['S', 'A', 'B', 'C'][Math.floor(Math.random() * 4)] as 'S' | 'A' | 'B' | 'C' | 'F',
          collaborationProbability: Math.floor(Math.random() * 30) + 70, // 70-100%
          securityStatus: 'CLEARED' as 'CLEARED' | 'FLAGGED'
        },
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
        approvedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
        availableToCompleters: true,
        creatorType: creatorType as 'B2C_AGENCIES' | 'FOR_B2C' | 'INDIVIDUAL_CREATORS' | 'FOR_INDIVIDUALS'
      });
    }
    
    return campaigns;
  };

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

  // Dev Controls effects
  useEffect(() => {
    if (devForceTooltip) {
      setShowTooltip(true);
    }
  }, [devForceTooltip]);

  useEffect(() => {
    if (devForceInfo) {
      setShowInfo(true);
    }
  }, [devForceInfo]);

  // Auto navigation effect
  useEffect(() => {
    if (devAutoNavigate && filteredCampaigns.length > 1) {
      const interval = setInterval(() => {
        goToNextVideo();
      }, devAutoNavigateSpeed);
      
      return () => clearInterval(interval);
    }
  }, [devAutoNavigate, devAutoNavigateSpeed, filteredCampaigns.length]);

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
    if (filteredCampaigns.length > 0) {
      setCurrentVideoIndex((prev) => 
        prev === 0 ? filteredCampaigns.length - 1 : prev - 1
      );
    }
  };

  const goToNextVideo = () => {
    if (filteredCampaigns.length > 0) {
      setCurrentVideoIndex((prev) => 
        prev === filteredCampaigns.length - 1 ? 0 : prev + 1
      );
    }
  };
  
  // Dynamic identity based on campaign type
  const getIdentity = () => {
    if (!currentCampaign) return activeTab === 'b2c' ? '@Company' : '@0x12...89AB';
    
    if (currentCampaign.creatorType === 'B2C_AGENCIES' || currentCampaign.creatorType === 'FOR_B2C') {
      return `@${currentCampaign.creatorId || 'Company'}`;
    } else {
      const wallet = currentCampaign.creatorId || '0x1234567890123456789012345678901234567890';
      return `@${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
    }
  };

  // Get company name for display (agency + client for B2C_AGENCIES, just company for FOR_B2C)
  const getCompanyName = () => {
    if (!currentCampaign) return '';
    
    if (currentCampaign.creatorType === 'B2C_AGENCIES') {
      // For agencies, show both agency and client names
      const agencyName = localStorage.getItem('agencyName') || '';
      const clientName = localStorage.getItem('clientB2CName') || '';
      
      if (agencyName && clientName) {
        return `${agencyName} + ${clientName}`;
      } else if (agencyName) {
        return agencyName;
      } else if (clientName) {
        return clientName;
      } else {
        return currentCampaign.creatorId || 'Agency + Client';
      }
    } else if (currentCampaign.creatorType === 'FOR_B2C') {
      // For direct B2C companies, show company name
      const companyName = localStorage.getItem('companyName') || currentCampaign.creatorId || 'Company';
      return companyName;
    }
    
    return '';
  };

  // Calculate time left (mock implementation)
  const getTimeLeft = () => {
    if (!currentCampaign) return "7 days left";
    
    if (devShowMockData) {
      const hours = devTimeLeftHours + (Math.random() - 0.5) * 24;
      if (hours <= 0) return "Ended";
      if (hours < 24) return `${Math.floor(hours)}h left`;
      return `${Math.floor(hours / 24)} days left`;
    }
    
    // Mock calculation - in real app this would be based on campaign end date
    return `${Math.floor(Math.random() * 14) + 1} days left`;
  };

  // Progress helpers for right panel visual bars
  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  const getCompletionProgressPercent = () => {
    const { minted, available } = getCompletionStats();
    if (!available) return 0;
    return clamp(Math.round((minted / available) * 100), 0, 100);
  };

  const getRewardProgressPercent = () => {
    const reward = Number(currentCampaign?.completions?.wincValue || 0);
    // Normalize to a reasonable cap (200 $WINC like DevControls)
    const percent = (reward / 200) * 100;
    return clamp(Math.round(percent), 0, 100);
  };

  const getTimeProgressPercent = () => {
    // Try to infer proportionally using units (days/hours). Fallback to 7 days.
    const label = getTimeLeft().toLowerCase();
    const numMatch = label.match(/(\d+(?:\.\d+)?)/);
    const value = numMatch ? Number(numMatch[1]) : 0;
    let remainingHours = 0;
    if (label.includes('hour')) remainingHours = value;
    else if (label.includes('day')) remainingHours = value * 24;
    else remainingHours = value * 24; // fallback

    // Assume campaigns run on a 7-day window if unknown; for mock dev controls we also accept bounds [0,168]
    const totalHours = 168;
    const elapsed = clamp(totalHours - remainingHours, 0, totalHours);
    return clamp(Math.round((elapsed / totalHours) * 100), 0, 100);
  };

  const ProgressRow = ({ label, value, percent }: { label: string; value: string; percent: number }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: '#9AA5A8' }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#4ECB71' }}>{value}</span>
      </div>
      <div style={{ width: '100%', height: 10, borderRadius: 8, background: 'rgba(78, 203, 113, 0.12)', border: '1px solid rgba(78, 203, 113, 0.25)', overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #4ECB71 0%, #2EA85C 100%)' }} />
      </div>
    </div>
  );

  // Helpers: mint/price formatting
  const numberToWords = (n: number): string => {
    const ones = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
    const tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? `-${ones[n%10]}` : '');
    if (n < 1000) return `${ones[Math.floor(n/100)]} hundred${n%100 ? ` ${numberToWords(n%100)}` : ''}`;
    return String(n);
  };

  const getMintPrice = () => {
    const price = Number(currentCampaign?.completions?.wincValue || 0);
    return isNaN(price) ? 0 : price;
  };

  const isB2CCreator = () => {
    if (!currentCampaign) return activeTab === 'b2c';
    return (
      currentCampaign.creatorType === 'B2C_AGENCIES' ||
      currentCampaign.creatorType === 'FOR_B2C' ||
      activeTab === 'b2c'
    );
  };

  const getPriceUnit = () => (isB2CCreator() ? '$' : '$WINC');

  const formatPriceShort = () => {
    const price = getMintPrice();
    const unit = getPriceUnit();
    if (unit === '$') return `$${price.toFixed(2)}`;
    return `${price} ${unit}`;
  };

  const formatMintPriceTextual = () => {
    const price = getMintPrice();
    if (price <= 0) return 'FREE';
    const unit = getPriceUnit();
    if (unit === '$') return `$${price.toFixed(2)}`;
    return `${price} ${unit}`;
  };

  const formatButtonCta = () => {
    const price = getMintPrice();
    if (price <= 0) return 'Complete for FREE';
    return `Complete for ${formatPriceShort()}`;
  };

  // Mock rewards for B2C companies/agencies (brand-friendly placeholders)
  const getB2CRewardsMock = (): string[] => {
    const brand = (currentCampaign?.creatorId || '').toLowerCase();
    if (brand.includes('nike')) return ['Exclusive drop early access', '25% off voucher', 'Limited-edition merch'];
    if (brand.includes('uber')) return ['Ride credits ($20)', 'Priority support badge', 'Beta access to new features'];
    if (brand.includes('starbucks')) return ['Free drink for a week', 'Gold tier fast-track', 'Seasonal merch'];
    if (brand.includes('adidas')) return ['Members-only raffle entry', '30% off coupon', 'Special collab merch'];
    // generic default
    return ['Gift card ($25)', 'Exclusive early access', 'Brand merch pack'];
  };

  const getRewardsDescription = () => {
    if (!currentCampaign) return '';
    if (isB2CCreator()) {
      const items = getB2CRewardsMock();
      return items.join(' • ');
    }
    const winc = currentCampaign?.completions?.wincValue || 0;
    return `Complete this campaign to earn ${winc} $WINC tokens (Top 3 winners)`;
  };

  // Rewards modal helpers
  const getB2CRewardsTiered = () => {
    const standard = getB2CRewardsMock();
    // simple premium layer for mock-up
    const premium = ['Premium merch bundle', 'VIP experience (limited)', 'Annual subscription/credit'];
    return { standard, premium };
  };

  const getIndividualTop3 = () => {
    const pool = Number(currentCampaign?.completions?.wincValue || 0);
    const first = Math.round(pool * 0.5);
    const second = Math.round(pool * 0.3);
    const third = Math.round(pool * 0.2);
    return { first, second, third };
  };

  // Get completion stats
  const getCompletionStats = () => {
    if (!currentCampaign) return { minted: 0, available: 100 };
    
    if (devShowMockData) {
      const completionPercent = devBaseCompletionPercent + (Math.random() - 0.5) * 40;
      const minted = Math.floor((completionPercent / 100) * 1000);
      const available = 1000;
      return { minted, available };
    }
    
    const minted = 0; // This would come from campaign data
    const available = currentCampaign.completions?.maxCompletions || 100;
    return { minted, available };
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#FFD600', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #FFD600',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px auto'
          }}></div>
          <div style={{ color: '#FFD600', fontSize: '18px', fontWeight: '600' }}>
            Loading available campaigns...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#FFD600', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#FF2D2D', fontSize: '48px', marginBottom: '20px' }}>
            ✗
          </div>
          <div style={{ color: '#FF2D2D', fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
            Error Loading Campaigns
          </div>
          <div style={{ color: '#fff', fontSize: '16px', marginBottom: '30px' }}>
            {error}
          </div>
          <button
            onClick={fetchApprovedCampaigns}
            style={{
              background: '#FFD600',
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
            color: activeTab === 'b2c' ? '#4ECB71' : '#1E5E3D',
            fontWeight: 700,
            fontSize: 22,
            borderBottom: activeTab === 'b2c' ? '3px solid #4ECB71' : 'none',
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
            color: activeTab === 'individual' ? '#4ECB71' : '#1E5E3D',
            fontWeight: 700,
            fontSize: 22,
            borderBottom: activeTab === 'individual' ? '3px solid #4ECB71' : 'none',
            cursor: 'pointer',
            paddingBottom: 4,
            transition: 'color 0.2s',
          }}
        >
          Individuals
        </button>
      </div>

      {/* Identité + flèches */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 12 }}>
        {filteredCampaigns.length > 1 && (
          <button
            onClick={goToPreviousVideo}
            aria-label="Previous"
            title="Previous (Arrow Left)"
            style={{
              background: 'none',
              border: '2px solid #4ECB71',
              color: '#4ECB71',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            ←
          </button>
        )}
        <div style={{ background: '#4ECB71', color: '#000', borderRadius: 12, padding: '8px 18px', fontWeight: 700, fontSize: 16 }}>
          {getIdentity()}
        </div>
        {filteredCampaigns.length > 1 && (
          <button
            onClick={goToNextVideo}
            aria-label="Next"
            title="Next (Arrow Right)"
            style={{
              background: 'none',
              border: '2px solid #4ECB71',
              color: '#4ECB71',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            →
          </button>
        )}
      </div>

      {/* Points carrousel ou compteur */}
      {filteredCampaigns.length > 1 && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 2 }}>
          {filteredCampaigns.length <= 10 ? (
            // Points carrousel pour 10 contenus ou moins
            filteredCampaigns.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentVideoIndex(index)}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  border: 'none',
                  background: index === currentVideoIndex ? '#4ECB71' : 'rgba(78, 203, 113, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              />
            ))
          ) : (
            // Compteur numérique pour plus de 10 contenus
            <div style={{
              background: 'rgba(78, 203, 113, 0.15)',
              border: '1px solid rgba(78, 203, 113, 0.3)',
              borderRadius: 12,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              color: '#4ECB71'
            }}>
              {currentVideoIndex + 1}/{filteredCampaigns.length}
            </div>
          )}
        </div>
      )}

      {/* Affichage conditionnel : avec ou sans campagnes */}
      {filteredCampaigns.length > 0 ? (
        /* Layout Netflix-style: Vidéo à gauche, Infos à droite */
        <div style={{ 
          display: 'flex', 
          height: window.innerWidth < 1024 ? 'auto' : 'calc(100vh - 160px)', // Réduit encore l'espacement
          marginTop: 5, // Espacement minimal du header
          gap: 40,
          alignItems: 'flex-start', // Changé de 'center' à 'flex-start' pour permettre au contenu de droite de remonter
          flexDirection: window.innerWidth < 1024 ? 'column' : 'row'
        }}>
        {/* Section Vidéo - Centrée avec les éléments de droite */}
        <div style={{ 
          flex: window.innerWidth < 1024 ? '1 1 100%' : '0 0 55%', // Réduit de 60% à 55%
          position: 'relative',
          display: 'flex',
          alignItems: 'center', // Centre verticalement avec les éléments de droite
          justifyContent: 'center',
          paddingTop: isCurrentVideoVertical ? '20px' : '80px' // Plus de padding pour les vidéos horizontales
        }}>
          <div style={{
            position: 'relative',
            aspectRatio: isCurrentVideoVertical ? '9/16' : '16/9', // Format exact de la vidéo
            width: isCurrentVideoVertical ? 'auto' : '100%', // Vidéo horizontale prend toute la largeur
            height: isCurrentVideoVertical ? 'calc(100vh - 320px)' : 'auto', // Vidéo verticale encore plus petite
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 320px)', // Limite la hauteur maximale réduite
            background: '#000',
            borderRadius: 12,
            overflow: 'hidden',
            border: '2px solid #4ECB71', // Liseré vert adaptatif au contour de la vidéo
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Indicateur d'orientation */}
            {isCurrentVideoVertical && (
              <div style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#FFD600',
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                zIndex: 3,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 214, 0, 0.3)'
              }}>
                📱 Vertical Format
      </div>
            )}

            {/* Vidéo */}
            {currentCampaign?.film?.url ? (
              <video
                src={currentCampaign.film.url}
                controls
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 10,
                  objectFit: 'cover'
                }}
                onError={() => console.log('Video failed to load')}
              />
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#FFD600',
                fontSize: 48,
                opacity: 0.3
              }}>
                ▶️
              </div>
            )}

            {/* Contrôles de navigation overlay (désactivés - flèches déplacées sous les onglets) */}
            {false && filteredCampaigns.length > 1}
          </div>
        </div>

        {/* Section Informations - Plus compacte */}
        <div style={{ 
          flex: window.innerWidth < 1024 ? '1 1 100%' : '0 0 40%', // Augmenté de 35% à 40%
          padding: '20px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 20, // Réduit de 24 à 20
          justifyContent: 'flex-start' // Changé de 'center' à 'flex-start' pour permettre au bouton de remonter
        }}>
          {/* Titre de la campagne avec info et carrousel */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 style={{
                  fontSize: 28, // Réduit de 32 à 28
                  fontWeight: 800,
                  color: '#4ECB71',
                  margin: 0,
                  lineHeight: 1.2
                }}>
                  {currentCampaign?.story?.title || 'Campaign Title'}
                </h1>
                <button onClick={() => setShowInfo(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <div style={{ background: '#4ECB71', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#000', fontWeight: 700, fontSize: 18, fontFamily: 'serif' }}>i</span>
                  </div>
                </button>
              </div>
              {/* Company name à droite */}
              {getCompanyName() && (
                <div style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: '#fff',
                  opacity: 0.9,
                  textAlign: 'right',
                  maxWidth: '250px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {getCompanyName()}
                </div>
              )}
            </div>
          </div>

          {/* Stats principales */}
            <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16, // Réduit de 18 à 16
            background: 'rgba(78, 203, 113, 0.06)',
            padding: 20, // Réduit de 24 à 20
            borderRadius: 16,
            border: '1px solid rgba(78, 203, 113, 0.25)'
          }}>
            {/* Visual progress rows (clickable) */}
            <div onClick={() => setShowTimeModal(true)} style={{ cursor: 'pointer' }}>
              <ProgressRow label="Time remaining" value={getTimeLeft()} percent={getTimeProgressPercent()} />
            </div>
            <div onClick={() => setShowCompletionModal(true)} style={{ cursor: 'pointer' }}>
              <ProgressRow label="Completions" value={`${getCompletionStats().minted} / ${getCompletionStats().available}`} percent={getCompletionProgressPercent()} />
            </div>
            {/* Completion Price (numeric, at card bottom, yellow, clickable) */}
            <div onClick={() => setShowRewardModal(true)} style={{ cursor: 'pointer', marginTop: 6, paddingTop: 10, borderTop: '1px dashed rgba(78, 203, 113, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#9AA5A8' }}>Completion Price</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#FFD600' }}>{formatPriceShort()}</span>
              </div>
              {/* micro-note removed by request */}
            </div>
          </div>

            {/* Rectangles d'informations élargis - avec espacement */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'stretch', alignItems: 'stretch' }}>
            {/* Starting Story - Rectangle vert élargi */}
            <div 
              style={{
                flex: 1,
                height: 100, // Réduit de 110 à 100
                borderRadius: 12,
                background: 'rgba(78, 203, 113, 0.15)',
                border: '2px solid rgba(78, 203, 113, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(78, 203, 113, 0.1)',
                padding: '12px' // Réduit de 14px à 12px
              }}
              onClick={() => setShowStoryModal(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.background = 'rgba(78, 203, 113, 0.25)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(78, 203, 113, 0.2)';
                e.currentTarget.style.border = '2px solid rgba(78, 203, 113, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(78, 203, 113, 0.15)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(78, 203, 113, 0.1)';
                e.currentTarget.style.border = '2px solid rgba(78, 203, 113, 0.3)';
              }}
            >
              <div style={{ 
                marginBottom: 12,
                fontSize: 18,
                color: '#4ECB71',
                fontWeight: 700
              }}>
                Starting Story
              </div>
              <p style={{
                fontSize: 13,
                color: '#4ECB71',
                lineHeight: 1.4,
                margin: 0,
                opacity: 0.9,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {currentCampaign?.story?.startingStory || 'No starting story available'}
              </p>
            </div>

            {/* Guidelines - Rectangle vert élargi */}
            <div 
              style={{
                flex: 1,
                height: 100, // Réduit de 110 à 100
                borderRadius: 12,
                background: 'rgba(78, 203, 113, 0.15)',
                border: '2px solid rgba(78, 203, 113, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(78, 203, 113, 0.1)',
                padding: '12px' // Réduit de 14px à 12px
              }}
              onClick={() => setShowGuidelinesModal(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.background = 'rgba(78, 203, 113, 0.25)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(78, 203, 113, 0.2)';
                e.currentTarget.style.border = '2px solid rgba(78, 203, 113, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(78, 203, 113, 0.15)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(78, 203, 113, 0.1)';
                e.currentTarget.style.border = '2px solid rgba(78, 203, 113, 0.3)';
              }}
            >
              <div style={{ 
                marginBottom: 12,
                fontSize: 18,
                color: '#4ECB71',
                fontWeight: 700
              }}>
                Guideline
              </div>
              <p style={{
                fontSize: 13,
                color: '#4ECB71',
                lineHeight: 1.4,
                margin: 0,
                opacity: 0.9,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {currentCampaign?.story?.guideline || 'Follow the campaign guidelines to complete successfully'}
              </p>
            </div>
          </div>

          {/* Rewards - Encart jaune moderne agrandi et cliquable */}
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.15), rgba(255, 214, 0, 0.08))',
              border: '2px solid rgba(255, 214, 0, 0.4)',
              borderRadius: 16,
              padding: 20, // Réduit de 24 à 20
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 20px rgba(255, 214, 0, 0.15)',
              backdropFilter: 'blur(10px)',
              minHeight: 130 // Réduit de 140 à 130
            }}
            onClick={() => setShowRewardsModal(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 214, 0, 0.25), rgba(255, 214, 0, 0.15))';
              e.currentTarget.style.border = '2px solid rgba(255, 214, 0, 0.6)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 214, 0, 0.25), 0 0 0 1px rgba(255, 214, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 214, 0, 0.15), rgba(255, 214, 0, 0.08))';
              e.currentTarget.style.border = '2px solid rgba(255, 214, 0, 0.4)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 214, 0, 0.15)';
            }}
          >
            <div style={{
              position: 'absolute',
              top: -8,
              left: 20,
              background: 'linear-gradient(135deg, #FFD600, #FFC200)',
              color: '#000',
              padding: '10px 18px',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(255, 214, 0, 0.3)'
            }}>
              🎁 Rewards
            </div>
            <div style={{
              marginTop: 22,
              fontSize: 16,
              lineHeight: 1.6,
              color: '#FFD600'
            }}>
              {isB2CCreator() ? (
                (() => {
                  const { standard, premium } = getB2CRewardsTiered();
                  return (
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 8, color: '#4ECB71', fontSize: 15 }}>
                        ✅ Standard for all Validated Completers
                      </div>
                      <div style={{ marginLeft: 12, marginBottom: 14, fontSize: 14, color: '#ccc' }}>
                        {standard.join(' • ')}
                      </div>
                      <div style={{ fontWeight: 700, marginBottom: 8, color: '#FFD600', fontSize: 15 }}>
                        🥇🥈🥉 Premium for Top 3
                      </div>
                      <div style={{ marginLeft: 12, fontSize: 14, color: '#ccc' }}>
                        {premium.join(' • ')}
                      </div>
                    </div>
                  );
                })()
              ) : (
                (() => {
                  const { first, second, third } = getIndividualTop3();
                  return (
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 8, color: '#FFD600', fontSize: 15 }}>
                        🥇🥈🥉 Top 3 Winners
                      </div>
                      <div style={{ marginLeft: 12, fontSize: 14, color: '#ccc' }}>
                        1st: {first} $WINC • 2nd: {second} $WINC • 3rd: {third} $WINC
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>

          {/* Bouton Complete - En bas (jaune) avec espacement réduit */}
            <button
              onClick={() => setShowComplete(true)}
              style={{ 
                background: 'linear-gradient(135deg, #FFD600, #FFC200)',
                color: '#111', 
                fontWeight: 800,
                fontSize: 24,
                border: 'none', 
                borderRadius: 16,
                padding: '20px 40px',
                cursor: 'pointer', 
                boxShadow: '0 8px 32px rgba(255, 214, 0, 0.35), 0 0 0 2px rgba(255, 214, 0, 0.25)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                marginTop: 0 // Supprimé l'espacement pour frôler l'encart Rewards
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 214, 0, 0.45), 0 0 0 3px rgba(255, 214, 0, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 214, 0, 0.35), 0 0 0 2px rgba(255, 214, 0, 0.25)';
              }}
            >
              <span style={{ position: 'relative', zIndex: 1 }}>
                {formatButtonCta()}
              </span>
            </button>
        </div>
      </div>
      ) : (
        /* Message simple quand pas de campagnes */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 200px)',
          textAlign: 'center',
          gap: 24
        }}>
          <div style={{
            fontSize: 24,
            fontWeight: 600,
            color: '#4ECB71',
            marginBottom: 8
          }}>
            No campaigns available
          </div>
          <div style={{
            fontSize: 16,
            color: '#ccc',
            marginBottom: 32
          }}>
            Check back later or switch to {activeTab === 'b2c' ? 'Individuals' : 'B2C Companies'} tab
          </div>
          <button
            onClick={() => router.push('/creation')}
            style={{
              background: 'linear-gradient(135deg, #FFD600, #FFC200)',
              color: '#000',
              fontWeight: 700,
              fontSize: 14,
              border: 'none',
              borderRadius: 8,
              padding: '10px 20px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 214, 0, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 214, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 214, 0, 0.3)';
            }}
          >
            Create Your Story
          </button>
        </div>
      )}

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
            <h2 style={{ marginBottom: 16, color: '#FFD600' }}>{currentCampaign.story?.title}</h2>
            <div style={{ marginBottom: 12, color: '#fff' }}>
              <strong>Starting Story:</strong>
              <p style={{ marginTop: 8, lineHeight: 1.4 }}>{currentCampaign.story?.startingStory}</p>
            </div>
            {currentCampaign.story?.guideline && (
              <div style={{ marginBottom: 12, color: '#fff' }}>
                <strong>Guidelines:</strong>
                <p style={{ marginTop: 8, lineHeight: 1.4 }}>{currentCampaign.story.guideline}</p>
              </div>
            )}
            <div style={{ marginBottom: 12, color: '#fff' }}>
              <strong>Reward:</strong>
              <p style={{ marginTop: 8, color: '#4ECB71' }}>{currentCampaign.completions?.wincValue} $WINC</p>
            </div>
            {currentCampaign.evaluation && (
              <div style={{ marginBottom: 12, color: '#fff' }}>
                <strong>AI Evaluation:</strong>
                <p style={{ marginTop: 8, color: '#FFD600' }}>
                  Score: {currentCampaign.evaluation.score}/100 ({currentCampaign.evaluation.tier}-Tier)
                </p>
                <p style={{ marginTop: 4, color: '#4ECB71' }}>
                  Collaboration Probability: {currentCampaign.evaluation.collaborationProbability}%
                </p>
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

      {/* Modals d'informations supplémentaires */}
      {showTimeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowTimeModal(false)}>
          <div style={{
            background: '#111',
            border: '2px solid #FFD600',
            borderRadius: 16,
            padding: 24,
            maxWidth: 400,
            color: '#FFD600',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowTimeModal(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: 24,
                color: '#FF6B6B',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              ×
            </button>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 20 }}>⏰ Time Remaining</h3>
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              This campaign has {getTimeLeft()} remaining. Complete it before the deadline to earn your rewards.
            </p>
          </div>
        </div>
      )}

      {showRewardModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowRewardModal(false)}>
          <div style={{
            background: '#111',
            border: '2px solid #4ECB71',
            borderRadius: 16,
            padding: 24,
            maxWidth: 400,
            color: '#4ECB71',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowRewardModal(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: 24,
                color: '#FF6B6B',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              ×
            </button>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 20 }}>Details</h3>
            <p style={{ margin: 0, lineHeight: 1.5, color: '#9AA5A8' }}>Completion Price</p>
            <p style={{ marginTop: 6 }}>Price: <span style={{ color: '#FFD600', fontWeight: 800 }}>{formatPriceShort()}</span></p>
            <div style={{ height: 1, background: 'rgba(255, 214, 0, 0.15)', margin: '12px 0' }} />
            {isB2CCreator() ? (
              <div>
                <p style={{ margin: 0, lineHeight: 1.5, color: '#9AA5A8' }}>Rewards (mock)</p>
                {(() => {
                  const { standard, premium } = getB2CRewardsTiered();
                  return (
                    <div>
                      <div style={{ marginTop: 6, fontWeight: 700, color: '#4ECB71' }}>Standard</div>
                      <ul style={{ margin: '6px 0 10px 18px', color: '#ccc' }}>
                        {standard.map((r, i) => (<li key={`std-${i}`}>{r}</li>))}
                      </ul>
                      <div style={{ fontWeight: 700, color: '#4ECB71' }}>Premium</div>
                      <ul style={{ margin: '6px 0 0 18px', color: '#ccc' }}>
                        {premium.map((r, i) => (<li key={`prm-${i}`}>{r}</li>))}
                      </ul>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div>
                <p style={{ margin: 0, lineHeight: 1.5, color: '#9AA5A8' }}>Top 3 rewards (mock)</p>
                {(() => {
                  const { first, second, third } = getIndividualTop3();
                  return (
                    <ul style={{ margin: '6px 0 0 18px', color: '#ccc' }}>
                      <li>1st: {first} $WINC</li>
                      <li>2nd: {second} $WINC</li>
                      <li>3rd: {third} $WINC</li>
                    </ul>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {showRewardsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowRewardsModal(false)}>
          <div style={{
            background: '#111',
            border: '2px solid #4ECB71',
            borderRadius: 16,
            padding: 24,
            maxWidth: 520,
            width: '90vw',
            color: '#4ECB71',
            position: 'relative',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowRewardsModal(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: 24,
                color: '#FF6B6B',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              ×
            </button>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 20 }}>Rewards</h3>
            {isB2CCreator() ? (
              (() => {
                const { standard, premium } = getB2CRewardsTiered();
                return (
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 6, color: '#4ECB71' }}>
                      ✅ Standard for all Validated Completers
                    </div>
                    <ul style={{ margin: '0 0 12px 18px', color: '#ccc' }}>
                      {standard.map((r, i) => (<li key={`r-std-${i}`}>{r}</li>))}
                    </ul>
                    <div style={{ fontWeight: 700, marginBottom: 6, color: '#FFD600' }}>
                      🥇🥈🥉 Premium for Top 3
                    </div>
                    <ul style={{ margin: '0 0 6px 18px', color: '#ccc' }}>
                      {premium.map((r, i) => (<li key={`r-prm-${i}`}>{r}</li>))}
                    </ul>
                  </div>
                );
              })()
            ) : (
              (() => {
                const { first, second, third } = getIndividualTop3();
                return (
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Top 3 winners</div>
                    <ul style={{ margin: '0 0 6px 18px', color: '#ccc' }}>
                      <li>1st: {first} $WINC</li>
                      <li>2nd: {second} $WINC</li>
                      <li>3rd: {third} $WINC</li>
                    </ul>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}

      {/* Dev Controls */}
      <DevControls
        additionalControls={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Main Toggle */}
            <div style={{ borderBottom: '1px solid #333', paddingBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={devShowMockData}
                  onChange={(e) => setDevShowMockData(e.target.checked)}
                  style={{ accentColor: '#FFD600' }}
                />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#FFD600' }}>
                  📊 Show Mock Campaigns
                </span>
              </label>
              <div style={{ fontSize: 11, color: '#888', marginTop: 4, marginLeft: 28 }}>
                Toggle to display test data in the Completion page
              </div>
            </div>

            {devShowMockData && (
              <>
                {/* Campaign Generation Controls */}
                <div style={{ borderTop: '1px solid #333', paddingTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#FFD600', marginBottom: 8 }}>
                    🎬 Campaign Generation
                  </div>
                  
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 11, color: '#ccc', display: 'block', marginBottom: 4 }}>
                      Number of Campaigns: {devNumberOfCampaigns}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={devNumberOfCampaigns}
                      onChange={(e) => setDevNumberOfCampaigns(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: '#FFD600' }}
                    />
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 11, color: '#ccc', display: 'block', marginBottom: 4 }}>
                      Base Completion %: {devBaseCompletionPercent}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={devBaseCompletionPercent}
                      onChange={(e) => setDevBaseCompletionPercent(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: '#FFD600' }}
                    />
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 11, color: '#ccc', display: 'block', marginBottom: 4 }}>
                      Time Left: {devTimeLeftHours}h
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="168"
                      step="12"
                      value={devTimeLeftHours}
                      onChange={(e) => setDevTimeLeftHours(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: '#FFD600' }}
                    />
                  </div>
                </div>

                {/* Video Controls */}
                <div style={{ borderTop: '1px solid #333', paddingTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#FFD600', marginBottom: 8 }}>
                    📱 Video Controls
                  </div>
                  
                  <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                    {(['16:9', '9:16', 'mixed'] as const).map((orientation) => (
                      <button
                        key={orientation}
                        onClick={() => setDevVideoOrientation(orientation)}
                        style={{
                          background: devVideoOrientation === orientation ? '#FFD600' : '#333',
                          color: devVideoOrientation === orientation ? '#000' : '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '4px 8px',
                          fontSize: 10,
                          cursor: 'pointer',
                          flex: 1
                        }}
                      >
                        {orientation}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campaign Type Controls */}
                <div style={{ borderTop: '1px solid #333', paddingTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#FFD600', marginBottom: 8 }}>
                    🏢 Campaign Types
                  </div>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 4 }}>
                    <input
                      type="checkbox"
                      checked={devShowB2CCampaigns}
                      onChange={(e) => setDevShowB2CCampaigns(e.target.checked)}
                      style={{ accentColor: '#FFD600' }}
                    />
                    <span style={{ fontSize: 11 }}>B2C Companies</span>
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={devShowIndividualCampaigns}
                      onChange={(e) => setDevShowIndividualCampaigns(e.target.checked)}
                      style={{ accentColor: '#FFD600' }}
                    />
                    <span style={{ fontSize: 11 }}>Individual Creators</span>
                  </label>
                </div>

                {/* Reward Controls */}
                <div style={{ borderTop: '1px solid #333', paddingTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#FFD600', marginBottom: 8 }}>
                    💰 Reward Range
                  </div>
                  
                  <div style={{ marginBottom: 4 }}>
                    <label style={{ fontSize: 11, color: '#ccc', display: 'block', marginBottom: 2 }}>
                      Min: {devRewardRange.min} $WINC
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="200"
                      value={devRewardRange.min}
                      onChange={(e) => setDevRewardRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                      style={{ width: '100%', accentColor: '#FFD600' }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ fontSize: 11, color: '#ccc', display: 'block', marginBottom: 2 }}>
                      Max: {devRewardRange.max} $WINC
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="200"
                      value={devRewardRange.max}
                      onChange={(e) => setDevRewardRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                      style={{ width: '100%', accentColor: '#FFD600' }}
                    />
                  </div>
                </div>

                {/* Status Controls */}
                <div style={{ borderTop: '1px solid #333', paddingTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#FFD600', marginBottom: 8 }}>
                    📊 Campaign Status
                  </div>
                  
                  <div style={{ display: 'flex', gap: 4 }}>
                    {(['active', 'completed', 'ending_soon'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setDevCampaignStatus(status)}
                        style={{
                          background: devCampaignStatus === status ? '#FFD600' : '#333',
                          color: devCampaignStatus === status ? '#000' : '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '4px 8px',
                          fontSize: 10,
                          cursor: 'pointer',
                          flex: 1
                        }}
                      >
                        {status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interaction Controls */}
                <div style={{ borderTop: '1px solid #333', paddingTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#FFD600', marginBottom: 8 }}>
                    🎮 Interaction Controls
                  </div>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 4 }}>
                    <input
                      type="checkbox"
                      checked={devForceTooltip}
                      onChange={(e) => setDevForceTooltip(e.target.checked)}
                      style={{ accentColor: '#FFD600' }}
                    />
                    <span style={{ fontSize: 11 }}>Force Tooltip Open</span>
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 4 }}>
                    <input
                      type="checkbox"
                      checked={devForceInfo}
                      onChange={(e) => setDevForceInfo(e.target.checked)}
                      style={{ accentColor: '#FFD600' }}
                    />
                    <span style={{ fontSize: 11 }}>Force Info Modal</span>
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 4 }}>
                    <input
                      type="checkbox"
                      checked={devAutoNavigate}
                      onChange={(e) => setDevAutoNavigate(e.target.checked)}
                      style={{ accentColor: '#FFD600' }}
                    />
                    <span style={{ fontSize: 11 }}>Auto Navigate</span>
                  </label>
                  
                  {devAutoNavigate && (
                    <div style={{ marginTop: 4 }}>
                      <label style={{ fontSize: 11, color: '#ccc', display: 'block', marginBottom: 2 }}>
                        Speed: {devAutoNavigateSpeed}ms
                      </label>
                      <input
                        type="range"
                        min="1000"
                        max="10000"
                        step="500"
                        value={devAutoNavigateSpeed}
                        onChange={(e) => setDevAutoNavigateSpeed(parseInt(e.target.value))}
                        style={{ width: '100%', accentColor: '#FFD600' }}
                      />
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div style={{ borderTop: '1px solid #333', paddingTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#FFD600', marginBottom: 8 }}>
                    🚀 Quick Actions
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                    <button
                      onClick={() => {
                        setDevNumberOfCampaigns(5);
                        setDevBaseCompletionPercent(0);
                        setDevTimeLeftHours(72);
                        setDevCampaignStatus('active');
                      }}
                      style={{
                        background: '#333',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 8px',
                        fontSize: 10,
                        cursor: 'pointer'
                      }}
                    >
                      🚀 New Campaigns
                    </button>
                    
                    <button
                      onClick={() => {
                        setDevNumberOfCampaigns(8);
                        setDevBaseCompletionPercent(100);
                        setDevTimeLeftHours(0);
                        setDevCampaignStatus('completed');
                      }}
                      style={{
                        background: '#333',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 8px',
                        fontSize: 10,
                        cursor: 'pointer'
                      }}
                    >
                      ✅ Completed
                    </button>
                    
                    <button
                      onClick={() => {
                        setDevNumberOfCampaigns(6);
                        setDevBaseCompletionPercent(75);
                        setDevTimeLeftHours(12);
                        setDevCampaignStatus('ending_soon');
                      }}
                      style={{
                        background: '#333',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 8px',
                        fontSize: 10,
                        cursor: 'pointer'
                      }}
                    >
                      ⏰ Ending Soon
                    </button>
                    
                    <button
                      onClick={() => {
                        setDevNumberOfCampaigns(20);
                        setDevBaseCompletionPercent(50);
                        setDevTimeLeftHours(48);
                        setDevCampaignStatus('active');
                        setDevShowB2CCampaigns(true);
                        setDevShowIndividualCampaigns(true);
                      }}
                      style={{
                        background: '#333',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 8px',
                        fontSize: 10,
                        cursor: 'pointer'
                      }}
                    >
                      📊 Max Load
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        }
      />

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Modals pour les informations supplémentaires */}
      {/* Starting Story Modal */}
      {showStoryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={() => setShowStoryModal(false)}>
          <div style={{
            background: '#111',
            border: '2px solid #4ECB71',
            borderRadius: 16,
            padding: 24,
            maxWidth: 500,
            width: '90vw',
            color: '#fff',
            position: 'relative',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowStoryModal(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: 24,
                color: '#FF6B6B',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              ×
            </button>
            <h3 style={{
              color: '#4ECB71',
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 16,
              marginTop: 0
            }}>
              Starting Story
            </h3>
            <p style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: '#ccc',
              margin: 0
            }}>
              {currentCampaign?.story?.startingStory || 'No starting story available'}
            </p>
          </div>
        </div>
      )}

      {/* Guideline Modal */}
      {showGuidelinesModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }} onClick={() => setShowGuidelinesModal(false)}>
          <div style={{
            background: '#111',
            border: '2px solid #4ECB71',
            borderRadius: 16,
            padding: 24,
            maxWidth: 500,
            width: '90vw',
            color: '#fff',
            position: 'relative',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowGuidelinesModal(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: 24,
                color: '#FF6B6B',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              ×
            </button>
            <h3 style={{
              color: '#4ECB71',
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 16,
              marginTop: 0
            }}>
              Guideline
            </h3>
            <p style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: '#ccc',
              margin: 0
            }}>
              {currentCampaign?.story?.guideline || 'Follow the campaign guidelines to complete successfully'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletionPage;
