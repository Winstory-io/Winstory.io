import React from 'react';

interface CompletionInfoProps {
  contentType: 'b2c' | 'agency' | 'individual';
  companyName?: string;
  agencyName?: string;
  campaignTitle: string;
  startingText: string;
  guideline: string;
  standardRewards: string;
  premiumRewards: string;
  onBubbleClick: (type: string) => void;
}

const CompletionInfo: React.FC<CompletionInfoProps> = ({
  contentType,
  companyName,
  agencyName,
  campaignTitle,
  startingText,
  guideline,
  standardRewards,
  premiumRewards,
  onBubbleClick
}) => {
  const getContentTypeLabel = () => {
    switch (contentType) {
      case 'b2c': return companyName || 'B2C Company';
      case 'agency': return `${agencyName} / ${companyName}` || 'Agency B2C';
      case 'individual': return 'Individual Creator';
      default: return 'Creator';
    }
  };

  return (
    <div className="completion-info">
      <div className="info-header">
        <div className="content-type-badge">
          {getContentTypeLabel()}
        </div>
        <div className="campaign-title">
          {campaignTitle}
        </div>
      </div>
      
      <div className="bubbles-container">
        {/* Bulle principale pour le film initial */}
        <button 
          className="bubble large" 
          onClick={() => onBubbleClick('initialFilm')}
        >
          Watch<br/>initial<br/>{contentType === 'individual' ? 'Creator' : 'Company'}<br/>Film
        </button>
        
        {/* Première rangée de bulles */}
        <div className="bubble-row">
          <button 
            className="bubble small" 
            onClick={() => onBubbleClick('startingText')}
          >
            Starting<br/>Text
          </button>
          <button 
            className="bubble small" 
            onClick={() => onBubbleClick('guideline')}
          >
            Guideline
          </button>
        </div>
        
        {/* Deuxième rangée de bulles */}
        <div className="bubble-row">
          <button 
            className="bubble small" 
            onClick={() => onBubbleClick('standardReward')}
          >
            Standard<br/>Reward
          </button>
          <button 
            className="bubble small" 
            onClick={() => onBubbleClick('premiumReward')}
          >
            Premium<br/>Reward
          </button>
        </div>
      </div>

      <style jsx>{`
        .completion-info {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .info-header {
          margin-bottom: 20px;
          text-align: center;
        }
        
        .content-type-badge {
          background: #FFD700;
          color: #111;
          border-radius: 12px;
          padding: 8px 16px;
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 12px;
          display: inline-block;
        }
        
        .campaign-title {
          color: #ddd;
          font-style: italic;
          font-size: 18px;
        }
        
        .bubbles-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        
        .bubble {
          border: 2px solid #FFD700;
          background: #111;
          color: #FFD700;
          border-radius: 16px;
          cursor: pointer;
          font-weight: bold;
          text-align: center;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1.2;
        }
        
        .bubble:hover {
          background: #FFD700;
          color: #111;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
        }
        
        .bubble.large {
          width: 140px;
          height: 140px;
          font-size: 16px;
        }
        
        .bubble.small {
          width: 110px;
          height: 110px;
          font-size: 14px;
        }
        
        .bubble-row {
          display: flex;
          gap: 16px;
        }
        
        @media (max-width: 768px) {
          .bubble.large {
            width: 120px;
            height: 120px;
            font-size: 14px;
          }
          
          .bubble.small {
            width: 90px;
            height: 90px;
            font-size: 12px;
          }
          
          .bubble-row {
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default CompletionInfo; 