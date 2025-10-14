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

  // Determine video orientation from format or URL
  const isVertical = currentCampaign.film?.format === '9:16' || 
                    currentCampaign.film?.url?.includes('720x1280') ||
                    currentCampaign.film?.fileName?.includes('vertical') ||
                    currentCampaign.film?.fileName?.includes('9:16');

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-around',
      marginTop: 32, 
      gap: 0,
      flexDirection: 'row',
      position: 'relative',
      minHeight: '50vh',
      maxWidth: '75vw',  // Réduit de 90vw à 75vw pour rapprocher encore plus
      margin: '32px auto 0 auto'
    }}>
      {/* Flèche gauche - Position fixe rapprochée */}
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
            position: 'relative',
            zIndex: 10,
            flexShrink: 0
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

      {/* Vidéo container - Centré et adaptatif */}
      <div style={{ 
        position: 'relative', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        height: '100%'  // Utilise toute la hauteur disponible
      }}>
        <div style={{ 
          width: isVertical ? 'min(25vw, 220px)' : 'min(65vw, 550px)', 
          maxWidth: isVertical ? 220 : 550, 
          maxHeight: isVertical ? '45vh' : '40vh',
          aspectRatio: isVertical ? '9/16' : '16/9', 
          background: 'linear-gradient(135deg,#FFD600 60%,#111 100%)', 
          borderRadius: 18, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isVertical 
            ? '0 12px 40px rgba(255, 214, 0, 0.4), 0 0 0 3px rgba(255, 214, 0, 0.15)' 
            : '0 8px 32px rgba(255, 214, 0, 0.25)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isVertical ? 'scale(1.02)' : 'scale(1)'
        }}>
          {/* Vertical video indicator - Design moderne */}
          {isVertical && (
            <div style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6))',
              color: '#FFD600',
              padding: '6px 12px',
              borderRadius: 16,
              fontSize: 11,
              fontWeight: 700,
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 214, 0, 0.3)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}>
              <span style={{ fontSize: 14 }}>📱</span>
              <span>9:16</span>
            </div>
          )}

          {/* Loading indicator */}
          {isVideoLoading && !videoError && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#FFD600',
              fontSize: isVertical ? 14 : 16,
              fontWeight: 600,
              zIndex: 2,
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '8px 16px',
              borderRadius: 20,
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ 
                width: 20, 
                height: 20, 
                border: '2px solid #FFD600', 
                borderTop: '2px solid transparent', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite',
                margin: '0 auto 8px auto'
              }}></div>
              Loading video...
            </div>
          )}

          {/* Error state */}
          {videoError && (
            <div style={{
              textAlign: 'center',
              color: '#FF2D2D',
              fontSize: isVertical ? 14 : 16,
              fontWeight: 600,
              padding: '20px',
              background: 'rgba(255, 45, 45, 0.1)',
              borderRadius: 12,
              margin: '10px'
            }}>
              <div style={{ fontSize: isVertical ? 32 : 40, marginBottom: 8 }}>⚠️</div>
              <div>Video unavailable</div>
              <div style={{ fontSize: 11, color: '#FFD600', marginTop: 4 }}>Click info for details</div>
            </div>
          )}

          {/* Video or placeholder */}
          {currentCampaign.film?.url && !videoError ? (
            <video
              src={currentCampaign.film.url}
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
                console.log('Video failed to load:', currentCampaign.film?.url);
              }}
            />
          ) : !videoError && (
            <span style={{ fontSize: 80, color: '#111', opacity: 0.3 }}>&#9654;</span>
          )}
          

        </div>
        



      </div>

      {/* Flèche droite - Position fixe rapprochée */}
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
            position: 'relative',
            zIndex: 10,
            flexShrink: 0
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

// Add CSS for the spin animation
const styles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('completion-video-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'completion-video-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default CompletionVideoNavigator; 