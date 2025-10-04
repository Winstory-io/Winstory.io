'use client';

import React, { useState } from 'react';

type Tab = {
  key: string;
  label: string;
};

type ExplorerTabsProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
};

export default function ExplorerTabs({ tabs, activeTab, onTabChange }: ExplorerTabsProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  return (
    <nav style={{ display: 'flex', gap: 40, padding: '0 2rem', marginBottom: 20, position: 'relative' }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const isHovered = hoveredTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            onMouseEnter={() => setHoveredTab(tab.key)}
            onMouseLeave={() => setHoveredTab(null)}
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              color: isActive ? '#FFD600' : isHovered ? '#FFA500' : '#666',
              fontWeight: 800,
              fontSize: 20,
              padding: '16px 8px',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textShadow: isActive ? '0 0 20px rgba(255, 214, 0, 0.5)' : 'none',
            }}
          >
            {tab.label}
            
            {/* Active Indicator */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                background: isActive
                  ? 'linear-gradient(90deg, #FFD600 0%, #FFA500 100%)'
                  : 'transparent',
                borderRadius: '4px 4px 0 0',
                boxShadow: isActive ? '0 -2px 12px rgba(255, 214, 0, 0.6)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />

            {/* Hover Indicator */}
            {!isActive && isHovered && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'rgba(255, 165, 0, 0.5)',
                  borderRadius: '2px 2px 0 0',
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
} 