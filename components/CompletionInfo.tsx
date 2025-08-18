import React from 'react';

interface CompletionInfoProps {
  campaign: any;
  getTimeLeft: () => string;
  getCompletionStats: () => { minted: number; available: number };
}

const CompletionInfo: React.FC<CompletionInfoProps> = ({
  campaign,
  getTimeLeft,
  getCompletionStats
}) => {
  const stats = getCompletionStats();

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      marginTop: 20, 
      marginBottom: 15,
      gap: 12, 
      flexWrap: 'wrap',
      padding: '0 20px'
    }}>
      {/* Time left */}
      <div style={{ 
        background: 'rgba(255, 214, 0, 0.1)', 
        border: '1px solid #FFD600', 
        borderRadius: 10, 
        padding: '6px 12px', 
        fontSize: 13,
        color: '#FFD600',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        minWidth: 100,
        justifyContent: 'center'
      }}>
        <span>⏰</span>
        <span>{getTimeLeft()}</span>
      </div>

      {/* Completion price */}
      <div style={{ 
        background: 'rgba(78, 203, 113, 0.1)', 
        border: '1px solid #4ECB71', 
        borderRadius: 10, 
        padding: '6px 12px', 
        fontSize: 13,
        color: '#4ECB71',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        minWidth: 100,
        justifyContent: 'center'
      }}>
        <span>💰</span>
        <span>{campaign?.rewards?.completionPrice || 'Free'}</span>
      </div>

      {/* MINT stats */}
      <div style={{ 
        background: 'rgba(255, 45, 45, 0.1)', 
        border: '1px solid #FF2D2D', 
        borderRadius: 10, 
        padding: '6px 12px', 
        fontSize: 13,
        color: '#FF2D2D',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        minWidth: 100,
        justifyContent: 'center'
      }}>
        <span>🎯</span>
        <span>{stats.minted} / {stats.available} MINT</span>
      </div>
    </div>
  );
};

export default CompletionInfo; 