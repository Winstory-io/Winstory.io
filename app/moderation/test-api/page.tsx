'use client';

import { useState, useEffect } from 'react';

export default function TestApiPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/moderation/campaigns');
        const result = await response.json();
        
        if (result.success) {
          setCampaigns(result.data);
        } else {
          setError(result.error || 'Failed to fetch campaigns');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Loading campaigns...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h1>Error: {error}</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test API - Campagnes disponibles</h1>
      <p>Nombre de campagnes: {campaigns.length}</p>
      
      {campaigns.map((campaign) => (
        <div key={campaign.id} style={{ 
          border: '1px solid #ccc', 
          margin: '10px 0', 
          padding: '15px',
          borderRadius: '8px'
        }}>
          <h3>{campaign.title}</h3>
          <p><strong>Type:</strong> {campaign.type}</p>
          <p><strong>Creator Type:</strong> {campaign.creatorType}</p>
          <p><strong>Status:</strong> {campaign.status}</p>
          {campaign.creatorInfo && (
            <div>
              <p><strong>Company:</strong> {campaign.creatorInfo.companyName || 'N/A'}</p>
              <p><strong>Agency:</strong> {campaign.creatorInfo.agencyName || 'N/A'}</p>
            </div>
          )}
          {campaign.content && (
            <div>
              <p><strong>Starting Story:</strong> {campaign.content.startingStory.substring(0, 100)}...</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 