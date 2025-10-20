'use client';

import React, { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Lazy load pour éviter les erreurs SSR
const DevControls = dynamic(() => import('@/components/DevControls'), { ssr: false });
const SuperModeratorInterface = dynamic(() => import('@/components/SuperModeratorInterface'), { ssr: false });

interface CommunityCompletion {
  id: string;
  campaignId: string;
  campaignTitle: string;
  completionTitle: string;
  completerWallet: string;
  date: string;
  status: 'minted' | 'ai_evaluated' | 'community_moderating' | 'pending_moderation' | 'community_validated' | 'super_moderated' | 'final_validated' | 'final_refused';
  communityData: {
    validVotes: number;
    refuseVotes: number;
    averageScore: number;
    decision: 'PENDING' | 'VALID' | 'REFUSE';
    stakersCount: number;
    stakingPool: number;
  };
  superModeratorData?: {
    voteDecision: 'VALID' | 'REFUSE';
    score?: number;
    finalScore?: number;
    finalDecision?: 'VALID' | 'REFUSE';
    timestamp: string;
  };
  videoUrl?: string;
  story?: string;
}

interface SuperModeratorVoteResult {
  success: boolean;
  finalDecision: 'VALID' | 'REFUSE';
  finalScore: number;
  communityScore: number;
  communityDecision: 'VALID' | 'REFUSE';
}

export default function CommunityCompletionsPage() {
  const account = useActiveAccount();
  const router = useRouter();
  const [completions, setCompletions] = useState<CommunityCompletion[]>([]);
  const [selectedCompletion, setSelectedCompletion] = useState<CommunityCompletion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTooltipModal, setShowTooltipModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'moderated'>('pending');

  // Charger les complétions communautaires
  useEffect(() => {
    const loadCommunityCompletions = async () => {
      if (!account?.address) return;

      setIsLoading(true);
      try {
        // TODO: Remplacer par un vrai appel API
        // Pour l'instant, simulation avec des données mock
        const mockCompletions: CommunityCompletion[] = [
          {
            id: 'completion_001',
            campaignId: 'campaign_123',
            campaignTitle: 'B2C Campaign - Community Completions',
            completionTitle: 'MINT: 2024-01-15 10:30:00',
            completerWallet: '0x1234...5678',
            date: '2024-01-15T10:30:00Z',
            status: 'minted',
            communityData: {
              validVotes: 26,
              refuseVotes: 8,
              averageScore: 78.4,
              decision: 'VALID',
              stakersCount: 34,
              stakingPool: 1250.50
            },
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            story: 'This is a creative completion story that demonstrates the user\'s understanding of the campaign requirements. The user has created an innovative solution that showcases their creativity and technical skills.'
          },
          {
            id: 'completion_002',
            campaignId: 'campaign_456',
            campaignTitle: 'B2C Campaign - Community Completions',
            completionTitle: 'MINT: 2024-01-16 14:20:00',
            completerWallet: '0x9876...5432',
            date: '2024-01-16T14:20:00Z',
            status: 'ai_evaluated',
            communityData: {
              validVotes: 15,
              refuseVotes: 12,
              averageScore: 65.2,
              decision: 'VALID',
              stakersCount: 27,
              stakingPool: 890.75
            },
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            story: 'A comprehensive digital art completion that showcases advanced techniques and creative vision. This submission demonstrates mastery of digital tools and artistic expression.'
          },
          {
            id: 'completion_003',
            campaignId: 'campaign_999',
            campaignTitle: 'B2C Campaign - Community Completions',
            completionTitle: 'MINT: 2024-01-18 13:45:00',
            completerWallet: '0x7777...8888',
            date: '2024-01-18T13:45:00Z',
            status: 'community_moderating',
            communityData: {
              validVotes: 8,
              refuseVotes: 2,
              averageScore: 0,
              decision: 'PENDING',
              stakersCount: 10,
              stakingPool: 320.50
            },
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            story: 'A new service completion that is currently being moderated by the community while Super-Moderation is available.'
          },
          {
            id: 'completion_004',
            campaignId: 'campaign_789',
            campaignTitle: 'B2C Campaign - Community Completions',
            completionTitle: 'MINT: 2024-01-17 09:15:00',
            completerWallet: '0x5555...9999',
            date: '2024-01-17T09:15:00Z',
            status: 'super_moderated',
            communityData: {
              validVotes: 22,
              refuseVotes: 5,
              averageScore: 82.1,
              decision: 'VALID',
              stakersCount: 27,
              stakingPool: 1100.25
            },
            superModeratorData: {
              voteDecision: 'VALID',
              score: 91,
              finalScore: 84.6,
              finalDecision: 'VALID',
              timestamp: '2024-01-17T11:30:00Z'
            },
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            story: 'An innovative service completion that demonstrates exceptional problem-solving skills and customer focus. This submission shows deep understanding of user needs and creative solutions.'
          }
        ];

        setCompletions(mockCompletions);
        console.log('📊 Complétions communautaires chargées:', mockCompletions);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des complétions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCommunityCompletions();
  }, [account?.address]);

  const handleVoteSubmitted = (result: SuperModeratorVoteResult) => {
    console.log('✅ Vote Super-Modérateur soumis:', result);
    
    // Mettre à jour la complétion avec le résultat
    if (selectedCompletion) {
      const updatedCompletion: CommunityCompletion = {
        ...selectedCompletion,
        status: 'super_moderated',
        superModeratorData: {
          voteDecision: result.finalDecision,
          score: result.finalScore,
          finalScore: result.finalScore,
          finalDecision: result.finalDecision,
          timestamp: new Date().toISOString()
        }
      };

      setCompletions(prev => 
        prev.map(comp => 
          comp.id === selectedCompletion.id ? updatedCompletion : comp
        )
      );

      // Close voting interface
      setSelectedCompletion(null);
      
      // Show success message
      alert(`Super-Moderator vote submitted successfully!\nFinal Decision: ${result.finalDecision}\nFinal Score: ${result.finalScore}/100`);
    }
  };

  const getStatusColor = (status: CommunityCompletion['status']) => {
    switch (status) {
      case 'minted': return '#ffffff';
      case 'ai_evaluated': return '#ffffff';
      case 'community_moderating': return '#ffffff';
      case 'pending_moderation': return '#FFD600';
      case 'community_validated': return '#00FF00';
      case 'super_moderated': return '#FFD600';
      case 'final_validated': return '#00FF00';
      case 'final_refused': return '#FF2D2D';
      default: return '#ccc';
    }
  };

  const getStatusLabel = (status: CommunityCompletion['status']) => {
    switch (status) {
      case 'minted': return 'MINTED';
      case 'ai_evaluated': return 'AI EVALUATED';
      case 'community_moderating': return 'COMMUNITY MODERATING';
      case 'pending_moderation': return 'PENDING MODERATION';
      case 'community_validated': return 'COMMUNITY VALIDATED';
      case 'super_moderated': return 'SUPER-MODERATED';
      case 'final_validated': return 'FINAL VALIDATED';
      case 'final_refused': return 'FINAL REFUSED';
      default: return 'UNKNOWN STATUS';
    }
  };

  const filteredCompletions = completions.filter(completion => {
    if (activeTab === 'pending') {
      // Super-Modérateur peut intervenir dès le MINT + AI Evaluation, en parallèle des stakers
      return completion.status === 'minted' || 
             completion.status === 'ai_evaluated' || 
             completion.status === 'community_moderating' ||
             completion.status === 'community_validated' || 
             completion.status === 'pending_moderation';
    } else {
      return completion.status === 'super_moderated' || completion.status === 'final_validated' || completion.status === 'final_refused';
    }
  });

  if (!account?.address) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        padding: '2rem'
      }}>
        <h1 style={{ color: '#FFD600', fontSize: '2rem', marginBottom: '1rem' }}>
          Community Completions
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', textAlign: 'center' }}>
          Connect your wallet to access the Super-Moderator interface
        </p>
        <button
          onClick={() => router.push('/welcome')}
          style={{
            background: '#FFD600',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      padding: '2rem'
    }}>
      {/* Dev Controls */}
      <DevControls />
      
      {/* Header moderne et épuré */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '3rem',
        padding: '0 2rem'
      }}>
        {/* Bouton retour minimaliste */}
        <button
          onClick={() => router.push('/mywin/creations')}
          style={{
            padding: '8px 16px',
            background: 'rgba(0, 255, 0, 0.1)',
            color: 'rgba(0, 255, 0, 0.8)',
            border: '1px solid rgba(0, 255, 0, 0.3)',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 255, 0, 0.15)';
            e.currentTarget.style.color = 'rgba(0, 255, 0, 1)';
            e.currentTarget.style.borderColor = 'rgba(0, 255, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)';
            e.currentTarget.style.color = 'rgba(0, 255, 0, 0.8)';
            e.currentTarget.style.borderColor = 'rgba(0, 255, 0, 0.3)';
          }}
        >
          ← Validated Campaign
        </button>

        {/* Titre principal moderne */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <h1 style={{
            color: '#ffffff',
            fontSize: '2rem',
            fontWeight: '600',
            margin: 0,
            letterSpacing: '-0.02em'
          }}>
            Community Completions
          </h1>
          
          {/* Badge Super-Moderator */}
          <div style={{
            background: 'linear-gradient(135deg, #FFD600, #FFA500)',
            color: '#000',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}>
            SUPER-MODERATOR
          </div>
          
          {/* Tooltip info */}
          <div style={{
            position: 'relative',
            display: 'inline-block'
          }}>
            <img
              src="/tooltip.svg"
              alt="Info"
              style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
                opacity: '0.7'
              }}
              onClick={() => setShowTooltipModal(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.7';
              }}
            />
          </div>
        </div>

        {/* Espace équilibre */}
        <div style={{ width: '120px' }}></div>
      </div>

      {/* Navigation moderne */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '2rem',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'pending' ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
            color: activeTab === 'pending' ? '#000000' : '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Pending ({completions.filter(c => c.status === 'community_validated' || c.status === 'pending_moderation').length})
        </button>
        <button
          onClick={() => setActiveTab('moderated')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'moderated' ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
            color: activeTab === 'moderated' ? '#000000' : '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Moderated ({completions.filter(c => c.status === 'super_moderated' || c.status === 'final_validated' || c.status === 'final_refused').length})
        </button>
      </div>

      {/* Liste des complétions */}
      {isLoading ? (
        <div style={{
          textAlign: 'center',
          color: '#FFD600',
          fontSize: '18px'
        }}>
          Loading completions...
        </div>
      ) : filteredCompletions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          color: '#ccc',
          fontSize: '18px',
          padding: '2rem'
        }}>
          No completions {activeTab === 'pending' ? 'pending' : 'moderated'}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {filteredCompletions.map((completion) => (
            <div
              key={completion.id}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
              onClick={() => setSelectedCompletion(completion)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    lineHeight: '1.3'
                  }}>
                    MINT: {new Date(completion.date).toLocaleString()}
                  </h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}>
                    {completion.completerWallet.slice(0, 6)}...{completion.completerWallet.slice(-4)}
                  </p>
                </div>
                <div style={{
                  background: getStatusColor(completion.status),
                  color: '#000',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  letterSpacing: '0.5px'
                }}>
                  {getStatusLabel(completion.status)}
                </div>
              </div>

              {/* Community Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '10px', marginBottom: '4px' }}>YES</div>
                  <div style={{ color: '#00FF88', fontWeight: '600', fontSize: '14px' }}>{completion.communityData.validVotes}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '10px', marginBottom: '4px' }}>NO</div>
                  <div style={{ color: '#FF4757', fontWeight: '600', fontSize: '14px' }}>{completion.communityData.refuseVotes}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '10px', marginBottom: '4px' }}>SCORE</div>
                  <div style={{ color: '#FFD700', fontWeight: '600', fontSize: '14px' }}>{completion.communityData.averageScore}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '10px', marginBottom: '4px' }}>DECISION</div>
                  <div style={{ 
                    color: completion.communityData.decision === 'VALID' ? '#00FF88' : completion.communityData.decision === 'REFUSE' ? '#FF4757' : '#FFD700', 
                    fontWeight: '600', 
                    fontSize: '14px'
                  }}>
                    {completion.communityData.decision}
                  </div>
                </div>
              </div>

              {/* Completion Content Access */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                {completion.videoUrl && (
                  <button
                    onClick={() => {
                      // Open video in popup modal
                      const videoModal = document.createElement('div');
                      videoModal.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.9);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                        padding: 20px;
                      `;
                      
                      videoModal.innerHTML = `
                        <div style="background: #000; border-radius: 12px; padding: 20px; max-width: 90vw; max-height: 90vh; position: relative; border: 2px solid #FFD600;">
                          <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 10px; right: 10px; background: #FF2D2D; color: #fff; border: none; border-radius: 50%; width: 30px; height: 30px; font-size: 16px; font-weight: bold; cursor: pointer;">×</button>
                          <div style="font-size: 18px; font-weight: bold; color: #FFD600; margin-bottom: 16px; text-align: center;">🎬 Completion Video</div>
                          <video controls style="width: 100%; max-height: 70vh; border-radius: 8px;">
                            <source src="${completion.videoUrl}" type="video/mp4">
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      `;
                      
                      // Close modal when clicking outside
                      videoModal.addEventListener('click', (e) => {
                        if (e.target === videoModal) {
                          videoModal.remove();
                        }
                      });
                      
                      document.body.appendChild(videoModal);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                  >
                    🎬 Video
                  </button>
                )}
                {completion.story && (
                  <button
                    onClick={() => {
                      // Show story in popup modal
                      const storyModal = document.createElement('div');
                      storyModal.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.9);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                        padding: 20px;
                      `;
                      
                      storyModal.innerHTML = `
                        <div style="background: #000; border-radius: 12px; padding: 20px; max-width: 80vw; max-height: 80vh; position: relative; border: 2px solid #FFD600; overflow: auto;">
                          <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 10px; right: 10px; background: #FF2D2D; color: #fff; border: none; border-radius: 50%; width: 30px; height: 30px; font-size: 16px; font-weight: bold; cursor: pointer;">×</button>
                          <div style="font-size: 18px; font-weight: bold; color: #FFD600; margin-bottom: 16px; text-align: center;">📖 Completing Story</div>
                          <div style="font-size: 16px; line-height: 1.6; color: #fff; white-space: pre-wrap; padding: 16px; background: rgba(255, 215, 0, 0.05); border-radius: 8px; border: 1px solid rgba(255, 215, 0, 0.2);">${completion.story}</div>
                        </div>
                      `;
                      
                      // Close modal when clicking outside
                      storyModal.addEventListener('click', (e) => {
                        if (e.target === storyModal) {
                          storyModal.remove();
                        }
                      });
                      
                      document.body.appendChild(storyModal);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                  >
                    📖 Story
                  </button>
                )}
              </div>

              {/* Super-Moderator Stats */}
              {completion.superModeratorData && (
                <div style={{
                  marginTop: '12px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  background: 'rgba(255, 215, 0, 0.05)',
                  border: '1px solid rgba(255, 215, 0, 0.2)',
                  borderRadius: '8px',
                  padding: '16px',
                  fontSize: '12px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '10px', marginBottom: '4px' }}>SUPER-VOTE</div>
                    <div style={{ 
                      color: completion.superModeratorData.voteDecision === 'VALID' ? '#00FF88' : '#FF4757', 
                      fontWeight: '600', 
                      fontSize: '14px'
                    }}>
                      {completion.superModeratorData.voteDecision}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '10px', marginBottom: '4px' }}>SUPER-SCORE</div>
                    <div style={{ color: '#FFD700', fontWeight: '600', fontSize: '14px' }}>
                      {completion.superModeratorData.score || 'N/A'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '10px', marginBottom: '4px' }}>FINAL SCORE</div>
                    <div style={{ color: '#FFD700', fontWeight: '600', fontSize: '14px' }}>
                      {completion.superModeratorData.finalScore}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Super-Modérateur */}
      {selectedCompletion && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedCompletion(null);
            }
          }}
        >
          <div style={{
            position: 'relative',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            {/* Bouton de fermeture */}
            <button
              onClick={() => setSelectedCompletion(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(255, 45, 45, 0.8)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '20px',
                cursor: 'pointer',
                zIndex: 1001
              }}
            >
              ×
            </button>

            {/* Interface Super-Modérateur */}
            <SuperModeratorInterface
              campaignId={selectedCompletion.campaignId}
              completionId={selectedCompletion.id}
              completionTitle={selectedCompletion.completionTitle}
              completionVideoUrl={selectedCompletion.videoUrl}
              completingStory={selectedCompletion.story}
              communityData={selectedCompletion.communityData}
              onVoteSubmitted={handleVoteSubmitted}
            />
          </div>
        </div>
      )}

      {/* Super-Moderator Info Modal */}
      {showTooltipModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTooltipModal(false);
            }
          }}
        >
          <div style={{
            background: '#000',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '80vw',
            maxHeight: '80vh',
            position: 'relative',
            border: '2px solid #FFD600',
            overflow: 'auto'
          }}>
            <button
              onClick={() => setShowTooltipModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#FF2D2D',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
            
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#FFD600',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              👑 Super-Moderator System
            </div>
            
            <div style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#fff',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: '#FFD600', fontSize: '18px', marginBottom: '12px' }}>
                What is Community Completions?
              </h3>
              <p style={{ marginBottom: '16px' }}>
                This interface allows campaign creators to review and moderate content as soon as it's MINTED and AI-evaluated. Super-Moderation happens in parallel with community moderation, not after it. All content displayed here is ready for Super-Moderation.
              </p>
              
              <h3 style={{ color: '#FFD600', fontSize: '18px', marginBottom: '12px' }}>
                Super-Moderator Role
              </h3>
              <p style={{ marginBottom: '16px' }}>
                As a Super-Moderator, you are the campaign creator with special powers to:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>• <strong>Override community decisions</strong> - Change VALID to REFUSE or vice versa</li>
                <li style={{ marginBottom: '8px' }}>• <strong>Apply 51/49 weighting</strong> - Your score counts for 51% vs community's 49%</li>
                <li style={{ marginBottom: '8px' }}>• <strong>Review completion content</strong> - Watch videos and read stories before voting</li>
                <li style={{ marginBottom: '8px' }}>• <strong>Make final decisions</strong> - Your vote determines the ultimate outcome</li>
              </ul>
              
              <h3 style={{ color: '#FFD600', fontSize: '18px', marginBottom: '12px' }}>
                How the 51/49 System Works
              </h3>
              <p style={{ marginBottom: '16px' }}>
                <strong>Final Score = (Community Score × 49%) + (Your Score × 51%)</strong>
              </p>
              <p style={{ marginBottom: '16px' }}>
                This weighting system ensures that while community input is respected, the campaign creator has the final say in content quality and alignment with campaign goals.
              </p>
              
              <h3 style={{ color: '#FFD600', fontSize: '18px', marginBottom: '12px' }}>
                Parallel Moderation System
              </h3>
              <p style={{ marginBottom: '16px' }}>
                Super-Moderation happens simultaneously with community moderation, not sequentially. You can intervene as soon as content is MINTED and AI-evaluated, while stakers are still voting. This ensures faster decision-making and better quality control.
              </p>
              
              <h3 style={{ color: '#FFD600', fontSize: '18px', marginBottom: '12px' }}>
                Non-Blocking System
              </h3>
              <p style={{ marginBottom: '16px' }}>
                Even if you vote REFUSE, the content remains accessible. This system is designed to provide guidance and quality control without blocking the creative flow.
              </p>
              
              <div style={{
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '20px'
              }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#FFD600', fontWeight: 'bold' }}>
                  💡 Remember: You can only Super-Moderate campaigns you created. This ensures authentic quality control from the original campaign vision.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
