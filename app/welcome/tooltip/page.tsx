'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const listItem = 'text-white font-inter';

const TooltipPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black font-inter" style={{ background: '#000' }}>
      <div className="relative max-w-lg w-full bg-black border-4 border-yellow-400 rounded-2xl p-6 sm:p-10 shadow-2xl">
        {/* Croix rouge pour fermer */}
        <button
          className="absolute top-4 right-4 text-4xl font-bold text-red-500 hover:text-red-700 transition-colors z-10"
          aria-label="Close"
          onClick={() => router.push('/welcome')}
        >
          ×
        </button>
        {/* Titre sans ampoule */}
        <div className="flex items-center justify-center mb-8">
          <h1 style={{ color: '#FFD600' }} className="text-4xl sm:text-5xl font-extrabold text-center tracking-wide drop-shadow-lg font-inter">What do you Win today?</h1>
        </div>
        <div className="space-y-10 text-lg">
          {/* Explorer */}
          <div>
            <div className="flex items-center mb-1">
              <span className="text-2xl mr-2" role="img" aria-label="compass">🧭</span>
              <h2 style={{ color: '#FFD600' }} className="text-2xl sm:text-3xl font-extrabold mb-1 drop-shadow-lg font-inter">Explorer</h2>
            </div>
            <h3 style={{ color: '#FFD600' }} className="font-bold mb-1 font-inter">For You. Humanity. With Love <span className="text-red-500">❤️</span></h3>
            <ul className="list-disc ml-7">
              <li className={listItem}>All in one place <span className="text-yellow-300">☀️</span></li>
              <li className={listItem}>Discover Winstory world.</li>
              <li className={listItem}>Creations and best Completions.</li>
            </ul>
          </div>
          {/* Create Campaign */}
          <div>
            <div className="flex items-center mb-1">
              <span className="text-2xl mr-2" role="img" aria-label="play">▶️</span>
              <h2 style={{ color: '#FFD600' }} className="text-2xl sm:text-3xl font-extrabold mb-1 drop-shadow-lg font-inter">Create Campaign</h2>
            </div>
            <h3 style={{ color: '#FFD600' }} className="font-bold mb-1 font-inter">For B2C Companies & creative individuals</h3>
            <ul className="list-disc ml-7">
              <li className={listItem}>Launch interactive narrative stories</li>
              <li className={listItem}>As a B2C Company : <span className="text-yellow-300">Your storytelling with ROI</span></li>
              <li className={listItem}>As an Individual : <span className="text-yellow-300">Your vision with $WINC</span></li>
              <li className={listItem}>Base the creative contributions</li>
              <li className={listItem}>Turn storytelling into visibility and impact</li>
            </ul>
          </div>
          {/* Moderate */}
          <div>
            <div className="flex items-center mb-1">
              <span className="text-2xl mr-2" role="img" aria-label="check and cross">✅❌</span>
              <h2 style={{ color: '#FFD600' }} className="text-2xl sm:text-3xl font-extrabold mb-1 drop-shadow-lg font-inter">Moderate</h2>
            </div>
            <h3 style={{ color: '#FFD600' }} className="font-bold mb-1 font-inter">For $WINC Stakers / DAO members only</h3>
            <ul className="list-disc ml-7">
              <li className={listItem}>Shape what deserves to rise</li>
              <li className={listItem}>Vote on the quality of completions</li>
              <li className={listItem}>Win <span className="text-yellow-300">$WINC</span> based on alignment</li>
              <li className={listItem}>Governance & rewards powered by your judgment</li>
            </ul>
          </div>
          {/* Complete Campaign */}
          <div>
            <div className="flex items-center mb-1">
              <span className="text-2xl mr-2" role="img" aria-label="fast forward">➡️</span>
              <h2 style={{ color: '#FFD600' }} className="text-2xl sm:text-3xl font-extrabold mb-1 drop-shadow-lg font-inter">Complete Campaign</h2>
            </div>
            <h3 style={{ color: '#FFD600' }} className="font-bold mb-1 font-inter">For Community Members</h3>
            <ul className="list-disc ml-7">
              <li className={listItem}>Take a story. Make it yours.</li>
              <li className={listItem}>Extend campaigns with your creative completion</li>
              <li className={listItem}>Win exclusive rewards from brands or Winstory</li>
              <li className={listItem}>Top 3 completions unlock <span className="text-yellow-300">Premium Rewards</span></li>
              <li className={listItem}>Inspire, tell, and get noticed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TooltipPage; 