"use client";

import React from 'react';

interface EvaluationResultsProps {
  evaluation: {
    score: number;
    tier: 'S' | 'A' | 'B' | 'C' | 'F';
    collaborationProbability: number;
    scoreBreakdown: {
      storyFoundation: number;
      technicalExcellence: number;
      collaborativePotential: number;
      viralImpact: number;
    };
    strengths: string[];
    weaknesses: string[];
    optimizationRoadmap: {
      priority: string;
      secondary: string;
    };
    collaborationForecast: string;
    securityStatus: 'CLEARED' | 'FLAGGED';
    securityReason?: string;
  };
  onContinue: () => void;
  onRetry: () => void;
}

export default function EvaluationResults({ evaluation, onContinue, onRetry }: EvaluationResultsProps) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'S': return '#FFD700'; // Or
      case 'A': return '#00C46C'; // Vert
      case 'B': return '#FFD600'; // Jaune
      case 'C': return '#FF8C00'; // Orange
      case 'F': return '#FF2D2D'; // Rouge
      default: return '#666';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'S': return 'S-Tier: Collaboration Catalyst';
      case 'A': return 'A-Tier: Strong Foundation';
      case 'B': return 'B-Tier: Acceptable Base';
      case 'C': return 'C-Tier: Needs Improvement';
      case 'F': return 'F-Tier: Significant Issues';
      default: return 'Unknown Tier';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#FFD700';
    if (score >= 80) return '#00C46C';
    if (score >= 70) return '#FFD600';
    if (score >= 60) return '#FF8C00';
    return '#FF2D2D';
  };

  return (
    <div style={{
      background: '#000',
      border: '3px solid #FFD600',
      borderRadius: '20px',
      padding: '40px',
      maxWidth: '800px',
      width: '100%',
      color: '#fff',
      textAlign: 'center'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#FFD600', fontSize: '28px', fontWeight: '700', marginBottom: '10px' }}>
          AI Evaluation Complete
        </h2>
        <div style={{ color: '#fff', fontSize: '16px' }}>
          Post-MINT Individual Creation Assessment
        </div>
      </div>

      {/* Security Status */}
      {evaluation.securityStatus === 'FLAGGED' && (
        <div style={{
          background: 'rgba(255, 45, 45, 0.1)',
          border: '2px solid #FF2D2D',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px',
          color: '#FF2D2D'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>
            ⚠️ SECURITY BREACH DETECTED
          </div>
          <div style={{ fontSize: '14px' }}>
            {evaluation.securityReason || 'Content flagged for security review'}
          </div>
        </div>
      )}

      {/* Main Score */}
      <div style={{
        background: 'rgba(255, 215, 0, 0.1)',
        border: '2px solid #FFD600',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '30px'
      }}>
        <div style={{ fontSize: '48px', fontWeight: '700', color: getScoreColor(evaluation.score), marginBottom: '10px' }}>
          {evaluation.score}/100
        </div>
        <div style={{ fontSize: '20px', fontWeight: '600', color: getTierColor(evaluation.tier), marginBottom: '10px' }}>
          {getTierLabel(evaluation.tier)}
        </div>
        <div style={{ fontSize: '16px', color: '#fff' }}>
          Collaboration Probability: {evaluation.collaborationProbability}%
        </div>
      </div>

      {/* Score Breakdown */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#FFD600', fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
          Score Breakdown
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ color: '#FFD600', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              Story Foundation (40%)
            </div>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: '700' }}>
              {evaluation.scoreBreakdown.storyFoundation}/40
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ color: '#FFD600', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              Technical Excellence (25%)
            </div>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: '700' }}>
              {evaluation.scoreBreakdown.technicalExcellence}/25
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ color: '#FFD600', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              Collaborative Potential (25%)
            </div>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: '700' }}>
              {evaluation.scoreBreakdown.collaborativePotential}/25
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ color: '#FFD600', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              Viral Impact (10%)
            </div>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: '700' }}>
              {evaluation.scoreBreakdown.viralImpact}/10
            </div>
          </div>
        </div>
      </div>

      {/* Strengths and Weaknesses */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Strengths */}
          <div>
            <h4 style={{ color: '#00C46C', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
              ✅ Strengths
            </h4>
            <div style={{ textAlign: 'left' }}>
              {evaluation.strengths.map((strength, index) => (
                <div key={index} style={{
                  background: 'rgba(0, 196, 108, 0.1)',
                  border: '1px solid #00C46C',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#fff'
                }}>
                  {strength}
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div>
            <h4 style={{ color: '#FF8C00', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
              ⚠️ Weaknesses
            </h4>
            <div style={{ textAlign: 'left' }}>
              {evaluation.weaknesses.map((weakness, index) => (
                <div key={index} style={{
                  background: 'rgba(255, 140, 0, 0.1)',
                  border: '1px solid #FF8C00',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#fff'
                }}>
                  {weakness}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Roadmap */}
      <div style={{
        background: 'rgba(255, 215, 0, 0.1)',
        border: '1px solid #FFD600',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '30px',
        textAlign: 'left'
      }}>
        <h4 style={{ color: '#FFD600', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
          🎯 Optimization Roadmap
        </h4>
        <div style={{ marginBottom: '8px' }}>
          <strong style={{ color: '#FFD600' }}>Priority:</strong> {evaluation.optimizationRoadmap.priority}
        </div>
        <div>
          <strong style={{ color: '#FFD600' }}>Secondary:</strong> {evaluation.optimizationRoadmap.secondary}
        </div>
      </div>

      {/* Collaboration Forecast */}
      <div style={{
        background: 'rgba(0, 196, 108, 0.1)',
        border: '1px solid #00C46C',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '30px'
      }}>
        <h4 style={{ color: '#00C46C', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
          📈 Collaboration Forecast
        </h4>
        <div style={{ color: '#fff', fontSize: '14px', lineHeight: '1.5' }}>
          {evaluation.collaborationForecast}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        {evaluation.securityStatus === 'CLEARED' && evaluation.tier !== 'F' ? (
          <button
            onClick={onContinue}
            style={{
              background: '#00C46C',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Continue to Campaign
          </button>
        ) : (
          <button
            onClick={onRetry}
            style={{
              background: '#FFD600',
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Improve Content
          </button>
        )}
      </div>
    </div>
  );
}
