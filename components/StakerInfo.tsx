import React from 'react';

interface StakerInfoProps {
  stakerData: {
    stakedAmount: number;
    stakeAgeDays: number;
    moderatorXP: number;
    isEligible: boolean;
  } | null;
}

const StakerInfo: React.FC<StakerInfoProps> = ({ stakerData }) => {
  if (!stakerData) {
    return (
      <div style={{
        background: 'rgba(255, 214, 0, 0.1)',
        border: '1px solid #FFD600',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 14, color: '#FFD600', fontWeight: 600 }}>
          🔍 Loading staker data...
        </div>
      </div>
    );
  }

  const { stakedAmount, stakeAgeDays, moderatorXP, isEligible } = stakerData;

  return (
    <div style={{
      background: isEligible 
        ? 'rgba(24, 201, 100, 0.1)' 
        : 'rgba(255, 45, 45, 0.1)',
      border: `1px solid ${isEligible ? '#18C964' : '#FF2D2D'}`,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16
    }}>
      <div style={{ 
        fontSize: 14, 
        fontWeight: 600, 
        color: isEligible ? '#18C964' : '#FF2D2D',
        marginBottom: 8,
        textAlign: 'center'
      }}>
        {isEligible ? '✅ Eligible Staker' : '❌ Non-Eligible Staker'}
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: 8,
        fontSize: 12
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
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#888', marginBottom: 2 }}>Vote Weight</div>
          <div style={{ 
            fontWeight: 600, 
            color: isEligible ? '#18C964' : '#FF2D2D' 
          }}>
            {isEligible ? '50% + 50%' : '0%'}
          </div>
        </div>
      </div>
      
      {!isEligible && (
        <div style={{ 
          fontSize: 11, 
          color: '#FF2D2D', 
          marginTop: 8,
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          Minimum: 50 WINC + 7 days age
        </div>
      )}
      
      {isEligible && (
        <div style={{ 
          fontSize: 11, 
          color: '#18C964', 
          marginTop: 8,
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          Framework V1: Plutocracy + Democracy
        </div>
      )}
    </div>
  );
};

export default StakerInfo;
