"use client";

import { useState, useEffect, useRef } from 'react';
import ExplorerTabs from "../../components/Explorer/ExplorerTabs";
import ExplorerSubTabs from "../../components/Explorer/ExplorerSubTabs";
import VideoCarousel from "../../components/Explorer/VideoCarousel";
import CompanyCarousel from "../../components/Explorer/CompanyCarousel";
import VideoPodium from "../../components/Explorer/VideoPodium";
import VideoMosaic from "../../components/Explorer/VideoMosaic";
import CampaignInfoModal from "../../components/Explorer/CampaignInfoModal";
import ExplorerIntroModal from "../../components/Explorer/ExplorerIntroModal";
import ExplorerSearchBar from "../../components/Explorer/ExplorerSearchBar";
import { CampaignVideo } from "../../components/Explorer/VideoCard";
import DevControls from "../../components/DevControls";
import VideoPlayerModal from "../../components/Explorer/VideoPlayerModal";
import ExplorerWalletPopup from "../../components/Explorer/ExplorerWalletPopup";
import CompletionPopup from "../../components/CompletionPopup";
import Image from "next/image";

const LogoWinstory = () => (
  <button
    onClick={() => window.location.href = '/welcome'}
    style={{
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      transition: 'transform 0.2s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.05)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
    }}
    aria-label="Accueil"
  >
    <img
      src="/logo.svg"
      alt="Logo Winstory"
      style={{
        width: '10vw',
        minWidth: 48,
        maxWidth: 120,
        height: 'auto',
        display: 'block',
      }}
    />
  </button>
);

