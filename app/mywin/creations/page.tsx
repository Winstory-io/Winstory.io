"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import CampaignCard from '@/components/CampaignCard';

interface Campaign {
  id: string;
  creatorId: string;
  story: {
    title: string;
    startingStory: string;
    guideline: string;
  };
  film: {
    url?: string;
    videoId?: string;
    fileName?: string;
    fileSize?: number;
    format?: string;
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
}

export default function MyCreationsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  useEffect(() => {
    fetchUserCampaigns();
  }, []);

  const fetchUserCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/campaigns');
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      
      const data = await response.json();
      // Filter campaigns for current user (in a real app, this would be done server-side)
      const userCampaigns = data.campaigns || [];
      setCampaigns(userCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to load your campaigns');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCampaigns = () => {
    switch (activeTab) {
      case 'approved':
        return campaigns.filter(c => c.status === 'approved');
      case 'pending':
        return campaigns.filter(c => c.status === 'pending' || c.status === 'evaluating');
      case 'rejected':
        return campaigns.filter(c => c.status === 'rejected');
      default:
        return campaigns;
    }
  };

  const handleViewDetails = (campaignId: string) => {
    // TODO: Navigate to campaign details page
    console.log('View details for campaign:', campaignId);
  };

  const getTabCount = (status: string) => {
    switch (status) {
      case 'approved':
        return campaigns.filter(c => c.status === 'approved').length;
      case 'pending':
        return campaigns.filter(c => c.status === 'pending' || c.status === 'evaluating').length;
      case 'rejected':
        return campaigns.filter(c => c.status === 'rejected').length;
      default:
        return campaigns.length;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div style={{ 
          minHeight: '100vh', 
          background: '#000', 
          color: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid #FFD600',
              borderTop: '4px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px auto'
            }}></div>
            <div style={{ color: '#FFD600', fontSize: '18px', fontWeight: '600' }}>
              Loading your campaigns...
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div style={{ 
          minHeight: '100vh', 
          background: '#000', 
          color: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#FF2D2D', fontSize: '48px', marginBottom: '20px' }}>
              ✗
            </div>
            <div style={{ color: '#FF2D2D', fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
              Error Loading Campaigns
            </div>
            <div style={{ color: '#fff', fontSize: '16px', marginBottom: '30px' }}>
              {error}
            </div>
            <button
              onClick={fetchUserCampaigns}
              style={{
                background: '#FFD600',
                color: '#000',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 32px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const filteredCampaigns = getFilteredCampaigns();

  return (
    <ProtectedRoute>
      <div style={{ 
        minHeight: '100vh', 
        background: '#000', 
        color: '#fff', 
        padding: '20px' 
      }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: '40px' 
        }}>
          <img src="/creation.svg" alt="Creations" style={{ width: 80, height: 80, marginRight: 16 }} />
          <span style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>
            My Creations
          </span>
        </div>

        {/* Onglets */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '24px', 
          marginBottom: '40px',
          flexWrap: 'wrap'
        }}>
          {[
            { key: 'all', label: 'All Campaigns' },
            { key: 'approved', label: 'Approved' },
            { key: 'pending', label: 'Pending' },
            { key: 'rejected', label: 'Rejected' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                background: activeTab === tab.key ? '#FFD600' : 'transparent',
                color: activeTab === tab.key ? '#000' : '#FFD600',
                border: '2px solid #FFD600',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {tab.label}
              <span style={{
                background: activeTab === tab.key ? '#000' : '#FFD600',
                color: activeTab === tab.key ? '#FFD600' : '#000',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                {getTabCount(tab.key)}
              </span>
            </button>
          ))}
        </div>

        {/* Contenu principal */}
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {filteredCampaigns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ color: '#FFD600', fontSize: '48px', marginBottom: '20px' }}>
                {activeTab === 'all' ? '📝' : activeTab === 'approved' ? '✅' : activeTab === 'pending' ? '⏳' : '❌'}
              </div>
              <div style={{ color: '#FFD600', fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
                {activeTab === 'all' ? 'No Campaigns Created' : 
                 activeTab === 'approved' ? 'No Approved Campaigns' :
                 activeTab === 'pending' ? 'No Pending Campaigns' : 'No Rejected Campaigns'}
              </div>
              <div style={{ color: '#fff', fontSize: '16px', marginBottom: '30px' }}>
                {activeTab === 'all' ? 'Start creating your first campaign to get started!' :
                 activeTab === 'approved' ? 'Your approved campaigns will appear here.' :
                 activeTab === 'pending' ? 'Your campaigns under review will appear here.' :
                 'Campaigns that need improvement will appear here.'}
              </div>
              {activeTab === 'all' && (
                <button
                  onClick={() => router.push('/creation')}
                  style={{
                    background: '#18C964',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px 32px',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Create Campaign
                </button>
              )}
            </div>
          ) : (
            <div>
              <div style={{ 
                color: '#FFD600', 
                fontSize: '20px', 
                fontWeight: '600', 
                marginBottom: '30px',
                textAlign: 'center'
              }}>
                {filteredCampaigns.length} Campaign{filteredCampaigns.length > 1 ? 's' : ''} Found
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                gap: '24px' 
              }}>
                {filteredCampaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}
