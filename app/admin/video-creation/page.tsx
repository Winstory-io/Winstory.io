'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PendingVideoCampaign {
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  startingStory: string;
  guidelines: string;
  videoOrientation: string;
  companyName: string;
  email: string | null;
  aiOption: boolean;
  videoUrl: string;
}

export default function VideoCreationAdminPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<PendingVideoCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingVideos();
  }, []);

  const fetchPendingVideos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/admin/pending-videos');
      const result = await response.json();

      if (result.success) {
        setCampaigns(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch campaigns');
      }
    } catch (err) {
      console.error('Error fetching pending videos:', err);
      setError('Network error: Failed to fetch campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        color: '#FFD600',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '18px'
      }}>
        Chargement des campagnes nécessitant une vidéo...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        color: '#FF6B6B',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        gap: '16px'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Erreur</div>
        <div>{error}</div>
        <button
          onClick={fetchPendingVideos}
          style={{
            padding: '12px 24px',
            background: '#FFD600',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#FFD600',
              margin: '0 0 8px 0'
            }}>
              Création de Vidéos Winstory
            </h1>
            <p style={{
              color: '#999',
              margin: 0
            }}>
              {campaigns.length} campagne{campaigns.length !== 1 ? 's' : ''} nécessitant une vidéo
            </p>
          </div>
          <button
            onClick={fetchPendingVideos}
            style={{
              padding: '12px 24px',
              background: '#FFD600',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            🔄 Actualiser
          </button>
        </div>

        {/* Campaigns List */}
        {campaigns.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 24px',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
              Aucune campagne nécessitant une vidéo
            </div>
            <div style={{ fontSize: '14px' }}>
              Toutes les vidéos ont été créées ou aucune campagne avec l'option "Winstory creates the Film" n'est en attente.
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '24px'
          }}>
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                style={{
                  background: '#111',
                  border: '1px solid rgba(255, 214, 0, 0.3)',
                  borderRadius: '12px',
                  padding: '24px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 214, 0, 0.6)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 214, 0, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '24px',
                  marginBottom: '16px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <h2 style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#FFD600',
                      margin: '0 0 8px 0'
                    }}>
                      {campaign.title || 'Sans titre'}
                    </h2>
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      flexWrap: 'wrap',
                      fontSize: '14px',
                      color: '#999',
                      marginBottom: '12px'
                    }}>
                      <span>
                        <strong style={{ color: '#fff' }}>Entreprise:</strong> {campaign.companyName}
                      </span>
                      {campaign.email && (
                        <span>
                          <strong style={{ color: '#fff' }}>Email:</strong> {campaign.email}
                        </span>
                      )}
                      <span>
                        <strong style={{ color: '#fff' }}>Créé:</strong> {formatDate(campaign.createdAt)}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      marginTop: '8px'
                    }}>
                      <span style={{
                        padding: '4px 8px',
                        background: campaign.status === 'PENDING_WINSTORY_VIDEO' ? 'rgba(255, 214, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        marginRight: '8px'
                      }}>
                        {campaign.status}
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        background: 'rgba(255, 214, 0, 0.2)',
                        borderRadius: '4px'
                      }}>
                        {campaign.videoOrientation === 'vertical' ? '📱 Vertical' : '🖥️ Horizontal'}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/admin/video-creation/${campaign.id}`}
                    style={{
                      padding: '12px 24px',
                      background: '#FFD600',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      textDecoration: 'none',
                      display: 'inline-block'
                    }}
                  >
                    Créer/Uploader Vidéo →
                  </Link>
                </div>

                {/* Starting Story Preview */}
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#FFD600',
                    marginBottom: '8px',
                    textTransform: 'uppercase'
                  }}>
                    Starting Story
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#ccc',
                    lineHeight: '1.6',
                    maxHeight: '80px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {campaign.startingStory || 'Aucune starting story fournie'}
                  </div>
                </div>

                {/* Guidelines Preview */}
                {campaign.guidelines && (
                  <div style={{
                    marginTop: '12px',
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#FFD600',
                      marginBottom: '8px',
                      textTransform: 'uppercase'
                    }}>
                      Guidelines
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#ccc',
                      lineHeight: '1.6',
                      maxHeight: '60px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {campaign.guidelines}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