const SearchIcon = () => (
  <div
    style={{
      width: 44,
      height: 44,
      borderRadius: '50%',
      background: 'rgba(255, 214, 0, 0.1)',
      border: '2px solid rgba(255, 214, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      color: '#FFD600',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }}
  >
    🔍
  </div>
);

const MAIN_TABS = [
  { key: 'active', label: 'Active Creations' },
  { key: 'best', label: 'Best Completions' },
  { key: 'all', label: 'All' },
];
const SUB_TABS = [
  { key: 'company', label: 'Company to Complete' },
  { key: 'community', label: 'Community to Complete' },
];

export default function ExplorerPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [activeSubTab, setActiveSubTab] = useState('company');
  const [showIntro, setShowIntro] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignVideo | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<CampaignVideo | null>(null);
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignVideo[]>([]);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Auth & Completion states
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [selectedCampaignToComplete, setSelectedCampaignToComplete] = useState<CampaignVideo | null>(null);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  // Filter states for "All" tab
  const [typeFilter, setTypeFilter] = useState<'all' | 'company' | 'community' | 'completed'>('all');
  const [formatFilter, setFormatFilter] = useState<'all' | 'horizontal' | 'vertical'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  // Dev Controls State
  const [devShowMockData, setDevShowMockData] = useState(false);
  const [devCampaignCount, setDevCampaignCount] = useState(8);
  const [devCompletionPercentage, setDevCompletionPercentage] = useState(45);
  const [devTimeLeftHours, setDevTimeLeftHours] = useState(48);
  const [devOrientation, setDevOrientation] = useState<'horizontal' | 'vertical' | 'mixed'>('mixed');
  const [devShowCompany, setDevShowCompany] = useState(true);
  const [devShowCommunity, setDevShowCommunity] = useState(true);
  const [devPodiumCount, setDevPodiumCount] = useState(3);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const walletAddress = localStorage.getItem('walletAddress');
      setIsUserAuthenticated(!!walletAddress);
    };
    checkAuth();
  }, []);

  // Handler for Complete button
  const handleCompleteClick = (campaign: CampaignVideo) => {
    setSelectedCampaignToComplete(campaign);
    
    // Check if user is authenticated
    const walletAddress = localStorage.getItem('walletAddress');
    if (!walletAddress) {
      // Not authenticated - show auth popup
      setShowAuthPopup(true);
    } else {
      // Already authenticated - show completion popup directly
      setShowCompletionPopup(true);
    }
  };

  // Handler for successful wallet connection
  const handleWalletConnected = (walletAddress: string) => {
    setIsUserAuthenticated(true);
    setShowAuthPopup(false);
    // Now show completion popup
    setShowCompletionPopup(true);
  };

  // Handler for completion popup close
  const handleCompletionClose = () => {
    setShowCompletionPopup(false);
    setSelectedCampaignToComplete(null);
  };

  // Generate mock data for development
  const generateMockCampaigns = (): CampaignVideo[] => {
    const mockCampaigns: CampaignVideo[] = [];
    // Company domains for logos
    const companyDomains = ['nike.com', 'apple.com', 'tesla.com', 'spotify.com', 'netflix.com', 'airbnb.com', 'uber.com', 'stripe.com'];
    const companyNames = ['Nike', 'Apple', 'Tesla', 'Spotify', 'Netflix', 'Airbnb', 'Uber', 'Stripe'];
    
    for (let i = 0; i < devCampaignCount; i++) {
      const isCompany = i % 2 === 0;
      const shouldShowCompany = isCompany && devShowCompany;
      const shouldShowCommunity = !isCompany && devShowCommunity;
      
      if (!shouldShowCompany && !shouldShowCommunity) continue;

      const orientation = 
        devOrientation === 'mixed' 
          ? (i % 3 === 0 ? 'vertical' : 'horizontal')
          : devOrientation;

      const companyIndex = Math.floor(i / 2) % companyDomains.length;

      mockCampaigns.push({
        id: `campaign-${i}`,
        title: `${isCompany ? 'Epic Brand Challenge' : 'Community Story Quest'} #${i + 1}`,
        companyName: isCompany ? companyNames[companyIndex] : undefined,
        companyDomain: isCompany ? companyDomains[companyIndex] : undefined, // Add domain for logo
        creatorWallet: !isCompany ? `0x${Math.random().toString(16).substr(2, 40)}` : undefined,
        thumbnail: `https://picsum.photos/seed/${i}/${orientation === 'vertical' ? '360/640' : '640/360'}`,
        videoUrl: `https://example.com/video-${i}`,
        orientation: orientation as 'horizontal' | 'vertical',
        completionPercentage: Math.min(100, devCompletionPercentage + (i * 5) % 40),
        timeLeft: devTimeLeftHours > 0 ? `${devTimeLeftHours}h left` : 'Ended',
        standardReward: `${(i + 1) * 10} WINC`,
        premiumReward: `${(i + 1) * 50} USDT + NFT`,
        completionPrice: `${(0.05 + i * 0.01).toFixed(2)} USDT`,
        startingStory: `This is an amazing ${isCompany ? 'brand' : 'community'} campaign that challenges creators to push boundaries and create innovative content.`,
        guidelines: 'Be creative, follow the theme, and showcase your unique style. Must be original content.',
        rank: activeTab === 'best' && i < 3 ? i + 1 : undefined,
      });
    }

    return mockCampaigns;
  };

  // Generate Best Completions mock data (1 initial + 3 completions per campaign)
  const generateBestCompletionsCampaigns = (): CampaignVideo[] => {
    const campaigns: CampaignVideo[] = [];
    const campaignsToGenerate = Math.min(devPodiumCount, 5); // Max 5 campaigns
    // Company domains for logos
    const companyDomains = ['nike.com', 'apple.com', 'tesla.com', 'spotify.com', 'netflix.com'];
    const companyNames = ['Nike', 'Apple', 'Tesla', 'Spotify', 'Netflix'];

    for (let campaignIndex = 0; campaignIndex < campaignsToGenerate; campaignIndex++) {
      const isCompany = campaignIndex % 2 === 0;
      const orientation = devOrientation === 'mixed' 
        ? (campaignIndex % 2 === 0 ? 'horizontal' : 'vertical')
        : devOrientation;

      // Initial video (the campaign starter)
      campaigns.push({
        id: `best-initial-${campaignIndex}`,
        title: `${isCompany ? 'Epic Brand Campaign' : 'Amazing Community Story'} #${campaignIndex + 1}`,
        companyName: isCompany ? companyNames[campaignIndex % companyNames.length] : undefined,
        companyDomain: isCompany ? companyDomains[campaignIndex % companyDomains.length] : undefined, // Add domain for logo
        creatorWallet: !isCompany ? `0x${Math.random().toString(16).substr(2, 40)}` : undefined,
        thumbnail: `https://picsum.photos/seed/best-${campaignIndex}/${orientation === 'vertical' ? '360/640' : '640/360'}`,
        videoUrl: `https://example.com/best-video-${campaignIndex}`,
        orientation: orientation as 'horizontal' | 'vertical',
        completionPercentage: 100,
        timeLeft: undefined, // Completed campaigns don't show time
        standardReward: `${(campaignIndex + 1) * 15} WINC`,
        premiumReward: `${(campaignIndex + 1) * 75} USDT + NFT`,
        completionPrice: `${(0.08 + campaignIndex * 0.02).toFixed(2)} USDT`,
        startingStory: `This is the initial creation that inspired ${3} amazing completions. The creator set a high bar for creativity and storytelling, challenging the community to build upon this foundation.`,
        guidelines: 'Must maintain the same theme and quality. Be creative while staying true to the original vision. Professional quality required.',
      });

      // Top 3 completions
      for (let rank = 1; rank <= 3; rank++) {
        campaigns.push({
          id: `best-completion-${campaignIndex}-${rank}`,
          title: `Completion #${rank} - Campaign ${campaignIndex + 1}`,
          companyName: undefined,
          creatorWallet: `0x${Math.random().toString(16).substr(2, 40)}`,
          thumbnail: `https://picsum.photos/seed/completion-${campaignIndex}-${rank}/${orientation === 'vertical' ? '360/640' : '640/360'}`,
          videoUrl: `https://example.com/completion-${campaignIndex}-${rank}`,
          orientation: orientation as 'horizontal' | 'vertical',
          completionPercentage: 100,
          timeLeft: undefined,
          standardReward: rank === 1 ? `${(campaignIndex + 1) * 20} WINC` : 
                          rank === 2 ? `${(campaignIndex + 1) * 15} WINC` :
                          `${(campaignIndex + 1) * 10} WINC`,
          premiumReward: rank === 1 ? `${(campaignIndex + 1) * 100} USDT + Gold NFT` : 
                         rank === 2 ? `${(campaignIndex + 1) * 60} USDT + Silver NFT` :
                         `${(campaignIndex + 1) * 30} USDT + Bronze NFT`,
          rank: rank,
          completionStory: `This is the winning completion story #${rank}. The creator took the original concept and elevated it with exceptional creativity, technical skill, and storytelling. This completion truly stands out among all submissions.`,
        });
      }
    }

    return campaigns;
  };

  // Filter campaigns based on active tab and sub-tab
  const getFilteredCampaigns = (): CampaignVideo[] => {
    if (!devShowMockData) return [];

    if (activeTab === 'best') {
      // Generate specific Best Completions data
      return generateBestCompletionsCampaigns();
    }

    const allCampaigns = generateMockCampaigns();

    if (activeTab === 'active') {
      // Filter by sub-tab
      return allCampaigns.filter(campaign => {
        if (activeSubTab === 'company') return campaign.companyName;
        if (activeSubTab === 'community') return !campaign.companyName;
        return true;
      }).filter(campaign => (campaign.completionPercentage || 0) < 100);
    } else {
      // Show all
      return allCampaigns;
    }
  };

  // Update campaigns when filters change
  useEffect(() => {
    if (devShowMockData) {
      setCampaigns(getFilteredCampaigns());
    } else {
      // TODO: Replace with actual API call to fetch campaigns
      // fetchCampaigns().then(data => setCampaigns(data));
      setCampaigns([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeSubTab, devShowMockData, devCampaignCount, devCompletionPercentage, devTimeLeftHours, devOrientation, devShowCompany, devShowCommunity, devPodiumCount]);

  // Handle scroll to hide/show header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down & past threshold
        setHeaderVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up
        setHeaderVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      {/* Header Section */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: 'linear-gradient(180deg, #000 0%, rgba(0, 0, 0, 0.98) 100%)',
          borderBottom: '3px solid #FFD600',
          paddingBottom: 0,
          zIndex: 1000,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
          transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <header
          style={{
        position: 'relative',
            display: 'flex',
            alignItems: 'center',
            padding: '1.5rem 2rem',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 10, display: 'flex', alignItems: 'center' }}>
            <LogoWinstory />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #FFD600 0%, #FFA500 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                letterSpacing: '1px',
              }}
            >
              Explorer
              <button
                onClick={() => setShowIntro(true)}
                style={{
                  background: 'rgba(255, 214, 0, 0.1)',
                  border: '2px solid rgba(255, 214, 0, 0.3)',
                  borderRadius: '50%',
                  padding: 8,
                  marginLeft: 12,
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 214, 0, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(255, 214, 0, 0.6)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 214, 0, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 214, 0, 0.3)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Image
                  src="/tooltip.svg"
                  alt="Info"
                  width={28}
                  height={28}
                  style={{ display: 'inline-block', verticalAlign: 'middle' }}
                />
              </button>
            </h1>
          </div>
          <button
            style={{ background: 'none', border: 'none', padding: 0 }}
            onClick={() => setShowSearch(true)}
            onMouseEnter={(e) => {
              const searchDiv = e.currentTarget.querySelector('div') as HTMLDivElement;
              if (searchDiv) {
                searchDiv.style.background = 'rgba(255, 214, 0, 0.2)';
                searchDiv.style.borderColor = 'rgba(255, 214, 0, 0.6)';
                searchDiv.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              const searchDiv = e.currentTarget.querySelector('div') as HTMLDivElement;
              if (searchDiv) {
                searchDiv.style.background = 'rgba(255, 214, 0, 0.1)';
                searchDiv.style.borderColor = 'rgba(255, 214, 0, 0.3)';
                searchDiv.style.transform = 'scale(1)';
              }
            }}
          >
            <SearchIcon />
          </button>
        </header>

        {/* Tabs Section */}
        <div style={{ paddingTop: 20, paddingBottom: 16 }}>
          <ExplorerTabs tabs={MAIN_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
          {activeTab === 'active' && (
            <ExplorerSubTabs tabs={SUB_TABS} activeSubTab={activeSubTab} onSubTabChange={setActiveSubTab} />
          )}
        </div>

        {/* Filters Bar - Above Yellow Line */}
        {activeTab === 'all' && campaigns.length > 0 && (
          <div style={{ 
            padding: '12px 2rem 16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            borderTop: '1px solid rgba(255, 214, 0, 0.2)',
          }}>
            {/* Type Filters */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#666', fontWeight: 600, marginRight: 4 }}>Type:</span>
              {[
                { key: 'all', label: 'All', icon: '🌟' },
                { key: 'company', label: 'Companies', icon: '🏢' },
                { key: 'community', label: 'Community', icon: '👥' },
                { key: 'completed', label: 'Completed', icon: '✅' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setTypeFilter(f.key as typeof typeFilter)}
                  style={{
                    background: typeFilter === f.key ? 'rgba(255, 214, 0, 0.2)' : 'transparent',
                    border: typeFilter === f.key ? '1px solid #FFD600' : 'none',
                    color: '#FFD600',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    padding: '4px 12px',
                    borderRadius: 12,
                    transition: 'all 0.2s',
                    opacity: typeFilter === f.key ? 1 : 0.6,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    if (typeFilter !== f.key) {
                      e.currentTarget.style.background = 'rgba(255, 214, 0, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = typeFilter === f.key ? '1' : '0.6';
                    if (typeFilter !== f.key) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {f.icon} {f.label}
                </button>
              ))}
            </div>

            {/* Format Filters */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#666', fontWeight: 600, marginRight: 4 }}>Format:</span>
              {[
                { key: 'all', label: 'All', icon: '🎬' },
                { key: 'horizontal', label: '16:9', icon: '▬' },
                { key: 'vertical', label: '9:16', icon: '▮' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFormatFilter(f.key as typeof formatFilter)}
                  style={{
                    background: formatFilter === f.key ? 'rgba(0, 255, 176, 0.2)' : 'transparent',
                    border: formatFilter === f.key ? '1px solid #00FFB0' : 'none',
                    color: '#00FFB0',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    padding: '4px 12px',
                    borderRadius: 12,
                    transition: 'all 0.2s',
                    opacity: formatFilter === f.key ? 1 : 0.6,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    if (formatFilter !== f.key) {
                      e.currentTarget.style.background = 'rgba(0, 255, 176, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = formatFilter === f.key ? '1' : '0.6';
                    if (formatFilter !== f.key) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {f.icon} {f.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular')}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 8,
                  padding: '4px 12px',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="recent" style={{ background: '#000' }}>Most Recent</option>
                <option value="popular" style={{ background: '#000' }}>Most Popular</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main 
        style={{ 
          paddingTop: '3rem',
          paddingBottom: '3rem', 
          minHeight: 'calc(100vh - 200px)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {loading ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 400,
              gap: 20,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                border: '4px solid rgba(255, 214, 0, 0.2)',
                borderTop: '4px solid #FFD600',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <div style={{ color: '#FFD600', fontSize: 18, fontWeight: 600 }}>Loading campaigns...</div>
            <style jsx>{`
              @keyframes spin {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </div>
        ) : activeTab === 'active' ? (
          activeSubTab === 'company' ? (
            <CompanyCarousel 
              videos={campaigns} 
              onInfoClick={setSelectedCampaign} 
              onVideoClick={setSelectedVideo}
              onCompleteClick={handleCompleteClick}
            />
          ) : (
            <VideoCarousel 
              videos={campaigns} 
              subTab={activeSubTab} 
              onInfoClick={setSelectedCampaign} 
              onVideoClick={setSelectedVideo}
              onCompleteClick={handleCompleteClick}
            />
          )
        ) : activeTab === 'best' ? (
          <VideoPodium 
            videos={campaigns} 
            onInfoClick={setSelectedCampaign} 
            onVideoClick={setSelectedVideo}
          />
        ) : (
          <VideoMosaic 
            videos={campaigns} 
            onInfoClick={setSelectedCampaign} 
            onVideoClick={setSelectedVideo}
            onCompleteClick={handleCompleteClick}
            externalTypeFilter={typeFilter}
            externalFormatFilter={formatFilter}
            externalSortBy={sortBy}
          />
        )}
      </main>

      {/* Modals */}
      {selectedCampaign && (
        <CampaignInfoModal 
          campaign={selectedCampaign} 
          onClose={() => setSelectedCampaign(null)}
          onCompleteClick={handleCompleteClick}
        />
      )}
      {selectedVideo && (
        <VideoPlayerModal
          videoUrl={selectedVideo.videoUrl}
          title={selectedVideo.title}
          orientation={selectedVideo.orientation}
          onClose={() => setSelectedVideo(null)}
        />
      )}
      {showIntro && <ExplorerIntroModal onClose={() => setShowIntro(false)} />}
      {showSearch && <ExplorerSearchBar onClose={() => setShowSearch(false)} />}

      {/* Wallet Connection Popup */}
      <ExplorerWalletPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        onSuccess={handleWalletConnected}
      />

      {/* Completion Popup */}
      {showCompletionPopup && selectedCampaignToComplete && (
        <CompletionPopup
          open={showCompletionPopup}
          onClose={handleCompletionClose}
          activeTab="b2c" // Default to b2c, you can make this dynamic based on campaign type
          identity={selectedCampaignToComplete.companyName || 'Community'}
          currentCampaign={selectedCampaignToComplete}
          getTimeLeft={() => selectedCampaignToComplete.timeLeft || 'N/A'}
          getCompletionStats={() => ({ 
            minted: Math.floor((selectedCampaignToComplete.completionPercentage || 0) * 10), 
            available: 1000 
          })}
        />
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
                Toggle to display test data in the Explorer
              </div>
            </div>

            {devShowMockData && (
              <>
                  {/* Campaign Count - Different for Active vs All */}
                  <div>
                    <label style={{ fontSize: 12, color: '#C0C0C0', display: 'block', marginBottom: 6 }}>
                      🎬 Number of Campaigns: {devCampaignCount}
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={activeTab === 'active' ? 50 : 20}
                      value={devCampaignCount}
                      onChange={(e) => setDevCampaignCount(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                    <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                      {activeTab === 'active' ? 'Max 50 for Active Creations' : 'Max 20 for other tabs'}
                    </div>
                  </div>

                {/* Completion Percentage */}
                <div>
                  <label style={{ fontSize: 12, color: '#C0C0C0', display: 'block', marginBottom: 6 }}>
                    📊 Base Completion %: {devCompletionPercentage}%
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={devCompletionPercentage}
                    onChange={(e) => setDevCompletionPercentage(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                    Each campaign varies ±20% from this base
                  </div>
                </div>

                {/* Time Left */}
                <div>
                  <label style={{ fontSize: 12, color: '#C0C0C0', display: 'block', marginBottom: 6 }}>
                    ⏱ Time Left: {devTimeLeftHours}h
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={168}
                    step={12}
                    value={devTimeLeftHours}
                    onChange={(e) => setDevTimeLeftHours(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                    0 = Ended campaign
                  </div>
                </div>

                {/* Video Orientation */}
                <div>
                  <label style={{ fontSize: 12, color: '#C0C0C0', display: 'block', marginBottom: 8 }}>
                    📱 Video Orientation
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['horizontal', 'vertical', 'mixed'] as const).map((orientation) => (
                      <button
                        key={orientation}
                        onClick={() => setDevOrientation(orientation)}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          fontSize: 11,
                          fontWeight: 700,
                          background: devOrientation === orientation ? '#FFD600' : '#222',
                          color: devOrientation === orientation ? '#000' : '#999',
                          border: `1px solid ${devOrientation === orientation ? '#FFD600' : '#444'}`,
                          borderRadius: 6,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {orientation === 'horizontal' ? '16:9' : orientation === 'vertical' ? '9:16' : 'Mixed'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campaign Type Filters */}
                <div style={{ borderTop: '1px solid #333', paddingTop: 12 }}>
                  <div style={{ fontSize: 12, color: '#FFD600', fontWeight: 700, marginBottom: 8 }}>
                    Campaign Types
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 6 }}>
                    <input
                      type="checkbox"
                      checked={devShowCompany}
                      onChange={(e) => setDevShowCompany(e.target.checked)}
                      style={{ accentColor: '#FFD600' }}
                    />
                    <span style={{ fontSize: 13 }}>🏢 Company Campaigns</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={devShowCommunity}
                      onChange={(e) => setDevShowCommunity(e.target.checked)}
                      style={{ accentColor: '#FFD600' }}
                    />
                    <span style={{ fontSize: 13 }}>👥 Community Campaigns</span>
                  </label>
                </div>

                  {/* Podium Settings (only visible when Best Completions tab is active) */}
                  {activeTab === 'best' && (
                    <div style={{ borderTop: '1px solid #333', paddingTop: 12 }}>
                      <div style={{ fontSize: 12, color: '#FFD600', fontWeight: 700, marginBottom: 12 }}>
                        🏆 Best Completions Settings
                      </div>
                      
                      <label style={{ fontSize: 12, color: '#C0C0C0', display: 'block', marginBottom: 6 }}>
                        📊 Number of Campaigns: {devPodiumCount}
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={devPodiumCount}
                        onChange={(e) => setDevPodiumCount(Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                      <div style={{ fontSize: 10, color: '#666', marginTop: 2, marginBottom: 12 }}>
                        Each campaign = 1 initial video + 3 top completions
                      </div>

                      {/* Video Orientation for Best Completions */}
                      <label style={{ fontSize: 12, color: '#C0C0C0', display: 'block', marginBottom: 8 }}>
                        📱 Campaign Orientation
                      </label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {(['horizontal', 'vertical', 'mixed'] as const).map((orientation) => (
                          <button
                            key={orientation}
                            onClick={() => setDevOrientation(orientation)}
                            style={{
                              flex: 1,
                              padding: '6px 8px',
                              fontSize: 11,
                              fontWeight: 700,
                              background: devOrientation === orientation ? '#FFD600' : '#222',
                              color: devOrientation === orientation ? '#000' : '#999',
                              border: `1px solid ${devOrientation === orientation ? '#FFD600' : '#444'}`,
                              borderRadius: 6,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            {orientation === 'horizontal' ? '▬ 16:9' : orientation === 'vertical' ? '▮ 9:16' : 'Mixed'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Current Tab Info */}
                <div style={{ borderTop: '1px solid #333', paddingTop: 12 }}>
                  <div style={{ fontSize: 11, color: '#888' }}>
                    <div><strong style={{ color: '#FFD600' }}>Active Tab:</strong> {activeTab}</div>
                    {activeTab === 'active' && (
                      <div><strong style={{ color: '#FFD600' }}>Sub-Tab:</strong> {activeSubTab}</div>
                    )}
                    <div><strong style={{ color: '#FFD600' }}>Showing:</strong> {campaigns.length} campaigns</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div style={{ borderTop: '1px solid #333', paddingTop: 12 }}>
                  <div style={{ fontSize: 12, color: '#FFD600', fontWeight: 700, marginBottom: 8 }}>
                    🎮 Quick Actions
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <button
                      onClick={() => {
                        setDevCompletionPercentage(0);
                        setDevTimeLeftHours(72);
                      }}
                      style={{
                        padding: '8px 6px',
                        fontSize: 11,
                        fontWeight: 700,
                        background: '#222',
                        color: '#00FF88',
                        border: '1px solid #00FF88',
                        borderRadius: 6,
                        cursor: 'pointer',
                      }}
                    >
                      🚀 New Campaigns
                    </button>
                    <button
                      onClick={() => {
                        setDevCompletionPercentage(100);
                        setDevTimeLeftHours(0);
                      }}
                      style={{
                        padding: '8px 6px',
                        fontSize: 11,
                        fontWeight: 700,
                        background: '#222',
                        color: '#FFD600',
                        border: '1px solid #FFD600',
                        borderRadius: 6,
                        cursor: 'pointer',
                      }}
                    >
                      ✅ Completed
                    </button>
                    <button
                      onClick={() => {
                        setDevCompletionPercentage(75);
                        setDevTimeLeftHours(12);
                      }}
                      style={{
                        padding: '8px 6px',
                        fontSize: 11,
                        fontWeight: 700,
                        background: '#222',
                        color: '#FF5252',
                        border: '1px solid #FF5252',
                        borderRadius: 6,
                        cursor: 'pointer',
                      }}
                    >
                      ⏰ Ending Soon
                    </button>
                    <button
                      onClick={() => {
                        setDevCampaignCount(20);
                        setDevShowCompany(true);
                        setDevShowCommunity(true);
                      }}
                      style={{
                        padding: '8px 6px',
                        fontSize: 11,
                        fontWeight: 700,
                        background: '#222',
                        color: '#00FFB0',
                        border: '1px solid #00FFB0',
                        borderRadius: 6,
                        cursor: 'pointer',
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
    </div>
  );
}
