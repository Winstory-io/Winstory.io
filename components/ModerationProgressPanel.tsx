import React from 'react';

interface ModerationProgressPanelProps {
  stakers: number;
  stakedAmount: number;
  mintPrice: number;
  validVotes: number;
  refuseVotes: number;
  totalVotes: number;
  averageScore?: number;
  campaignType?: 'creation' | 'completion';
  creatorType?: 'b2c' | 'agency' | 'individual';
  style?: React.CSSProperties;
  onClick?: () => void;
  stakeYes?: number;
  stakeNo?: number;
}

const ModerationProgressPanel: React.FC<ModerationProgressPanelProps> = ({
  stakers,
  stakedAmount,
  mintPrice,
  validVotes,
  refuseVotes,
  totalVotes,
  averageScore,
  campaignType,
  creatorType,
  style,
  onClick,
  stakeYes,
  stakeNo
}) => {
  // Calculs pour les 3 conditions de validation
  const condition1Met = totalVotes >= 22; // 22 modérateurs minimum ont voté
  const condition2Met = stakedAmount >= mintPrice; // $WINC Staked > MINT price

  // Hybrid 50/50 score calculation
  const totalStakeSides = (stakeYes ?? 0) + (stakeNo ?? 0);
  const demYes = totalVotes > 0 ? validVotes / totalVotes : 0;
  const demNo = totalVotes > 0 ? refuseVotes / totalVotes : 0;
  const plutoYes = totalStakeSides > 0 ? (stakeYes ?? 0) / totalStakeSides : 0;
  const plutoNo = totalStakeSides > 0 ? (stakeNo ?? 0) / totalStakeSides : 0;
  const scoreYes = (demYes + plutoYes) / 2;
  const scoreNo = (demNo + plutoNo) / 2;
  const condition3Met = (scoreYes >= 2 * scoreNo) || (scoreNo >= 2 * scoreYes);

  // Calcul du pourcentage de remplissage pour le score
  const getScoreFillPercentage = (score: number) => {
    return Math.max(0, Math.min(100, score));
  };

  // Couleur dynamique du score (rouge -> orange -> jaune -> vert clair -> vert foncé)
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#00FF00'; // Vert foncé
    if (score >= 60) return '#90EE90'; // Vert clair
    if (score >= 40) return '#FFD700'; // Jaune
    if (score >= 20) return '#FFA500'; // Orange
    return '#FF0000'; // Rouge
  };

  // Couleur de fond du score
  const getScoreBackgroundColor = (score: number) => {
    if (score >= 80) return 'rgba(0, 255, 0, 0.1)';
    if (score >= 60) return 'rgba(144, 238, 144, 0.1)';
    if (score >= 40) return 'rgba(255, 215, 0, 0.1)';
    if (score >= 20) return 'rgba(255, 165, 0, 0.1)';
    return 'rgba(255, 0, 0, 0.1)';
  };

  // Couleur de bordure du score
  const getScoreBorderColor = (score: number) => {
    if (score >= 80) return '#00FF00';
    if (score >= 60) return '#90EE90';
    if (score >= 40) return '#FFD700';
    if (score >= 20) return '#FFA500';
    return '#FF0000';
  };

  return (
    <div style={style}>
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px', // Augmenté de 12px à 16px pour plus d'espace
          padding: '18px', // Augmenté de 16px à 18px
          background: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          minWidth: '340px', // Augmenté de 320px à 340px
          maxHeight: '55vh', // Augmenté de 45vh à 55vh pour plus d'espace
          overflow: 'hidden',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease'
        }}
        onClick={onClick}
        onMouseEnter={(e) => {
          if (onClick) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
          }
        }}
        onMouseLeave={(e) => {
          if (onClick) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)';
          }
        }}
      >
        
        {/* Condition 1: 22 modérateurs minimum ont voté */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px' // Augmenté de 6px à 8px
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px', // Augmenté de 13px à 14px
            fontWeight: 600,
            color: condition1Met ? '#00FF00' : '#FFD600'
          }}>
            <span>Minimum 22 moderators voted</span>
            <span style={{ color: condition1Met ? '#00FF00' : '#FFD600' }}>
              {totalVotes}/22
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '6px', // Augmenté de 4px à 6px
            background: 'rgba(255, 215, 0, 0.2)',
            borderRadius: '3px', // Augmenté de 2px à 3px
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, (totalVotes / 22) * 100)}%`,
              height: '100%',
              background: condition1Met ? '#00FF00' : '#FFD600',
              borderRadius: '3px', // Augmenté de 2px à 3px
              transition: 'width 0.3s ease'
            }}></div>
          </div>
          <div style={{
            fontSize: '11px', // Augmenté de 10px à 11px
            color: '#999',
            textAlign: 'center'
          }}>
            {totalVotes}/22 - {22 - totalVotes} votes remaining
          </div>
        </div>

        {/* Condition 2: $WINC Staked > MINT price */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px' // Augmenté de 6px à 8px
        }}>
          <div style={{
            fontSize: '13px', // Augmenté de 12px à 13px
            fontWeight: 600,
            color: condition2Met ? '#00FF00' : '#FFD600',
            textAlign: 'center'
          }}>
            $WINC Staked &gt; MINT Price
          </div>
          <div style={{
            width: '100%',
            height: '6px', // Augmenté de 4px à 6px
            background: 'rgba(0, 255, 0, 0.2)',
            borderRadius: '3px', // Augmenté de 2px à 3px
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: `${Math.min(100, (stakedAmount / mintPrice) * 100)}%`,
              height: '100%',
              background: condition2Met ? '#00FF00' : '#FFD600',
              borderRadius: '3px', // Augmenté de 2px à 3px
              transition: 'width 0.3s ease'
            }}></div>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px', // Augmenté de 10px à 11px
            color: '#999'
          }}>
            <span>Currently Staked: {stakedAmount} $WINC</span>
            <span>MINT Price: {mintPrice} $WINC</span>
          </div>
          <div style={{
            fontSize: '11px', // Augmenté de 10px à 11px
            color: condition2Met ? '#00FF00' : '#999',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            {condition2Met ? '✅ Condition 2 met!' : 'Staking insufficient'}
          </div>
        </div>

        {/* Condition 3 et Score - Layout horizontal pour économiser la hauteur */}
        <div style={{
          display: 'flex',
          gap: '16px', // Augmenté de 12px à 16px
          alignItems: 'flex-start'
        }}>
          {/* Condition 3: 2:1 ratio minimum Valid/Refuse */}
          <div style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px' // Augmenté de 6px à 8px
          }}>
            <div style={{
              fontSize: '12px', // Augmenté de 11px à 12px
              fontWeight: 600,
              color: '#FFD600',
              textAlign: 'center'
            }}>
              Hybrid 50/50: score ≥ 2:1 (Yes vs No)
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px' // Augmenté de 8px à 10px
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: '#999', marginBottom: '2px' }}>Refuse</span>
                <span style={{ color: '#FF0000', fontSize: '16px', fontWeight: 'bold' }}>{Math.round(scoreNo * 100)}%</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: '#999', marginBottom: '2px' }}>Valid</span>
                <span style={{ color: '#00FF00', fontSize: '16px', fontWeight: 'bold' }}>{Math.round(scoreYes * 100)}%</span>
              </div>
            </div>
            <div style={{
              fontSize: '10px', // Augmenté de 9px à 10px
              color: condition3Met ? '#00FF00' : '#999',
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              {condition3Met ? '✅ Threshold reached (2:1)' : 'Below 2:1 threshold'}
            </div>
          </div>

          {/* Score moyen pour les complétions - À côté de la condition 3 */}
          {campaignType === 'completion' && averageScore !== undefined && (
            <div style={{
              flex: '1',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px', // Augmenté de 6px à 8px
              alignItems: 'center'
            }}>
              <div style={{
                fontSize: '12px', // Augmenté de 11px à 12px
                fontWeight: 600,
                color: '#FFD600',
                textAlign: 'center'
              }}>
                Current Average Score
              </div>
              <div style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '18px', // Augmenté de 16px à 18px
                fontWeight: '900',
                color: getScoreColor(averageScore),
                background: getScoreBackgroundColor(averageScore),
                borderRadius: '8px', // Augmenté de 6px à 8px
                padding: '10px', // Augmenté de 8px à 10px
                border: `2px solid ${getScoreBorderColor(averageScore)}`,
                minWidth: '80px', // Augmenté de 70px à 80px
                minHeight: '40px' // Augmenté de 35px à 40px
              }}>
                {/* Barre de remplissage proportionnelle au score */}
                <div style={{
                  position: 'absolute',
                  left: '0',
                  top: '0',
                  bottom: '0',
                  width: `${getScoreFillPercentage(averageScore)}%`,
                  background: getScoreColor(averageScore),
                  borderRadius: '6px', // Augmenté de 4px à 6px
                  opacity: 0.3,
                  zIndex: 1
                }}></div>
                {/* Score au-dessus de la barre */}
                <span style={{ position: 'relative', zIndex: 2 }}>
                  {averageScore}/100
                </span>
              </div>
              <div style={{
                fontSize: '10px', // Augmenté de 9px à 10px
                color: getScoreColor(averageScore),
                textAlign: 'center',
                fontStyle: 'italic'
              }}>
                {averageScore >= 80 ? '🌟 Excellent!' : 
                 averageScore >= 60 ? '👍 Good' : 
                 averageScore >= 40 ? '⚠️ Needs work' : '❌ Poor'}
              </div>
            </div>
          )}
        </div>

        {/* Résumé des conditions - Plus lisible */}
        <div style={{
          padding: '10px', // Augmenté de 8px à 10px
          background: 'rgba(255, 215, 0, 0.1)',
          borderRadius: '8px', // Augmenté de 6px à 8px
          border: '1px solid rgba(255, 215, 0, 0.3)'
        }}>
          <div style={{
            fontSize: '13px', // Augmenté de 12px à 13px
            fontWeight: '700',
            color: '#FFD600',
            textAlign: 'center',
            marginBottom: '8px' // Augmenté de 6px à 8px
          }}>
            Validation Status
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px' // Augmenté de 8px à 10px
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px', // Augmenté de 4px à 5px
              fontSize: '11px', // Augmenté de 10px à 11px
              color: condition1Met ? '#00FF00' : '#999'
            }}>
              <span>22 moderators</span>
              <span>{condition1Met ? '✅' : '❌'}</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px', // Augmenté de 4px à 5px
              fontSize: '11px', // Augmenté de 10px à 11px
              color: condition2Met ? '#00FF00' : '#999'
            }}>
              <span>$WINC staked</span>
              <span>{condition2Met ? '✅' : '❌'}</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px', // Augmenté de 4px à 5px
              fontSize: '11px', // Augmenté de 10px à 11px
              color: condition3Met ? '#00FF00' : '#999'
            }}>
              <span>Hybrid 2:1</span>
              <span>{condition3Met ? '✅' : '❌'}</span>
            </div>
          </div>
          {condition1Met && condition2Met && condition3Met && (
            <div style={{
              fontSize: '12px', // Augmenté de 11px à 12px
              fontWeight: '700',
              color: '#00FF00',
              textAlign: 'center',
              marginTop: '8px', // Augmenté de 6px à 8px
              padding: '6px', // Augmenté de 4px à 6px
              background: 'rgba(0, 255, 0, 0.1)',
              borderRadius: '6px', // Augmenté de 4px à 6px
              border: '1px solid #00FF00'
            }}>
              🎉 All conditions met!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModerationProgressPanel; 