"use client";

import { useState } from 'react';
import ExplorerTabs from "../../components/Explorer/ExplorerTabs";
import ExplorerSubTabs from "../../components/Explorer/ExplorerSubTabs";
import VideoCarousel from "../../components/Explorer/VideoCarousel";
import VideoPodium from "../../components/Explorer/VideoPodium";
import VideoMosaic from "../../components/Explorer/VideoMosaic";
import CampaignInfoModal from "../../components/Explorer/CampaignInfoModal";
import ExplorerIntroModal from "../../components/Explorer/ExplorerIntroModal";
import ExplorerSearchBar from "../../components/Explorer/ExplorerSearchBar";

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

const BulbIcon = () => (
  <span style={{ fontSize: 32, color: '#FFD600', marginLeft: 8, cursor: 'pointer' }}>💡</span>
);
const SearchIcon = () => (
  <span style={{ fontSize: 28, color: '#FFD600', cursor: 'pointer' }}>🔍</span>
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
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // TODO: fetch campaigns/videos from API
  const loading = false;
  const campaigns = [];

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      <div style={{
        position: 'relative',
        background: '#000',
        borderBottom: '2px solid #FFD600',
        paddingBottom: 0,
        zIndex: 20,
      }}>
        <header style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '1rem 2rem', justifyContent: 'space-between' }}>
          <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 10, display: 'flex', alignItems: 'center' }}>
            <LogoWinstory />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#FFD600', margin: 0, display: 'flex', alignItems: 'center' }}>
              Explorer
              <button onClick={() => setShowIntro(true)} style={{ background: 'none', border: 'none', padding: 0, marginLeft: 8 }}>
                <BulbIcon />
              </button>
            </h1>
          </div>
          <button style={{ background: 'none', border: 'none', padding: 0 }} onClick={() => setShowSearch(true)}>
            <SearchIcon />
          </button>
        </header>
        <div style={{ paddingTop: 24 }}>
          <ExplorerTabs tabs={MAIN_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
          {activeTab === 'active' && (
            <ExplorerSubTabs tabs={SUB_TABS} activeSubTab={activeSubTab} onSubTabChange={setActiveSubTab} />
          )}
        </div>
      </div>
      <main style={{ padding: '2rem 0' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#FFD600' }}>Chargement...</div>
        ) : activeTab === 'active' ? (
          <VideoCarousel videos={campaigns} subTab={activeSubTab} onInfoClick={setSelectedCampaign} />
        ) : activeTab === 'best' ? (
          <VideoPodium videos={campaigns} onInfoClick={setSelectedCampaign} />
        ) : (
          <VideoMosaic videos={campaigns} onInfoClick={setSelectedCampaign} />
        )}
      </main>
      {selectedCampaign && (
        <CampaignInfoModal campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />
      )}
      {showIntro && <ExplorerIntroModal onClose={() => setShowIntro(false)} />}
      {showSearch && <ExplorerSearchBar onClose={() => setShowSearch(false)} />}
    </div>
  );
}
