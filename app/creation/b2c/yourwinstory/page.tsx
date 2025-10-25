"use client";
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

// Flèche colorée dans un rond
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
      transition: 'opacity 0.2s',
    }}
  >
    <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="18" fill={disabled ? '#FF2D2D' : '#18C964'} />
      <path d="M16 22L24 30L32 22" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

// Croix rouge réutilisable
const CloseIcon = ({ onClick, size = 24 }: { onClick: () => void; size?: number }) => (
  <svg onClick={onClick} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer', position: 'absolute', top: 32, right: 32, zIndex: 100 }}>
    <path d="M18 6L6 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 6L18 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function YourWinstoryB2C() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [guideline, setGuideline] = useState('');
  const [focus, setFocus] = useState({ title: false, story: false, guideline: false });
  const [touched, setTouched] = useState({ title: false, story: false, guideline: false });
  const [error, setError] = useState<{ title?: string, story?: string, guideline?: string }>({});
  const [showModal, setShowModal] = useState(false);

  // Handlers avec useCallback pour éviter les re-renders inutiles
  const handleShowModal = useCallback(() => {
    console.log('Opening tooltip modal');
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    console.log('Closing tooltip modal');
    setShowModal(false);
  }, []);

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
      console.log('=== CREATE CAMPAIGN - Step 2: Your Winstory ===');
      console.log('Starting Title:', title);
      console.log('Starting Story:', story);
      console.log('Guideline:', guideline);
      console.log('==========================================');
      // Sauvegarde dans le localStorage
      localStorage.setItem("story", JSON.stringify({
        title,
        startingStory: story,
        guideline
      }));
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
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', background: '#000', color: '#FFD600', fontFamily: 'Inter, sans-serif', padding: 0, margin: 0 }}>
        {/* Croix rouge en haut à droite */}
        <CloseIcon onClick={() => router.push('/welcome')} size={32} />
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 40, paddingBottom: 24, position: 'relative' }}>
          <img src="/company.svg" alt="Company Icon" style={{ width: 96, height: 96, marginRight: 16 }} />
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: 1 }}>Your winStory</h1>
          <img
            src="/tooltip.svg"
            alt="Aide"
            style={{ width: 36, height: 36, marginLeft: 16, cursor: 'pointer' }}
            onClick={handleShowModal}
            aria-label="Show info"
          />
        </div>
        {/* Modal for the bulb - Tooltip persistant */}
        {showModal && (
          <div key="tooltip-modal" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.7)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }} onClick={handleCloseModal}>
            <div style={{ background: '#000', color: '#FFD600', padding: 32, borderRadius: 24, minWidth: 340, maxWidth: 600, textAlign: 'left', position: 'relative', border: '4px solid #FFD600', boxShadow: '0 0 32px #000' }} onClick={e => e.stopPropagation()}>
              <button onClick={handleCloseModal} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 }}>
                <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="10" y1="10" x2="30" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" /><line x1="30" y1="10" x2="10" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" /></svg>
              </button>
              <h2 style={{ color: '#FFD600', fontSize: 22, fontWeight: 900, textAlign: 'center', marginBottom: 18, letterSpacing: 1 }}>This is where your Neo-Marketing Web2.5 begins !</h2>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 400, marginBottom: 18, textAlign: 'center' }}>
                Your brand starts the story, your community writes the future. You're not just writing, you're activating the foundational moment where your brand hands the mic to the world !
              </div>
              <div style={{ marginBottom: 18 }}>
                <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 17, marginBottom: 6 }}>Starting Title</div>
                <div style={{ color: '#fff', fontSize: 15, fontWeight: 500 }}>
                  The hook. The spark. Think of your title as the first beat of your brand's narrative : sets the rhythm, the tone, the intent. Make it short, memorable, and loaded with meaning. You're not selling a product, you're launching a world. A good title triggers insatiable curiosity and emotions, in a single line. Aim for clarity. Think tagline meets teaser.
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 17, marginBottom: 6 }}>Starting Story</div>
                <div style={{ color: '#fff', fontSize: 15, fontWeight: 500 }}>
                  Your starting text meets your starting film, giving it a new dimension. You write the first chapter of a story your community, individually, will complete, and elevate each in their own way. Describe a scene. Create tension. Think visual, immersive, suggestive. Inject your brand's value and vision subtly, through atmosphere, not slogans. Set the tone, the mood, the style, and most importantly, leave it open enough to invite continuations. Whether it's a plot twist, a mysterious character, a sudden silence, or an unresolved choice, etc.. infinite examples ! Leave a gap, an unresolved thread, a door left open. This isn't just a script for ads, it's a narrative designed to inspire imagination and elevate your brand meaning. You're not concluding, you're setting the scene for infinite continuations.
                </div>
              </div>
              <div style={{ marginBottom: 0 }}>
                <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 17, marginBottom: 6 }}>Guideline</div>
                <div style={{ color: '#fff', fontSize: 15, fontWeight: 500 }}>
                  This is your narrative compass. This is the space to define the do's and don'ts. It ensures your brand's DNA remains intact while opening the door to creative excellence. While your Starting Story sets the scene, the Guideline sets the rules of the game. Clarify what matters most for you. Here's what you can define to keep the narrative aligned, a few examples among others :
                  <br /><br />
                  • Tone<br />
                  • Format<br />
                  • Brand values to respect<br />
                  • Elements to avoid<br />
                  <br />
                  A clear guideline helps contributors stay aligned and helps moderators score the most aligned completions. Your story, your world, your codes, define them here.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bloc: Starting Title */}
        <section style={{ maxWidth: 600, margin: '0 auto', marginTop: 20 }}>
          <h2 style={{
            color: showTitleError ? '#F31260' : getColor(isTitleValid, touched.title, focus.title),
            fontSize: 28,
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 16
          }}>Starting Title</h2>
          <div 
            style={{
              border: `2px solid ${showTitleError ? '#F31260' : getColor(isTitleValid, touched.title, focus.title)}`,
              borderRadius: 6,
              padding: 18,
              background: 'rgba(0,0,0,0.7)',
              marginBottom: 8,
              position: 'relative',
              transition: 'all 0.3s ease',
              transform: 'scale(1)',
              boxShadow: '0 0 5px rgba(255, 214, 0, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 214, 0, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 5px rgba(255, 214, 0, 0.3)';
            }}
          >
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
        <section style={{ maxWidth: 700, margin: '0 auto', marginTop: 16 }}>
          <h2 style={{
            color: showStoryError ? '#F31260' : getColor(isStoryValid, touched.story, focus.story),
            fontSize: 28,
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 16
          }}>Starting Story</h2>
          <div 
            style={{
              border: `2px solid ${showStoryError ? '#F31260' : getColor(isStoryValid, touched.story, focus.story)}`,
              borderRadius: 6,
              padding: 18,
              background: 'rgba(0,0,0,0.7)',
              marginBottom: 8,
              position: 'relative',
              transition: 'all 0.3s ease',
              transform: 'scale(1)',
              boxShadow: '0 0 5px rgba(255, 214, 0, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 214, 0, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 5px rgba(255, 214, 0, 0.3)';
            }}
          >
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
          <div 
            style={{
              border: `2px solid ${showGuidelineError ? '#F31260' : getColor(isGuidelineValid, touched.guideline, focus.guideline)}`,
              borderRadius: 6,
              padding: 9,
              background: 'rgba(0,0,0,0.7)',
              minHeight: 60,
              transition: 'all 0.3s ease',
              transform: 'scale(1)',
              boxShadow: '0 0 5px rgba(255, 214, 0, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 214, 0, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 5px rgba(255, 214, 0, 0.3)';
            }}
          >
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
            <GreenArrowButton onClick={handleNext} disabled={!allValid} />
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
} 