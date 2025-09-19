"use client";

import { useActiveAccount } from 'thirdweb/react';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import DevControls from '@/components/DevControls';

// Lazy load client-only components
const ActiveCompletionDashboard = dynamic(() => import('../../../components/ActiveCompletionDashboard'), { ssr: false });
const ValidatedCompletionDashboard = dynamic(() => import('../../../components/ValidatedCompletionDashboard'), { ssr: false });

interface Completion {
  id: string;
  campaignTitle: string;
  completionTitle: string;
  date: string;
  status: 'completed' | 'in_progress' | 'in_moderation' | 'validated' | 'refused';
  score?: number; // Score moyen sur 100 des modérateurs
  ranking?: number; // Position dans le classement
  roiEarned?: number; // ROI gagné par le completeur (seulement si top 3 sur campagne individuelle)
  standardReward?: string; // Récompense standard proposée
  premiumReward?: string; // Récompense premium proposée si top 3
  campaignEndDate?: string; // Date de fin de campagne
  completionTarget?: number; // Nombre de complétions cibles
  currentCompletions?: number; // Nombre de complétions actuelles
  usdcRevenue?: number; // Revenus USDC générés par les récompenses payantes
  campaignCreatorType?: 'individual' | 'company'; // Type de créateur de la campagne
  moderatorScores?: { stakerId: string; stakerName: string; score: number; stakedAmount: number; }[];
}

interface ModeratorScore {
  stakerId: string;
  stakerName: string;
  score: number;
  stakedAmount: number;
}

