'use client';

import React from 'react';
import TipBox from '@/components/icons/TipBox';
import CreationIcon from '@/components/icons/CreationIcon';
import ModerationIcon from '@/components/icons/ModerationIcon';
import CompletionIcon from '@/components/icons/CompletionIcon';
import ExplorerIcon from '@/components/icons/ExplorerIcon';

const rowStyle = 'flex items-center mb-16 w-full max-w-xs sm:max-w-md';
const textStyle = 'text-2xl sm:text-3xl font-bold tracking-wide text-yellow-400';

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
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative font-inter">
      <TipBox />

      <button className={rowStyle} onClick={() => handleClick('Create Campaign')}>
        <span className="mr-6"><CreationIcon /></span>
        <span className={textStyle}>Create Campaign</span>
      </button>

      <button className={rowStyle} onClick={() => handleClick('Moderate')}>
        <span className="mr-6"><ModerationIcon /></span>
        <span className={textStyle}>Moderate</span>
      </button>

      <button className={rowStyle} onClick={() => handleClick('Complete Campaign')}>
        <span className="mr-6"><CompletionIcon /></span>
        <span className={textStyle}>Complete Campaign</span>
      </button>

      <button className="flex flex-col items-center mt-16" onClick={() => handleClick('Explorer')}>
        <ExplorerIcon />
        <span className={textStyle}>Explorer</span>
      </button>
    </div>
  );
};

export default Home;
