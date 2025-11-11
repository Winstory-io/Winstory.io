import React from 'react';

interface ModerationStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stakers: number;
  stakedAmount: number;
  mintPrice: number;
  validVotes: number;
  refuseVotes: number;
  totalVotes: number;
  averageScore?: number;
  campaignType: 'creation' | 'completion';
  creatorType: 'b2c' | 'agency' | 'individual';
  stakeYes?: number;
  stakeNo?: number;
}

const ModerationStatsModal: React.FC<ModerationStatsModalProps> = ({ 
  isOpen, 
  onClose, 
  stakers,
  stakedAmount,
  mintPrice,
  validVotes,
  refuseVotes,
  totalVotes,
  averageScore,
  campaignType,
  creatorType,
  stakeYes,
  stakeNo
}) => {
  if (!isOpen) return null;

  const validPercentage = totalVotes > 0 ? Math.round((validVotes / totalVotes) * 100) : 0;
  const refusePercentage = totalVotes > 0 ? Math.round((refuseVotes / totalVotes) * 100) : 0;
  // Hybrid 50/50 scoring
  const yesStake = stakeYes ?? 0;
  const noStake = stakeNo ?? 0;
  const totalStakeSides = yesStake + noStake;
  const demYes = totalVotes > 0 ? validVotes / totalVotes : 0;
  const demNo = totalVotes > 0 ? refuseVotes / totalVotes : 0;
  const plutoYes = totalStakeSides > 0 ? yesStake / totalStakeSides : 0;
  const plutoNo = totalStakeSides > 0 ? noStake / totalStakeSides : 0;
  const scoreYes = (demYes + plutoYes) / 2;
  const scoreNo = (demNo + plutoNo) / 2;
  const isValidationAchieved = (scoreYes >= 2 * scoreNo) || (scoreNo >= 2 * scoreYes);

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toString();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)',
          border: '2px solid #FFD600',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '1200px',
          maxHeight: '85vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(255, 215, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
          paddingBottom: '16px'
        }}>
          <h1 style={{
            color: '#FFD600',
            fontSize: '28px',
            fontWeight: 'bold',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            📊 Moderation Statistics
          </h1>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#FFD600',
              fontSize: '32px',
              cursor: 'pointer',
              fontWeight: 'bold',
              padding: '8px',
              borderRadius: '50%',
              transition: 'all 0.2s ease',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            ×
          </button>
        </div>

        {/* Content - Statistics Grid */}
        <div style={{ color: '#fff', lineHeight: '1.6' }}>
          
          {/* Main Stats Grid */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '32px',
            justifyContent: 'center'
          }}>
            
            {/* Stakers Information */}
            <div style={{
              background: 'rgba(255, 215, 0, 0.05)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              borderRadius: '12px',
              padding: '18px',
              flex: '1',
              minWidth: '280px',
              maxWidth: '350px'
            }}>
              <h3 style={{
                color: '#FFD600',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                👥 Active Moderators
              </h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00FF00', marginBottom: '6px' }}>
                {stakers}
              </div>
              <div style={{ fontSize: '12px', color: '#ccc' }}>
                Stakers currently participating in this moderation session
              </div>
            </div>

            {/* Staked Amount */}
            <div style={{
              background: 'rgba(255, 215, 0, 0.05)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              borderRadius: '12px',
              padding: '18px',
              flex: '1',
              minWidth: '280px',
              maxWidth: '350px'
            }}>
              <h3 style={{
                color: '#FFD600',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                💰 Total Staked
              </h3>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00FF00', marginBottom: '4px' }}>
                {formatAmount(stakedAmount)} WINC
              </div>
              <div style={{ fontSize: '12px', color: '#ccc', marginBottom: '6px' }}>
                vs {formatAmount(mintPrice)} WINC MINT price
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: stakedAmount >= mintPrice ? '#00FF00' : '#FF6B6B',
                fontWeight: '600'
              }}>
                {stakedAmount >= mintPrice ? '✅ Sufficient stake' : '⚠️ Below MINT price'}
              </div>
            </div>

            {/* Voting Results */}
            <div style={{
              background: 'rgba(255, 215, 0, 0.05)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              borderRadius: '12px',
              padding: '18px',
              flex: '1',
              minWidth: '280px',
              maxWidth: '350px'
            }}>
              <h3 style={{
                color: '#FFD600',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                🗳️ Vote Results
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FF6B6B' }}>
                    {refuseVotes} Refuse ({refusePercentage}%)
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#00FF00' }}>
                    {validVotes} Valid ({validPercentage}%)
                  </div>
                </div>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                background: '#333',
                borderRadius: '3px',
                overflow: 'hidden',
                marginBottom: '6px'
              }}>
                <div style={{
                  width: `${refusePercentage}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #FF6B6B, #FF4444)',
                  float: 'left'
                }}></div>
                <div style={{
                  width: `${validPercentage}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #00FF00, #00CC00)',
                  float: 'left'
                }}></div>
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: isValidationAchieved ? '#00FF00' : '#FF6B6B',
                fontWeight: '600'
              }}>
                {isValidationAchieved ? '✅ Hybrid 2:1 threshold reached' : '⚠️ Below Hybrid 2:1 threshold'}
              </div>
            </div>
          </div>

          {/* Scoring Section (for completions) */}
          {campaignType === 'completion' && averageScore !== undefined && (
            <div style={{
              background: 'rgba(255, 215, 0, 0.05)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              borderRadius: '12px',
              padding: '18px',
              marginBottom: '20px'
            }}>
              <h3 style={{
                color: '#FFD600',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                🎯 Quality Scoring
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFD600' }}>
                    {averageScore.toFixed(1)}/100
                  </div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>
                    Average Score
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: '#333',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${averageScore}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, 
                        ${averageScore < 30 ? '#FF4444' : 
                          averageScore < 50 ? '#FF8800' : 
                          averageScore < 70 ? '#FFD600' : 
                          averageScore < 90 ? '#88FF00' : '#00FF00'}, 
                        ${averageScore < 30 ? '#FF6B6B' : 
                          averageScore < 50 ? '#FFAA00' : 
                          averageScore < 70 ? '#FFE600' : 
                          averageScore < 90 ? '#AAFF00' : '#00FF88'})`
                    }}></div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#ccc', marginTop: '3px' }}>
                    {averageScore < 30 ? 'Poor Quality' : 
                     averageScore < 50 ? 'Below Average' : 
                     averageScore < 70 ? 'Average Quality' : 
                     averageScore < 90 ? 'Good Quality' : 'Excellent Quality'}
                  </div>
                </div>
              </div>
            </div>
          )}


        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid rgba(255, 215, 0, 0.3)',
          paddingTop: '20px',
          marginTop: '24px',
          textAlign: 'center'
        }}>
          <button
            style={{
              background: 'linear-gradient(135deg, #FFD600 0%, #e6c300 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#000',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModerationStatsModal; 