import React from 'react';

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

  if (!open) return null;

  // Gestion fermeture par clic overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
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
        background: 'rgba(0,0,0,0.7)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 5,
      }}
      onClick={handleOverlayClick}
    >
      <div
        className="completion-popup"
        style={{
          width: '70vw',
          maxWidth: 950,
          height: '90vh',
          background: '#111',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 0 32px #000',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Partie haute (campagne initiale) */}
        <div
          className="completion-top"
          style={{
            flex: '0 0 48%',
            background: '#000',
            border: `3px solid ${GREEN}`,
            borderRadius: '16px 16px 0 0',
            padding: '12px 24px 12px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            minHeight: 0,
          }}
        >
          <div style={{ color: GREEN, fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>Creation</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontStyle: 'italic', fontSize: 16, color: '#fff' }}>Title</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>@Company</div>
          </div>
          <div style={{ display: 'flex', flex: 1, alignItems: 'flex-start', justifyContent: 'center', gap: 32 }}>
            {/* Vidéo initiale, taille réduite */}
            <div style={{ width: 426, height: 240, background: '#222', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, flexShrink: 0 }}>
              Vidéo initiale
            </div>
            {/* Bulles vertes à droite de la vidéo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'flex-start', alignItems: 'center', marginTop: 0 }}>
              <button style={{ borderRadius: 50, background: GREEN, color: '#111', padding: '14px 32px', fontWeight: 700, border: 'none', fontSize: 16, boxShadow: '0 2px 8px #0008', cursor: 'pointer', minWidth: 170 }}>Starting Text</button>
              <button style={{ borderRadius: 50, background: GREEN, color: '#111', padding: '14px 32px', fontWeight: 700, border: 'none', fontSize: 16, boxShadow: '0 2px 8px #0008', cursor: 'pointer', minWidth: 170 }}>Guideline</button>
              <button style={{ borderRadius: 50, background: GREEN, color: '#111', padding: '14px 32px', fontWeight: 700, border: 'none', fontSize: 16, boxShadow: '0 2px 8px #0008', cursor: 'pointer', minWidth: 170 }}>Standard Rewards</button>
              <button style={{ borderRadius: 50, background: GREEN, color: '#111', padding: '14px 32px', fontWeight: 700, border: 'none', fontSize: 16, boxShadow: '0 2px 8px #0008', cursor: 'pointer', minWidth: 170 }}>Premium Rewards</button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13 }}>
            <div style={{ fontWeight: 600, color: '#fff' }}>Time left to Complete</div>
            <div style={{ fontWeight: 600, color: '#fff' }}>Completion Price</div>
          </div>
          <div style={{ fontSize: 12, marginBottom: 0, color: '#fff' }}>Completions MINT / Completions available</div>
        </div>
        {/* Partie basse (complétion utilisateur) */}
        <div
          className="completion-bottom"
          style={{
            flex: '0 0 52%',
            background: '#222',
            border: `3px solid ${YELLOW}`,
            borderRadius: '0 0 16px 16px',
            padding: '12px 24px 12px 24px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: 0,
          }}
        >
          {/* Croix de fermeture */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 12,
              right: 16,
              background: 'none',
              border: 'none',
              fontSize: 32,
              color: '#FF2D55',
              cursor: 'pointer',
              fontWeight: 700,
              zIndex: 2,
            }}
            aria-label="Fermer"
          >
            ×
          </button>
          <div style={{ color: YELLOW, fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>Completion</div>
          <textarea
            style={{ width: '100%', minHeight: 70, borderRadius: 8, border: `2px solid ${YELLOW}`, padding: 12, fontSize: 15, marginBottom: 12, background: '#222', color: '#fff', fontWeight: 500 }}
            placeholder={storyFocused ? '' : 'Write your Completion Story according to the Creation and Guideline’s Company. Creativity, magical, sophistication ! (minimum 100 characters)'}
            value={story}
            onChange={e => setStory(e.target.value)}
            onFocus={() => setStoryFocused(true)}
            onBlur={() => setStoryFocused(false)}
          />
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <label htmlFor="mp4-upload" style={{
              background: 'none',
              border: `2px solid ${YELLOW}`,
              borderRadius: 12,
              padding: '12px 24px',
              color: YELLOW,
              fontWeight: 700,
              textAlign: 'center',
              cursor: 'pointer',
              fontSize: 15,
              boxShadow: '0 2px 8px #0008',
              transition: 'background 0.2s',
            }}>
              {file ? file.name : 'Upload MP4 film according to your Completion Text (max.100MB)'}
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
          <button
            style={{
              width: 180,
              alignSelf: 'center',
              background: GREEN,
              color: '#111',
              border: 'none',
              borderRadius: 12,
              padding: '10px 0',
              fontSize: 17,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #0008',
              marginTop: 2,
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionPopup; 