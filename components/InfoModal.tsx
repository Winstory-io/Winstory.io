import React, { useState, useRef, useEffect } from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: string;
  content: string;
  videoUrl?: string;
  // Optional structured rewards for $WINC pool
  wincPool?: {
    top1?: string;
    top2?: string;
    top3?: string;
    moderators?: string;
    platform?: string;
  };
}

const InfoModal: React.FC<InfoModalProps> = ({ 
  isOpen, 
  onClose, 
  title,
  icon,
  content,
  videoUrl,
  wincPool
}) => {
  const [videoOrientation, setVideoOrientation] = useState<'horizontal' | 'vertical' | 'square'>('horizontal');
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset states when modal opens/closes or videoUrl changes
  useEffect(() => {
    if (isOpen && videoUrl) {
      setIsVideoLoaded(false);
      setVideoError(false);
      setVideoOrientation('horizontal');
    }
  }, [isOpen, videoUrl]);

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      const { videoWidth, videoHeight } = videoRef.current;
      console.log('Video dimensions:', { videoWidth, videoHeight });
      
      if (videoWidth && videoHeight) {
        const aspectRatio = videoWidth / videoHeight;
        console.log('Aspect ratio:', aspectRatio);
        
        if (aspectRatio > 1.3) {
          setVideoOrientation('horizontal');
        } else if (aspectRatio < 0.75) {
          setVideoOrientation('vertical');
        } else {
          setVideoOrientation('square');
        }
        setIsVideoLoaded(true);
        console.log('Video orientation set to:', aspectRatio > 1.3 ? 'horizontal' : aspectRatio < 0.75 ? 'vertical' : 'square');
      }
    }
  };

  const handleVideoError = () => {
    console.error('Video failed to load');
    setVideoError(true);
  };

  if (!isOpen) return null;

  // Adaptive modal dimensions based on video orientation
  const getModalMaxWidth = () => {
    if (!videoUrl) return '800px';
    switch (videoOrientation) {
      case 'vertical':
        return '500px';
      case 'square':
        return '600px';
      default:
        return '800px';
    }
  };

  const getVideoStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      borderRadius: '12px',
      border: '1px solid rgba(0, 255, 0, 0.3)',
      boxShadow: '0 4px 20px rgba(0, 255, 0, 0.2)',
      backgroundColor: '#000'
    };

    if (!isVideoLoaded) {
      return {
        ...baseStyles,
        width: '100%',
        maxWidth: '500px',
        height: 'auto'
      };
    }

    switch (videoOrientation) {
      case 'vertical':
        return {
          ...baseStyles,
          width: 'auto',
          height: '500px',
          maxHeight: '60vh',
          maxWidth: '100%',
          objectFit: 'contain'
        };
      case 'square':
        return {
          ...baseStyles,
          width: '400px',
          height: '400px',
          maxWidth: '100%',
          maxHeight: '60vh',
          objectFit: 'contain'
        };
      default:
        return {
          ...baseStyles,
          width: '100%',
          maxWidth: '600px',
          height: 'auto',
          objectFit: 'contain'
        };
    }
  };

  const getVideoClassName = () => {
    return `info-modal-video info-modal-video--${videoOrientation}`;
  };

  return (
    <>
      <style jsx>{`
        .info-modal-video {
          border-radius: 12px !important;
          border: 1px solid rgba(0, 255, 0, 0.3) !important;
          box-shadow: 0 4px 20px rgba(0, 255, 0, 0.2) !important;
          background-color: #000 !important;
          object-fit: contain !important;
        }
        
        .info-modal-video--vertical {
          width: auto !important;
          height: 500px !important;
          max-height: 60vh !important;
          max-width: 100% !important;
        }
        
        .info-modal-video--square {
          width: 400px !important;
          height: 400px !important;
          max-width: 100% !important;
          max-height: 60vh !important;
        }
        
        .info-modal-video--horizontal {
          width: 100% !important;
          max-width: 600px !important;
          height: auto !important;
        }
        
        .info-modal-video:not(.info-modal-video--loaded) {
          width: 100% !important;
          max-width: 500px !important;
          height: auto !important;
        }
      `}</style>
      
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          backdropFilter: 'blur(8px)'
        }}
        onClick={onClose}
      >
        <div 
          style={{
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)',
            border: '2px solid #FFD600',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: getModalMaxWidth(),
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(255, 215, 0, 0.3)',
            width: '100%'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with close button */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
            paddingBottom: '16px'
          }}>
            <h1 style={{
              color: '#FFD600',
              fontSize: '28px',
              fontWeight: 'bold',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {icon} {title}
            </h1>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#FFD600',
                fontSize: '32px',
                cursor: 'pointer',
                fontWeight: 'bold',
                padding: '8px',
                borderRadius: '50%',
                transition: 'all 0.2s ease',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div style={{ color: '#fff', lineHeight: '1.6' }}>
            {videoUrl ? (
              <div>
                <div style={{
                  background: 'rgba(255, 215, 0, 0.05)',
                  border: '1px solid rgba(255, 215, 0, 0.2)',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <p style={{ 
                    margin: '0 0 16px 0', 
                    fontSize: '16px', 
                    color: '#FFD600',
                    fontWeight: '600'
                  }}>
                    This is the original video that the completer is responding to:
                  </p>
                  
                  {/* Debug info - remove in production */}
                  {isVideoLoaded && (
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#888', 
                      margin: '0 0 8px 0' 
                    }}>
                      Detected orientation: {videoOrientation}
                    </p>
                  )}
                  
                  {videoError ? (
                    <div style={{
                      padding: '40px',
                      backgroundColor: '#333',
                      borderRadius: '12px',
                      color: '#fff'
                    }}>
                      <p>Unable to load video</p>
                    </div>
                  ) : (
                    <video 
                      ref={videoRef}
                      src={videoUrl} 
                      controls 
                      onLoadedMetadata={handleVideoLoadedMetadata}
                      onError={handleVideoError}
                      className={`${getVideoClassName()} ${isVideoLoaded ? 'info-modal-video--loaded' : ''}`}
                      preload="metadata"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div style={{
                background: 'rgba(255, 215, 0, 0.05)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                borderRadius: '12px',
                padding: '24px'
              }}>
                {title.startsWith('$WINC Pool') && wincPool ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 10, padding: 16 }}>
                      <div style={{ color: '#FFD600', fontWeight: 800, marginBottom: 6 }}>Top 1</div>
                      <div style={{ color: '#fff' }}>{wincPool.top1 || '—'}</div>
                    </div>
                    <div style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 10, padding: 16 }}>
                      <div style={{ color: '#FFD600', fontWeight: 800, marginBottom: 6 }}>Top 2</div>
                      <div style={{ color: '#fff' }}>{wincPool.top2 || '—'}</div>
                    </div>
                    <div style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 10, padding: 16 }}>
                      <div style={{ color: '#FFD600', fontWeight: 800, marginBottom: 6 }}>Top 3</div>
                      <div style={{ color: '#fff' }}>{wincPool.top3 || '—'}</div>
                    </div>
                    <div style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 10, padding: 16 }}>
                      <div style={{ color: '#FFD600', fontWeight: 800, marginBottom: 6 }}>Moderators</div>
                      <div style={{ color: '#fff' }}>{wincPool.moderators || '—'}</div>
                    </div>
                    <div style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 10, padding: 16, gridColumn: '1 / -1' }}>
                      <div style={{ color: '#FFD600', fontWeight: 800, marginBottom: 6 }}>Platform</div>
                      <div style={{ color: '#fff' }}>{wincPool.platform || '—'}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    fontSize: '16px',
                    lineHeight: '1.6',
                    color: '#fff',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {content || `No ${title.toLowerCase()} available for this campaign.`}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Information section */}
          <div style={{
            marginTop: '24px',
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: '14px', 
              color: '#FFD600',
              textAlign: 'center'
            }}>
              <strong>💡 Note:</strong> {
                title === 'Starting Story' ? 'This is the initial narrative that sets the context for community completions.' :
                title === 'Guideline' ? 'These guidelines help ensure quality and consistency in community contributions, and assist moderators in judging and scoring completions.' :
                title === 'Initial Video' ? 'This video provides the foundation for community responses and completions.' :
                'This information is essential for understanding the campaign context.'
              }
            </p>
          </div>

          {/* Footer */}
          <div style={{
            borderTop: '1px solid rgba(255, 215, 0, 0.3)',
            paddingTop: '20px',
            marginTop: '24px',
            textAlign: 'center'
          }}>
            <button
              style={{
                background: 'linear-gradient(135deg, #FFD600 0%, #e6c300 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#000',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoModal; 