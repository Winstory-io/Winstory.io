'use client';
import React from 'react';

const iconStyle = {
  fontSize: '64px',
  marginRight: '24px',
  flexShrink: 0,
};
const rowStyle =
  'flex items-center mb-16 w-full max-w-xs sm:max-w-md';
const textStyle =
  'text-2xl sm:text-3xl font-bold tracking-wide text-yellow-400';

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
      case 'Ampoule cliquée':
        alert('Astuce : Créez, modérez ou explorez les campagnes !');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative font-inter">
      {/* Ampoule en haut à droite */}
      <button
        className="absolute top-8 right-8 text-yellow-400 text-4xl focus:outline-none"
        onClick={() => handleClick('Ampoule cliquée')}
        aria-label="Informations ou astuces"
        style={{ fontSize: '48px' }}
      >
        <span role="img" aria-label="ampoule">💡</span>
      </button>

      {/* Create Campaign */}
      <button
        className={rowStyle}
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        onClick={() => handleClick('Create Campaign')}
      >
        <span style={iconStyle} role="img" aria-label="play">🟡▶️</span>
        <span className={textStyle}>Create Campaign</span>
      </button>

      {/* Moderate */}
      <button
        className={rowStyle}
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        onClick={() => handleClick('Moderate')}
      >
        <span style={iconStyle} role="img" aria-label="moderate">❌✅</span>
        <span className={textStyle}>Moderate</span>
      </button>

      {/* Complete Campaign */}
      <button
        className={rowStyle}
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        onClick={() => handleClick('Complete Campaign')}
      >
        <span style={iconStyle} role="img" aria-label="complete">⏩</span>
        <span className={textStyle}>Complete Campaign</span>
      </button>

      {/* Explorer */}
      <button
        className="flex flex-col items-center mt-16"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        onClick={() => handleClick('Explorer')}
      >
        <span style={{ fontSize: '56px', marginBottom: '8px' }} role="img" aria-label="explorer">🧭</span>
        <span className={textStyle}>Explorer</span>
      </button>
    </div>
  );
};

export default Home; 