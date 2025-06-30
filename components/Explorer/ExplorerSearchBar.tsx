import React, { useRef, useEffect } from 'react';

type ExplorerSearchBarProps = {
  onClose: () => void;
};

export default function ExplorerSearchBar({ onClose }: ExplorerSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.7)',
      zIndex: 3000,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: 80,
    }}>
      <div style={{
        background: '#181818',
        border: '2px solid #FFD600',
        borderRadius: 12,
        padding: '18px 24px',
        minWidth: 320,
        maxWidth: 480,
        width: '90vw',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 4px 32px #000a',
        position: 'relative',
      }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search keywords, stories, companies"
          style={{
            flex: 1,
            fontSize: 18,
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            outline: 'none',
            background: '#222',
            color: '#FFD600',
            fontWeight: 500,
          }}
        />
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#FF5252',
            fontSize: 28,
            marginLeft: 12,
            cursor: 'pointer',
            fontWeight: 700,
          }}
          aria-label="Fermer la recherche"
        >
          ×
        </button>
      </div>
    </div>
  );
} 