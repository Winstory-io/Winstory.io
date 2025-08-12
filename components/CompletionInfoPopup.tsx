import React from 'react';

interface CompletionInfoPopupProps {
  isOpen: boolean;
  type: string;
  content: string;
  onClose: () => void;
}

const CompletionInfoPopup: React.FC<CompletionInfoPopupProps> = ({
  isOpen,
  type,
  content,
  onClose
}) => {
  if (!isOpen) return null;

  const getPopupTitle = () => {
    switch (type) {
      case 'initialFilm': return 'Initial Film';
      case 'startingText': return 'Starting Text';
      case 'guideline': return 'Guideline';
      case 'standardReward': return 'Standard Reward';
      case 'premiumReward': return 'Premium Reward';
      case 'completingText': return 'Completing Text';
      default: return 'Information';
    }
  };

  const getPopupIcon = () => {
    switch (type) {
      case 'initialFilm': return '🎬';
      case 'startingText': return '📝';
      case 'guideline': return '📋';
      case 'standardReward': return '🎁';
      case 'premiumReward': return '🏆';
      case 'completingText': return '✍️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <div className="popup-title">
            <span className="popup-icon">{getPopupIcon()}</span>
            {getPopupTitle()}
          </div>
          <button className="close-popup" onClick={onClose}>&times;</button>
        </div>
        
        <div className="popup-body">
          {type === 'initialFilm' ? (
            <div className="video-container">
              <video controls className="popup-video">
                <source src="company_video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div className="text-content">
              {content || `[DYNAMIC: ${getPopupTitle().toLowerCase()} content]`}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        
        .popup-content {
          background: #111;
          border: 2px solid #FFD700;
          border-radius: 16px;
          padding: 24px;
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
        }
        
        .popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .popup-title {
          color: #FFD700;
          font-size: 20px;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .popup-icon {
          font-size: 24px;
        }
        
        .close-popup {
          background: none;
          border: none;
          color: #FFD700;
          font-size: 28px;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .popup-body {
          color: #ddd;
        }
        
        .video-container {
          width: 100%;
          display: flex;
          justify-content: center;
        }
        
        .popup-video {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }
        
        .text-content {
          font-size: 16px;
          line-height: 1.6;
          white-space: pre-wrap;
        }
        
        @media (max-width: 768px) {
          .popup-content {
            padding: 20px;
            margin: 20px;
          }
          
          .popup-title {
            font-size: 18px;
          }
          
          .popup-icon {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default CompletionInfoPopup; 