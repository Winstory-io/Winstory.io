import React from 'react';

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
  return (
    <nav style={{ display: 'flex', gap: 32, borderBottom: '2px solid #FFD600', padding: '0 2rem', marginBottom: 24 }}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === tab.key ? '#FFD600' : '#bfae5e',
            fontWeight: 700,
            fontSize: 18,
            padding: '12px 0',
            borderBottom: activeTab === tab.key ? '4px solid #FFD600' : '4px solid transparent',
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