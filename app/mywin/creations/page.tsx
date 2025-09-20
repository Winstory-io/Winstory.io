"use client";

import { useActiveAccount } from 'thirdweb/react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import DevControls from '@/components/DevControls';
import EnhancedModerationDevControls from '@/components/EnhancedModerationDevControls';

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
  const [devModerationData, setDevModerationData] = useState<any | null>(null);

  useEffect(() => {
    if (account) {
      setCampaigns([]);
    }
  }, [account]);

  // Simulate reading current active initial campaign progress from mock for conditional swap to validated dashboard
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await import('../../../lib/mockData');
        const firstInitial = (data.mockCampaigns as any[]).find((c) => c.type === 'INITIAL');
        if (mounted) {
          const progress = firstInitial?.progress || null;
          setActiveInitialProgress(progress);
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  // Initialize dev moderation data when activeInitialProgress is available
  useEffect(() => {
    if (activeInitialProgress && !devModerationData) {
      setDevModerationData(activeInitialProgress);
    }
  }, [activeInitialProgress, devModerationData]);

  const isValidated = useMemo(() => {
    if (devForceValidated) return true;
    // Use dev-modified data if available, otherwise fall back to original data
    const progressData = devModerationData || activeInitialProgress;
    if (!progressData) return false;
    const s = computeValidationState(progressData);
    return s.allOk;
  }, [activeInitialProgress, devForceValidated, devModerationData]);

  const separatorStyle = {
    height: 1,
    width: '85%', // Reduced width to end around the "y" of "Winstory"
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
      display: 'grid',
      gridTemplateColumns: '220px 1fr', // Reduced from 260px to 220px to give more space to chart
      gap: 24,
      alignItems: 'start',
      paddingTop: 16,
      paddingLeft: 16,
      paddingRight: 16
    }}>
      {/* Left sidebar mini-menu - repositioned to center vertically */}
      <div style={{ 
        position: 'sticky', 
        top: '50%', 
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: 'fit-content'
      }}>
        <div style={{ 
          color: activeTab === 'active' ? '#18C964' : '#C0C0C0', 
          fontWeight: 900, 
          fontSize: 16, // Reduced from 18 to 16
          cursor: 'pointer', 
          marginBottom: 10 
        }} onClick={() => setActiveTab('active')}>
          Active Campaign
        </div>
        <div style={separatorStyle} />
        <div style={{ 
          marginTop: 10, 
          marginBottom: 10, 
          color: activeTab === 'previous' ? '#18C964' : '#C0C0C0', 
          fontWeight: 900, 
          fontSize: 16, // Reduced from 18 to 16
          cursor: 'pointer' 
        }} onClick={() => setActiveTab('previous')}>
          Previous Campaign(s)
        </div>
        <div style={separatorStyle} />
        <div style={{ 
          marginTop: 10, 
          color: activeTab === 'universe' ? '#18C964' : '#C0C0C0', 
          fontWeight: 900, 
          fontSize: 16, // Reduced from 18 to 16
          cursor: 'pointer' 
        }} onClick={() => setActiveTab('universe')}>
          Your Universe x Winstory
        </div>
        <div style={separatorStyle} />
      </div>

      {/* Right content area */}
      <div style={{ width: '100%', maxWidth: 1400, justifySelf: 'center', position: 'relative' }}>
        {activeTab === 'active' && (
          isValidated ? (
            <ValidatedCampaignDashboard 
              forceValidated={devForceValidated}
              onForceValidated={setDevForceValidated}
            />
          ) : (
            <ActiveCampaignDashboard 
              externalProgressData={devModerationData}
            />
          )
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
            additionalControls={
              <EnhancedModerationDevControls
                initialProgress={devModerationData || activeInitialProgress}
                onProgressChange={setDevModerationData}
              />
            }
          />
        )}
      </div>
    </div>
  );
}
