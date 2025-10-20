'use client';

import React, { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';

interface SuperModeratorInterfaceProps {
  campaignId: string;
  completionId: string;
  completionTitle: string;
  completionVideoUrl?: string;
  completingStory?: string;
  communityData: {
    validVotes: number;
    refuseVotes: number;
    averageScore: number;
    decision: 'PENDING' | 'VALID' | 'REFUSE';
    stakersCount: number;
    stakingPool: number;
  };
  onVoteSubmitted: (result: SuperModeratorVoteResult) => void;
}

interface SuperModeratorVoteResult {
  success: boolean;
  finalDecision: 'VALID' | 'REFUSE';
  finalScore: number;
  communityScore: number;
  communityDecision: 'VALID' | 'REFUSE';
}

interface SuperModeratorVoteData {
  campaignId: string;
  superModeratorWallet: string;
  completionId: string;
  voteDecision: 'VALID' | 'REFUSE';
  score?: number;
}

export default function SuperModeratorInterface({
  campaignId,
  completionId,
  completionTitle,
  completionVideoUrl,
  completingStory,
  communityData,
  onVoteSubmitted
}: SuperModeratorInterfaceProps) {
  const account = useActiveAccount();
  const [voteDecision, setVoteDecision] = useState<'VALID' | 'REFUSE' | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScoreInput, setShowScoreInput] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);

  // Vérifier l'autorisation du Super-Modérateur
  useEffect(() => {
    const checkAuthorization = async () => {
      if (!account?.address) {
        setIsAuthorized(false);
        return;
      }

      try {
        const response = await fetch(`/api/moderation/verify-super-moderator?campaignId=${campaignId}&wallet=${account.address}`);
        const result = await response.json();
        setIsAuthorized(result.isAuthorized);
      } catch (error) {
        console.error('Error during authorization check:', error);
        setIsAuthorized(false);
      }
    };

    checkAuthorization();
  }, [account?.address, campaignId]);

  const handleVoteChange = (decision: 'VALID' | 'REFUSE') => {
    setVoteDecision(decision);
    if (decision === 'VALID') {
      setShowScoreInput(true);
      setScore(50); // Score par défaut
    } else {
      setShowScoreInput(false);
      setScore(0);
    }
  };

  const handleScoreChange = (newScore: number) => {
    if (newScore >= 1 && newScore <= 100) {
      setScore(newScore);
    }
  };

  const handleSubmitVote = async () => {
    if (!voteDecision || !account?.address) return;

    setIsSubmitting(true);

    try {
      const voteData: SuperModeratorVoteData = {
        campaignId,
        superModeratorWallet: account.address,
        completionId,
        voteDecision,
        score: voteDecision === 'VALID' ? score : undefined
      };

      console.log('🔍 [SUPER MODERATOR] Soumission du vote:', voteData);

      const response = await fetch('/api/moderation/super-moderator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voteData),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ [SUPER MODERATOR] Vote soumis avec succès:', result);
        
        const voteResult: SuperModeratorVoteResult = {
          success: true,
          finalDecision: result.finalDecision,
          finalScore: result.finalScore,
          communityScore: result.communityScore,
          communityDecision: result.communityDecision
        };

        onVoteSubmitted(voteResult);
      } else {
        console.error('❌ [SUPER MODERATOR] Error during submission:', result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ [SUPER MODERATOR] Error:', error);
      alert('Error during vote submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si pas encore vérifié
  if (isAuthorized === null) {
    return (
      <div style={{
        padding: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid #FFD600',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <div style={{ color: '#FFD600', fontSize: '18px', marginBottom: '10px' }}>
          🔍 Checking authorization...
        </div>
      </div>
    );
  }

  // Si pas autorisé
  if (!isAuthorized) {
    return (
      <div style={{
        padding: '20px',
        background: 'rgba(255, 45, 45, 0.1)',
        border: '2px solid #FF2D2D',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <div style={{ color: '#FF2D2D', fontSize: '18px', marginBottom: '10px' }}>
          ❌ Not Authorized
        </div>
        <div style={{ color: '#ccc', fontSize: '14px' }}>
          Only the creator of this campaign can exercise the Super-Moderator role
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      background: 'rgba(0, 0, 0, 0.9)',
      border: '2px solid #FFD600',
      borderRadius: '16px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      {/* En-tête Super-Modérateur */}
      <div style={{
        textAlign: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(255, 215, 0, 0.3)'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#FFD600',
          marginBottom: '8px'
        }}>
          👑 Super-Moderator
        </div>
        <div style={{
          fontSize: '16px',
          color: '#fff',
          marginBottom: '4px'
        }}>
          {completionTitle}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#ccc'
        }}>
          Decision Override + 51/49 Weighting
        </div>
      </div>

      {/* Community Data */}
      <div style={{
        background: 'rgba(0, 255, 0, 0.1)',
        border: '1px solid rgba(0, 255, 0, 0.3)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#00FF00',
          marginBottom: '12px'
        }}>
          📊 Community Moderation
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          fontSize: '14px'
        }}>
          <div>
            <div style={{ color: '#ccc' }}>YES Votes</div>
            <div style={{ color: '#00FF00', fontWeight: 'bold' }}>{communityData.validVotes}</div>
          </div>
          <div>
            <div style={{ color: '#ccc' }}>NO Votes</div>
            <div style={{ color: '#FF2D2D', fontWeight: 'bold' }}>{communityData.refuseVotes}</div>
          </div>
          <div>
            <div style={{ color: '#ccc' }}>Avg Score</div>
            <div style={{ color: '#FFD600', fontWeight: 'bold' }}>{communityData.averageScore}/100</div>
          </div>
          <div>
            <div style={{ color: '#ccc' }}>Decision</div>
            <div style={{ 
              color: communityData.decision === 'VALID' ? '#00FF00' : '#FF2D2D', 
              fontWeight: 'bold' 
            }}>
              {communityData.decision === 'VALID' ? 'VALIDATED' : 'REFUSED'}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Content Access */}
      {(completionVideoUrl || completingStory) && (
        <div style={{
          background: 'rgba(255, 215, 0, 0.1)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#FFD600',
            marginBottom: '12px'
          }}>
            🎬 Completion Content Review
          </div>
          
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {completionVideoUrl && (
              <button
                onClick={() => setShowVideoModal(true)}
                style={{
                  flex: '1',
                  minWidth: '200px',
                  padding: '12px 16px',
                  background: 'rgba(255, 215, 0, 0.2)',
                  border: '1px solid rgba(255, 215, 0, 0.5)',
                  borderRadius: '8px',
                  color: '#FFD600',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 215, 0, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 215, 0, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🎬 Watch Completion Video
              </button>
            )}
            
            {completingStory && (
              <button
                onClick={() => setShowStoryModal(true)}
                style={{
                  flex: '1',
                  minWidth: '200px',
                  padding: '12px 16px',
                  background: 'rgba(255, 215, 0, 0.2)',
                  border: '1px solid rgba(255, 215, 0, 0.5)',
                  borderRadius: '8px',
                  color: '#FFD600',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 215, 0, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 215, 0, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                📖 Read Completing Story
              </button>
            )}
          </div>
        </div>
      )}

      {/* Voting Interface */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#fff',
          marginBottom: '16px'
        }}>
          🗳️ Your Super-Moderator Decision
        </div>

        {/* Decision Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => handleVoteChange('VALID')}
            style={{
              flex: 1,
              padding: '16px',
              background: voteDecision === 'VALID' ? '#00FF00' : 'rgba(0, 255, 0, 0.1)',
              border: `2px solid ${voteDecision === 'VALID' ? '#00FF00' : 'rgba(0, 255, 0, 0.3)'}`,
              borderRadius: '8px',
              color: voteDecision === 'VALID' ? '#000' : '#00FF00',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            ✅ VALIDATE
          </button>
          <button
            onClick={() => handleVoteChange('REFUSE')}
            style={{
              flex: 1,
              padding: '16px',
              background: voteDecision === 'REFUSE' ? '#FF2D2D' : 'rgba(255, 45, 45, 0.1)',
              border: `2px solid ${voteDecision === 'REFUSE' ? '#FF2D2D' : 'rgba(255, 45, 45, 0.3)'}`,
              borderRadius: '8px',
              color: voteDecision === 'REFUSE' ? '#fff' : '#FF2D2D',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            ❌ REFUSE
          </button>
        </div>

        {/* Score Input for Validation */}
        {showScoreInput && (
          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#FFD600',
              marginBottom: '12px'
            }}>
              📊 Score out of 100 (51% Weighting)
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <input
                type="range"
                min="1"
                max="100"
                value={score}
                onChange={(e) => handleScoreChange(parseInt(e.target.value))}
                style={{
                  flex: 1,
                  height: '8px',
                  background: 'rgba(255, 215, 0, 0.3)',
                  borderRadius: '4px',
                  outline: 'none'
                }}
              />
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#FFD600',
                minWidth: '40px',
                textAlign: 'center'
              }}>
                {score}
              </div>
            </div>
            <div style={{
              fontSize: '12px',
              color: '#ccc',
              marginTop: '8px',
              textAlign: 'center'
            }}>
              Final Score = (Community × 49%) + (Your Score × 51%)
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmitVote}
        disabled={!voteDecision || isSubmitting}
        style={{
          width: '100%',
          padding: '16px',
          background: voteDecision && !isSubmitting ? '#FFD600' : 'rgba(255, 215, 0, 0.3)',
          border: 'none',
          borderRadius: '8px',
          color: voteDecision && !isSubmitting ? '#000' : '#666',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: voteDecision && !isSubmitting ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s ease'
        }}
      >
        {isSubmitting ? '⏳ Submitting...' : '🚀 Submit Super-Moderator Vote'}
      </button>

      {/* Super-Moderator Powers Information */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: 'rgba(255, 215, 0, 0.05)',
        border: '1px solid rgba(255, 215, 0, 0.2)',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#ccc',
        textAlign: 'center'
      }}>
        <div style={{ fontWeight: 'bold', color: '#FFD600', marginBottom: '4px' }}>
          💡 Super-Moderator Powers
        </div>
        <div>• Override community decision</div>
        <div>• 51% weighted score vs 49% community</div>
        <div>• Non-blocking final decision</div>
      </div>

      {/* Video Modal */}
      {showVideoModal && completionVideoUrl && (
        <div style={{
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
        }}>
          <div style={{
            background: '#000',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            position: 'relative',
            border: '2px solid #FFD600'
          }}>
            <button
              onClick={() => setShowVideoModal(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#FF2D2D',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                fontSize: '16px',
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
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#FFD600',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              🎥 Completion Video
            </div>
            
            <video
              controls
              style={{
                width: '100%',
                maxHeight: '70vh',
                borderRadius: '8px'
              }}
            >
              <source src={completionVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Story Modal */}
      {showStoryModal && completingStory && (
        <div style={{
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
        }}>
          <div style={{
            background: '#000',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '80vw',
            maxHeight: '80vh',
            position: 'relative',
            border: '2px solid #FFD600',
            overflow: 'auto'
          }}>
            <button
              onClick={() => setShowStoryModal(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#FF2D2D',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                fontSize: '16px',
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
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#FFD600',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              📖 Completing Story
            </div>
            
            <div style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#fff',
              whiteSpace: 'pre-wrap',
              padding: '16px',
              background: 'rgba(255, 215, 0, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 215, 0, 0.2)'
            }}>
              {completingStory}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}