import React, { useState } from 'react';

interface ModerationButtonsProps {
  activeTab: 'initial' | 'completion';
  userType: 'b2c' | 'agency' | 'individual';
  onValid: () => void;
  onRefuse: () => void;
  onValidWithScore?: (score: number) => void;
  usedScores?: number[];
}

const ModerationButtons: React.FC<ModerationButtonsProps> = ({
  activeTab,
  userType,
  onValid,
  onRefuse,
  onValidWithScore,
  usedScores = []
}) => {
  const [showValidPopup, setShowValidPopup] = useState(false);
  const [showRefusePopup, setShowRefusePopup] = useState(false);
  const [showScoringPopup, setShowScoringPopup] = useState(false);
  const [currentScore, setCurrentScore] = useState(50);

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
        warning: 'V1 Staking: Only ACTIVE voters (stake ≥ 50 and stake age ≥ 7 days) earn XP and are subject to proportional slashing if they vote against the final decision. Your vote weight = 50% stake share + 50% democracy factors (stake, XP, age). If YES wins and you voted YES, you share the majority pool (e.g. 459 $/€) proportional to your stake among majority ACTIVE. Minority ACTIVE + PASSIVE share the minority pool (e.g. 51 $/€). If there is no minority+passive stake, the minority pool goes to the majority. If NO wins while you validated, you lose a proportional part of your stake.'
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
        additionalInfo: 'Once validated, you\'ll assign a score from 1/100 to 100/100 based on the overall quality of the completion. Each score can only be used once per campaign. This scoring system helps identify the top 3 highest-rated contributions; they will win the 3 Premium Rewards.',
        warning: 'V1 Staking: Only ACTIVE voters (stake ≥ 50 and stake age ≥ 7 days) earn XP and are subject to proportional slashing if they vote against the final decision. Your weight combines 50% ploutocracy (stake share) + 50% democracy (stake, XP, age). If YES wins and you voted YES, you receive part of the majority pool (e.g. 459 $/€) proportional to your stake among majority ACTIVE. Minority ACTIVE + PASSIVE split the minority pool (e.g. 51 $/€). If there is no minority+passive stake, the minority pool is added to the majority. If NO wins while you validated, you lose a proportional part of your stake.'
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
        warning: 'V1 Staking: Only ACTIVE voters (stake ≥ 50 and stake age ≥ 7 days) earn XP and may be slashed if they vote against the final decision. Weight = 50% stake share + 50% democracy (stake, XP, age). If NO wins and you voted NO, you receive a share of the majority pool (e.g. 459 $/€) proportional to your stake among majority ACTIVE. Minority ACTIVE + PASSIVE share the minority pool (e.g. 51 $/€). If there is no minority+passive stake, the minority pool goes to the majority. If YES wins while you refused, you lose a proportional part of your stake.'
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
        warning: 'V1 Staking: Only ACTIVE voters (stake ≥ 50 and stake age ≥ 7 days) earn XP and may be slashed if they vote against the final decision. Weight = 50% stake share + 50% democracy (stake, XP, age). If NO wins and you voted NO, you receive a share of the majority pool (e.g. 459 $/€) proportional to your stake among majority ACTIVE. Minority ACTIVE + PASSIVE share the minority pool (e.g. 51 $/€). If there is no minority+passive stake, the minority pool goes to the majority. If YES wins while you refused, you lose a proportional part of your stake.'
      };
    }
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

  const handleValidClick = () => {
    if (activeTab === 'completion') {
      // Pour les completions, ouvrir d'abord le popup de validation, puis le scoring
      setShowValidPopup(true);
    } else {
      // Pour les initials, ouvrir directement le popup de validation
      setShowValidPopup(true);
    }
  };

  const handleValidConfirm = () => {
    setShowValidPopup(false);
    if (activeTab === 'completion') {
      // Ouvrir le popup de notation après validation
      setShowScoringPopup(true);
    } else {
      // Pour les initials, valider directement
      onValid();
    }
  };

  const handleScoreConfirm = () => {
    if (!isScoreUsed(currentScore) && onValidWithScore) {
      onValidWithScore(currentScore);
      setShowScoringPopup(false);
    }
  };

  const validContent = getValidPopupContent();
  const refuseContent = getRefusePopupContent();

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '16px',
        marginTop: '8px', // Réduit de 24px à 8px pour rapprocher du panneau
        justifyContent: 'center'
      }}>
        <button
          style={{
            padding: '14px 24px', // Légèrement réduit pour un meilleur fit côte à côte
            fontSize: '16px',
            fontWeight: 700,
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #37FF00 0%, #2eea8b 100%)',
            color: '#000',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(55, 255, 0, 0.3)',
            minWidth: '120px',
            flex: '1'
          }}
          onClick={handleValidClick}
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
            padding: '14px 24px',
            fontSize: '16px',
            fontWeight: 700,
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #FF0000 0%, #ff4444 100%)',
            color: '#fff',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(255, 0, 0, 0.3)',
            minWidth: '120px',
            flex: '1'
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
              onClick={handleValidConfirm}
            >
              {activeTab === 'initial' ? 'Valid' : 'Valid & Score'}
            </button>
          </div>
        </div>
      )}

      {/* Popup Scoring (pour les completions) */}
      {showScoringPopup && (
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
            zIndex: 1001,
            padding: '20px'
          }}
          onClick={() => setShowScoringPopup(false)}
        >
          <div 
            style={{
              background: 'rgba(0, 0, 0, 0.95)',
              border: '2px solid #FFD600',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '450px',
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
                color: '#FFD600',
                fontSize: '24px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              onClick={() => setShowScoringPopup(false)}
            >
              ×
            </button>
            
            <h2 style={{ color: '#FFD600', marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>
              Score this completion
            </h2>
            
            <p style={{ color: '#fff', marginBottom: '20px', fontSize: '14px' }}>
              Move the slider to assign a score from 1 to 100 based on the overall quality of this completion.
              A score of 0 equals Refusal (use the Refuse button).
            </p>
            
            {/* Slider Container */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '8px',
                fontSize: '12px',
                color: '#999'
              }}>
                <span>1</span>
                <span>100</span>
              </div>
              
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={currentScore}
                  onChange={(e) => setCurrentScore(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    background: '#333',
                    outline: 'none',
                    appearance: 'none'
                  }}
                />
                
                {/* Marqueurs pour les scores déjà utilisés */}
                {usedScores.map((score, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      left: `${score}%`,
                      width: '4px',
                      height: '16px',
                      background: '#FF0000',
                      borderRadius: '2px',
                      transform: 'translateX(-50%)'
                    }}
                  />
                ))}
              </div>
              
              <div style={{ 
                textAlign: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                color: getScoreColor(currentScore),
                marginBottom: '8px'
              }}>
                {currentScore}
              </div>
              
              <div style={{ 
                textAlign: 'center',
                fontSize: '14px',
                color: isScoreUsed(currentScore) ? '#FF0000' : '#fff',
                marginBottom: '16px'
              }}>
                {isScoreUsed(currentScore) ? '⚠️ You have already used this score for another completion from this campaign' : getScoreDescription(currentScore)}
              </div>
            </div>
            
            <button
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '8px',
                border: 'none',
                background: isScoreUsed(currentScore) ? '#666' : '#FFD600',
                color: isScoreUsed(currentScore) ? '#999' : '#000',
                cursor: isScoreUsed(currentScore) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: isScoreUsed(currentScore) ? 0.5 : 1
              }}
              onClick={handleScoreConfirm}
              disabled={isScoreUsed(currentScore)}
            >
              Score {currentScore}/100
            </button>
            
            <p style={{ 
              color: '#999', 
              fontSize: '12px', 
              textAlign: 'center', 
              marginTop: '12px',
              margin: 0
            }}>
              Each score can only be used once per campaign by the same moderator. Unavailable scores are marked in red.
            </p>
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