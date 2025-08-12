import React, { useState } from 'react';

interface ModerationButtonsProps {
  activeTab: 'initial' | 'completion';
  userType: 'b2c' | 'agency' | 'individual';
  onValid: () => void;
  onRefuse: () => void;
  onValidWithScore?: (score: number) => void;
}

const ModerationButtons: React.FC<ModerationButtonsProps> = ({
  activeTab,
  userType,
  onValid,
  onRefuse,
  onValidWithScore
}) => {
  const [showValidPopup, setShowValidPopup] = useState(false);
  const [showRefusePopup, setShowRefusePopup] = useState(false);

  const getValidPopupContent = () => {
    if (activeTab === 'initial') {
      return {
        title: '🟢 Validate this Initial Story',
        description: 'By validating this content, you confirm that it:',
        criteria: [
          '✅ Respects Winstory\'s moderation standards (clarity, coherence, creativity, and potential to inspire community completions)',
          '✅ Contains an initial story that is understandable and usable as a narrative starting point',
          '✅ Does not violate any of the listed refusal rules',
          userType === 'individual' 
            ? '✅ Proposes an original, engaging and AI-enhanceable narrative seed'
            : '✅ For company stories: follows the brand\'s creative structure and purpose'
        ],
        additionalInfo: 'Once validated, this content will be eligible for community completions.',
        warning: 'Your decision engages a proportional part of your staked WINC. If the majority of stakers vote YES and you also voted YES, you earn a share of the rewards pool. If the final vote is NO and you validated it, you lose proportional part of your stake.'
      };
    } else {
      return {
        title: '🟢 Validate & Score this Completion',
        description: 'By validating this content, you confirm that it:',
        criteria: [
          '✅ Complies with Winstory\'s moderation standards (overall coherence)',
          '✅ Follows the narrative, visual, and guideline defined by the initial company',
          '✅ Does not violate any of the listed refusal rules'
        ],
        additionalInfo: 'Once validated, you\'ll assign a score from 0/100 to 100/100 based on the overall quality of Completion. Each score can only be used once per campaign. This scoring system helps identify the top 3 highest-rated contributions, they will win the 3 Premium Rewards.',
        warning: 'Your decision engages a proportional part of your staked WINC. If the majority of stakers vote YES, and you also voted YES, you earn a share of the rewards pool. If the final vote is NO and you validated it, you lose proportional part of your stake.'
      };
    }
  };

  const getRefusePopupContent = () => {
    if (activeTab === 'initial') {
      return {
        title: '🔴 Refuse this Initial Story',
        description: 'You should refuse this content if it falls under any of the following criteria:',
        criteria: [
          '🚫 The text or video is incomplete, incoherent, or lacks clear narrative direction',
          '🚫 It cannot reasonably inspire meaningful community completions',
          '🚫 It includes hate speech, racism, xenophobia, or apology for harassment and bullying',
          '🚫 It contains deepfakes that may harm the dignity or identity of a specific (group of) person',
          '🚫 It presents geopolitical risks',
          '🚫 It contains explicit sexual content or pornography',
          '🚫 It has clearly not been enhanced, assisted, or post-produced using generative AI or similar post-prod technologies'
        ],
        additionalInfo: 'Refusing content is a strong decision. Make sure it clearly meets at least one of these criteria.',
        warning: 'Your decision engages a proportional part of your staked WINC. If the majority of stakers vote Refuse, and you also voted Refuse, you win a share of the rewards pool. If the final vote is Valid and you refused it, you lose proportional part of your stake.'
      };
    } else {
      return {
        title: '🔴 Refuse this Completion',
        description: 'You should refuse this content if it falls under any of the following criteria:',
        criteria: [
          '🚫 The film was not created, assisted, or enhanced by Generative A.I. or digital post-production',
          '🚫 The film or text does not follow the company\'s initial creative guidelines',
          '🚫 The content promotes hate, racism, xenophobia, or harassment',
          '🚫 The content includes a deepfake that may threaten the dignity or integrity of a person',
          '🚫 It presents clear geopolitical risks',
          '🚫 It contains explicit pornography'
        ],
        additionalInfo: 'Refusing content is a strong decision. Make sure it clearly meets at least one of these criteria.',
        warning: 'Your decision engages a proportional part of your staked WINC. If the majority of stakers vote NO, and you also voted NO, you earn a share of the rewards pool. If the final vote is YES and you refused it, you lose proportional part of your stake.'
      };
    }
  };

  const validContent = getValidPopupContent();
  const refuseContent = getRefusePopupContent();

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginTop: '24px'
      }}>
        <button
          style={{
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: 700,
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #37FF00 0%, #2eea8b 100%)',
            color: '#000',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(55, 255, 0, 0.3)'
          }}
          onClick={() => setShowValidPopup(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(55, 255, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(55, 255, 0, 0.3)';
          }}
        >
          {activeTab === 'initial' ? 'Valid' : 'Valid & Score'}
        </button>
        
        <button
          style={{
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: 700,
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #FF0000 0%, #ff4444 100%)',
            color: '#fff',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(255, 0, 0, 0.3)'
          }}
          onClick={() => setShowRefusePopup(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(255, 0, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 0, 0, 0.3)';
          }}
        >
          Refuse
        </button>
      </div>

      {/* Popup Valid */}
      {showValidPopup && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowValidPopup(false)}
        >
          <div 
            style={{
              background: 'rgba(0, 0, 0, 0.95)',
              border: '2px solid #37FF00',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflow: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#37FF00',
                fontSize: '24px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              onClick={() => setShowValidPopup(false)}
            >
              ×
            </button>
            
            <h2 style={{ color: '#37FF00', marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>
              {validContent.title}
            </h2>
            
            <p style={{ color: '#fff', marginBottom: '16px', fontSize: '16px' }}>
              {validContent.description}
            </p>
            
            <ul style={{ color: '#37FF00', marginBottom: '20px', paddingLeft: '20px' }}>
              {validContent.criteria.map((criterion, index) => (
                <li key={index} style={{ marginBottom: '8px', fontSize: '14px', lineHeight: '1.4' }}>
                  {criterion}
                </li>
              ))}
            </ul>
            
            <p style={{ color: '#fff', marginBottom: '16px', fontSize: '14px', lineHeight: '1.4' }}>
              {validContent.additionalInfo}
            </p>
            
            <div style={{ 
              background: 'rgba(55, 255, 0, 0.1)', 
              border: '1px solid rgba(55, 255, 0, 0.3)', 
              borderRadius: '8px', 
              padding: '16px', 
              marginBottom: '20px' 
            }}>
              <p style={{ color: '#fff', fontSize: '14px', lineHeight: '1.4', margin: 0 }}>
                ⚠️ {validContent.warning}
              </p>
            </div>
            
            <button
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '8px',
                border: 'none',
                background: '#37FF00',
                color: '#000',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => {
                setShowValidPopup(false);
                onValid();
              }}
            >
              {activeTab === 'initial' ? 'Valid' : 'Valid & Score'}
            </button>
          </div>
        </div>
      )}

      {/* Popup Refuse */}
      {showRefusePopup && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowRefusePopup(false)}
        >
          <div 
            style={{
              background: 'rgba(0, 0, 0, 0.95)',
              border: '2px solid #FF0000',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflow: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#FF0000',
                fontSize: '24px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              onClick={() => setShowRefusePopup(false)}
            >
              ×
            </button>
            
            <h2 style={{ color: '#FF0000', marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>
              {refuseContent.title}
            </h2>
            
            <p style={{ color: '#fff', marginBottom: '16px', fontSize: '16px' }}>
              {refuseContent.description}
            </p>
            
            <ul style={{ color: '#FF0000', marginBottom: '20px', paddingLeft: '20px' }}>
              {refuseContent.criteria.map((criterion, index) => (
                <li key={index} style={{ marginBottom: '8px', fontSize: '14px', lineHeight: '1.4' }}>
                  {criterion}
                </li>
              ))}
            </ul>
            
            <p style={{ color: '#fff', marginBottom: '16px', fontSize: '14px', lineHeight: '1.4' }}>
              {refuseContent.additionalInfo}
            </p>
            
            <div style={{ 
              background: 'rgba(255, 0, 0, 0.1)', 
              border: '1px solid rgba(255, 0, 0, 0.3)', 
              borderRadius: '8px', 
              padding: '16px', 
              marginBottom: '20px' 
            }}>
              <p style={{ color: '#fff', fontSize: '14px', lineHeight: '1.4', margin: 0 }}>
                ⚠️ {refuseContent.warning}
              </p>
            </div>
            
            <button
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '8px',
                border: 'none',
                background: '#FF0000',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => {
                setShowRefusePopup(false);
                onRefuse();
              }}
            >
              Refuse
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ModerationButtons; 