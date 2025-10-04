'use client';

import React from 'react';

type VideoPlayerModalProps = {
  videoUrl: string;
  title: string;
  onClose: () => void;
};

export default function VideoPlayerModal({ videoUrl, title, onClose }: VideoPlayerModalProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '90%',
          maxWidth: 1200,
          maxHeight: '85vh',
          background: '#000',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 0 2px rgba(255, 214, 0, 0.3)',
          animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '2px solid rgba(255, 214, 0, 0.6)',
            color: '#FFD600',
            fontSize: 24,
            cursor: 'pointer',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FFD600';
            e.currentTarget.style.color = '#000';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
            e.currentTarget.style.color = '#FFD600';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          aria-label="Close"
        >
          ×
        </button>

        {/* Video Title */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            padding: '8px 16px',
            background: 'rgba(0, 0, 0, 0.8)',
            borderRadius: 8,
            border: '1px solid rgba(255, 214, 0, 0.3)',
            zIndex: 10,
          }}
        >
          <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 16 }}>{title}</div>
        </div>

        {/* Video Player */}
        <div
          style={{
            width: '100%',
            height: '85vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000',
          }}
        >
          {/* For now, showing placeholder - replace with actual video player */}
          <video
            src={videoUrl}
            controls
            autoPlay
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
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
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

