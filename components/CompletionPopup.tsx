import React from 'react';
import styles from '../styles/Moderation.module.css';

interface CompletionPopupProps {
  open: boolean;
  onClose: () => void;
  // Ajoute d'autres props si besoin (infos campagne, callbacks, etc.)
}

const GREEN = '#4ECB71';
const YELLOW = '#FFD600';

const CompletionPopup: React.FC<CompletionPopupProps> = ({ open, onClose }) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [story, setStory] = React.useState('');
  const [storyFocused, setStoryFocused] = React.useState(false);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [hoveredBubble, setHoveredBubble] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoUrl(null);
    }
  }, [file]);

  if (!open) return null;

  // Gestion fermeture par clic overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
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
        overflow: 'hidden',
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
          overflow: 'hidden',
          marginTop: '6vh',
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
          }}
        >
          <div style={{ color: GREEN, fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>Creation</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontStyle: 'italic', fontSize: 18, color: '#fff' }}>Title</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#fff' }}>@Company</div>
          </div>
          {/* Ligne flex pour bulles et vidéo */}
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', gap: 0, position: 'relative' }}>
            {/* Bulles gauche */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: 18, height: '100%', marginRight: 18 }}>
              {[
                { key: 'starting', label: 'Starting Text' },
                { key: 'guideline', label: 'Guideline' },
              ].map(bulle => (
                <div
                  key={bulle.key}
                  style={hoveredBubble === bulle.key ? { ...circleStyle, ...circleHoverStyle } : circleStyle}
                  onMouseEnter={() => setHoveredBubble(bulle.key)}
                  onMouseLeave={() => setHoveredBubble(null)}
                >
                  {bulle.label}
                </div>
              ))}
            </div>
            {/* Vidéo centrée verticalement et horizontalement */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320, minWidth: 0 }}>
              <div style={{ width: '90%', maxWidth: 480, maxHeight: 360, aspectRatio: '16/9', background: '#222', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24 }}>
                Vidéo initiale
              </div>
            </div>
            {/* Bulles droite */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 18, height: '100%', marginLeft: 18 }}>
              {[
                { key: 'standard', label: 'Standard Rewards' },
                { key: 'premium', label: 'Premium Rewards' },
              ].map(bulle => (
                <div
                  key={bulle.key}
                  style={hoveredBubble === bulle.key ? { ...circleStyle, ...circleHoverStyle } : circleStyle}
                  onMouseEnter={() => setHoveredBubble(bulle.key)}
                  onMouseLeave={() => setHoveredBubble(null)}
                >
                  {bulle.label}
                </div>
              ))}
            </div>
          </div>
          {/* Infos bas */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, fontSize: 15 }}>
            <div style={{ fontWeight: 600, color: '#fff' }}>Time left to Complete</div>
            <div style={{ fontWeight: 600, color: '#fff' }}>Completion Price</div>
          </div>
          <div style={{ fontSize: 13, marginBottom: 0, color: '#fff' }}>Completions MINT / Completions available</div>
        </div>
        {/* Encart Completion à droite */}
        <div
          className="completion-bottom"
          style={{
            flex: 1,
            background: '#000',
            border: `3px solid ${YELLOW}`,
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
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          {/* Croix rouge de fermeture à l'intérieur en haut à droite */}
          <button
            onClick={onClose}
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
          {/* Mot Completion en haut */}
          <div style={{ color: YELLOW, fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 10, marginTop: 0 }}>Completion</div>
          {/* Zone de texte dans un seul encart, descendue */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 20, marginTop: 8, flexDirection: 'column', alignItems: 'center' }}>
            <textarea
              style={{ width: '95%', minHeight: 110, maxHeight: 160, borderRadius: 12, border: `2px solid ${YELLOW}`, padding: 16, fontSize: 17, background: '#111', color: '#fff', fontWeight: 500, resize: 'none', outline: 'none' }}
              placeholder={storyFocused ? '' : 'Write your Completion Story according to the Creation and Guideline’s Company. Creativity, magical, sophistication ! (minimum 100 characters)'}
              value={story}
              onChange={e => setStory(e.target.value)}
              onFocus={() => setStoryFocused(true)}
              onBlur={() => setStoryFocused(false)}
            />
            {/* Import vidéo centré horizontalement, seulement si pas de vidéo */}
            {!videoUrl && (
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: 18, marginTop: 12 }}>
                <label htmlFor="mp4-upload" style={{
                  background: 'none',
                  border: `2px solid ${YELLOW}`,
                  borderRadius: 12,
                  padding: '14px 28px',
                  color: YELLOW,
                  fontWeight: 700,
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontSize: 17,
                  boxShadow: '0 2px 8px #0008',
                  transition: 'background 0.2s',
                  width: 320,
                  display: 'block',
                }}>
                  Upload MP4 film according to your Completion Text (max.100MB)
                  <input
                    id="mp4-upload"
                    type="file"
                    accept="video/mp4"
                    style={{ display: 'none' }}
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
                    }}
                  />
                </label>
              </div>
            )}
            {/* Preview vidéo large, centrée, adaptée, reste dans l'encart */}
            {videoUrl && (
              <div style={{ position: 'relative', width: '95%', maxWidth: 480, margin: '10px auto 10px auto', display: 'flex', justifyContent: 'center' }}>
                <video src={videoUrl} controls style={{ width: '100%', maxWidth: 480, maxHeight: 400, borderRadius: 10, background: '#111', objectFit: 'contain' }} />
                {/* Petite croix rouge pour supprimer la vidéo, à l'extérieur du cadre vidéo */}
                <button
                  onClick={() => { setFile(null); setVideoUrl(null); }}
                  style={{
                    position: 'absolute',
                    top: -18,
                    right: -18,
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
        </div>
      </div>
      {/* Bouton Confirm parfaitement centré sous l'encart Completion */}
      <div style={{
        width: 'calc(49vw - 32px)',
        minWidth: 340,
        display: 'flex',
        justifyContent: 'center',
        margin: '0 0 0 auto',
        marginRight: '40px',
      }}>
        <button
          style={{
            width: 220,
            margin: '-44px auto 0 auto', // marginTop négatif pour coller encore plus
            background: isConfirmEnabled ? '#4ECB71' : '#FFD600',
            color: isConfirmEnabled ? '#111' : '#222',
            border: 'none',
            borderRadius: 12,
            padding: '18px 0',
            fontSize: 22,
            fontWeight: 700,
            cursor: isConfirmEnabled ? 'pointer' : 'not-allowed',
            boxShadow: '0 2px 8px #0008',
            display: 'block',
            transition: 'background 0.2s, color 0.2s',
            alignSelf: 'center',
          }}
          disabled={!isConfirmEnabled}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default CompletionPopup; 