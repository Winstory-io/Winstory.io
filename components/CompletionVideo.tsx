import React, { useRef, useEffect, useState } from 'react';

interface CompletionVideoProps {
  videoUrl: string;
  completingText: string;
  onValid: () => void;
  onRefuse: () => void;
  onBubbleClick: (type: string) => void;
}

const CompletionVideo: React.FC<CompletionVideoProps> = ({
  videoUrl,
  completingText,
  onValid,
  onRefuse,
  onBubbleClick
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoHeight, setVideoHeight] = useState(0);

  useEffect(() => {
    if (videoRef.current) {
      setVideoHeight(videoRef.current.clientHeight);
    }
  }, []);

  return (
    <div className="completion-video-container">
      <div className="video-section">
        <video 
          ref={videoRef} 
          src={videoUrl} 
          controls 
          className="completion-video"
        />
      </div>
      
      <div className="completion-footer">
        <div 
          className="completing-bubble" 
          onClick={() => onBubbleClick('completingText')}
        >
          Completing<br/>Text
        </div>
        
        <div className="completion-controls">
          <div className="actions">
            <button 
              className="action-btn approve" 
              onClick={onValid}
              title="Validate & Score this Completion"
            >
              Valid & Score
            </button>
            
            <button 
              className="action-btn reject"
              onClick={onRefuse}
              title="Refuse this Completion"
            >
              Refuse
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .completion-video-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
        }
        
        .video-section {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .completion-video {
          max-width: 100%;
          height: auto;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }
        
        .completion-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        
        .completing-bubble {
          width: 120px;
          height: 120px;
          border: 2px solid #FFD700;
          background: #111;
          color: #FFD700;
          border-radius: 16px;
          cursor: pointer;
          font-weight: bold;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1.2;
          transition: all 0.3s ease;
        }
        
        .completing-bubble:hover {
          background: #FFD700;
          color: #111;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
        }
        
        .completion-controls {
          width: 100%;
          max-width: 400px;
        }
        
        .actions {
          display: flex;
          gap: 16px;
          justify-content: center;
        }
        
        .action-btn {
          padding: 16px 32px;
          border: none;
          border-radius: 12px;
          font-weight: bold;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 140px;
        }
        
        .action-btn.approve {
          background: #37FF00;
          color: #111;
        }
        
        .action-btn.approve:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(55, 255, 0, 0.3);
        }
        
        .action-btn.reject {
          background: #FF0000;
          color: #fff;
        }
        
        .action-btn.reject:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(255, 0, 0, 0.3);
        }
        
        @media (max-width: 768px) {
          .actions {
            flex-direction: column;
            align-items: center;
          }
          
          .action-btn {
            width: 100%;
            max-width: 280px;
          }
          
          .completing-bubble {
            width: 100px;
            height: 100px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default CompletionVideo; 