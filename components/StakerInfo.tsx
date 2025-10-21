import React, { useState } from 'react';

interface StakerInfoProps {
  stakerData: {
    stakedAmount: number;
    stakeAgeDays: number;
    moderatorXP: number;
    isEligible: boolean;
  } | null;
}

const StakerInfo: React.FC<StakerInfoProps> = ({ stakerData }) => {
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  
  if (!stakerData) return null;

  const { stakedAmount, stakeAgeDays, moderatorXP, isEligible } = stakerData;

  const handleEligibilityClick = () => {
    setShowEligibilityModal(true);
  };

  const EligibilityModal = () => {
    if (!showEligibilityModal) return null;

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={() => setShowEligibilityModal(false)}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            border: `2px solid ${isEligible ? '#18C964' : '#FF2D2D'}`,
            borderRadius: 16,
            padding: '32px',
            maxWidth: 500,
            maxHeight: '80vh',
            overflowY: 'auto',
            color: '#fff',
            position: 'relative',
            boxShadow: `0 0 30px ${isEligible ? 'rgba(24, 201, 100, 0.3)' : 'rgba(255, 45, 45, 0.3)'}`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={() => setShowEligibilityModal(false)}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'none',
              border: 'none',
              color: isEligible ? '#18C964' : '#FF2D2D',
              fontSize: 24,
              cursor: 'pointer',
              padding: 8,
              borderRadius: 4
            }}
          >
            ✕
          </button>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 16, color: isEligible ? '#18C964' : '#FF2D2D' }}>
              {isEligible ? '✅' : '⚠️'}
            </div>
            <h2 style={{
              color: isEligible ? '#18C964' : '#FF2D2D',
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 8
            }}>
              Eligibility Status
            </h2>
            <p style={{
              color: '#ccc',
              fontSize: 16,
              lineHeight: 1.5
            }}>
              {isEligible 
                ? 'You are eligible for rewards and XP when moderating content'
                : 'You can participate in moderation but won\'t earn rewards or XP'
              }
            </p>
          </div>

          {/* Current Status */}
          <div style={{
            background: isEligible ? 'rgba(24, 201, 100, 0.1)' : 'rgba(255, 45, 45, 0.1)',
            border: `1px solid ${isEligible ? '#18C964' : '#FF2D2D'}`,
            borderRadius: 12,
            padding: 20,
            marginBottom: 24
          }}>
            <h3 style={{
              color: '#FFD600',
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
              textAlign: 'center'
            }}>
              Your Current Status
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 16,
              fontSize: 14
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#888', marginBottom: 4 }}>Staked Amount</div>
                <div style={{
                  fontWeight: 600,
                  color: isEligible ? '#18C964' : '#FF2D2D',
                  fontSize: 16
                }}>
                  {stakedAmount} WINC
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#888', marginBottom: 4 }}>Stake Age</div>
                <div style={{
                  fontWeight: 600,
                  color: isEligible ? '#18C964' : '#FF2D2D',
                  fontSize: 16
                }}>
                  {stakeAgeDays} days
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#888', marginBottom: 4 }}>Moderator XP</div>
                <div style={{
                  fontWeight: 600,
                  color: isEligible ? '#18C964' : '#FF2D2D',
                  fontSize: 16
                }}>
                  {moderatorXP}
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div style={{
            background: isEligible ? 'rgba(0, 255, 0, 0.1)' : 'rgba(0, 255, 0, 0.1)',
            border: '1px solid #00FF00',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24
          }}>
            <h3 style={{
              color: '#00FF00',
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
              textAlign: 'center'
            }}>
              {isEligible ? '🎉 Eligibility Achieved!' : '💡 Requirements for Rewards & XP'}
            </h3>
            
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
              <div style={{ marginBottom: 12 }}>
                <strong style={{ color: '#00FF00' }}>Minimum Stake:</strong>
                <span style={{ color: '#fff', marginLeft: 8 }}>
                  {stakedAmount < 50 ? '❌' : '✅'} 50 WINC
                  {stakedAmount < 50 && (
                    <span style={{ color: '#FF2D2D', marginLeft: 8 }}>
                      (Need {50 - stakedAmount} more)
                    </span>
                  )}
                  {isEligible && stakedAmount >= 50 && (
                    <span style={{ color: '#18C964', marginLeft: 8 }}>
                      (Exceeds by {stakedAmount - 50})
                    </span>
                  )}
                </span>
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <strong style={{ color: '#00FF00' }}>Minimum Age:</strong>
                <span style={{ color: '#fff', marginLeft: 8 }}>
                  {stakeAgeDays < 7 ? '❌' : '✅'} 7 days
                  {stakeAgeDays < 7 && (
                    <span style={{ color: '#FF2D2D', marginLeft: 8 }}>
                      (Need {7 - stakeAgeDays} more days)
                    </span>
                  )}
                  {isEligible && stakeAgeDays >= 7 && (
                    <span style={{ color: '#18C964', marginLeft: 8 }}>
                      (Exceeds by {stakeAgeDays - 7} days)
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <>
      <div 
        style={{
          background: isEligible 
            ? 'rgba(24, 201, 100, 0.1)' 
            : 'rgba(255, 45, 45, 0.1)',
          border: `1px solid ${isEligible ? '#18C964' : '#FF2D2D'}`,
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={handleEligibilityClick}
        onMouseEnter={(e) => {
          if (isEligible) {
            e.currentTarget.style.background = 'rgba(24, 201, 100, 0.2)';
            e.currentTarget.style.borderColor = '#4ADE80';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(24, 201, 100, 0.4)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            // Activer l'effet neon vert
            const neonElement = e.currentTarget.querySelector('.neon-glow') as HTMLElement;
            if (neonElement) {
              neonElement.style.opacity = '1';
            }
          } else {
            e.currentTarget.style.background = 'rgba(255, 45, 45, 0.2)';
            e.currentTarget.style.borderColor = '#FF6B6B';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 45, 45, 0.4)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            // Activer l'effet neon rouge
            const neonElement = e.currentTarget.querySelector('.neon-glow') as HTMLElement;
            if (neonElement) {
              neonElement.style.opacity = '1';
            }
          }
        }}
        onMouseLeave={(e) => {
          if (isEligible) {
            e.currentTarget.style.background = 'rgba(24, 201, 100, 0.1)';
            e.currentTarget.style.borderColor = '#18C964';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
            // Désactiver l'effet neon vert
            const neonElement = e.currentTarget.querySelector('.neon-glow') as HTMLElement;
            if (neonElement) {
              neonElement.style.opacity = '0';
            }
          } else {
            e.currentTarget.style.background = 'rgba(255, 45, 45, 0.1)';
            e.currentTarget.style.borderColor = '#FF2D2D';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
            // Désactiver l'effet neon rouge
            const neonElement = e.currentTarget.querySelector('.neon-glow') as HTMLElement;
            if (neonElement) {
              neonElement.style.opacity = '0';
            }
          }
        }}
      >
        {/* Neon glow effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 8,
          background: isEligible 
            ? 'linear-gradient(45deg, transparent, rgba(24, 201, 100, 0.1), transparent)'
            : 'linear-gradient(45deg, transparent, rgba(255, 45, 45, 0.1), transparent)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none'
        }}
        className="neon-glow"
        />
        
        <div style={{ 
          fontSize: 14, 
          fontWeight: 600, 
          color: isEligible ? '#18C964' : '#FF2D2D',
          marginBottom: 8,
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          {isEligible ? '✅ Eligible for Rewards' : '⚠️ Can Vote (No Rewards)'}
          <span style={{
            fontSize: 12,
            marginLeft: 8,
            opacity: 0.7
          }}>
            (Click for details)
          </span>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: 8,
          fontSize: 12,
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#888', marginBottom: 2 }}>Stake</div>
            <div style={{ 
              fontWeight: 600, 
              color: isEligible ? '#18C964' : '#FF2D2D' 
            }}>
              {stakedAmount} WINC
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#888', marginBottom: 2 }}>Age</div>
            <div style={{ 
              fontWeight: 600, 
              color: isEligible ? '#18C964' : '#FF2D2D' 
            }}>
              {stakeAgeDays} days
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#888', marginBottom: 2 }}>XP</div>
            <div style={{ 
              fontWeight: 600, 
              color: isEligible ? '#18C964' : '#FF2D2D' 
            }}>
              {moderatorXP}
            </div>
          </div>
        </div>
        
        {!isEligible && (
          <div style={{ 
            fontSize: 11, 
            color: '#FF2D2D', 
            marginTop: 8,
            textAlign: 'center',
            fontStyle: 'italic',
            position: 'relative',
            zIndex: 1
          }}>
            You can vote but won't earn rewards or XP
          </div>
        )}
      </div>
      
      <EligibilityModal />
    </>
  );
};

export default StakerInfo;
