import React from 'react';

interface ModerationStatsProps {
  stakers: {
    current: number;
    required: number;
  };
  staking: {
    stakedAmount: number;
    mintPrice: number;
  };
  voting: {
    validVotes: number;
    refuseVotes: number;
    requiredRatio: number; // 2:1 = 2, 3:1 = 3, etc.
    totalVotes: number;
  };
  contentType: 'b2c' | 'agency' | 'individual';
}

const ModerationStats: React.FC<ModerationStatsProps> = ({
  stakers,
  staking,
  voting,
  contentType
}) => {
  // Calculs des pourcentages
  const stakersPercentage = Math.min((stakers.current / 22) * 100, 100);
  const stakedPercentage = Math.min((staking.stakedAmount / staking.mintPrice) * 100, 100);
  const validPercentage = voting.totalVotes > 0 ? (voting.validVotes / voting.totalVotes) * 100 : 0;
  const refusePercentage = voting.totalVotes > 0 ? (voting.refuseVotes / voting.totalVotes) * 100 : 0;

  const getContentTypeLabel = () => {
    switch (contentType) {
      case 'b2c': return 'B2C Creation';
      case 'agency': return 'Agency B2C';
      case 'individual': return 'Individual Creation';
      default: return 'Content';
    }
  };

  return (
    <div className="moderation-stats">
      <div className="stats-header">
        <h3>Moderation Progress - {getContentTypeLabel()}</h3>
      </div>
      
      <div className="stats-container">
        {/* Stakers Progress */}
        <div className="stat-item">
          <div className="stat-header">
            <span>22 modérateurs minimum ont voté</span>
            <span className="stat-value">{stakers.current}/22</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill primary" 
              style={{ width: `${Math.min((stakers.current / 22) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Staking Progress */}
        <div className="stat-item">
          <div className="stat-header">
            <span>Total staked amount exceeds MINT price</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill secondary" 
              style={{ width: `${stakedPercentage}%` }}
            />
          </div>
          <div className="staking-comparison">
            <span className="staked-amount">{staking.stakedAmount.toLocaleString()} $WINC</span>
            <span className="mint-price">{staking.mintPrice.toLocaleString()} $WINC</span>
          </div>
        </div>

        {/* Vote Results */}
        <div className="stat-item">
          <div className="stat-header">
            <span>Vote results</span>
            <span className="stat-value">{voting.requiredRatio}:1 ratio needed</span>
          </div>
          <div className="vote-results">
            <div 
              className="vote-valid" 
              style={{ width: `${validPercentage}%` }}
              title={`Valid votes: ${voting.validVotes}`}
            />
            <div 
              className="vote-refuse" 
              style={{ width: `${refusePercentage}%` }}
              title={`Refuse votes: ${voting.refuseVotes}`}
            />
          </div>
          <div className="vote-summary">
            <span className="valid-count">{voting.validVotes} valid</span>
            <span className="refuse-count">{voting.refuseVotes} refuse</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .moderation-stats {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .stats-header h3 {
          color: #FFD700;
          font-size: 18px;
          margin: 0 0 20px 0;
          text-align: center;
        }
        
        .stats-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          color: #ddd;
        }
        
        .stat-value {
          font-weight: bold;
          color: #FFD700;
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        
        .progress-fill.primary {
          background: #FFD700;
        }
        
        .progress-fill.secondary {
          background: #00ff88;
        }
        
        .staking-comparison {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #aaa;
        }
        
        .staked-amount {
          color: #00ff88;
          font-weight: bold;
        }
        
        .mint-price {
          color: #FFD700;
        }
        
        .vote-results {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          display: flex;
        }
        
        .vote-valid {
          height: 100%;
          background: #37FF00;
          transition: width 0.3s ease;
        }
        
        .vote-refuse {
          height: 100%;
          background: #FF0000;
          transition: width 0.3s ease;
        }
        
        .vote-summary {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #aaa;
        }
        
        .valid-count {
          color: #37FF00;
        }
        
        .refuse-count {
          color: #FF0000;
        }
      `}</style>
    </div>
  );
};

export default ModerationStats; 