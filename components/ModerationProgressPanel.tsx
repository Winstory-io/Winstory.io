import React from 'react';

interface ModerationProgressPanelProps {
  stakers: number;
  stakersRequired: number;
  stakedAmount: number;
  mintPrice: number;
  validVotes: number;
  refuseVotes: number;
  totalVotes: number;
  averageScore?: number;
  campaignType?: 'creation' | 'completion';
  creatorType?: 'b2c' | 'agency' | 'individual';
  style?: React.CSSProperties;
}

const ModerationProgressPanel: React.FC<ModerationProgressPanelProps> = ({
  stakers,
  stakersRequired,
  stakedAmount,
  mintPrice,
  validVotes,
  refuseVotes,
  totalVotes,
  averageScore,
  campaignType,
  creatorType,
  style
}) => {
  const stakersPercentage = Math.round((stakers / stakersRequired) * 100);
  const stakedPercentage = Math.round((stakedAmount / mintPrice) * 100);
  const validPercentage = totalVotes > 0 ? Math.round((validVotes / totalVotes) * 100) : 0;
  const refusePercentage = totalVotes > 0 ? Math.round((refuseVotes / totalVotes) * 100) : 0;

  const getVoteColor = () => {
    if (totalVotes === 0) return '#665c2e';
    const ratio = validVotes / (validVotes + refuseVotes);
    return ratio >= 0.67 ? '#37FF00' : '#FF0000';
  };

  return (
    <div style={style}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '24px',
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 215, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        minWidth: '320px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: 600,
            color: '#FFD600'
          }}>
            <span>Minimum {stakersRequired} active stakers have voted</span>
            <span>{stakers}/{stakersRequired}</span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 215, 0, 0.2)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(stakersPercentage, 100)}%`,
              height: '100%',
              background: '#FFD600',
              borderRadius: '4px',
              transition: 'width 0.5s ease'
            }}></div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#FFD600',
            textAlign: 'center'
          }}>
            Staking Progress vs MINT Price
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 215, 0, 0.2)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(stakedPercentage, 100)}%`,
              height: '100%',
              background: '#00ff88',
              borderRadius: '4px',
              transition: 'width 0.5s ease'
            }}></div>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: 600,
            color: '#FFD600'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '12px', color: '#999', marginBottom: '2px' }}>Currently Staked</span>
              <span>{stakedAmount} $WINC</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '12px', color: '#999', marginBottom: '2px' }}>MINT Price Target</span>
              <span>{mintPrice} $WINC</span>
            </div>
          </div>
          <div style={{
            fontSize: '12px',
            color: '#999',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            {stakedAmount >= mintPrice ? '✅ MINT price reached!' : `Need ${mintPrice - stakedAmount} more $WINC to reach MINT price`}
          </div>
        </div>

        {/* Score moyen pour les complétions */}
        {campaignType === 'completion' && averageScore !== undefined && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#FFD600',
              textAlign: 'center'
            }}>
              Current Average Score
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '24px',
              fontWeight: 900,
              color: '#00FF00',
              background: 'rgba(0, 255, 0, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              border: '2px solid #00FF00'
            }}>
              {averageScore}/100
            </div>
            <div style={{
              fontSize: '12px',
              color: '#999',
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              {averageScore >= 80 ? '🌟 Excellent quality!' : 
               averageScore >= 60 ? '👍 Good quality' : 
               averageScore >= 40 ? '⚠️ Needs improvement' : '❌ Poor quality'}
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: 600,
            color: '#FFD600'
          }}>
            <span>Vote results</span>
            <span style={{ color: getVoteColor() }}>2:1 ratio needed</span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex'
          }}>
            <div style={{
              width: `${validPercentage}%`,
              height: '100%',
              background: '#37FF00',
              transition: 'width 0.5s ease'
            }}></div>
            <div style={{
              width: `${refusePercentage}%`,
              height: '100%',
              background: '#FF0000',
              transition: 'width 0.5s ease'
            }}></div>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: '#999'
          }}>
            <span>Valid: {validVotes}</span>
            <span>Refuse: {refuseVotes}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModerationProgressPanel; 