export default function MyCompletionsPage() {
  const account = useActiveAccount();
  const [activeTab, setActiveTab] = useState<'active' | 'all' | 'rewards'>('active');
  const [completions, setCompletions] = useState<Completion[]>([]);
  
  // Dev controls
  const [devForceValidated, setDevForceValidated] = useState(false);
  const [devForceInModeration, setDevForceInModeration] = useState(false);
  const [devRanking, setDevRanking] = useState(1);
  const [devTotalCompletions, setDevTotalCompletions] = useState(524);
  // devStakedAmount removed - now calculated as sum of individual moderator stakes
  const [devMintPrice, setDevMintPrice] = useState(100);
  const [devIsTopThree, setDevIsTopThree] = useState(true);
  const [devCampaignTimeHours, setDevCampaignTimeHours] = useState(48); // Hours remaining
  
  // Fixed campaign end time - only changes when devCampaignTimeHours is manually updated
  const [campaignEndTime, setCampaignEndTime] = useState(() => 
    Date.now() + (48 * 60 * 60 * 1000) // 48h from now by default
  );

  // Update campaign end time only when hours are changed manually
  useEffect(() => {
    if (devCampaignTimeHours <= 0) {
      setCampaignEndTime(Date.now() - 1000); // Set to past = finished
    } else {
      setCampaignEndTime(Date.now() + (devCampaignTimeHours * 60 * 60 * 1000));
    }
  }, [devCampaignTimeHours]);

  // Moderator configuration - Sequential numbering from 1 to N
  const [devModerators, setDevModerators] = useState<ModeratorScore[]>([
    { stakerId: '1', stakerName: 'Staker 1', score: 92, stakedAmount: 1200 },
    { stakerId: '2', stakerName: 'Staker 2', score: 95, stakedAmount: 800 },
    { stakerId: '3', stakerName: 'Staker 3', score: 88, stakedAmount: 1500 },
    { stakerId: '4', stakerName: 'Staker 4', score: 91, stakedAmount: 900 },
    { stakerId: '5', stakerName: 'Staker 5', score: 87, stakedAmount: 1100 },
    { stakerId: '6', stakerName: 'Staker 6', score: 86, stakedAmount: 750 },
    { stakerId: '7', stakerName: 'Staker 7', score: 91, stakedAmount: 1300 },
    { stakerId: '8', stakerName: 'Staker 8', score: 89, stakedAmount: 850 },
    { stakerId: '9', stakerName: 'Staker 9', score: 93, stakedAmount: 1000 },
    { stakerId: '10', stakerName: 'Staker 10', score: 94, stakedAmount: 950 },
    { stakerId: '11', stakerName: 'Staker 11', score: 88, stakedAmount: 1400 },
    { stakerId: '12', stakerName: 'Staker 12', score: 92, stakedAmount: 700 },
    { stakerId: '13', stakerName: 'Staker 13', score: 85, stakedAmount: 1250 },
    { stakerId: '14', stakerName: 'Staker 14', score: 96, stakedAmount: 600 },
    { stakerId: '15', stakerName: 'Staker 15', score: 91, stakedAmount: 1350 },
    { stakerId: '16', stakerName: 'Staker 16', score: 89, stakedAmount: 800 },
    { stakerId: '17', stakerName: 'Staker 17', score: 93, stakedAmount: 1150 },
    { stakerId: '18', stakerName: 'Staker 18', score: 87, stakedAmount: 900 },
    { stakerId: '19', stakerName: 'Staker 19', score: 94, stakedAmount: 1050 },
    { stakerId: '20', stakerName: 'Staker 20', score: 90, stakedAmount: 750 },
    { stakerId: '21', stakerName: 'Staker 21', score: 88, stakedAmount: 1200 }
  ]);

  // New moderator inputs
  const [newStakerScore, setNewStakerScore] = useState(90);

  // Helper function to renumber stakers sequentially
  const renumberStakers = (stakers: ModeratorScore[]): ModeratorScore[] => {
    return stakers.map((staker, index) => ({
      ...staker,
      stakerId: (index + 1).toString(),
      stakerName: `Staker ${index + 1}`
    }));
  };

  useEffect(() => {
    if (account) {
      // TODO: Fetch user completions from blockchain/database based on actual user behavior
      // For now, initialize with empty array - will be populated with real data
      setCompletions([]);
    }
  }, [account]);

  // Auto-update top 3 status based on ranking
  useEffect(() => {
    setDevIsTopThree(devRanking <= 3);
  }, [devRanking]);

  // Simulate having a validated completion when dev control is enabled
  const hasValidatedCompletion = useMemo(() => {
    return devForceValidated || completions.some(c => c.status === 'validated');
  }, [devForceValidated, completions]);

  // Simulate having a completion in moderation when dev control is enabled
  const hasCompletionInModeration = useMemo(() => {
    return devForceInModeration || completions.some(c => c.status === 'in_moderation');
  }, [devForceInModeration, completions]);

  // Prepare dev data for ValidatedCompletionDashboard
  const devCompletionData = useMemo(() => ({
    moderatorScores: devModerators,
    ranking: devRanking,
    totalCompletions: devTotalCompletions,
    stakedAmount: devModerators.reduce((sum, mod) => sum + mod.stakedAmount, 0), // Sum of all moderator stakes
    mintPrice: devMintPrice,
    isTopThree: devIsTopThree,
    campaignEndTime: campaignEndTime
  }), [devModerators, devRanking, devTotalCompletions, devMintPrice, devIsTopThree, campaignEndTime]);

  // Calculate current average score
  const currentAverageScore = useMemo(() => {
    if (devModerators.length === 0) return 0;
    return Math.round(devModerators.reduce((sum, mod) => sum + mod.score, 0) / devModerators.length);
  }, [devModerators]);

  // Add new moderator - Always sequential numbering
  const handleAddModerator = () => {
    const nextId = devModerators.length + 1;
    const newModerator = {
      stakerId: nextId.toString(),
      stakerName: `Staker ${nextId}`,
      score: newStakerScore,
      stakedAmount: 1000 // Default staked amount
    };
    
    setDevModerators([...devModerators, newModerator]);
    setNewStakerScore(90);
  };

  // Remove moderator and renumber
  const handleRemoveModerator = (stakerId: string) => {
    const filtered = devModerators.filter(m => m.stakerId !== stakerId);
    const renumbered = renumberStakers(filtered);
    setDevModerators(renumbered);
  };

  // Update moderator score
  const handleUpdateModeratorScore = (stakerId: string, newScore: number) => {
    setDevModerators(devModerators.map(m => 
      m.stakerId === stakerId ? { ...m, score: newScore } : m
    ));
  };

  // Update moderator staked amount
  const handleUpdateModeratorStake = (stakerId: string, newStake: number) => {
    setDevModerators(devModerators.map(m => 
      m.stakerId === stakerId ? { ...m, stakedAmount: newStake } : m
    ));
  };

  // Quick preset buttons with sequential numbering
  const handleSetPreset = (preset: 'default' | 'mixed' | 'high_scores' | 'with_refuses' | 'refused_completion') => {
    let newModerators: ModeratorScore[] = [];
    
    switch (preset) {
      case 'default':
        // 22 sequential stakers with good scores
        const goodScores = [92, 95, 88, 91, 87, 94, 89, 93, 90, 86, 88, 92, 85, 96, 91, 89, 93, 87, 94, 90, 88, 92];
        const defaultStakes = [1200, 800, 1500, 900, 1100, 750, 1300, 850, 1000, 950, 1400, 700, 1250, 600, 1350, 800, 1150, 900, 1050, 750, 1200, 1000];
        newModerators = goodScores.map((score, index) => ({
          stakerId: (index + 1).toString(),
          stakerName: `Staker ${index + 1}`,
          score,
          stakedAmount: defaultStakes[index] || 1000
        }));
        break;
        
      case 'mixed':
        // 7 sequential stakers with mixed scores
        const mixedScores = [98, 45, 87, 92, 35, 89, 94]; // Mix of good and medium scores (all validated)
        const mixedStakes = [1500, 800, 1200, 900, 600, 1100, 1300];
        newModerators = mixedScores.map((score, index) => ({
          stakerId: (index + 1).toString(),
          stakerName: `Staker ${index + 1}`,
          score,
          stakedAmount: mixedStakes[index] || 1000
        }));
        break;
        
      case 'high_scores':
        // 5 sequential stakers with high scores
        const highScores = [98, 99, 97, 96, 95];
        const highStakes = [2000, 1800, 1500, 1200, 1000];
        newModerators = highScores.map((score, index) => ({
          stakerId: (index + 1).toString(),
          stakerName: `Staker ${index + 1}`,
          score,
          stakedAmount: highStakes[index] || 1500
        }));
        break;
        
      case 'with_refuses':
        // 7 sequential stakers with some refuses (score = 0)
        const refuseScores = [85, 0, 90, 0, 88, 0, 92]; // Some actual refuses (0)
        const refuseStakes = [1200, 800, 1500, 600, 1100, 500, 1300]; // Lower stakes for refused stakers
        newModerators = refuseScores.map((score, index) => ({
          stakerId: (index + 1).toString(),
          stakerName: `Staker ${index + 1}`,
          score,
          stakedAmount: refuseStakes[index] || 1000
        }));
        break;
        
      case 'refused_completion':
        // 22 sequential stakers with majority refuses (score = 0) - completion rejected
        const refusedScores = [0, 0, 75, 0, 0, 82, 0, 0, 68, 0, 0, 90, 0, 0, 72, 0, 0, 85, 0, 0, 78, 88]; // Majority = 0 (refused)
        const refusedStakes = [500, 300, 1200, 400, 600, 1500, 350, 800, 1100, 450, 200, 1800, 550, 700, 1300, 250, 900, 1600, 300, 400, 1000, 1200]; // Lower stakes for refused stakers
        newModerators = refusedScores.map((score, index) => ({
          stakerId: (index + 1).toString(),
          stakerName: `Staker ${index + 1}`,
          score,
          stakedAmount: refusedStakes[index] || 500
        }));
        break;
    }
    
    setDevModerators(newModerators);
  };

  const separatorStyle = {
    height: 1,
    width: '85%', // Reduced width to end around the "s" of "Earnings"
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
          Loading your completions...
        </h1>
        <p style={{ fontSize: '16px', color: '#ccc' }}>
          Please wait while we fetch your completion data.
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
      gridTemplateColumns: '220px 1fr', // Same as creations page
      gap: 24,
      alignItems: 'start',
      paddingTop: 16,
      paddingLeft: 16,
      paddingRight: 16
    }}>
      {/* Left sidebar menu */}
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
          fontSize: 16,
          cursor: 'pointer', 
          marginBottom: 10 
        }} onClick={() => setActiveTab('active')}>
          Active Completion
        </div>
        <div style={separatorStyle} />
        <div style={{ 
          marginTop: 10, 
          marginBottom: 10, 
          color: activeTab === 'all' ? '#18C964' : '#C0C0C0', 
          fontWeight: 900, 
          fontSize: 16,
          cursor: 'pointer' 
        }} onClick={() => setActiveTab('all')}>
          All Completions
        </div>
        <div style={separatorStyle} />
        <div style={{ 
          marginTop: 10, 
          color: activeTab === 'rewards' ? '#18C964' : '#C0C0C0', 
          fontWeight: 900, 
          fontSize: 16,
          cursor: 'pointer' 
        }} onClick={() => setActiveTab('rewards')}>
          Rewards & Earnings
        </div>
        <div style={separatorStyle} />
      </div>

      {/* Right content area */}
      <div style={{ width: '100%', maxWidth: 1400, justifySelf: 'center', position: 'relative' }}>
        {activeTab === 'active' && (
          hasValidatedCompletion ? (
            <ValidatedCompletionDashboard 
              forceValidated={devForceValidated}
              onForceValidated={setDevForceValidated}
              devCompletionData={devCompletionData}
            />
          ) : hasCompletionInModeration ? (
            <ActiveCompletionDashboard />
          ) : (
            <ActiveCompletionDashboard />
          )
        )}

        {activeTab === 'all' && (
          <div style={{ color: '#fff', textAlign: 'center', paddingTop: 40 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>All Completions</h2>
            <p style={{ color: '#C0C0C0', marginBottom: 32 }}>View all your completion history</p>
            
            {/* Completions List */}
            <div style={{ 
              maxWidth: '1000px', 
              width: '90vw',
              margin: '0 auto'
            }}>
              {completions.length === 0 ? (
                <div style={{ 
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '2px dashed #333',
                  borderRadius: '16px',
                  padding: '48px 24px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📝</div>
                  <h3 style={{ color: '#C0C0C0', fontSize: '20px', marginBottom: '8px' }}>No completions yet</h3>
                  <p style={{ color: '#888', fontSize: '16px' }}>Your completed campaigns will appear here once you start participating.</p>
                </div>
              ) : (
                completions.map((completion) => (
                  <div
                    key={completion.id}
                    style={{
                      background: 'rgba(0, 0, 0, 0.8)',
                      border: `2px solid ${completion.status === 'completed' ? '#00FF00' : '#FFD600'}`,
                      borderRadius: '16px',
                      padding: '24px',
                      marginBottom: '24px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <h3 style={{ 
                      fontSize: '24px', 
                      fontWeight: 800, 
                      color: '#00FF00',
                      marginBottom: '8px'
                    }}>
                      {completion.campaignTitle}
                    </h3>
                    <p style={{ 
                      fontSize: '18px', 
                      color: '#fff',
                      marginBottom: '8px'
                    }}>
                      {completion.completionTitle}
                    </p>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#ccc'
                    }}>
                      Completed on {completion.date}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div style={{ color: '#fff', textAlign: 'center', paddingTop: 40 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Rewards & Earnings</h2>
            <p style={{ color: '#C0C0C0', marginBottom: 32 }}>Track your rewards and earnings from completions</p>
            
            <div style={{ 
              background: 'rgba(0, 0, 0, 0.6)',
              border: '2px dashed #333',
              borderRadius: '16px',
              padding: '48px 24px',
              textAlign: 'center',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>🎁</div>
              <h3 style={{ color: '#C0C0C0', fontSize: '20px', marginBottom: '8px' }}>Rewards Coming Soon</h3>
              <p style={{ color: '#888', fontSize: '16px' }}>Your earned rewards and earnings will be displayed here once available.</p>
            </div>
          </div>
        )}

        {/* Dev Controls with individual moderator configuration */}
        <DevControls 
          onForceValidated={setDevForceValidated}
          forceValidated={devForceValidated}
          additionalControls={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Basic state controls */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={devForceInModeration} 
                  onChange={(e) => setDevForceInModeration(e.target.checked)}
                  style={{ accentColor: '#FFD600' }}
                />
                <span style={{ fontSize: 14 }}>Force "Completion in Moderation"</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={devForceValidated} 
                  onChange={(e) => setDevForceValidated(e.target.checked)}
                  style={{ accentColor: '#FFD600' }}
                />
                <span style={{ fontSize: 14 }}>Force "Validated Completion"</span>
              </label>

              {/* Campaign data controls */}
              <div style={{ borderTop: '1px solid #333', paddingTop: 10, marginTop: 10 }}>
                <strong style={{ color: '#FFD600', fontSize: 13, marginBottom: 8, display: 'block' }}>Campaign Data</strong>
                
                <label style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13 }}>Your Ranking</span>
                  <input
                    type="number"
                    value={devRanking}
                    min={1}
                    onChange={(e) => setDevRanking(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ width: 60, background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 4, padding: '4px 6px', fontSize: 12 }}
                  />
                </label>

                <label style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13 }}>Total Completions</span>
                  <input
                    type="number"
                    value={devTotalCompletions}
                    min={1}
                    onChange={(e) => setDevTotalCompletions(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ width: 60, background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 4, padding: '4px 6px', fontSize: 12 }}
                  />
                </label>

                <label style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13 }}>Total Staked (auto)</span>
                  <span style={{ fontSize: 13, color: '#FFD600' }}>
                    {devModerators.reduce((sum, mod) => sum + mod.stakedAmount, 0)} WINC
                  </span>
                </label>

                <label style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13 }}>MINT Price ($)</span>
                  <input
                    type="number"
                    value={devMintPrice}
                    min={1}
                    onChange={(e) => setDevMintPrice(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ width: 60, background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 4, padding: '4px 6px', fontSize: 12 }}
                  />
                </label>

                <label style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13 }}>Campaign Time Remaining (h)</span>
                  <input
                    type="number"
                    value={devCampaignTimeHours}
                    min={0}
                    max={168} // 7 days max
                    onChange={(e) => setDevCampaignTimeHours(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{ width: 60, background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 4, padding: '4px 6px', fontSize: 12 }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={devIsTopThree} 
                    onChange={(e) => setDevIsTopThree(e.target.checked)}
                    style={{ accentColor: '#FFD600' }}
                  />
                  <span style={{ fontSize: 13 }}>Force Top 3 (Premium Rewards)</span>
                </label>
              </div>

              {/* Moderator Configuration */}
              <div style={{ borderTop: '1px solid #333', paddingTop: 10, marginTop: 10 }}>
                <strong style={{ color: '#FFD600', fontSize: 13, marginBottom: 8, display: 'block' }}>
                  Moderator Scores ({devModerators.length} moderators • Avg: {currentAverageScore})
                </strong>

                {/* Quick Presets */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => handleSetPreset('default')} style={{ background: '#333', color: '#fff', border: '1px solid #555', borderRadius: 4, padding: '2px 6px', fontSize: 10, cursor: 'pointer' }}>22 Good</button>
                  <button onClick={() => handleSetPreset('mixed')} style={{ background: '#333', color: '#fff', border: '1px solid #555', borderRadius: 4, padding: '2px 6px', fontSize: 10, cursor: 'pointer' }}>7 Mixed</button>
                  <button onClick={() => handleSetPreset('high_scores')} style={{ background: '#333', color: '#fff', border: '1px solid #555', borderRadius: 4, padding: '2px 6px', fontSize: 10, cursor: 'pointer' }}>5 High</button>
                  <button onClick={() => handleSetPreset('with_refuses')} style={{ background: '#333', color: '#fff', border: '1px solid #555', borderRadius: 4, padding: '2px 6px', fontSize: 10, cursor: 'pointer' }}>7 with Refuses</button>
                  <button onClick={() => handleSetPreset('refused_completion')} style={{ background: '#333', color: '#fff', border: '1px solid #555', borderRadius: 4, padding: '2px 6px', fontSize: 10, cursor: 'pointer' }}>22 Refused</button>
                </div>

                {/* Add new moderator */}
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#FFD600', minWidth: 60 }}>
                    Add #{devModerators.length + 1}:
                  </span>
                  <input
                    type="number"
                    placeholder="Score"
                    value={newStakerScore}
                    min={0}
                    max={100}
                    onChange={(e) => setNewStakerScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    style={{ width: 50, background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 4, padding: '4px 6px', fontSize: 12 }}
                  />
                  <button onClick={handleAddModerator} style={{ background: '#18C964', color: '#000', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Add</button>
                </div>

                {/* Moderators list */}
                <div style={{ maxHeight: 150, overflowY: 'auto', border: '1px solid #333', borderRadius: 4, padding: 6 }}>
                  {devModerators.map((mod) => {
                    // Determine score category and styling
                    const isRefused = mod.score === 0;
                    const isMedium = mod.score > 0 && mod.score <= 50;
                    const isGood = mod.score > 50;
                    
                    let backgroundColor, textColor, borderColor, icon;
                    if (isRefused) {
                      backgroundColor = '#330000';
                      textColor = '#FF6666';
                      borderColor = '#FF3333';
                      icon = '❌';
                    } else if (isMedium) {
                      backgroundColor = '#332200';
                      textColor = '#FF9933';
                      borderColor = '#FF9500';
                      icon = '🟠';
                    } else {
                      backgroundColor = '#003300';
                      textColor = '#66FF66';
                      borderColor = '#33FF33';
                      icon = '✅';
                    }
                    
                    return (
                      <div key={mod.stakerId} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: '#FFD600', minWidth: 30 }}>#{mod.stakerId}</span>
                        <input
                          type="number"
                          value={mod.score}
                          min={0}
                          max={100}
                          onChange={(e) => handleUpdateModeratorScore(mod.stakerId, Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                          style={{ 
                            width: 40, 
                            background: backgroundColor, 
                            color: textColor, 
                            border: `1px solid ${borderColor}`, 
                            borderRadius: 3, 
                            padding: '2px 4px', 
                            fontSize: 11,
                            textAlign: 'center'
                          }}
                        />
                        <span style={{ fontSize: 9, color: '#888', minWidth: 35 }}>|</span>
                        <input
                          type="number"
                          value={mod.stakedAmount}
                          min={0}
                          max={10000}
                          onChange={(e) => handleUpdateModeratorStake(mod.stakerId, Math.max(0, parseInt(e.target.value) || 0))}
                          style={{ 
                            width: 50, 
                            background: '#111', 
                            color: '#FFD600', 
                            border: '1px solid #333', 
                            borderRadius: 3, 
                            padding: '2px 4px', 
                            fontSize: 10,
                            textAlign: 'center'
                          }}
                          title="Staked amount in WINC"
                        />
                        <span style={{ fontSize: 9, color: '#888' }}>WINC</span>
                        <span style={{ fontSize: 10, color: textColor }}>
                          {icon}
                        </span>
                        <button 
                          onClick={() => handleRemoveModerator(mod.stakerId)} 
                          style={{ 
                            background: '#FF3333', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: 3, 
                            padding: '2px 6px', 
                            fontSize: 10, 
                            cursor: 'pointer',
                            marginLeft: 'auto'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ fontSize: 11, color: '#666', fontStyle: 'italic', marginTop: 8 }}>
                💡 <strong>Hybrid 50/50 System:</strong> Score = 0 = Refused (❌) • Score 1-50 = Medium (🟠) but VALIDATED • Score 51-100 = Good (✅)<br/>
                🏛️ <strong>Democracy (50%)</strong> + 💰 <strong>Plutocracy (50%)</strong>: Vote weight + Stake weight combined<br/>
                📊 Requirements: ≥ 22 moderators + total staked ≥ mint price + 2:1 ratio • Individual stake amounts affect hybrid score<br/>
                🎁 Standard rewards: when 3/3 validated • Premium rewards: only after campaign ends (time = 0)
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
} 