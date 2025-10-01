"use client";
import React from 'react';

interface CampaignCardProps {
  campaign: {
    id: string;
    story: {
      title: string;
      startingStory: string;
      guideline: string;
    };
    completions: {
      wincValue: number;
      maxCompletions: number;
    };
    status: 'pending' | 'evaluating' | 'approved' | 'rejected' | 'active' | 'completed';
    evaluation?: {
      score: number;
      tier: 'S' | 'A' | 'B' | 'C' | 'F';
      collaborationProbability: number;
      securityStatus: 'CLEARED' | 'FLAGGED';
    };
    createdAt: string;
    approvedAt?: string;
    availableToCompleters: boolean;
  };
  onViewDetails: (campaignId: string) => void;
}

export default function CampaignCard({ campaign, onViewDetails }: CampaignCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#00C46C';
      case 'active': return '#18C964';
      case 'completed': return '#FFD600';
      case 'rejected': return '#FF2D2D';
      case 'evaluating': return '#FF8C00';
      case 'pending': return '#666';
      default: return '#666';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'rejected': return 'Rejected';
      case 'evaluating': return 'Evaluating';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'S': return '#FFD700';
      case 'A': return '#00C46C';
      case 'B': return '#FFD600';
      case 'C': return '#FF8C00';
      case 'F': return '#FF2D2D';
      default: return '#666';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'S': return 'S-Tier';
      case 'A': return 'A-Tier';
      case 'B': return 'B-Tier';
      case 'C': return 'C-Tier';
      case 'F': return 'F-Tier';
      default: return 'Unknown';
    }
  };

  return (
    <div
      style={{
        background: '#000',
        border: '2px solid #FFD600',
        borderRadius: '16px',
        padding: '24px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#18C964';
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#FFD600';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      onClick={() => onViewDetails(campaign.id)}
    >
      {/* En-tête de la campagne */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '12px'
        }}>
          <h3 style={{ 
            color: '#FFD600', 
            fontSize: '20px', 
            fontWeight: '700',
            margin: 0,
            flex: 1
          }}>
            {campaign.story.title}
          </h3>
          <div style={{
            background: getStatusColor(campaign.status),
            color: campaign.status === 'completed' ? '#000' : '#fff',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '700',
            marginLeft: '12px'
          }}>
            {getStatusLabel(campaign.status)}
          </div>
        </div>
        
        <div style={{ 
          color: '#fff', 
          fontSize: '14px', 
          lineHeight: '1.5',
          marginBottom: '16px'
        }}>
          {campaign.story.startingStory.length > 150 
            ? campaign.story.startingStory.substring(0, 150) + '...'
            : campaign.story.startingStory
          }
        </div>
      </div>

      {/* Informations de récompense */}
      <div style={{
        background: 'rgba(255, 215, 0, 0.1)',
        border: '1px solid #FFD600',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ 
          color: '#FFD600', 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '8px' 
        }}>
          💰 Reward: {campaign.completions.wincValue} $WINC
        </div>
        <div style={{ 
          color: '#fff', 
          fontSize: '14px' 
        }}>
          Max Completions: {campaign.completions.maxCompletions}
        </div>
      </div>

      {/* Informations d'évaluation */}
      {campaign.evaluation && (
        <div style={{
          background: 'rgba(0, 196, 108, 0.1)',
          border: '1px solid #18C964',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <div style={{ 
              color: '#18C964', 
              fontSize: '14px', 
              fontWeight: '600' 
            }}>
              AI Evaluation Score: {campaign.evaluation.score}/100
            </div>
            <div style={{
              background: getTierColor(campaign.evaluation.tier),
              color: campaign.evaluation.tier === 'S' ? '#000' : '#fff',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: '700'
            }}>
              {getTierLabel(campaign.evaluation.tier)}
            </div>
          </div>
          <div style={{ 
            color: '#fff', 
            fontSize: '12px' 
          }}>
            Collaboration Probability: {campaign.evaluation.collaborationProbability}%
          </div>
        </div>
      )}

      {/* Informations de disponibilité */}
      {campaign.availableToCompleters && (
        <div style={{
          background: 'rgba(24, 201, 100, 0.1)',
          border: '1px solid #18C964',
          borderRadius: '6px',
          padding: '8px 12px',
          marginBottom: '16px'
        }}>
          <div style={{ 
            color: '#18C964', 
            fontSize: '12px', 
            fontWeight: '600' 
          }}>
            ✅ Available to Community Completions
          </div>
        </div>
      )}

      {/* Date de création */}
      <div style={{ 
        color: '#666', 
        fontSize: '12px', 
        textAlign: 'right' 
      }}>
        Created: {new Date(campaign.createdAt).toLocaleDateString()}
      </div>

      {/* Indicateur de clic */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        color: '#FFD600',
        fontSize: '20px',
        opacity: 0.7
      }}>
        →
      </div>
    </div>
  );
}
