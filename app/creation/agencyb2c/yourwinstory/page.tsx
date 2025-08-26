"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
      opacity: disabled ? 0.3 : 1,
      transition: 'opacity 0.2s',
    }}
  >
    <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="18" fill="#18C964"/>
      <path d="M16 22L24 30L32 22" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
);

const CloseIcon = ({ onClick, size = 24 }: { onClick: () => void; size?: number }) => (
  <svg onClick={onClick} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer', position: 'absolute', top: 32, right: 32, zIndex: 100 }}>
    <path d="M18 6L6 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6L18 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function YourWinstoryAgencyB2C() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [guideline, setGuideline] = useState('');
  const [focus, setFocus] = useState({ title: false, story: false, guideline: false });
  const [touched, setTouched] = useState({ title: false, story: false, guideline: false });
  const [error, setError] = useState<{title?: string, story?: string, guideline?: string}>({});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user?.email) {
      router.replace('/creation/agencyb2c/login');
      return;
    }
    const b2cClient = JSON.parse(localStorage.getItem('b2cClient') || 'null');
    if (!b2cClient?.verified) {
      router.replace('/creation/agencyb2c/yourinformations');
      return;
    }
  }, [router]);

  const isTitleValid = !!title.trim();
  const isStoryValid = !!story.trim();
  const isGuidelineValid = !!guideline.trim();
  const allValid = isTitleValid && isStoryValid && isGuidelineValid;

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
      localStorage.setItem("story", JSON.stringify({
        title,
        startingStory: story,
        guideline
      }));
      router.push('/creation/agencyb2c/yourfilm');
    }
  };

  const getColor = (valid: boolean, touched: boolean, focus: boolean) => {
    if (focus) return '#FFD600';
    if (valid) return '#18C964';
    if (touched) return '#F31260';
    return '#FFD600';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#FFD600', fontFamily: 'Inter, sans-serif', padding: 0, margin: 0 }}>
      <CloseIcon onClick={() => router.push('/welcome')} size={32} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 40, paddingBottom: 24, position: 'relative' }}>
        <img src="/company.svg" alt="Company Icon" style={{ width: 96, height: 96, marginRight: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: 1 }}>Your winStory</h1>
          <span style={{ fontSize: 18, fontStyle: 'italic', marginTop: 4 }}>as Agency</span>
        </div>
        <img
          src="/tooltip.svg"
          alt="Aide"
          style={{ width: 36, height: 36, marginLeft: 16, cursor: 'pointer' }}
          onClick={() => setShowModal(true)}
          aria-label="Show info"
        />
      </div>
      {showModal && (
        <div 
          style={{
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
          }}
          onClick={() => setShowModal(false)}
        >
          <div 
            style={{ 
              background: '#111', 
              color: '#fff', 
              padding: 32, 
              borderRadius: 16, 
              minWidth: 320, 
              maxWidth: 600, 
              textAlign: 'left', 
              position: 'relative', 
              maxHeight: '80vh', 
              overflowY: 'auto',
              border: '3px solid #FFD600',
              boxShadow: '0 4px 32px #000a'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 6L18 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: '#FFD600' }}>This is where your client's Neo-Marketing Web2.5 begins</div>
            <div style={{ fontSize: 16, marginBottom: 24, lineHeight: 1.6 }}>
              You're not just launching content,<br/>
              you're activating the foundational moment where your client's brand hands the mic to the world.
            </div>
            <div style={{ fontSize: 16, marginBottom: 24, lineHeight: 1.6 }}>
              As an agency, you're shaping the narrative bridge between brand and community.<br/>
              You're crafting the first signal, the narrative spark, that will invite the world to join, remix, and elevate the story.
            </div>
            
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#FFD600' }}>Starting Title</div>
            <div style={{ fontSize: 16, marginBottom: 24, lineHeight: 1.6 }}>
              The hook, the spark.<br/>
              This is the first beat of your client's brand narrative, it sets the rhythm, the tone, the intent.
            </div>
            <div style={{ fontSize: 16, marginBottom: 24, lineHeight: 1.6 }}>
              Make it short, memorable, and loaded with meaning.<br/>
              You're not selling a product, you're launching a world.<br/>
              A good title triggers insatiable curiosity or emotion in a single line.<br/>
              Aim for clarity, think tagline meets teaser.
            </div>
            
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#FFD600' }}>Starting Story</div>
            <div style={{ fontSize: 16, marginBottom: 24, lineHeight: 1.6 }}>
              Your written story meets the starting film, giving it narrative depth, for the eyes and for the mind.<br/>
              You're writing the first chapter of a story that the community will complete, each in their own way.
            </div>
            <div style={{ fontSize: 16, marginBottom: 24, lineHeight: 1.6 }}>
              Describe a scene, create tension, think visual, immersive, suggestive.<br/>
              Inject your client's values and brand essence subtly, through atmosphere, not slogans.
            </div>
            <div style={{ fontSize: 16, marginBottom: 24, lineHeight: 1.6 }}>
              Set the tone, the mood, the style, and most importantly, leave it open enough to invite continuations.<br/>
              Whether it's a plot twist, a mysterious character, a sudden silence, or an unresolved choice, etc., infinite examples exist.<br/>
              Leave a gap, an unresolved thread, a door left open.
            </div>
            <div style={{ fontSize: 16, marginBottom: 24, lineHeight: 1.6 }}>
              This isn't just a script for ads, it's a narrative designed to inspire imagination and elevate brand meaning.<br/>
              You're not concluding, you're setting the scene for infinite continuations.
            </div>
            
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#FFD600' }}>Guideline</div>
            <div style={{ fontSize: 16, marginBottom: 24, lineHeight: 1.6 }}>
              This is your narrative compass, your space to define the do's and don'ts.
            </div>
            <div style={{ fontSize: 16, marginBottom: 24, lineHeight: 1.6 }}>
              It ensures your client's brand DNA remains intact while opening the door to creative excellence.
            </div>
            <div style={{ fontSize: 16, marginBottom: 24, lineHeight: 1.6 }}>
              While the Starting Story sets the tone, the Guideline defines the creative boundaries.
            </div>
            <div style={{ fontSize: 16, marginBottom: 24, lineHeight: 1.6 }}>
              Clarify what matters most. Here's what you can define to keep the narrative aligned:
            </div>
            <ul style={{ marginTop: 8, marginLeft: 20, marginBottom: 24 }}>
              <li>Tone</li>
              <li>Format</li>
              <li>Brand values to respect</li>
              <li>Elements to avoid</li>
            </ul>
            <div style={{ fontSize: 16, lineHeight: 1.6 }}>
              A clear guideline helps contributors stay focused, and helps moderators score the most aligned completions.
            </div>
            <div style={{ fontSize: 16, lineHeight: 1.6 }}>
              Your client's story, your narrative setup, your framework, define it with intention.
            </div>
          </div>
        </div>
      )}

      <section style={{ maxWidth: 600, margin: '0 auto', marginTop: 20 }}>
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
            placeholder={focus.title || title ? '' : 'Enter title, hook the audience in a few words. Go for impact !'}
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

      <section style={{ maxWidth: 700, margin: '0 auto', marginTop: 16 }}>
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
            placeholder={focus.story || story ? '' : `Like a cinematic script with your scenario and visual effects !\n\nWrite, invent, imagine your Starting Text highlighting the brand's impact and added value, then open-ended at the perfect suspense moment and let the community co-create! Imagine a decor, a mood, characters, plot-twist etc.\n\nSophistication, imagination, your creativity is your only limit !\n\nPlease note that we don't tolerate any incitement to hatred, violence or other forms of discrimination, like Hate Speech, in our version nor in future.`}
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
          padding: 9,
          background: 'rgba(0,0,0,0.7)',
          minHeight: 60,
        }}>
          <textarea
            value={guideline}
            onChange={e => { setGuideline(e.target.value); if (touched.guideline) setTouched(t => ({ ...t, guideline: false })); setError(e => ({ ...e, guideline: undefined })); }}
            onFocus={() => setFocus(f => ({ ...f, guideline: true }))}
            onBlur={() => { setFocus(f => ({ ...f, guideline: false })); setTouched(t => ({ ...t, guideline: true })); }}
            placeholder={focus.guideline || guideline ? '' : `Guide the community completions, with style, tone, key elements.\nYour B2C customer, your story, your rules ! This will help both the moderators in scoring completions and the community to be more coherent.`}
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
  );
} 