"use client";

import { useState } from 'react';

interface TextModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export function TextModal({ isOpen, onClose, title, content }: TextModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#111',
        border: '2px solid #18C964',
        borderRadius: 16,
        padding: 24,
        maxWidth: 600,
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'transparent',
            border: 'none',
            color: '#18C964',
            fontSize: 24,
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ×
        </button>
        <h3 style={{ color: '#18C964', fontSize: 20, fontWeight: 900, marginBottom: 16 }}>
          {title}
        </h3>
        <div style={{ 
          color: '#fff', 
          lineHeight: 1.6, 
          whiteSpace: 'pre-wrap',
          fontSize: 16
        }}>
          {content}
        </div>
      </div>
    </div>
  );
}

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoUrl: string;
}

export function VideoModal({ isOpen, onClose, title, videoUrl }: VideoModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#111',
        border: '2px solid #18C964',
        borderRadius: 16,
        padding: 24,
        maxWidth: '90vw',
        maxHeight: '90vh',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'transparent',
            border: 'none',
            color: '#18C964',
            fontSize: 24,
            cursor: 'pointer',
            fontWeight: 'bold',
            zIndex: 1001
          }}
        >
          ×
        </button>
        <h3 style={{ color: '#18C964', fontSize: 20, fontWeight: 900, marginBottom: 16 }}>
          {title}
        </h3>
        <video
          src={videoUrl}
          controls
          style={{
            width: '100%',
            maxHeight: '70vh',
            borderRadius: 8
          }}
        />
      </div>
    </div>
  );
}
