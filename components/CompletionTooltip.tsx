import React from 'react';

interface CompletionTooltipProps {
  isOpen: boolean;
  onClose: () => void;
}

const CompletionTooltip: React.FC<CompletionTooltipProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        background: 'rgba(0, 0, 0, 0.8)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1000 
      }} 
      onClick={onClose}
    >
      <div 
        style={{ 
          background: '#000', 
          border: '4px solid #FFD600',
          borderRadius: 24,
          padding: '28px 20px 20px 20px',
          maxWidth: 650,
          width: '90vw',
          color: '#FFD600',
          position: 'relative',
          maxHeight: '85vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#FF2D2D',
            fontSize: 28,
            fontWeight: 700
          }}
          aria-label="Close tooltip"
        >
          ×
        </button>
        
        <h1 style={{ 
          color: '#FFD600', 
          fontSize: 28, 
          fontWeight: 900, 
          textAlign: 'center', 
          marginBottom: 18, 
          letterSpacing: 1 
        }}>
          Complete Campaign
        </h1>
        
        <div style={{ fontSize: 16, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 20, marginRight: 8 }}>⏩️</span>
            <h2 style={{ color: '#FFD600', fontSize: 20, fontWeight: 800, marginBottom: 0 }}>Complete Campaign</h2>
          </div>
          <h3 style={{ color: '#FFD600', fontWeight: 700, marginBottom: 8 }}>For Community Members</h3>
          
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 500, lineHeight: 1.6 }}>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ color: '#FFD600', marginBottom: 8, fontSize: 16 }}>🎯 What is Campaign Completion?</h4>
              <ul style={{ marginLeft: 18, marginBottom: 0 }}>
                <li>Browse approved campaigns from <span style={{ color: '#FFD600' }}>B2C Companies</span> and <span style={{ color: '#FFD600' }}>Individual Creators</span></li>
                <li>Take a story. Make it yours with your creative completion</li>
                <li>Upload your video response and tell your version of the story</li>
                <li>Get moderated by the community and rise to the top</li>
              </ul>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ color: '#FFD600', marginBottom: 8, fontSize: 16 }}>🎬 Video Navigation</h4>
              <ul style={{ marginLeft: 18, marginBottom: 0 }}>
                <li>Use navigation arrows to explore different campaign videos</li>
                <li>Videos adapt to their original orientation (horizontal or vertical)</li>
                <li>Each video shows the creator's starting story for you to continue</li>
                <li>Click the info button (i) on videos for detailed campaign information</li>
              </ul>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ color: '#FFD600', marginBottom: 8, fontSize: 16 }}>💰 Dynamic Information</h4>
              <ul style={{ marginLeft: 18, marginBottom: 0 }}>
                <li><span style={{ color: '#FFD600' }}>Creator Identity:</span> Shows company name (@Company) or wallet address (@0x12...89AB)</li>
                <li><span style={{ color: '#FFD600' }}>Time Left:</span> Remaining time to complete the campaign</li>
                <li><span style={{ color: '#FFD600' }}>Completion Price:</span> Cost in $WINC tokens to participate</li>
                <li><span style={{ color: '#FFD600' }}>MINT Availability:</span> Current completions vs. total available slots</li>
              </ul>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ color: '#FFD600', marginBottom: 8, fontSize: 16 }}>🏆 Rewards System</h4>
              <ul style={{ marginLeft: 18, marginBottom: 0 }}>
                <li>Win exclusive rewards from brands or earn <span style={{ color: '#FFD600' }}>$WINC</span> tokens</li>
                <li>Top 3 completions unlock <span style={{ color: '#FFD600' }}>Premium Rewards</span></li>
                <li>Standard rewards for all quality completions</li>
                <li>Premium rewards for exceptional storytelling and creativity</li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: '#FFD600', marginBottom: 8, fontSize: 16 }}>🌟 Getting Started</h4>
              <ul style={{ marginLeft: 18, marginBottom: 0 }}>
                <li>Browse campaigns using B2C Companies or Individuals tabs</li>
                <li>Navigate through videos to find stories that inspire you</li>
                <li>Click "Complete" to start creating your continuation</li>
                <li>Upload your video and add your narrative</li>
                <li>Submit for community moderation and earn rewards</li>
                <li>Inspire, tell, and get noticed in the Winstory ecosystem</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionTooltip; 