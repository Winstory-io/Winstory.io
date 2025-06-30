import React from 'react';

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
  return (
    <nav style={{ display: 'flex', gap: 32, padding: '0 2rem', marginBottom: 24 }}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onSubTabChange(tab.key)}
          style={{
            background: 'none',
            border: 'none',
            color: activeSubTab === tab.key ? '#FFD600' : '#bfae5e',
            fontWeight: 700,
            fontSize: 16,
            padding: '10px 0',
            borderBottom: activeSubTab === tab.key ? '3px solid #FFD600' : '3px solid transparent',
            cursor: 'pointer',
            outline: 'none',
            transition: 'color 0.2s, border-bottom 0.2s',
          }}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
} 