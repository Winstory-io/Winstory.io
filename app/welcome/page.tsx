'use client';

import React from 'react';
import TipBox from '@/components/icons/TipBox';
import CreationIcon from '@/components/icons/CreationIcon';
import ModerationIcon from '@/components/icons/ModerationIcon';
import CompletionIcon from '@/components/icons/CompletionIcon';
import ExplorerIcon from '@/components/icons/ExplorerIcon';

const buttonStyle =
  'flex items-center gap-6 py-6 select-none transition-transform active:scale-95 focus:outline-none';
const textStyle =
  'text-4xl sm:text-5xl font-extrabold tracking-wide text-yellow-400 drop-shadow-lg';

const Home = () => {
  const handleClick = (action: string) => {
    switch (action) {
      case 'Create Campaign':
        window.location.href = '/app/creation';
        break;
      case 'Moderate':
        window.location.href = '/app/moderation';
        break;
      case 'Complete Campaign':
        window.location.href = '/app/completion';
        break;
      case 'Explorer':
        window.location.href = '/app/explorer';
        break;
      case 'Tooltip':
        window.location.href = '/app/welcome/tooltip';
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center relative font-inter bg-black" style={{ background: '#000' }}>
      {/* Fond noir global */}
      <style>{`body { background: #000 !important; }`}</style>

      {/* Ampoule cliquable en haut à droite */}
      <div className="absolute top-8 right-8 z-50 cursor-pointer" onClick={() => handleClick('Tooltip')}>
        <TipBox />
      </div>

      {/* Section centrale verticale et centrée */}
      <div className="flex flex-col items-center justify-center flex-1 w-full gap-12">
        <button className={buttonStyle} style={{ background: 'none', border: 'none' }} onClick={() => handleClick('Create Campaign')}>
          <span className="text-7xl text-yellow-400"><CreationIcon /></span>
          <span className={textStyle} style={{ color: '#FFD600' }}>Create Campaign</span>
        </button>

        <button className={buttonStyle} style={{ background: 'none', border: 'none' }} onClick={() => handleClick('Moderate')}>
          <span className="text-7xl text-yellow-400"><ModerationIcon /></span>
          <span className={textStyle} style={{ color: '#FFD600' }}>Moderate</span>
        </button>

        <button className={buttonStyle} style={{ background: 'none', border: 'none' }} onClick={() => handleClick('Complete Campaign')}>
          <span className="text-7xl text-yellow-400"><CompletionIcon /></span>
          <span className={textStyle} style={{ color: '#FFD600' }}>Complete Campaign</span>
        </button>
      </div>

      {/* Explorer tout en bas, centré */}
      <div className="flex flex-col items-center mb-16">
        <button className="flex flex-col items-center" style={{ background: 'none', border: 'none' }} onClick={() => handleClick('Explorer')}>
          <span className="text-7xl text-yellow-400"><ExplorerIcon /></span>
          <span className={textStyle} style={{ color: '#FFD600' }}>Explorer</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
