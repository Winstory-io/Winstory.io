"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storeVideoInIndexedDB, generateVideoId, cleanupOldVideos } from '@/lib/videoStorage';

const BriefcaseIcon = () => (
    <img src="/company.svg" alt="Company Icon" style={{ width: 96, height: 96, marginRight: 16 }} />
);

const CloseIcon = ({ onClick, size = 24 }: { onClick: () => void; size?: number }) => (
    <svg onClick={onClick} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer', position: 'absolute', top: 40, right: 40 }}>
        <path d="M18 6L6 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 6L18 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

export default function YourFilmAgencyPage() {
    const router = useRouter();
    const [video, setVideo] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [videoFormat, setVideoFormat] = useState<'horizontal' | 'vertical' | null>(null);
    const [videoPoster, setVideoPoster] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }, [videoPreview]);

    const generatePoster = (file: File, url: string) => {
      const videoEl = document.createElement('video');
      videoEl.src = url;
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.currentTime = 0.1; 
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
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

        const handleNext = async () => {
        // Sauvegarde dans IndexedDB pour éviter les limites de localStorage
        if (video) {
            try {
                // Stocker le fichier vidéo dans IndexedDB
                const videoId = generateVideoId();
                await storeVideoInIndexedDB(videoId, video);
                
                // Nettoyer les anciennes vidéos en arrière-plan
                cleanupOldVideos().catch(console.warn);
                
                // Sauvegarder seulement les métadonnées dans localStorage
                localStorage.setItem("film", JSON.stringify({
                    aiRequested: false, // User uploaded their own video, so no AI requested
                    videoId: videoId, // ID pour récupérer la vidéo depuis IndexedDB
                    fileName: video?.name || null,
                    fileSize: video?.size || null,
                    format: videoFormat || null
                }));
                
                router.push('/creation/agencyb2c/rewardsornot');
            } catch (error) {
                console.error('Failed to store video:', error);
                alert('Failed to save video. Please try again.');
            }
        } else {
            // Pas de vidéo, sauvegarder quand même les données
            localStorage.setItem("film", JSON.stringify({
                aiRequested: false,
                videoId: null,
                fileName: null,
                fileSize: null,
                format: null
            }));
            router.push('/creation/agencyb2c/rewardsornot');
        }
    };

    const handleUploadClick = () => {
      fileInputRef.current?.click();
    };

    const canProceed = video !== null;

    return (
        <div style={{ minHeight: '100vh', background: '#000', color: 'white', fontFamily: 'Inter, sans-serif', padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CloseIcon onClick={() => router.back()} />
            
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 60, textAlign: 'center', position: 'relative' }}>
                <BriefcaseIcon />
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

                        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: '#FFD600' }}>Agency B2C Film Creation</div>

                        <div style={{ fontSize: 16, marginBottom: 24, lineHeight: 1.6, color: '#fff' }}>
                            Upload your A.I. film based on the Starting Story for your B2C client. This film will serve as the foundation for community completions.
                        </div>

                        <div style={{ fontSize: 16, marginBottom: 24, lineHeight: 1.6, color: '#fff' }}>
                            Requirements for your film:
                        </div>

                        <div style={{ fontSize: 16, marginBottom: 24, lineHeight: 1.6, color: '#fff' }}>
                            • Format: Horizontal or vertical (MP4, max 100MB)<br />
                            • Content: Based on your Starting Story<br />
                            • Quality: A.I.-generated video recommended<br />
                            • Purpose: Starting point for community completions<br />
                            • Style: Evocative and suggestive, not definitive
                        </div>

                        <div style={{ fontSize: 16, lineHeight: 1.6, color: '#fff' }}>
                            Your film should visually reflect the Starting Story you've written for your B2C client. Think coherence, tone, rhythm, and atmosphere. You're creating the foundation that others will expand upon.
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
                            Upload your film to continue to the next step.
                        </div>
                    </div>
                </div>
            )}

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: -60 }}>
                {videoPreview ? (
                    <section style={{ textAlign: 'center', maxWidth: videoFormat === 'horizontal' ? 800 : 360, margin: '0 auto' }}>
                        <p style={{ color: '#18C964', fontSize: 20, marginBottom: 24 }}>
                            Thank you for your film in {videoFormat} format, based on your Starting Story, the starting point for your Community's completions.
                        </p>
                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: videoFormat === 'horizontal' ? 800 : 360, height: videoFormat === 'horizontal' ? 450 : 520, maxWidth: '100%', margin: '0 auto', background: '#000', borderRadius: 8 }}>
                            <video
                              ref={videoRef}
                              controls
                              src={videoPreview}
                              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000', borderRadius: 8 }}
                              poster={videoPoster || undefined}
                              preload="metadata"
                            />
                            <button onClick={handleRemoveVideo} style={{ position: 'absolute', top: -10, right: -10, background: 'none', border: 'none', cursor: 'pointer' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 6L18 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                        </div>
                    </section>
                ) : (
                    <div
                        onClick={handleUploadClick}
                        style={{
                            border: '2px dashed #FFD600',
                            borderRadius: 12,
                            padding: '40px 20px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            maxWidth: 500,
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
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="video/mp4"
                            style={{ display: 'none' }}
                        />
                        <p style={{ margin: 0, fontSize: 20, fontWeight: 'bold', color: '#FFD600' }}>
                            Upload your horizontal or vertical
                            <br/>
                            A.I. film based on the Starting Story
                            <br/>
                            for your B2C Client
                        </p>
                        <div style={{ margin: '20px 0' }}>
                            <VideoUploadIcon />
                        </div>
                        <p style={{ margin: 0, fontSize: 16 }}>MP4 100mb max.</p>
                    </div>
                )}
            </main>
            
            <GreenArrowButton onClick={handleNext} disabled={!canProceed} />
        </div>
    );
} 