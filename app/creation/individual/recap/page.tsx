"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

const CloseIcon = ({ onClick }: { onClick: () => void }) => (
  <svg onClick={onClick} width={32} height={32} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer', position: 'absolute', top: 24, right: 24, zIndex: 100 }}>
    <line x1="10" y1="10" x2="22" y2="22" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
    <line x1="22" y1="10" x2="10" y2="22" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

interface RecapData {
  story?: {
    title: string;
    startingStory: string;
    guideline: string;
  };
  film?: {
    url: string;
    aiRequested: boolean;
  };
  completions?: {
    wincValue: number;
    maxCompletions: number;
  };
}

export default function IndividualRecapPage() {
  const router = useRouter();
  const [recap, setRecap] = useState<RecapData>({});
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showFullStartingStory, setShowFullStartingStory] = useState(false);
  const [showFullGuideline, setShowFullGuideline] = useState(false);

  useEffect(() => {
    // Charger les données depuis le localStorage
    const storyData = localStorage.getItem("story");
    const filmData = localStorage.getItem("film");
    const completionsData = localStorage.getItem("completions");

    const recapData: RecapData = {};

    if (storyData) {
      try {
        recapData.story = JSON.parse(storyData);
      } catch (e) {
        console.error("Error parsing story data:", e);
      }
    }

    if (filmData) {
      try {
        recapData.film = JSON.parse(filmData);
      } catch (e) {
        console.error("Error parsing film data:", e);
      }
    }

    if (completionsData) {
      try {
        recapData.completions = JSON.parse(completionsData);
      } catch (e) {
        console.error("Error parsing completions data:", e);
      }
    }

    setRecap(recapData);

    // Gestion de la navigation retour
    const handleBeforeUnload = () => {
      // Sauvegarder l'état actuel avant de quitter
      localStorage.setItem('fromRecap', 'true');
    };

    const handlePopState = () => {
      // Quand l'utilisateur clique sur la flèche de gauche, revenir à la page précédente
      // Marquer qu'on vient du recap et qu'on doit restaurer les données
      localStorage.setItem('fromRecap', 'true');
      router.push('/creation/individual/yourcompletions');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  const handleCloseClick = () => {
    setShowLeaveModal(true);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      // TODO: Rediriger vers le processus de MINT
      console.log("Redirecting to minting process...");
      // router.push("/creation/individual/mint");
    }, 1000);
  };

  const handleStartingStoryClick = () => {
    setShowFullStartingStory(!showFullStartingStory);
  };

  const handleGuidelineClick = () => {
    setShowFullGuideline(!showFullGuideline);
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const canProceed = recap.story && recap.film && recap.completions;

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', paddingTop: 48 }}>
        {/* Croix rouge à l'extérieur en haut à droite */}
        <CloseIcon onClick={handleCloseClick} />
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 600, margin: '0 auto 24px auto', position: 'relative' }}>
          <img src="/individual.svg" alt="Individual" style={{ width: 96, height: 96, marginRight: 18 }} />
          <span style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>Recap</span>
          <button onClick={() => setShowTooltip(true)} style={{ background: 'none', border: 'none', marginLeft: 18, cursor: 'pointer', padding: 0 }} aria-label="Help">
            <img src="/tooltip.svg" alt="Aide" style={{ width: 40, height: 40 }} />
          </button>
        </div>

        {/* Pop-up tooltip */}
        {showTooltip && (
          <div
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowTooltip(false)}
          >
            <div
              style={{
                position: 'relative',
                maxWidth: 600,
                width: '90vw',
                background: '#000',
                border: '4px solid #FFD600',
                borderRadius: 24,
                padding: '32px 24px 28px 24px',
                boxShadow: '0 0 32px #000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: '#FFD600',
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowTooltip(false)}
                style={{
                  position: 'absolute',
                  top: 18,
                  right: 18,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 10,
                }}
                aria-label="Close"
              >
                <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="10" y1="10" x2="30" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
                  <line x1="30" y1="10" x2="10" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </button>
              <h2 style={{ color: '#FFD600', fontSize: 24, fontWeight: 900, textAlign: 'center', marginBottom: 18, letterSpacing: 1 }}>Recap</h2>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 400, marginBottom: 18, textAlign: 'center' }}>
                Review all your campaign information before proceeding to MINT.<br /><br />
                This is your final chance to verify all details before launching your campaign.
              </div>
            </div>
          </div>
        )}

        {/* Contenu principal */}
        <div style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}>
          
          {/* Section Story */}
          {recap.story && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 24, marginBottom: 16, textAlign: 'center' }}>
                Your WinStory
              </div>
              <div style={{ background: '#000', border: '2px solid #FFD600', borderRadius: 12, padding: 28 }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#FFD600', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Title:</div>
                  <div style={{ color: '#fff', fontSize: 18 }}>{recap.story.title}</div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#FFD600', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Starting Story:</div>
                  <div 
                    onClick={handleStartingStoryClick}
                    style={{ 
                      color: '#fff', 
                      fontSize: 16, 
                      lineHeight: 1.6, 
                      whiteSpace: 'pre-line',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '6px',
                      transition: 'background-color 0.2s',
                      maxHeight: showFullStartingStory ? 'none' : '120px',
                      overflow: showFullStartingStory ? 'visible' : 'hidden',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {showFullStartingStory 
                      ? recap.story.startingStory 
                      : truncateText(recap.story.startingStory, 200)
                    }
                    {!showFullStartingStory && recap.story.startingStory && (
                      <div style={{ 
                        color: '#FFD600', 
                        fontSize: '14px', 
                        fontWeight: 600, 
                        marginTop: '8px',
                        textAlign: 'center'
                      }}>
                        Click to see full Story
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#FFD600', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Guideline:</div>
                  <div 
                    onClick={handleGuidelineClick}
                    style={{ 
                      color: '#fff', 
                      fontSize: 16, 
                      lineHeight: 1.6, 
                      whiteSpace: 'pre-line',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '6px',
                      transition: 'background-color 0.2s',
                      maxHeight: showFullGuideline ? 'none' : '120px',
                      overflow: showFullGuideline ? 'visible' : 'hidden',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {showFullGuideline 
                      ? recap.story.guideline 
                      : truncateText(recap.story.guideline, 200)
                    }
                  </div>
                  {!showFullGuideline && (
                    <div style={{ 
                      color: '#FFD600', 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      marginTop: '8px',
                      textAlign: 'center'
                    }}>
                      Click to see full Guideline
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section Film */}
          {recap.film && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 24, marginBottom: 16, textAlign: 'center' }}>
                Your Film
              </div>
              <div style={{ background: '#000', border: '2px solid #FFD600', borderRadius: 12, padding: 20 }}>
                {recap.film.url ? (
                  <div>
                    <div style={{ color: '#FFD600', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Video:</div>
                    <video 
                      src={recap.film.url} 
                      controls 
                      style={{ 
                        width: '100%', 
                        maxWidth: '400px', 
                        maxHeight: '300px',
                        borderRadius: 8, 
                        background: '#000',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ color: '#fff', fontSize: 16, fontStyle: 'italic' }}>
                    No video uploaded
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section Completions */}
          {recap.completions && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 24, marginBottom: 16, textAlign: 'center' }}>
                Completion Settings
              </div>
              <div style={{ background: '#000', border: '2px solid #FFD600', borderRadius: 12, padding: 20 }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#FFD600', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Unit Value:</div>
                  <div style={{ color: '#fff', fontSize: 18 }}>{recap.completions.wincValue} $WINC</div>
                </div>
                <div>
                  <div style={{ color: '#FFD600', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Max Completions:</div>
                  <div style={{ color: '#fff', fontSize: 18 }}>{recap.completions.maxCompletions}</div>
                </div>
              </div>
            </div>
          )}

          {/* Message si données manquantes */}
          {!canProceed && (
            <div style={{ textAlign: 'center', color: '#FF2D2D', fontSize: 18, marginTop: 32 }}>
              Some campaign data is missing. Please complete all steps before proceeding.
            </div>
          )}
        </div>

        {/* Bouton de confirmation */}
        {canProceed && (
          <button
            onClick={handleConfirm}
            style={{
              position: 'fixed',
              right: 24,
              bottom: 24,
              zIndex: 1100,
              background: '#18C964',
              border: 'none',
              color: '#fff',
              borderRadius: '50%',
              fontSize: confirmed ? 32 : 20,
              fontWeight: 700,
              width: confirmed ? 88 : 88,
              height: 88,
              boxShadow: '0 4px 32px rgba(24,201,100,0.35)',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s, box-shadow 0.2s, width 0.2s, height 0.2s, font-size 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              whiteSpace: 'pre-line',
              padding: 0,
            }}
            aria-label="Confirm"
          >
            {confirmed ? '✓' : 'Confirm'}
          </button>
        )}

        {/* Pop-up de confirmation pour quitter */}
        {showLeaveModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.7)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => setShowLeaveModal(false)}
          >
            <div
              style={{
                background: '#181818',
                border: '3px solid #FF2D2D',
                color: '#FF2D2D',
                padding: 40,
                borderRadius: 20,
                minWidth: 340,
                maxWidth: '90vw',
                boxShadow: '0 0 32px #FF2D2D55',
                textAlign: 'center',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ fontWeight: 700, fontSize: 28, color: '#FF2D2D', marginBottom: 8 }}>Back to home ?</div>
              <div style={{ color: '#FF2D2D', background: '#000', border: '2px solid #FF2D2D', borderRadius: 12, padding: 18, fontSize: 18, fontWeight: 500, marginBottom: 12 }}>
                You're about to leave this campaign creation process.<br/>Your current progress won't be saved
              </div>
              <button
                onClick={() => router.push('/welcome')}
                style={{
                  background: '#FF2D2D',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 32px',
                  fontWeight: 700,
                  fontSize: 18,
                  cursor: 'pointer',
                  marginTop: 8,
                  boxShadow: '0 2px 12px #FF2D2D55',
                  transition: 'background 0.2s',
                }}
              >
                Confirm & leave
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 