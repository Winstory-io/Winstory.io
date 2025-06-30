import React from 'react';

type ExplorerIntroModalProps = {
  onClose: () => void;
};

export default function ExplorerIntroModal({ onClose }: ExplorerIntroModalProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.92)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#181818',
        border: '3px solid #FFD600',
        borderRadius: 18,
        padding: 32,
        maxWidth: 520,
        color: '#fff',
        position: 'relative',
        boxShadow: '0 4px 32px #000a',
        fontFamily: 'inherit',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: '#FF5252', fontSize: 32, cursor: 'pointer', fontWeight: 700 }} aria-label="Fermer">×</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 32, color: '#FFD600' }}>💡</span>
          <span style={{ fontWeight: 700, fontSize: 22, color: '#FFD600' }}>Welcome !<br/>Explorer the Winstory World ☀️</span>
        </div>
        <div style={{ fontSize: 16, lineHeight: 1.6 }}>
          <b>Explore the most creative & co-creative A.I. campaigns</b><br/>
          You're not a viewer. You're the next co-creator.<br/><br/>
          Swipe left or right to navigate the carousel of winStories.<br/>
          Click on the video to launch it full screen<br/>
          (horizontal 16:9 or vertical 9:16)<br/><br/>
          <ul style={{ margin: '8px 0 8px 18px', padding: 0 }}>
            <li>Use the 🔍 Search (top-right) to find campaigns by theme, company or creator.</li>
            <li>Tap the "i" icon for full campaign details : text, rewards, creator, and rules.</li>
          </ul>
          <b>Type</b><br/>
          <ul style={{ margin: '8px 0 8px 18px', padding: 0 }}>
            <li>Active Creations : Stories open for contribution now</li>
            <li>Best Completions : 3 Best Completions = 3 Premium Rewards</li>
            <li>All : Everything, everywhere, all at once</li>
          </ul>
          <b>Filter by:</b><br/>
          Active Creations :<br/>
          <ul style={{ margin: '8px 0 8px 18px', padding: 0 }}>
            <li>Company to Complete: Brand-led challenges (rewarded by companies)</li>
            <li>Community to Complete: Individual-led quests (rewarded in $WINC)</li>
          </ul>
          <b>Complete directly</b><br/>
          Tap "Complete" to join any story, instantly — no redirection.<br/><br/>
          Tap the Winstory logo (bottom left) to go back to the main menu<br/>
          Tap the profile (bottom right) to connect / access profile<br/><br/>
          Explorer is your creative playground<br/>
          Discover stories. Leave your mark.<br/>
          You're not "scrolling", you're shaping culture.<br/>
          The world's watching, what will you create into it ?<br/><br/>
          Welcome to Neo-Storytelling. Welcome to <span style={{ color: '#FFD600', fontWeight: 700 }}>Winstory</span>
        </div>
      </div>
    </div>
  );
} 