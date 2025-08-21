import React, { useState, useEffect } from 'react';

interface CompletionScoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (score: number) => void;
  usedScores: number[];
  contentType: 'b2c' | 'agency' | 'individual';
}

const CompletionScoringModal: React.FC<CompletionScoringModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  usedScores,
  contentType
}) => {
  const [score, setScore] = useState(50);
  const [sliderFillWidth, setSliderFillWidth] = useState(50);

  useEffect(() => {
    if (isOpen) {
      setScore(50);
      setSliderFillWidth(50);
    }
  }, [isOpen]);

  const handleSliderChange = (value: number) => {
    setScore(value);
    setSliderFillWidth(value);
  };

  const getScoreDescription = (score: number) => {
    if (score < 30) return 'Poor quality content';
    if (score < 50) return 'Below average content';
    if (score < 70) return 'Average quality content';
    if (score < 90) return 'Good quality content';
    return 'Excellent quality content';
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return '#ff4444';
    if (score < 50) return '#ff8800';
    if (score < 70) return '#ffcc00';
    if (score < 90) return '#88cc00';
    return '#00ff88';
  };

  const isScoreUsed = (score: number) => usedScores.includes(score);

  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="scoring-popup" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2 className="popup-title">Score this completion</h2>
          <button className="close-popup" onClick={onClose}>&times;</button>
        </div>
        
        <div className="popup-content">
          <p className="scoring-description">
            Move the slider to assign a score from 0 to 100 based on the overall quality of this completion
          </p>
          
          <div className="slider-container">
            <div className="score-labels">
              <span>0</span>
              <span>100</span>
            </div>
            
            <div className="slider-track">
              <input
                type="range"
                min="0"
                max="100"
                value={score}
                onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                className="slider"
                style={{
                  background: `linear-gradient(to right, #ff4444 0%, #ffcc00 50%, #00ff88 100%)`
                }}
              />
              <div 
                className="slider-fill"
                style={{ 
                  width: `${sliderFillWidth}%`,
                  background: `linear-gradient(to right, #ff4444 0%, #ffcc00 50%, #00ff88 100%)`
                }}
              />
            </div>
            
            <div className="current-score" style={{ color: getScoreColor(score) }}>
              {score}
            </div>
          </div>
          
          <div className="unavailable-scores">
            {usedScores.map((usedScore) => (
              <div
                key={usedScore}
                className="unavailable-marker"
                style={{ left: `${usedScore}%` }}
                title={`Score ${usedScore}/100 already used`}
              />
            ))}
          </div>
          
          <div className="score-description">
            {isScoreUsed(score) ? '⚠️ You have already used this score for another completion from this campaign' : getScoreDescription(score)}
          </div>
          
          <button
            className={`score-confirm-btn ${isScoreUsed(score) ? 'disabled' : ''}`}
            onClick={() => !isScoreUsed(score) && onConfirm(score)}
            disabled={isScoreUsed(score)}
            style={{
              opacity: isScoreUsed(score) ? 0.5 : 1,
              cursor: isScoreUsed(score) ? 'not-allowed' : 'pointer'
            }}
          >
            Score {score}/100
          </button>
          
          <div className="score-note">
            <p>Each score can only be used once per campaign by the same moderator. Scores marked as unavailable are those you have already used for other completions from this same initial campaign.</p>
            <p><strong>Content type:</strong> {contentType === 'b2c' ? 'B2C Creation' : contentType === 'agency' ? 'Agency B2C' : 'Individual Creation'}</p>
          </div>
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
        
        .scoring-popup {
          background: #111;
          border: 2px solid #FFD700;
          border-radius: 16px;
          padding: 24px;
          max-width: 550px;
          width: 100%;
          max-height: 90vh;
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
          font-size: 24px;
          font-weight: bold;
          margin: 0;
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
        
        .scoring-description {
          color: #ddd;
          font-size: 16px;
          margin-bottom: 24px;
          text-align: center;
        }
        
        .slider-container {
          width: 100%;
          position: relative;
          margin-bottom: 32px;
        }
        
        .score-labels {
          display: flex;
          justify-content: space-between;
          color: #aaa;
          margin-bottom: 8px;
        }
        
        .slider-track {
          position: relative;
          width: 100%;
          height: 12px;
        }
        
        .slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 12px;
          background: rgba(51, 51, 51, 0.5);
          border-radius: 10px;
          outline: none;
          position: absolute;
          top: 0;
          left: 0;
          margin: 0;
          z-index: 2;
        }
        
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #FFD700;
          cursor: pointer;
          border: 3px solid #111;
          box-shadow: 0 0 5px rgba(0,0,0,0.5);
        }
        
        .slider-fill {
          position: absolute;
          height: 100%;
          border-radius: 10px;
          top: 0;
          left: 0;
          z-index: 1;
        }
        
        .current-score {
          font-size: 48px;
          font-weight: bold;
          margin-top: 20px;
          text-align: center;
          transition: color 0.3s;
        }
        
        .unavailable-scores {
          position: relative;
          width: 100%;
          height: 20px;
          margin-bottom: 20px;
        }
        
        .unavailable-marker {
          position: absolute;
          width: 4px;
          height: 15px;
          background: rgba(255, 255, 255, 0.5);
          transform: translateX(-50%);
          border-radius: 2px;
        }
        
        .score-description {
          font-size: 18px;
          margin-bottom: 25px;
          color: #ddd;
          height: 27px;
          text-align: center;
        }
        
        .score-confirm-btn {
          background: #FFD700;
          color: #111;
          border: none;
          padding: 15px 40px;
          border-radius: 8px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 20px;
          width: 100%;
        }
        
        .score-confirm-btn:hover:not(.disabled) {
          transform: translateY(-3px);
          box-shadow: 0 0 5px #FFD700, 0 0 10px #FFD700;
        }
        
        .score-note {
          font-size: 14px;
          color: #888;
          text-align: center;
        }
        
        .score-note p {
          margin: 8px 0;
        }
      `}</style>
    </div>
  );
};

export default CompletionScoringModal; 