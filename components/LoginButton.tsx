import React from 'react';

interface LoginButtonProps {
  icon: React.ReactNode;
  text: string;
  required?: boolean;
  optional?: boolean;
  onClick?: () => void;
}

const LoginButton: React.FC<LoginButtonProps> = ({ icon, text, required, optional, onClick }) => {
  const borderColor = required ? '#fff' : '#FFD600';
  const textColor = required ? '#fff' : '#FFD600';
  const mention = required ? 'REQUIRED' : optional ? 'OPTIONAL' : '';
  const mentionColor = required ? '#fff' : '#FFD600';
  return (
    <div style={{ margin: '24px 0', textAlign: 'center' }}>
      <button
        onClick={onClick}
        style={{
          width: 320,
          maxWidth: '90vw',
          border: `2px solid ${borderColor}`,
          borderRadius: 16,
          padding: '24px 0',
          background: 'rgba(0,0,0,0.85)',
          color: textColor,
          fontWeight: 700,
          fontSize: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          margin: '0 auto',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s',
        }}
      >
        <span style={{ fontSize: 32 }}>{icon}</span>
        <span>{text}</span>
      </button>
      <div style={{ color: mentionColor, fontWeight: 700, fontSize: 16, marginTop: 8, fontStyle: optional ? 'italic' : 'normal' }}>
        {mention}
      </div>
    </div>
  );
};

export default LoginButton; 