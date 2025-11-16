'use client';

import React from 'react';

type VideoPlayerModalProps = {
  videoUrl: string;
  title: string;
  orientation?: 'horizontal' | 'vertical';
  onClose: () => void;
};

export default function VideoPlayerModal({ videoUrl, title, orientation = 'horizontal', onClose }: VideoPlayerModalProps) {
  const isVertical = orientation === 'vertical';
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.98)',
        backdropFilter: 'blur(10px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.3s ease',
        padding: 20,
      }}
    >
      {/* Close Button - Outside the video */}
      <button
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 32,
          right: 80,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.9)',
          border: '2px solid rgba(255, 214, 0, 0.8)',
          color: '#FFD600',
          fontSize: 32,
          cursor: 'pointer',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2001,
          transition: 'all 0.2s',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#FFD600';
          e.currentTarget.style.color = '#000';
          e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
          e.currentTarget.style.color = '#FFD600';
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
        }}
        aria-label="Close"
      >
        ×
      </button>

      {/* Video Player - Full Screen */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'zoomIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <video
          src={videoUrl}
          controls
          autoPlay
          style={{
            width: isVertical ? 'auto' : '80vw',
            height: isVertical ? '85vh' : 'auto',
            maxWidth: isVertical ? 'calc(85vh * 9 / 16)' : '80vw',
            maxHeight: isVertical ? '85vh' : 'calc(80vw * 9 / 16)',
            aspectRatio: isVertical ? '9 / 16' : '16 / 9',
            objectFit: 'contain',
            borderRadius: 8,
            boxShadow: '0 20px 80px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 214, 0, 0.2)',
          }}
        >
          Your browser does not support the video tag.
        </video>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
