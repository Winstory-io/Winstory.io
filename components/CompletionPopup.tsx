import React from 'react';
import styles from '../styles/Moderation.module.css';
import { useRouter } from 'next/navigation';
import { validateVideoOrientation } from '../lib/utils';

interface CompletionPopupProps {
  open: boolean;
  onClose: () => void;
  activeTab: 'b2c' | 'individual';
  identity: string;
  currentCampaign?: any;
  getTimeLeft?: () => string;
  getCompletionStats?: () => { minted: number; available: number };
}

const GREEN = '#4ECB71';
const YELLOW = '#FFD600';

const CompletionPopup: React.FC<CompletionPopupProps> = ({ open, onClose, activeTab, identity, currentCampaign, getTimeLeft, getCompletionStats }) => {
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);
  const [story, setStory] = React.useState('');
  const [storyFocused, setStoryFocused] = React.useState(false);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [videoAspectRatio, setVideoAspectRatio] = React.useState<number | null>(null);
  const [hoveredBubble, setHoveredBubble] = React.useState<string | null>(null);
  // Ajout pour pop-up spécifique à la bulle
  const [openedBubble, setOpenedBubble] = React.useState<string | null>(null);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = React.useState(false);
  // Nouveaux états pour la validation d'orientation
  const [orientationError, setOrientationError] = React.useState<string | null>(null);
  const [isValidatingOrientation, setIsValidatingOrientation] = React.useState(false);

  // Determine if current video is vertical (same logic as main completion page)
  const isCurrentVideoVertical = currentCampaign?.film?.format === '9:16' || 
                                 currentCampaign?.film?.url?.includes('720x1280') ||
                                 currentCampaign?.film?.fileName?.includes('vertical') ||
                                 currentCampaign?.film?.fileName?.includes('9:16');

  // Price calculation (same logic as main completion page)
  const getMintPrice = () => {
    const price = Number(currentCampaign?.completions?.wincValue || 0);
    return isNaN(price) ? 0 : price;
  };

  const isB2CCreator = () => {
    if (!currentCampaign) return activeTab === 'b2c';
    return (
      currentCampaign.creatorType === 'B2C_AGENCIES' ||
      currentCampaign.creatorType === 'FOR_B2C' ||
      activeTab === 'b2c'
    );
  };

  const getPriceUnit = () => (isB2CCreator() ? '$' : '$WINC');

  const formatPriceShort = () => {
    const price = getMintPrice();
    const unit = getPriceUnit();
    if (unit === '$') return `$${price.toFixed(2)}`;
    return `${price} ${unit}`;
  };

  const formatMintPriceTextual = () => {
    const price = getMintPrice();
    if (price <= 0) return 'FREE';
    const unit = getPriceUnit();
    if (unit === '$') return `$${price.toFixed(2)}`;
    return `${price} ${unit}`;
  };

  // Charger les données sauvegardées quand le popup s'ouvre
  React.useEffect(() => {
    if (open) {
      const savedText = localStorage.getItem("completionText");
      const savedVideo = window.__completionVideo;
      
      if (savedText) {
        setStory(savedText);
      }
      
      if (savedVideo) {
        setFile(savedVideo);
      }
    }
  }, [open]);

  React.useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setVideoAspectRatio(null); // Reset aspect ratio on new file
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoUrl(null);
      setVideoAspectRatio(null);
    }
  }, [file]);

  if (!open) return null;

  const hasProgress = story.trim().length > 0 || !!file;

  const handleCloseClick = () => {
    // Toujours afficher le modal de confirmation si il y a du progrès
    if (hasProgress) {
      setShowLeaveConfirmModal(true);
    } else {
      onClose();
    }
  };

  // Gestion fermeture par clic overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      if (hasProgress) {
        return;
      }
      onClose();
    }
    // Fermer le pop-up spécifique si ouvert
    if (openedBubble) setOpenedBubble(null);
  };

  // Style bulle verte inspiré de .cornerBubble, version cercle
  const circleStyle: React.CSSProperties = {
    width: 90,
    height: 90,
    background: GREEN,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 1000,
    color: '#111',
    fontSize: 16,
    fontWeight: 700,
    textAlign: 'center',
    boxShadow: '0 2px 12px #000',
    border: `2px solid ${GREEN}`,
    transition: 'box-shadow 0.2s, background 0.2s',
    marginBottom: 18,
    userSelect: 'none',
  };
  const circleHoverStyle: React.CSSProperties = {
    boxShadow: `0 0 16px 4px ${GREEN}`,
    background: '#7CFFA7',
  };

  // Condition pour activer le bouton Confirm (texte + vidéo)
  const isConfirmEnabled = story.trim().length > 0 && !!videoUrl;
  const activeColor = isConfirmEnabled ? GREEN : YELLOW;

  const handleConfirm = () => {
    if (isConfirmEnabled) {
      window.__completionVideo = file || null;
      localStorage.setItem("completionText", story);
      localStorage.setItem("completionFilmUrl", ""); // On ne stocke plus la vidéo ici
      localStorage.setItem("completionType", activeTab);
      
      // Stocker les vraies données de récompenses de la campagne
      if (activeTab === 'b2c') {
        // Pour B2C, utiliser les données de récompenses de la campagne
        const standardRewards = currentCampaign?.rewards?.standardReward || 'Standard rewards not specified';
        const premiumRewards = currentCampaign?.rewards?.premiumReward || 'Premium rewards not specified';
        localStorage.setItem("standardTokenReward", JSON.stringify({ 
          name: "Standard Rewards", 
          description: standardRewards,
          type: "b2c_standard"
        }));
        localStorage.setItem("premiumTokenReward", JSON.stringify({ 
          name: "Premium Rewards", 
          description: premiumRewards,
          type: "b2c_premium"
        }));
      } else {
        // Pour Individuals, utiliser les calculs de $WINC
        const { first, second, third } = getIndividualTop3();
        localStorage.setItem("standardTokenReward", JSON.stringify({ 
          name: "Top 3 $WINC Rewards", 
          first: first,
          second: second,
          third: third,
          type: "individual_top3"
        }));
        localStorage.setItem("premiumTokenReward", JSON.stringify({ 
          name: "Individual Completion", 
          description: "Complete the campaign to be eligible for rewards",
          type: "individual_completion"
        }));
      }
      
      // Stocker le vrai prix de completion de la campagne (même logique que le bouton)
      const completionPrice = formatMintPriceTextual();
      localStorage.setItem("completionMintPrice", completionPrice);
      
      router.push('/completion/recap');
    }
  };

  const handleFileUpload = async (uploadedFile: File) => {
    if (!isCurrentVideoVertical && !currentCampaign?.film?.format) {
      // Si pas d'orientation spécifiée, accepter le fichier
      setFile(uploadedFile);
      setOrientationError(null);
      return;
    }

    setIsValidatingOrientation(true);
    setOrientationError(null);

    try {
      const expectedOrientation = isCurrentVideoVertical ? 'vertical' : 'horizontal';
      const { isValid, detectedOrientation } = await validateVideoOrientation(
        uploadedFile, 
        expectedOrientation
      );

      if (isValid) {
        setFile(uploadedFile);
        setOrientationError(null);
      } else {
        setFile(null);
        const expectedText = isCurrentVideoVertical ? 'vertical' : 'horizontal';
        const detectedText = detectedOrientation === 'vertical' ? 'vertical' : 'horizontal';
        setOrientationError(
          `Incorrect video format! This campaign requires a ${expectedText} video, but you uploaded a ${detectedText} video. Please upload a video with the correct orientation.`
        );
      }
    } catch (error) {
      console.error('Erreur lors de la validation d\'orientation:', error);
      setOrientationError('Error analyzing the video. Please try again.');
      setFile(null);
    } finally {
      setIsValidatingOrientation(false);
    }
  };

  return (
    <div
      className="completion-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#000',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // overflow: 'hidden', // This was causing the button to be clipped
      }}
      onClick={handleOverlayClick}
    >
      <div
        className="completion-popup"
        style={{
          width: '98vw',
          maxWidth: '98vw',
          height: '80vh',
          background: 'none',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'row',
          gap: 32,
          alignItems: 'center',
          justifyContent: 'center',
          // overflow: 'hidden', // This was also causing clipping
          marginTop: '6vh',
          position: 'relative',
          opacity: openedBubble ? 0.18 : 1,
          transition: 'opacity 0.2s',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Encart Creation à gauche */}
        <div
          className="completion-top"
          style={{
            flex: 1,
            background: '#000',
            border: `3px solid ${GREEN}`,
            borderRadius: '18px',
            padding: '4px 32px',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            minHeight: 0,
            height: '80%',
            boxSizing: 'border-box',
            justifyContent: 'flex-start',
            transition: 'opacity 0.2s',
            opacity: openedBubble ? 0.18 : 1,
            position: 'relative',
          }}
        >
          <div style={{ color: GREEN, fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>Creation</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontStyle: 'italic', fontSize: 18, color: '#fff' }}>{currentCampaign?.story?.title || 'Campaign Title'}</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#fff' }}>{identity}</div>
          </div>
          {/* Ligne flex pour bulles et vidéo */}
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', gap: 0, position: 'relative' }}>
            {/* Bulles gauche */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: 18, height: '100%', marginRight: 18 }}>
              {[
                { key: 'starting', label: 'Starting Text' },
                ...(activeTab === 'b2c' ? [{ key: 'guideline', label: 'Guideline' }] : []),
              ].map(bulle => (
                <div
                  key={bulle.key}
                  style={hoveredBubble === bulle.key ? { ...circleStyle, ...circleHoverStyle } : circleStyle}
                  onMouseEnter={() => setHoveredBubble(bulle.key)}
                  onMouseLeave={() => setHoveredBubble(null)}
                  onClick={() => setOpenedBubble(bulle.key)}
                >
                  {bulle.label}
                </div>
              ))}
            </div>
            {/* Vidéo centrée verticalement et horizontalement */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320, minWidth: 0, position: 'relative' }}>
              <div style={{ 
                width: '90%', 
                maxWidth: isCurrentVideoVertical ? 240 : 480, 
                maxHeight: 360, 
                aspectRatio: isCurrentVideoVertical ? '9/16' : '16/9', 
                background: '#222', 
                borderRadius: 16, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#fff', 
                fontSize: 24,
                overflow: 'hidden'
              }}>
                {currentCampaign?.content?.videoUrl ? (
                  <video
                    src={currentCampaign.content.videoUrl}
                    controls
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 16,
                      objectFit: 'cover'
                    }}
                    onError={() => {
                      console.log('Video failed to load in popup:', currentCampaign.content.videoUrl);
                    }}
                  />
                ) : (
                  <span>Vidéo initiale</span>
                )}
              </div>
              {/* Pop-up rectangulaire centré dans l'encart Creation */}
              {openedBubble && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: '#181818', // fond noir parfaitement opaque
                  border: '3px solid #00ffb0',
                  borderRadius: 20,
                  boxShadow: '0 12px 64px 0 #00ffb0cc, 0 2px 24px 0 #000a',
                  padding: '54px 38px 44px 38px',
                  minWidth: 360,
                  minHeight: 240,
                  maxWidth: 480,
                  width: '96%',
                  zIndex: 2000,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity: 1, // aucune transparence
                }}
                onClick={e => e.stopPropagation()} // Pour ne pas fermer en cliquant dans le pop-up
                >
                  <button
                    onClick={() => setOpenedBubble(null)}
                    style={{
                      position: 'absolute',
                      top: 18,
                      right: 22,
                      background: 'none',
                      border: 'none',
                      color: '#00ffb0',
                      fontSize: 34,
                      cursor: 'pointer',
                      fontWeight: 900,
                      zIndex: 2,
                    }}
                    aria-label="Fermer le pop-up spécifique"
                  >
                    ×
                  </button>
                  <div style={{ color: '#00ffb0', fontWeight: 800, fontSize: 30, marginBottom: 18, textAlign: 'center', letterSpacing: 1, textShadow: '0 2px 12px #000a' }}>
                    {openedBubble === 'starting' && 'Starting Text'}
                    {openedBubble === 'guideline' && 'Guideline'}
                    {openedBubble === 'standard' && 'Standard Rewards'}
                    {openedBubble === 'premium' && 'Premium Rewards'}
                  </div>
                  <div style={{ color: '#fff', fontSize: 20, textAlign: 'center', marginTop: 10, fontWeight: 500, textShadow: '0 2px 8px #000a' }}>
                    {/* Dynamic content from campaign */}
                    {openedBubble === 'starting' && (currentCampaign?.story?.startingStory || 'Texte de démarrage de la campagne (à paramétrer)')}
                    {openedBubble === 'guideline' && (currentCampaign?.story?.guideline || 'Consigne créative de la campagne (à paramétrer)')}
                    {openedBubble === 'standard' && (currentCampaign?.rewards?.standardReward || 'Description des Standard Rewards (à paramétrer)')}
                    {openedBubble === 'premium' && (currentCampaign?.rewards?.premiumReward || 'Description des Premium Rewards (à paramétrer)')}
                  </div>
                </div>
              )}
            </div>
            {/* Bulles droite */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 18, height: '100%', marginLeft: 18 }}>
              {[
                ...(activeTab === 'b2c'
                  ? [
                      { key: 'standard', label: 'Standard Rewards' },
                      { key: 'premium', label: 'Premium Rewards' },
                    ]
                  : [{ key: 'guideline', label: 'Guideline' }]),
              ].map(bulle => (
                <div
                  key={bulle.key}
                  style={hoveredBubble === bulle.key ? { ...circleStyle, ...circleHoverStyle } : circleStyle}
                  onMouseEnter={() => setHoveredBubble(bulle.key)}
                  onMouseLeave={() => setHoveredBubble(null)}
                  onClick={() => setOpenedBubble(bulle.key)}
                >
                  {bulle.label}
                </div>
              ))}
            </div>
          </div>
          {/* Infos bas - Dynamic (updated) */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 18, fontSize: 15 }}>
            <div style={{ fontWeight: 600, color: '#FFD600' }}>
              ⏰ {getTimeLeft ? getTimeLeft() : 'Time left to Complete'}
            </div>
          </div>
          <div style={{ fontSize: 13, marginBottom: 0, color: '#FF2D2D' }}>
            🎯 {getCompletionStats ? `${getCompletionStats().minted} / ${getCompletionStats().available} MINT` : 'Completions MINT / Completions available'}
          </div>
        </div>
        {/* Encart Completion à droite */}
        <div
          className="completion-bottom"
          style={{
            flex: 1,
            background: '#000',
            border: `3px solid ${activeColor}`,
            borderRadius: '18px',
            padding: '8px 32px 10px 32px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            minHeight: 0,
            height: '80%',
            boxSizing: 'border-box',
            overflow: 'visible',
            justifyContent: 'flex-start', // Garder le titre en haut
            alignItems: 'center',
            transition: 'opacity 0.2s',
            opacity: openedBubble ? 0.18 : 1,
          }}
        >
          {/* The entire content of the completion panel, without extra wrappers */}
          <button
            onClick={handleCloseClick}
            style={{
              position: 'absolute',
              top: 8,
              right: 12,
              background: 'none',
              border: 'none',
              fontSize: 32,
              color: '#FF2D55',
              cursor: 'pointer',
              fontWeight: 700,
              zIndex: 2000,
            }}
            aria-label="Fermer le pop-up"
          >
            ×
          </button>
          <div style={{ color: activeColor, fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 10, marginTop: 0 }}>Completion</div>
          
          {/* Prix de completion permanent - en bas à droite */}
          <div style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            background: 'rgba(0, 0, 0, 0.8)',
            border: '2px solid #4ECB71',
            borderRadius: 12,
            padding: '8px 16px',
            fontSize: 16,
            fontWeight: 800,
            color: '#4ECB71',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            zIndex: 1,
            boxShadow: '0 2px 8px rgba(78, 203, 113, 0.2)'
          }}>
            <span style={{ fontSize: 18 }}>💰</span>
            <span>{formatMintPriceTextual()}</span>
          </div>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 20, marginTop: 60, flexDirection: 'column', alignItems: 'center' }}>
            <textarea
              style={{ 
                width: '95%', 
                minHeight: 110, 
                maxHeight: 160, 
                borderRadius: 12, 
                border: `2px solid ${activeColor}`, 
                padding: 16, 
                fontSize: 17, 
                background: '#111', 
                color: '#fff', 
                fontWeight: 500, 
                resize: 'none', 
                outline: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 0 0 rgba(255, 214, 0, 0)',
                backdropFilter: 'blur(0px)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = `2px solid #FFD600`;
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 214, 0, 0.4), 0 0 40px rgba(255, 214, 0, 0.2), inset 0 0 20px rgba(255, 214, 0, 0.1)';
                e.currentTarget.style.backdropFilter = 'blur(10px)';
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.background = 'rgba(17, 17, 17, 0.9)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = `2px solid ${activeColor}`;
                e.currentTarget.style.boxShadow = '0 0 0 rgba(255, 214, 0, 0)';
                e.currentTarget.style.backdropFilter = 'blur(0px)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = '#111';
              }}
              placeholder={
                storyFocused
                  ? ''
                  : activeTab === 'b2c'
                  ? 'Write your Completion Story according to the Starting Text and Guideline’s Company. Creativity, magical, sophistication !'
                  : 'Write your Completion Story according to the Starting Text and Guideline’s Individual Member. Creativity, magical, sophistication !'
              }
              value={story}
              onChange={e => setStory(e.target.value)}
              onFocus={() => setStoryFocused(true)}
              onBlur={() => setStoryFocused(false)}
            />
            {!videoUrl && (
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: 18, marginTop: 20 }}>
                <label htmlFor="mp4-upload" style={{
                  background: YELLOW,
                  border: `2px solid ${YELLOW}`,
                  borderRadius: 12,
                  padding: '16px 32px',
                  color: '#000',
                  fontWeight: 700,
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontSize: 16,
                  boxShadow: '0 4px 12px rgba(255, 214, 0, 0.3)',
                  transition: 'all 0.3s ease',
                  width: 360,
                  display: 'block',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FFC200';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 214, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = YELLOW;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 214, 0, 0.3)';
                }}
                onClick={(e) => {
                  const target = e.currentTarget;
                  target.style.transform = 'scale(0.98)';
                  setTimeout(() => {
                    if (target) {
                      target.style.transform = 'scale(1)';
                    }
                  }, 150);
                }}>
                  Upload MP4 film according to your Completion Text (max.100MB)
                  {isCurrentVideoVertical ? 
                    <div style={{ fontSize: 14, marginTop: 6, color: '#000', fontWeight: 600 }}>📱 Please upload vertical 9:16 video</div> :
                    <div style={{ fontSize: 14, marginTop: 6, color: '#000', fontWeight: 600 }}>🖥️ Please upload horizontal 16:9 video</div>
                  }
                  <input
                    id="mp4-upload"
                    type="file"
                    accept="video/mp4"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        await handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            )}
            {orientationError && (
              <div style={{
                background: '#FF4444',
                color: '#fff',
                padding: '12px 16px',
                borderRadius: 8,
                margin: '12px auto',
                maxWidth: 480,
                fontSize: 14,
                textAlign: 'center',
                border: '2px solid #FF6666'
              }}>
                ⚠️ {orientationError}
              </div>
            )}
            {isValidatingOrientation && (
              <div style={{
                background: '#FFD600',
                color: '#000',
                padding: '12px 16px',
                borderRadius: 8,
                margin: '12px auto',
                maxWidth: 480,
                fontSize: 14,
                textAlign: 'center',
                fontWeight: 600
              }}>
                🔄 Validating video orientation...
              </div>
            )}
            {videoUrl && (
              <div style={{ position: 'relative', width: '95%', maxWidth: 480, margin: '18px auto 18px auto', display: 'flex', justifyContent: 'center', padding: '8px 0 20px 0', marginTop: 0 }}>
                <video
                  src={videoUrl}
                  controls
                  onLoadedMetadata={e => {
                    const video = e.currentTarget;
                    setVideoAspectRatio(video.videoWidth / video.videoHeight);
                  }}
                  style={{
                    borderRadius: 10,
                    background: '#111',
                    objectFit: 'contain',
                    boxShadow: '0 2px 12px #000a',
                    ...(videoAspectRatio && videoAspectRatio < 1
                      ? { height: '260px', width: 'auto' }
                      : { width: '100%', height: 'auto', maxHeight: '300px' }),
                  }}
                />
                <button
                  onClick={() => { setFile(null); }}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: -28,
                    background: 'none',
                    border: 'none',
                    fontSize: 24,
                    color: '#FF2D55',
                    cursor: 'pointer',
                    fontWeight: 700,
                    zIndex: 3,
                  }}
                  aria-label="Supprimer la vidéo importée"
                >
                  ×
                </button>

              </div>
            )}
          </div>
          <div style={{
            position: 'absolute',
            bottom: '-70px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}>
            <button
              onClick={handleConfirm}
              style={{
                width: 220,
                background: isConfirmEnabled ? '#4ECB71' : '#FFD600',
                color: isConfirmEnabled ? '#111' : '#222',
                border: 'none',
                borderRadius: 12,
                padding: '18px 0',
                fontSize: 22,
                fontWeight: 700,
                cursor: isConfirmEnabled ? 'pointer' : 'not-allowed',
                boxShadow: '0 2px 8px #0008',
                transition: 'background 0.2s, color 0.2s',
              }}
              disabled={!isConfirmEnabled}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
      {/* Pop-up rectangulaire centré sur l'écran, parfaitement visible */}
      {openedBubble && (
        <>
          {/* Overlay pour fermer le pop-up en cliquant à l'extérieur */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.01)', // quasi invisible, juste pour capter le clic
              zIndex: 2000,
            }}
            onClick={() => setOpenedBubble(null)}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: 32, // positionné à gauche de l'écran
            transform: 'translateY(-50%)',
            background: '#181818',
            border: '3px solid #00ffb0',
            borderRadius: 20,
            boxShadow: '0 12px 64px 0 #00ffb0cc, 0 2px 24px 0 #000a',
            padding: '54px 38px 44px 38px',
            minWidth: 360,
            minHeight: 240,
            maxWidth: 480,
            width: '96%',
            zIndex: 2001,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: 1,
          }}
          onClick={e => e.stopPropagation()} // Pour ne pas fermer en cliquant dans le pop-up
          >
            <button
              onClick={() => setOpenedBubble(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 22,
                background: 'none',
                border: 'none',
                color: '#00ffb0',
                fontSize: 34,
                cursor: 'pointer',
                fontWeight: 900,
                zIndex: 2,
              }}
              aria-label="Fermer le pop-up spécifique"
            >
              ×
            </button>
            <div style={{ color: '#00ffb0', fontWeight: 800, fontSize: 30, marginBottom: 18, textAlign: 'center', letterSpacing: 1, textShadow: '0 2px 12px #000a' }}>
              {openedBubble === 'starting' && 'Starting Text'}
              {openedBubble === 'guideline' && 'Guideline'}
              {openedBubble === 'standard' && 'Standard Rewards'}
              {openedBubble === 'premium' && 'Premium Rewards'}
            </div>
            <div style={{ color: '#fff', fontSize: 20, textAlign: 'center', marginTop: 10, fontWeight: 500, textShadow: '0 2px 8px #000a' }}>
              {/* Dynamic content from campaign */}
              {openedBubble === 'starting' && (currentCampaign?.story?.startingStory || 'Texte de démarrage de la campagne (à paramétrer)')}
              {openedBubble === 'guideline' && (currentCampaign?.story?.guideline || 'Consigne créative de la campagne (à paramétrer)')}
              {openedBubble === 'standard' && (currentCampaign?.rewards?.standardReward || 'Description des Standard Rewards (à paramétrer)')}
              {openedBubble === 'premium' && (currentCampaign?.rewards?.premiumReward || 'Description des Premium Rewards (à paramétrer)')}
            </div>
          </div>
        </>
      )}
      {showLeaveConfirmModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.7)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowLeaveConfirmModal(false)}
        >
          <div
            style={{
              background: '#181818',
              border: '3px solid #FF2D2D',
              color: '#FF2D2D',
              padding: 40,
              borderRadius: 20,
              minWidth: 340,
              maxWidth: '90vw',
              boxShadow: '0 0 32px #FF2D2D55',
              textAlign: 'center',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontWeight: 700, fontSize: 28, color: '#FF2D2D', marginBottom: 8 }}>Leave Completion ?</div>
            <div style={{ color: '#FF2D2D', background: '#000', border: '2px solid #FF2D2D', borderRadius: 12, padding: 18, fontSize: 18, fontWeight: 500, marginBottom: 12 }}>
              You're about to leave this completion process.<br/>Your current progress won't be saved.
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                <button
                  onClick={() => setShowLeaveConfirmModal(false)}
                  style={{
                    background: '#444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '14px 32px',
                    fontWeight: 700,
                    fontSize: 18,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  Stay here
                </button>
                <button
                  onClick={() => {
                    // Nettoyer les données sauvegardées
                    localStorage.removeItem('completionText');
                    localStorage.removeItem('completionType');
                    localStorage.removeItem('openCompletionPopup');
                    if (typeof window !== 'undefined') {
                      window.__completionVideo = null;
                    }
                    // Fermer le popup et revenir à la page de completion
                    onClose();
                    setShowLeaveConfirmModal(false);
                  }}
                  style={{
                    background: '#FF2D2D',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '14px 32px',
                    fontWeight: 700,
                    fontSize: 18,
                    cursor: 'pointer',
                    boxShadow: '0 2px 12px #FF2D2D55',
                    transition: 'background 0.2s',
                  }}
                >
                  Confirm & leave
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletionPopup; 