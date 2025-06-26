"use client";
import React, { useState } from 'react';

// Icône mallette (SVG simplifié, à remplacer par le SVG complet si besoin)
const BriefcaseIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 16 }}>
    <rect x="8" y="16" width="32" height="20" rx="3" fill="#FFD600" stroke="#FFD600" strokeWidth="2"/>
    <rect x="14" y="10" width="20" height="8" rx="2" fill="#FFD600" stroke="#FFD600" strokeWidth="2"/>
    <rect x="8" y="16" width="32" height="20" rx="3" fill="none" stroke="#FFD600" strokeWidth="2"/>
  </svg>
);

export default function YourWinstoryB2C() {
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [guideline, setGuideline] = useState('');
  const [focus, setFocus] = useState({ title: false, story: false, guideline: false });

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#FFD600', fontFamily: 'Inter, sans-serif', padding: 0, margin: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 40, paddingBottom: 24 }}>
        <BriefcaseIcon />
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: 1 }}>Your winStory</h1>
        <span style={{ fontSize: 36, marginLeft: 16 }}>💡</span>
      </div>

      {/* Bloc: Starting Title */}
      <section style={{ maxWidth: 600, margin: '0 auto', marginTop: 48 }}>
        <h2 style={{ color: '#FFD600', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 16 }}>Starting Title</h2>
        <div style={{ border: '2px solid #FFD600', borderRadius: 6, padding: 18, background: 'rgba(0,0,0,0.7)', marginBottom: 48 }}>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onFocus={() => setFocus(f => ({ ...f, title: true }))}
            onBlur={() => setFocus(f => ({ ...f, title: false }))}
            placeholder={focus.title || title ? '' : 'Enter title, hook your audience in a few words. Go for impact !'}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFD600',
              fontSize: 18,
              fontStyle: !focus.title && !title ? 'italic' : 'normal',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </section>

      {/* Bloc: Starting Story */}
      <section style={{ maxWidth: 700, margin: '0 auto', marginTop: 24 }}>
        <h2 style={{ color: '#FFD600', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 16 }}>Starting Story</h2>
        <div style={{ border: '2px solid #FFD600', borderRadius: 6, padding: 18, background: 'rgba(0,0,0,0.7)', marginBottom: 48 }}>
          <textarea
            value={story}
            onChange={e => setStory(e.target.value)}
            onFocus={() => setFocus(f => ({ ...f, story: true }))}
            onBlur={() => setFocus(f => ({ ...f, story: false }))}
            placeholder={focus.story || story ? '' : `Like a cinematic script with your scenario and visual effects !\n\nWrite, invent, imagine your Starting Text highlighting your brand's impact and added value, then open-ended at the perfect suspense moment and let your community co-create! Imagine a decor, a mood, characters, plot-twist etc.\n\nSophistication, imagination, your creativity is your only limit !\n\nPlease note that we don't tolerate any incitement to hatred, violence or other forms of discrimination, like Hate Speech, in our version nor in future.`}
            rows={8}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFD600',
              fontSize: 17,
              fontStyle: !focus.story && !story ? 'italic' : 'normal',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>
      </section>

      {/* Bloc: Guideline */}
      <section style={{ maxWidth: 700, margin: '0 auto', marginTop: 24, marginBottom: 64 }}>
        <h2 style={{ color: '#FFD600', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 16 }}>Guideline</h2>
        <div style={{ border: '2px solid #FFD600', borderRadius: 6, padding: 18, background: 'rgba(0,0,0,0.7)' }}>
          <textarea
            value={guideline}
            onChange={e => setGuideline(e.target.value)}
            onFocus={() => setFocus(f => ({ ...f, guideline: true }))}
            onBlur={() => setFocus(f => ({ ...f, guideline: false }))}
            placeholder={focus.guideline || guideline ? '' : `Guide your community completions, with style, tone, key elements.\nYour story, your rules ! This will help both the moderators in scoring completions and the community to be more coherent.`}
            rows={5}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFD600',
              fontSize: 17,
              fontStyle: !focus.guideline && !guideline ? 'italic' : 'normal',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>
      </section>
    </div>
  );
} 