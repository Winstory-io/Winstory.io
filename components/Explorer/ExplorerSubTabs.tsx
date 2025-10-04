'use client';

import React, { useState } from 'react';

type SubTab = {
  key: string;
  label: string;
};

type ExplorerSubTabsProps = {
  tabs: SubTab[];
  activeSubTab: string;
  onSubTabChange: (key: string) => void;
};

export default function ExplorerSubTabs({ tabs, activeSubTab, onSubTabChange }: ExplorerSubTabsProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  return (
    <nav
      style={{
        display: 'flex',
        gap: 16,
        padding: '0 2rem',
        marginBottom: 20,
        marginTop: 16,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeSubTab === tab.key;
        const isHovered = hoveredTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onSubTabChange(tab.key)}
            onMouseEnter={() => setHoveredTab(tab.key)}
            onMouseLeave={() => setHoveredTab(null)}
            style={{
              background: isActive
                ? 'linear-gradient(135deg, rgba(255, 214, 0, 0.2) 0%, rgba(255, 165, 0, 0.2) 100%)'
                : isHovered
                ? 'rgba(255, 255, 255, 0.05)'
                : 'transparent',
              border: isActive
                ? '2px solid rgba(255, 214, 0, 0.6)'
                : '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 24,
              color: isActive ? '#FFD600' : isHovered ? '#FFA500' : '#999',
              fontWeight: 700,
              fontSize: 15,
              padding: '10px 24px',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              letterSpacing: '0.3px',
              boxShadow: isActive
                ? '0 4px 16px rgba(255, 214, 0, 0.3), inset 0 0 20px rgba(255, 214, 0, 0.1)'
                : 'none',
              transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
} 