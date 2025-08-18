import React, { useState } from 'react';

interface CompletionVideoNavigatorProps {
  campaigns: any[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onCampaignInfo: () => void;
}

const CompletionVideoNavigator: React.FC<CompletionVideoNavigatorProps> = ({
  campaigns,
  currentIndex,
  onPrevious,
  onNext,
  onCampaignInfo
}) => {
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  
  const currentCampaign = campaigns[currentIndex];
  const hasMultipleVideos = campaigns.length > 1;

  // Reset loading state when campaign changes
  React.useEffect(() => {
    setIsVideoLoading(true);
    setVideoError(false);
  }, [currentIndex]);

  if (!currentCampaign) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
        <div style={{ 
          width: '90vw', 
          maxWidth: 700, 
          aspectRatio: '16/9', 
          background: 'linear-gradient(135deg,#FFD600 60%,#111 100%)', 
          borderRadius: 18, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div style={{ textAlign: 'center', color: '#111', opacity: 0.5 }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>&#9654;</div>
            <div style={{ fontSize: 16 }}>No campaigns available</div>
          </div>
        </div>
      </div>
    );
  }

  const isVertical = currentCampaign.content?.videoOrientation === 'vertical';

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 32, gap: 20 }}>
      {/* Flèche gauche */}
      {hasMultipleVideos && (
        <button
          onClick={onPrevious}
          style={{
            background: 'rgba(255, 214, 0, 0.1)',
            border: '2px solid #FFD600',
            borderRadius: '50%',
            width: 50,
            height: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#FFD600',
            fontSize: 24,
            fontWeight: 700,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 214, 0, 0.2)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 214, 0, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          aria-label="Previous video"
          title="Previous video (Arrow Left)"
        >
          ←
        </button>
      )}

      {/* Vidéo container */}
      <div style={{ position: 'relative' }}>
        <div style={{ 
          width: isVertical ? 'min(42vw, 200px)' : '85vw', 
          maxWidth: isVertical ? 200 : 650, 
          aspectRatio: isVertical ? '9/16' : '16/9', 
          background: 'linear-gradient(135deg,#FFD600 60%,#111 100%)', 
          borderRadius: 18, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: isVertical ? 'auto' : 'auto',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Loading indicator */}
          {isVideoLoading && !videoError && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#FFD600',
              fontSize: 16,
              fontWeight: 600,
              zIndex: 2
            }}>
              Loading video...
            </div>
          )}

          {/* Error state */}
          {videoError && (
            <div style={{
              textAlign: 'center',
              color: '#FF2D2D',
              fontSize: 16,
              fontWeight: 600
            }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
              <div>Video unavailable</div>
              <div style={{ fontSize: 12, color: '#FFD600', marginTop: 4 }}>Click info for details</div>
            </div>
          )}

          {/* Video or placeholder */}
          {currentCampaign.content?.videoUrl && !videoError ? (
            <video
              src={currentCampaign.content.videoUrl}
              controls
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 18,
                objectFit: 'cover',
                opacity: isVideoLoading ? 0.3 : 1,
                transition: 'opacity 0.3s'
              }}
              onLoadedData={() => setIsVideoLoading(false)}
              onError={() => {
                setVideoError(true);
                setIsVideoLoading(false);
                console.log('Video failed to load:', currentCampaign.content.videoUrl);
              }}
            />
          ) : !videoError && (
            <span style={{ fontSize: 80, color: '#111', opacity: 0.3 }}>&#9654;</span>
          )}
          

        </div>
        



      </div>

      {/* Flèche droite */}
      {hasMultipleVideos && (
        <button
          onClick={onNext}
          style={{
            background: 'rgba(255, 214, 0, 0.1)',
            border: '2px solid #FFD600',
            borderRadius: '50%',
            width: 50,
            height: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#FFD600',
            fontSize: 24,
            fontWeight: 700,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 214, 0, 0.2)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 214, 0, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          aria-label="Next video"
          title="Next video (Arrow Right)"
        >
          →
        </button>
      )}
    </div>
  );
};

export default CompletionVideoNavigator; 