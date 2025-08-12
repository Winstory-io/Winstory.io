import React from 'react';

interface ModerationTooltipProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModerationTooltip: React.FC<ModerationTooltipProps> = ({ isOpen, onClose }) => {
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
            💡 Moderation Guide
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
          
          {/* Overview Section */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              color: '#FFD600',
              fontSize: '22px',
              fontWeight: 'bold',
              marginBottom: '16px',
              borderLeft: '4px solid #FFD600',
              paddingLeft: '16px'
            }}>
              🎯 Overview
            </h2>
            <p style={{ fontSize: '16px', marginBottom: '12px' }}>
              Welcome to Winstory's moderation system. As a moderator, you play a crucial role in maintaining content quality 
              and ensuring community standards. This guide will help you understand your responsibilities and the tools available.
            </p>
            <div style={{
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginTop: '16px'
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#FFD600' }}>
                <strong>⚠️ Important:</strong> Your decisions directly impact the Winstory ecosystem and your staked WINC tokens. 
                Make informed decisions based on clear criteria.
              </p>
            </div>
          </section>

          {/* Tabs Section */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              color: '#FFD600',
              fontSize: '22px',
              fontWeight: 'bold',
              marginBottom: '16px',
              borderLeft: '4px solid #FFD600',
              paddingLeft: '16px'
            }}>
              📋 Content Types & Tabs
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Initial Tab */}
              <div style={{
                background: 'rgba(255, 215, 0, 0.05)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h3 style={{
                  color: '#FFD600',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🚀 Initial Stories
                </h3>
                <p style={{ fontSize: '14px', marginBottom: '16px', color: '#ccc' }}>
                  Moderate content before it's opened to community completions
                </p>
                
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ color: '#FFD600', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                    B2C & Agencies
                  </h4>
                  <ul style={{ fontSize: '13px', color: '#ccc', paddingLeft: '20px' }}>
                    <li>4 information bubbles (Premium/Standard Rewards, Guidelines, Starting Story)</li>
                    <li>Company branding and reward structures</li>
                    <li>Professional content standards</li>
                  </ul>
                </div>
                
                <div>
                  <h4 style={{ color: '#FFD600', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                    Individual Creators
                  </h4>
                  <ul style={{ fontSize: '13px', color: '#ccc', paddingLeft: '20px' }}>
                    <li>2 information bubbles (Guidelines, Starting Story)</li>
                    <li>No reward structures</li>
                    <li>Creative and personal content focus</li>
                  </ul>
                </div>
              </div>

              {/* Completion Tab */}
              <div style={{
                background: 'rgba(255, 215, 0, 0.05)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h3 style={{
                  color: '#FFD600',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🎬 Community Completions
                </h3>
                <p style={{ fontSize: '14px', marginBottom: '16px', color: '#ccc' }}>
                  Moderate and score community-submitted content
                </p>
                
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ color: '#FFD600', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                    For B2C Campaigns
                  </h4>
                  <ul style={{ fontSize: '13px', color: '#ccc', paddingLeft: '20px' }}>
                    <li>Professional completion standards</li>
                    <li>Brand guideline compliance</li>
                    <li>Reward-based scoring system</li>
                  </ul>
                </div>
                
                <div>
                  <h4 style={{ color: '#FFD600', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                    For Individual Content
                  </h4>
                  <ul style={{ fontSize: '13px', color: '#ccc', paddingLeft: '20px' }}>
                    <li>Creative freedom assessment</li>
                    <li>Personal expression evaluation</li>
                    <li>Community contribution value</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Moderation Criteria Section */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              color: '#FFD600',
              fontSize: '22px',
              fontWeight: 'bold',
              marginBottom: '16px',
              borderLeft: '4px solid #FFD600',
              paddingLeft: '16px'
            }}>
              ⚖️ Moderation Criteria
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Validation Criteria */}
              <div style={{
                background: 'rgba(46, 234, 139, 0.1)',
                border: '1px solid rgba(46, 234, 139, 0.3)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h3 style={{
                  color: '#2eea8b',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ✅ Validation Criteria
                </h3>
                <ul style={{ fontSize: '14px', color: '#ccc', paddingLeft: '20px' }}>
                  <li>Content clarity and coherence</li>
                  <li>Creative potential and inspiration value</li>
                  <li>Community contribution potential</li>
                  <li>Guideline compliance</li>
                  <li>AI enhancement compatibility</li>
                  <li>No policy violations</li>
                </ul>
              </div>

              {/* Refusal Criteria */}
              <div style={{
                background: 'rgba(255, 68, 68, 0.1)',
                border: '1px solid rgba(255, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h3 style={{
                  color: '#ff4444',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ❌ Refusal Criteria
                </h3>
                <ul style={{ fontSize: '14px', color: '#ccc', paddingLeft: '20px' }}>
                  <li>Incomplete or incoherent content</li>
                  <li>Hate speech or discrimination</li>
                  <li>Deepfakes or identity threats</li>
                  <li>Geopolitical risks</li>
                  <li>Explicit sexual content</li>
                  <li>No AI enhancement usage</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Tools & Features Section */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              color: '#FFD600',
              fontSize: '22px',
              fontWeight: 'bold',
              marginBottom: '16px',
              borderLeft: '4px solid #FFD600',
              paddingLeft: '16px'
            }}>
              🛠️ Tools & Features
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={{
                background: 'rgba(255, 215, 0, 0.05)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h4 style={{ color: '#FFD600', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  🔍 Information Bubbles
                </h4>
                <p style={{ fontSize: '13px', color: '#ccc', margin: 0 }}>
                  Click on bubbles to view detailed content information, guidelines, and reward structures.
                </p>
              </div>
              
              <div style={{
                background: 'rgba(255, 215, 0, 0.05)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h4 style={{ color: '#FFD600', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  📊 Progress Panel
                </h4>
                <p style={{ fontSize: '13px', color: '#ccc', margin: 0 }}>
                  Monitor staker participation, staked amounts, and voting ratios in real-time.
                </p>
              </div>
              
              <div style={{
                background: 'rgba(255, 215, 0, 0.05)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h4 style={{ color: '#FFD600', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  🎯 Scoring System
                </h4>
                <p style={{ fontSize: '13px', color: '#ccc', margin: 0 }}>
                  Rate completions from 0-100. Each score can only be used once per campaign.
                </p>
              </div>
            </div>
          </section>

          {/* Best Practices Section */}
          <section style={{ marginBottom: '24px' }}>
            <h2 style={{
              color: '#FFD600',
              fontSize: '22px',
              fontWeight: 'bold',
              marginBottom: '16px',
              borderLeft: '4px solid #FFD600',
              paddingLeft: '16px'
            }}>
              💡 Best Practices
            </h2>
            
            <div style={{
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <ul style={{ fontSize: '14px', color: '#fff', paddingLeft: '20px', margin: 0 }}>
                <li><strong>Review thoroughly:</strong> Watch videos completely and read all guidelines before deciding</li>
                <li><strong>Consider context:</strong> Evaluate content within its intended purpose and audience</li>
                <li><strong>Be consistent:</strong> Apply the same standards across similar content types</li>
                <li><strong>Document decisions:</strong> Use the detailed popups to understand your impact</li>
                <li><strong>Stay informed:</strong> Regularly review moderation guidelines and community feedback</li>
              </ul>
            </div>
          </section>

          {/* Footer */}
          <div style={{
            borderTop: '1px solid rgba(255, 215, 0, 0.3)',
            paddingTop: '20px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '14px', color: '#999', margin: '0 0 16px 0' }}>
              Need additional help? Contact the moderation team or consult the community guidelines.
            </p>
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
              Got it! Close Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModerationTooltip; 