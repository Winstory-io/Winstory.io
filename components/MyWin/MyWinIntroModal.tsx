import React from 'react';
import Image from 'next/image';

type MyWinIntroModalProps = {
  onClose: () => void;
};

export default function MyWinIntroModal({ onClose }: MyWinIntroModalProps) {
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
        border: '3px solid #00FF00',
        borderRadius: 18,
        padding: 32,
        maxWidth: 520,
        color: '#fff',
        position: 'relative',
        boxShadow: '0 4px 32px #000a',
        fontFamily: 'inherit',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: '#FF5252', fontSize: 32, cursor: 'pointer', fontWeight: 700 }} aria-label="Close">×</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Image src="/tooltip.svg" alt="Info" width={32} height={32} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
          <span style={{ fontWeight: 700, fontSize: 22, color: '#00FF00' }}>My Win Dashboard<br />Your Creative Hub 🚀</span>
        </div>
        <div style={{ fontSize: 16, lineHeight: 1.6 }}>
          <b>Welcome to your personal creative command center</b><br />
          Track your journey, manage your creations, and grow your influence.<br /><br />
          
          <b>My Creations</b><br />
          <ul style={{ margin: '8px 0 8px 18px', padding: 0 }}>
            <li>View all your published campaigns and their performance</li>
            <li>Monitor completion rates, engagement, and rewards earned</li>
            <li>Access campaign analytics and community feedback</li>
            <li>Edit or update your active campaigns</li>
          </ul>
          
          <b>My Moderations</b><br />
          <ul style={{ margin: '8px 0 8px 18px', padding: 0 }}>
            <li>Review content you've moderated for quality and compliance</li>
            <li>Track your moderation accuracy and community impact</li>
            <li>Earn rewards for maintaining platform quality standards</li>
            <li>Build reputation as a trusted community moderator</li>
          </ul>
          
          <b>My Completions</b><br />
          <ul style={{ margin: '8px 0 8px 18px', padding: 0 }}>
            <li>See all campaigns you've successfully completed</li>
            <li>Track your completion streak and skill progression</li>
            <li>View rewards earned and XP points accumulated</li>
            <li>Showcase your creative contributions to the community</li>
          </ul>
          
          <b>Dashboard Stats</b><br />
          Monitor your total $WINC earnings and XP progression.<br />
          Your creative journey is quantified and rewarded.<br /><br />
          
          <b>Navigation</b><br />
          Use the top navigation to switch between different sections.<br />
          Each section provides detailed insights into your creative activity.<br /><br />
          
          This is your space to grow, create, and influence the Winstory ecosystem.<br />
          Every creation matters. Every completion counts.<br />
          Welcome to your creative legacy.<br /><br />
          
          Welcome to <span style={{ color: '#00FF00', fontWeight: 700 }}>My Win</span>
        </div>
      </div>
    </div>
  );
}
