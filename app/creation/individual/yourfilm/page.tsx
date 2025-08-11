"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// --- Icons ---
const BriefcaseIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 16 }}>
    {/* Using a placeholder color, will be adapted */}
    <rect x="8" y="16" width="32" height="20" rx="3" stroke="#888" strokeWidth="2" />
    <rect x="14" y="10" width="20" height="8" rx="2" stroke="#888" strokeWidth="2" />
  </svg>
);

const CloseIcon = ({ onClick, size = 24 }: { onClick: () => void; size?: number }) => (
  <svg onClick={onClick} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer', position: 'absolute', top: 40, right: 40 }}>
    <path d="M18 6L6 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 6L18 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const VideoUploadIcon = () => (
  <img src="/importvideo.svg" alt="Import Video" style={{ width: 160, height: 160 }} />
);

const GreenArrowButton = ({ onClick, disabled }: { onClick: () => void, disabled: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label="Next"
    style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: 'none',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      padding: 0,
      outline: 'none',
      zIndex: 10,
    }}
  >
    <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" fill={disabled ? '#FF2D2D' : '#18C964'} />
      <path d="M16 22L24 30L32 22" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

// --- Page Component ---
export default function YourFilmPage() {
  const router = useRouter();
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoFormat, setVideoFormat] = useState<'horizontal' | 'vertical' | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [videoPoster, setVideoPoster] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Prevent automatic playback on import
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [videoPreview]);

  // Générer la miniature (poster) à l'import
  const generatePoster = (file: File, url: string) => {
    const videoEl = document.createElement('video');
    videoEl.src = url;
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.currentTime = 0.1; // Forcer une frame décodable
    videoEl.addEventListener('seeked', () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoEl.videoWidth;
        canvas.height = videoEl.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
          const imageUrl = canvas.toDataURL('image/png');
          setVideoPoster(imageUrl);
        }
      } catch (e) {
        setVideoPoster(null);
      }
    }, { once: true });
    // Fallback: si seeked ne se déclenche pas dans 2s, on laisse videoPoster à null
    setTimeout(() => {
      if (!videoPoster) setVideoPoster(null);
    }, 2000);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "video/mp4") {
      if (file.size > 100 * 1024 * 1024) { // 100MB
        alert("File is too large. Max size is 100MB.");
        return;
      }
      setVideo(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      setVideoPoster(null);

      const videoElement = document.createElement('video');
      videoElement.src = url;
      videoElement.onloadedmetadata = () => {
        const format = videoElement.videoWidth >= videoElement.videoHeight ? 'horizontal' : 'vertical';
        setVideoFormat(format);
      };
      // Générer la miniature
      generatePoster(file, url);
    } else {
      alert("Please select an MP4 file.");
    }
  };

  const handleRemoveVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideo(null);
    setVideoPreview(null);
    setVideoFormat(null);
    setVideoPoster(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleNext = () => {
    // Sauvegarde dans le localStorage
    localStorage.setItem("film", JSON.stringify({
      aiRequested: false, // Pour les individus, pas d'option AI
      url: videoPreview, // null si pas de vidéo
      fileName: video?.name || null, // Ajouter le nom du fichier
      fileSize: video?.size || null, // Ajouter la taille du fichier
      format: videoFormat || null // Ajouter le format de la vidéo
    }));
    // Redirige vers la page suivante pour les individus
    router.push('/creation/individual/yourcompletions');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const canProceed = video !== null;

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: 'white', fontFamily: 'Inter, sans-serif', padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <CloseIcon onClick={() => router.back()} />

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 60, textAlign: 'center', position: 'relative' }}>
        <img src="/individual.svg" alt="Individual Icon" style={{ width: 96, height: 96, marginRight: 16 }} />
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>Your A.I. Film</h1>
        <img
          src="/tooltip.svg"
          alt="Help"
          style={{ width: 36, height: 36, marginLeft: 16, cursor: 'pointer' }}
          onClick={() => setShowModal(true)}
          aria-label="Show info"
        />
      </header>

      {/* Modal for the bulb */}
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M6 6L18 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>

            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: '#FFD600' }}>Words become World</div>

            <div style={{ fontSize: 16, marginBottom: 24, lineHeight: 1.6, color: '#fff' }}>
              From text to vision, your written narrative enters a new dimension. Visual, immersive, expansive. Now, you choose how your Starting Story comes alive on screen.
            </div>

            <div style={{ fontSize: 16, marginBottom: 24, lineHeight: 1.6, color: '#fff' }}>
              You have one creative path :
            </div>

            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#FFD600' }}>Upload your own film</div>
            <div style={{ fontSize: 16, marginBottom: 24, lineHeight: 1.6, color: '#fff' }}>
              Your vision, your control. Horizontal or vertical (same format required for community completions), up to 100mb in MP4 format.
              <br /><br />
              A.I.-generated video is highly recommended. Minimum Post-Production and VFX/CGI if not A.I. Your film should visually reflect the Starting Story you've written, think coherence, tone, rhythm, atmosphere.
              <br /><br />
              You're not just uploading a file, you're launching a cinematic universe others will expand. You are the Big Bang. Completions will bring new post-lives.
              Stay evocative, stay suggestive, just enough to open the narrative, not close it.
            </div>

            <div style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: '#18C964',
              fontStyle: 'italic',
              marginTop: 24,
              textAlign: 'center',
              borderTop: '1px solid #333',
              paddingTop: 16
            }}>
              Uploading your film is required.<br />
              Click on the green arrow to continue.
            </div>
          </div>
        </div>
      )}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', width: '100%', marginTop: -60, paddingTop: 0 }}>
        {videoPreview ? (
          <section style={{ textAlign: 'center', maxWidth: videoFormat === 'horizontal' ? 800 : 400, margin: '0 auto' }}>
            <p style={{ color: '#18C964', fontSize: 18, marginBottom: 12, marginTop: 0 }}>
              Thank you for your film in {videoFormat} format, based on your Starting Story, the starting point for your Community's completions.
            </p>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: videoFormat === 'horizontal' ? 800 : 400, height: videoFormat === 'horizontal' ? 450 : 450, maxWidth: '100%', margin: '0 auto', background: '#000', borderRadius: 8 }}>
              <video
                ref={videoRef}
                controls
                src={videoPreview}
                style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000', borderRadius: 8 }}
                poster={videoPoster || undefined}
                preload="metadata"
                tabIndex={0}
                playsInline
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    videoRef.current.pause();
                    videoRef.current.currentTime = 0;
                  }
                }}
              />
              <button onClick={handleRemoveVideo} style={{ position: 'absolute', top: -10, right: -10, background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M6 6L18 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </section>
        ) : (
          <>
            {/* Upload Box */}
            <div
              onClick={handleUploadClick}
              style={{
                border: '2px dashed #FFD600',
                borderRadius: 12,
                padding: '40px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                maxWidth: 500,
                marginBottom: 40,
                marginTop: 100,
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="video/mp4"
                style={{ display: 'none' }}
              />
              <p style={{ margin: 0, fontSize: 20, fontWeight: 'bold', color: '#FFD600' }}>
                Upload your horizontal or vertical
                <br />
                A.I. film based on your Starting Story
              </p>
              <div style={{ margin: '20px 0' }}>
                <VideoUploadIcon />
              </div>
              <p style={{ margin: 0, fontSize: 18, color: '#FFD600' }}>MP4 100mb max.</p>
            </div>
          </>
        )}
      </main>

      <GreenArrowButton onClick={handleNext} disabled={!canProceed} />
    </div>
  );
} 