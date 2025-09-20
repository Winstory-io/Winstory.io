"use client";

import { useState, useEffect } from 'react';

interface ModerationProgress {
  stakersRequired: number;
  stakers: number;
  stakedAmount: number;
  mintPrice: number;
  validVotes: number;
  refuseVotes: number;
  totalVotes: number;
  averageScore: number;
  completionScores: number[];
  stakeYes: number;
  stakeNo: number;
}

interface EnhancedModerationDevControlsProps {
  onProgressChange?: (progress: ModerationProgress) => void;
  initialProgress?: ModerationProgress;
}

export default function EnhancedModerationDevControls({ 
  onProgressChange, 
  initialProgress 
}: EnhancedModerationDevControlsProps) {
  const [progress, setProgress] = useState<ModerationProgress>({
    stakersRequired: 22,
    stakers: 3,
    stakedAmount: 150.0,
    mintPrice: 1000.0,
    validVotes: 2,
    refuseVotes: 0,
    totalVotes: 2,
    averageScore: 0,
    completionScores: [],
    stakeYes: 120.0,
    stakeNo: 30.0
  });

  // Initialize with provided data if available
  useEffect(() => {
    if (initialProgress) {
      setProgress(initialProgress);
    }
  }, [initialProgress]);

  const handleChange = (field: keyof ModerationProgress, value: number) => {
    const newProgress = { ...progress, [field]: value };

    // Auto-calculate dependent fields
    if (field === 'validVotes' || field === 'refuseVotes') {
      newProgress.totalVotes = newProgress.validVotes + newProgress.refuseVotes;
      newProgress.stakers = Math.max(newProgress.totalVotes, newProgress.stakers);
    }

    if (field === 'stakeYes' || field === 'stakeNo') {
      newProgress.stakedAmount = newProgress.stakeYes + newProgress.stakeNo;
    }

    if (field === 'stakedAmount') {
      // Redistribute stakes proportionally
      const ratio = newProgress.stakeYes / (newProgress.stakeYes + newProgress.stakeNo || 1);
      newProgress.stakeYes = Math.round(value * ratio * 100) / 100;
      newProgress.stakeNo = Math.round(value * (1 - ratio) * 100) / 100;
    }

    setProgress(newProgress);
    onProgressChange?.(newProgress);
  };

  const resetToDefaults = () => {
    const defaultProgress: ModerationProgress = {
      stakersRequired: 22,
      stakers: 3,
      stakedAmount: 1500.0,
      mintPrice: 1000.0,
      validVotes: 15,
      refuseVotes: 7,
      totalVotes: 22,
      averageScore: 0,
      completionScores: [],
      stakeYes: 1200.0,
      stakeNo: 300.0
    };
    setProgress(defaultProgress);
    onProgressChange?.(defaultProgress);
  };

  const setValidatedState = () => {
    const validatedProgress: ModerationProgress = {
      stakersRequired: 22,
      stakers: 25,
      stakedAmount: 2500.0,
      mintPrice: 1000.0,
      validVotes: 20,
      refuseVotes: 5,
      totalVotes: 25,
      averageScore: 0,
      completionScores: [],
      stakeYes: 2000.0,
      stakeNo: 500.0
    };
    setProgress(validatedProgress);
    onProgressChange?.(validatedProgress);
  };

  const setFailedState = () => {
    const failedProgress: ModerationProgress = {
      stakersRequired: 22,
      stakers: 8,
      stakedAmount: 400.0,
      mintPrice: 1000.0,
      validVotes: 2,
      refuseVotes: 6,
      totalVotes: 8,
      averageScore: 0,
      completionScores: [],
      stakeYes: 100.0,
      stakeNo: 300.0
    };
    setProgress(failedProgress);
    onProgressChange?.(failedProgress);
  };

  const inputStyle = {
    width: '80px',
    padding: '4px 8px',
    background: '#111',
    border: '1px solid #444',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '12px'
  };

  const sectionStyle = {
    marginBottom: '16px',
    padding: '12px',
    background: 'rgba(255, 214, 0, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 214, 0, 0.3)'
  };

  return (
    <div style={{ color: '#fff' }}>
      {/* Quick Actions */}
      <div style={sectionStyle}>
        <h4 style={{ color: '#FFD600', margin: '0 0 10px 0', fontSize: '14px' }}>Quick Actions</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            onClick={setValidatedState}
            style={{
              padding: '6px 12px',
              background: '#18C964',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            ✅ Set Validated State
          </button>
          <button
            onClick={setFailedState}
            style={{
              padding: '6px 12px',
              background: '#FF3B30',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            ❌ Set Failed State
          </button>
          <button
            onClick={resetToDefaults}
            style={{
              padding: '6px 12px',
              background: '#666',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🔄 Reset to Defaults
          </button>
        </div>
      </div>

      {/* Stakers Controls */}
      <div style={sectionStyle}>
        <h4 style={{ color: '#FFD600', margin: '0 0 10px 0', fontSize: '14px' }}>Stakers & Participants</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
          <label>
            Stakers Required:
            <input
              type="number"
              value={progress.stakersRequired}
              onChange={(e) => handleChange('stakersRequired', parseInt(e.target.value) || 0)}
              style={inputStyle}
              min="1"
              max="100"
            />
          </label>
          <label>
            Current Stakers:
            <input
              type="number"
              value={progress.stakers}
              onChange={(e) => handleChange('stakers', parseInt(e.target.value) || 0)}
              style={inputStyle}
              min="0"
              max="100"
            />
          </label>
        </div>
      </div>

      {/* Votes Controls */}
      <div style={sectionStyle}>
        <h4 style={{ color: '#FFD600', margin: '0 0 10px 0', fontSize: '14px' }}>Individual Votes</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12px' }}>
          <label>
            Valid Votes:
            <input
              type="number"
              value={progress.validVotes}
              onChange={(e) => handleChange('validVotes', parseInt(e.target.value) || 0)}
              style={inputStyle}
              min="0"
            />
          </label>
          <label>
            Refuse Votes:
            <input
              type="number"
              value={progress.refuseVotes}
              onChange={(e) => handleChange('refuseVotes', parseInt(e.target.value) || 0)}
              style={inputStyle}
              min="0"
            />
          </label>
          <label>
            Total Votes:
            <input
              type="number"
              value={progress.totalVotes}
              readOnly
              style={{ ...inputStyle, background: '#333', color: '#999' }}
            />
          </label>
        </div>
      </div>

      {/* MINT Price Controls */}
      <div style={sectionStyle}>
        <h4 style={{ color: '#FFD600', margin: '0 0 10px 0', fontSize: '14px' }}>MINT Price</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', fontSize: '12px', alignItems: 'center' }}>
          <label>
            MINT Price ($):
            <input
              type="number"
              value={progress.mintPrice}
              onChange={(e) => handleChange('mintPrice', parseFloat(e.target.value) || 0)}
              style={inputStyle}
              min="0"
              step="50"
            />
          </label>
          <div style={{ fontSize: '10px', color: '#888' }}>
            Standard: $1000<br/>
            With AI: $1500
          </div>
        </div>
      </div>

      {/* Staking Amounts Controls */}
      <div style={sectionStyle}>
        <h4 style={{ color: '#FFD600', margin: '0 0 10px 0', fontSize: '14px' }}>Moderators Staking</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12px' }}>
          <label>
            Stake YES ($):
            <input
              type="number"
              value={progress.stakeYes}
              onChange={(e) => handleChange('stakeYes', parseFloat(e.target.value) || 0)}
              style={inputStyle}
              min="0"
              step="10"
            />
          </label>
          <label>
            Stake NO ($):
            <input
              type="number"
              value={progress.stakeNo}
              onChange={(e) => handleChange('stakeNo', parseFloat(e.target.value) || 0)}
              style={inputStyle}
              min="0"
              step="10"
            />
          </label>
          <label>
            Total Staked:
            <input
              type="number"
              value={progress.stakedAmount}
              onChange={(e) => handleChange('stakedAmount', parseFloat(e.target.value) || 0)}
              style={inputStyle}
              min="0"
              step="10"
            />
          </label>
        </div>
      </div>

      {/* Current Status Indicator */}
      <div style={{ 
        padding: '10px', 
        background: 'rgba(0,0,0,0.3)', 
        borderRadius: '6px', 
        fontSize: '11px',
        border: '1px solid #333'
      }}>
        <div style={{ color: '#FFD600', fontWeight: '600', marginBottom: '6px' }}>Current Status:</div>
        <div style={{ color: progress.totalVotes >= progress.stakersRequired ? '#18C964' : '#FF9500' }}>
          Votes: {progress.totalVotes >= progress.stakersRequired ? '✅' : '⚠️'} {progress.totalVotes}/{progress.stakersRequired} minimum
        </div>
        <div style={{ color: progress.stakedAmount > progress.mintPrice ? '#18C964' : '#FF9500' }}>
          Staking: {progress.stakedAmount > progress.mintPrice ? '✅' : '⚠️'} ${progress.stakedAmount} {'>'}  ${progress.mintPrice}
        </div>
        <div style={{ color: progress.validVotes / Math.max(progress.refuseVotes, 1) >= 2 ? '#18C964' : '#FF9500' }}>
          Ratio: {progress.validVotes / Math.max(progress.refuseVotes, 1) >= 2 ? '✅' : '⚠️'} {(progress.validVotes / Math.max(progress.refuseVotes, 1)).toFixed(2)} (need {'>='}2.0)
        </div>
      </div>
    </div>
  );
} 