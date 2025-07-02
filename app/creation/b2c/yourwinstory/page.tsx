"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Icône mallette (SVG simplifié, à remplacer par le SVG complet si besoin)
const BriefcaseIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 16 }}>
    <rect x="8" y="16" width="32" height="20" rx="3" fill="#FFD600" stroke="#FFD600" strokeWidth="2"/>
    <rect x="14" y="10" width="20" height="8" rx="2" fill="#FFD600" stroke="#FFD600" strokeWidth="2"/>
    <rect x="8" y="16" width="32" height="20" rx="3" fill="none" stroke="#FFD600" strokeWidth="2"/>
  </svg>
);

// Flèche verte dans un rond
const GreenArrowButton = ({ onClick, disabled }: { onClick: () => void, disabled: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label="Next"
    style={{
      position: 'absolute',
      bottom: 16,
      right: 16,
      background: 'none',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      padding: 0,
      outline: 'none',
      opacity: disabled ? 0.6 : 1,
    }}
  >
    <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="18" fill="#18C964"/>
      <path d="M16 22L24 30L32 22" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
);

// Croix rouge réutilisable
const CloseIcon = ({ onClick, size = 24 }: { onClick: () => void; size?: number }) => (
  <svg onClick={onClick} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer', position: 'absolute', top: 32, right: 32, zIndex: 100 }}>
    <path d="M18 6L6 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6L18 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function YourWinstoryB2C() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [guideline, setGuideline] = useState('');
  const [focus, setFocus] = useState({ title: false, story: false, guideline: false });
  const [touched, setTouched] = useState({ title: false, story: false, guideline: false });
  const [error, setError] = useState<{title?: string, story?: string, guideline?: string}>({});
  const [showModal, setShowModal] = useState(false);

  // Validation
  const isTitleValid = !!title.trim();
  const isStoryValid = !!story.trim();
  const isGuidelineValid = !!guideline.trim();
  const allValid = isTitleValid && isStoryValid && isGuidelineValid;

  // Helper pour savoir si on doit afficher l'erreur
  const showTitleError = !isTitleValid && touched.title;
  const showStoryError = !isStoryValid && touched.story;
  const showGuidelineError = !isGuidelineValid && touched.guideline;

  const handleNext = () => {
    const newError: typeof error = {};
    if (!isTitleValid) newError.title = 'This field is required.';
    if (!isStoryValid) newError.story = 'This field is required.';
    if (!isGuidelineValid) newError.guideline = 'This field is required.';
    setError(newError);
    setTouched({ title: true, story: true, guideline: true });
    if (Object.keys(newError).length === 0) {
      // Aller à la page suivante (à adapter selon le flow)
      router.push('/creation/b2c/yourfilm');
    }
  };

  // Couleur dynamique
  const getColor = (valid: boolean, touched: boolean, focus: boolean) => {
    if (focus) return '#FFD600';
    if (valid) return '#18C964'; // vert
    if (touched) return '#F31260'; // rouge
    return '#FFD600'; // jaune
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#FFD600', fontFamily: 'Inter, sans-serif', padding: 0, margin: 0 }}>
      {/* Croix rouge en haut à droite */}
      <CloseIcon onClick={() => router.push('/welcome')} size={32} />
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 40, paddingBottom: 24, position: 'relative' }}>
        <BriefcaseIcon />
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: 1 }}>Your winStory</h1>
        <span
          style={{ fontSize: 36, marginLeft: 16, cursor: 'pointer' }}
          onClick={() => setShowModal(true)}
          aria-label="Show info"
        >💡</span>
      </div>
      {/* Modal for the bulb */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ background: '#111', color: '#FFD600', padding: 32, borderRadius: 16, minWidth: 320, textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 6L18 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Info</div>
            <div style={{ fontSize: 16 }}>This popup will be customized later.</div>
          </div>
        </div>
      )}

      {/* Bloc: Starting Title */}
      <section style={{ maxWidth: 600, margin: '0 auto', marginTop: 48 }}>
        <h2 style={{
          color: showTitleError ? '#F31260' : getColor(isTitleValid, touched.title, focus.title),
          fontSize: 28,
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 16
        }}>Starting Title</h2>
        <div style={{
          border: `2px solid ${showTitleError ? '#F31260' : getColor(isTitleValid, touched.title, focus.title)}`,
          borderRadius: 6,
          padding: 18,
          background: 'rgba(0,0,0,0.7)',
          marginBottom: 8,
          position: 'relative',
        }}>
          <input
            type="text"
            value={title}
            onChange={e => { setTitle(e.target.value); if (touched.title) setTouched(t => ({ ...t, title: false })); setError(e => ({ ...e, title: undefined })); }}
            onFocus={() => setFocus(f => ({ ...f, title: true }))}
            onBlur={() => { setFocus(f => ({ ...f, title: false })); setTouched(t => ({ ...t, title: true })); }}
            placeholder={focus.title || title ? '' : 'Enter title, hook your audience in a few words. Go for impact !'}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: showTitleError ? '#F31260' : getColor(isTitleValid, touched.title, focus.title),
              fontSize: 18,
              fontStyle: !focus.title && !title ? 'italic' : 'normal',
              fontFamily: 'inherit',
            }}
          />
        </div>
        {showTitleError && (
          <div style={{ color: '#F31260', fontSize: 15, marginBottom: 32, textAlign: 'center' }}>This field is required.</div>
        )}
      </section>

      {/* Bloc: Starting Story */}
      <section style={{ maxWidth: 700, margin: '0 auto', marginTop: 24 }}>
        <h2 style={{
          color: showStoryError ? '#F31260' : getColor(isStoryValid, touched.story, focus.story),
          fontSize: 28,
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 16
        }}>Starting Story</h2>
        <div style={{
          border: `2px solid ${showStoryError ? '#F31260' : getColor(isStoryValid, touched.story, focus.story)}`,
          borderRadius: 6,
          padding: 18,
          background: 'rgba(0,0,0,0.7)',
          marginBottom: 8,
          position: 'relative',
        }}>
          <textarea
            value={story}
            onChange={e => { setStory(e.target.value); if (touched.story) setTouched(t => ({ ...t, story: false })); setError(e => ({ ...e, story: undefined })); }}
            onFocus={() => setFocus(f => ({ ...f, story: true }))}
            onBlur={() => { setFocus(f => ({ ...f, story: false })); setTouched(t => ({ ...t, story: true })); }}
            placeholder={focus.story || story ? '' : `Like a cinematic script with your scenario and visual effects !\n\nWrite, invent, imagine your Starting Text highlighting your brand's impact and added value, then open-ended at the perfect suspense moment and let your community co-create! Imagine a decor, a mood, characters, plot-twist etc.\n\nSophistication, imagination, your creativity is your only limit !\n\nPlease note that we don't tolerate any incitement to hatred, violence or other forms of discrimination, like Hate Speech, in our version nor in future.`}
            rows={8}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: showStoryError ? '#F31260' : getColor(isStoryValid, touched.story, focus.story),
              fontSize: 17,
              fontStyle: !focus.story && !story ? 'italic' : 'normal',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>
        {showStoryError && (
          <div style={{ color: '#F31260', fontSize: 15, marginBottom: 32, textAlign: 'center' }}>This field is required.</div>
        )}
      </section>

      {/* Bloc: Guideline */}
      <section style={{ maxWidth: 700, margin: '0 auto', marginTop: 24, marginBottom: 64 }}>
        <h2 style={{
          color: showGuidelineError ? '#F31260' : getColor(isGuidelineValid, touched.guideline, focus.guideline),
          fontSize: 28,
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 16
        }}>Guideline</h2>
        <div style={{
          border: `2px solid ${showGuidelineError ? '#F31260' : getColor(isGuidelineValid, touched.guideline, focus.guideline)}`,
          borderRadius: 6,
          padding: 18,
          background: 'rgba(0,0,0,0.7)',
          minHeight: 120,
        }}>
          <textarea
            value={guideline}
            onChange={e => { setGuideline(e.target.value); if (touched.guideline) setTouched(t => ({ ...t, guideline: false })); setError(e => ({ ...e, guideline: undefined })); }}
            onFocus={() => setFocus(f => ({ ...f, guideline: true }))}
            onBlur={() => { setFocus(f => ({ ...f, guideline: false })); setTouched(t => ({ ...t, guideline: true })); }}
            placeholder={focus.guideline || guideline ? '' : `Guide your community completions, with style, tone, key elements.\nYour story, your rules ! This will help both the moderators in scoring completions and the community to be more coherent.`}
            rows={5}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: showGuidelineError ? '#F31260' : getColor(isGuidelineValid, touched.guideline, focus.guideline),
              fontSize: 17,
              fontStyle: !focus.guideline && !guideline ? 'italic' : 'normal',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>
        {showGuidelineError && (
          <div style={{ color: '#F31260', fontSize: 15, marginTop: 8, textAlign: 'center' }}>This field is required.</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
          <GreenArrowButton onClick={handleNext} disabled={false} />
        </div>
      </section>
    </div>
  );
} 