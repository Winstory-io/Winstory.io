import React from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: string;
  content: string;
  videoUrl?: string;
}

const InfoModal: React.FC<InfoModalProps> = ({ 
  isOpen, 
  onClose, 
  title,
  icon,
  content,
  videoUrl
}) => {
  if (!isOpen) return null;

  return (
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
          maxWidth: '800px',
          maxHeight: '85vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(255, 215, 0, 0.3)'
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
                textAlign: 'center'
              }}>
                <p style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: '16px', 
                  color: '#FFD600',
                  fontWeight: '600'
                }}>
                  This is the original video that the completer is responding to:
                </p>
                <video 
                  src={videoUrl} 
                  controls 
                  style={{ 
                    width: '100%', 
                    maxWidth: '500px', 
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 255, 0, 0.3)',
                    boxShadow: '0 4px 20px rgba(0, 255, 0, 0.2)'
                  }} 
                />
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(255, 215, 0, 0.05)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <div style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#fff',
                whiteSpace: 'pre-wrap'
              }}>
                {content || `No ${title.toLowerCase()} available for this campaign.`}
              </div>
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
  );
};

export default InfoModal; 