"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const BriefcaseIcon = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 16 }}>
      <rect x="8" y="16" width="32" height="20" rx="3" stroke="#888" strokeWidth="2"/>
      <rect x="14" y="10" width="20" height="8" rx="2" stroke="#888" strokeWidth="2"/>
    </svg>
);

const CloseIcon = ({ onClick, size = 24 }: { onClick: () => void; size?: number }) => (
    <svg onClick={onClick} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer', position: 'absolute', top: 40, right: 40 }}>
        <path d="M18 6L6 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 6L18 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const VideoUploadIcon = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 16l-4-4-4 4M12 12V3" stroke="#FFD600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7" stroke="#FFD600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 12h0" stroke="#FFD600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
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
      opacity: disabled ? 0.3 : 1,
      zIndex: 10,
    }}
  >
    <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" fill="#18C964"/>
      <path d="M16 22L24 30L32 22" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
);

export default function YourFilmAgencyPage() {
    const router = useRouter();
    const [video, setVideo] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [videoFormat, setVideoFormat] = useState<'horizontal' | 'vertical' | null>(null);
    const [videoPoster, setVideoPoster] = useState<string | null>(null);
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

    const handleNext = () => {
        router.push('/'); 
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
                 <span style={{ fontSize: 36, marginLeft: 16 }}>💡</span>
            </header>

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                {videoPreview ? (
                    <section style={{ textAlign: 'center', maxWidth: videoFormat === 'horizontal' ? 800 : 400, margin: '0 auto' }}>
                        <p style={{ color: '#18C964', fontSize: 20, marginBottom: 24 }}>
                            Thank you for your film in {videoFormat} format, based on your Starting Story, the starting point for your Community's completions.
                        </p>
                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: videoFormat === 'horizontal' ? 800 : 400, height: videoFormat === 'horizontal' ? 450 : 600, maxWidth: '100%', margin: '0 auto', background: '#000', borderRadius: 8 }}>
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
                            A.I. film based on the Starting Story for your B2C Client
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