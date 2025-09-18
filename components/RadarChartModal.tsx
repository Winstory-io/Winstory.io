"use client";

import RadarChart from './RadarChart';

interface ModeratorScore {
  stakerId: string;
  stakerName: string;
  score: number; // 0-100
}

interface RadarChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  moderatorScores: ModeratorScore[];
  campaignTitle: string;
  averageScore: number;
  ranking: number;
  totalCompletions: number;
}

export default function RadarChartModal({ 
  isOpen, 
  onClose, 
  moderatorScores, 
  campaignTitle,
  averageScore,
  ranking,
  totalCompletions
}: RadarChartModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        backgroundColor: '#000',
        borderRadius: 16,
        padding: 32,
        maxWidth: '95vw',
        maxHeight: '95vh',
        border: '2px solid #18C964',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h3 style={{ color: '#18C964', fontSize: 28, fontWeight: 900, margin: '0 0 8px 0' }}>
              Moderator Scores Detail
            </h3>
            <p style={{ color: '#FFD600', fontSize: 16, margin: 0 }}>
              {campaignTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '2px solid #FF4444',
              color: '#FF4444',
              borderRadius: 8,
              padding: '8px 16px',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: 16
            }}
          >
            ✕ Close
          </button>
        </div>
        
        {/* Large radar chart */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <RadarChart 
            moderatorScores={moderatorScores}
            size={600}
            showLabels={true}
            isClickable={false}
          />
        </div>

        {/* Stats summary */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 40,
          alignItems: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 214, 0, 0.1)',
            border: '2px solid #FFD600',
            borderRadius: 12,
            padding: '16px 24px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#FFD600', fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
              Average Score
            </div>
            <div style={{ color: '#FFFFFF', fontSize: 32, fontWeight: 900 }}>
              {averageScore} / 100
            </div>
          </div>

          <div style={{
            background: 'rgba(24, 201, 100, 0.1)',
            border: '2px solid #18C964',
            borderRadius: 12,
            padding: '16px 24px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#18C964', fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
              Your Ranking
            </div>
            <div style={{ color: '#FFD600', fontSize: 32, fontWeight: 900 }}>
              #{ranking} / {totalCompletions}
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '2px solid #C0C0C0',
            borderRadius: 12,
            padding: '16px 24px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#C0C0C0', fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
              Total Moderators
            </div>
            <div style={{ color: '#FFFFFF', fontSize: 32, fontWeight: 900 }}>
              {moderatorScores.length}
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: 16, color: '#C0C0C0', fontSize: 14, textAlign: 'center' }}>
          Detailed view of all moderator scores • Higher scores extend further from center
        </div>
      </div>
    </div>
  );
} 