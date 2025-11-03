'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface CampaignDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  createdAt: string;
  startingStory: string;
  guidelines: string;
  videoOrientation: string;
  companyName: string;
  email: string | null;
  aiOption: boolean;
  videoUrl: string;
}

export default function VideoCreationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params?.campaignId as string;
  
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (campaignId) {
      fetchCampaignDetails();
    }
  }, [campaignId]);

  const fetchCampaignDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/admin/pending-videos');
      const result = await response.json();

      if (result.success) {
        const foundCampaign = result.data?.find((c: CampaignDetails) => c.id === campaignId);
        if (foundCampaign) {
          setCampaign(foundCampaign);
        } else {
          setError('Campagne non trouvée');
        }
      } else {
        setError(result.error || 'Failed to fetch campaign');
      }
    } catch (err) {
      console.error('Error fetching campaign details:', err);
      setError('Network error: Failed to fetch campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Valider le type de fichier
    if (!file.type.startsWith('video/')) {
      alert('Veuillez sélectionner un fichier vidéo');
      return;
    }

    // Valider la taille (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      alert('Le fichier est trop volumineux (max 500MB)');
      return;
    }

    await uploadVideo(file);
  };

  const uploadVideo = async (file: File) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Étape 1: Upload vers S3
      console.log('📤 Uploading video to S3...');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'pending');
      formData.append('campaignId', campaignId);

      const uploadResponse = await fetch('/api/s3/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload video to S3');
      }

      const uploadResult = await uploadResponse.json();
      const s3VideoUrl = uploadResult.videoUrl;
      
      console.log('✅ Video uploaded to S3:', s3VideoUrl);
      setVideoUrl(s3VideoUrl);
      setUploadProgress(50);

      // Étape 2: Mettre à jour la base de données
      console.log('💾 Updating database...');
      const updateResponse = await fetch('/api/admin/update-video', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          videoUrl: s3VideoUrl,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to update database');
      }

      const updateResult = await updateResponse.json();
      console.log('✅ Database updated:', updateResult);
      setUploadProgress(100);

      // Attendre un peu avant de rediriger
      setTimeout(() => {
        alert('✅ Vidéo créée avec succès ! La campagne est maintenant disponible pour modération.');
        router.push('/admin/video-creation');
      }, 1000);

    } catch (err) {
      console.error('Error uploading video:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
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
        Chargement des détails de la campagne...
      </div>
    );
  }

  if (error && !campaign) {
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
        <Link
          href="/admin/video-creation"
          style={{
            padding: '12px 24px',
            background: '#FFD600',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            textDecoration: 'none'
          }}
        >
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1200px',
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
            <Link
              href="/admin/video-creation"
              style={{
                color: '#999',
                textDecoration: 'none',
                fontSize: '14px',
                marginBottom: '8px',
                display: 'block'
              }}
            >
              ← Retour à la liste
            </Link>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#FFD600',
              margin: 0
            }}>
              Créer la vidéo
            </h1>
            <p style={{
              color: '#999',
              margin: '8px 0 0 0'
            }}>
              {campaign.title || 'Sans titre'}
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            padding: '16px',
            background: 'rgba(255, 107, 107, 0.2)',
            border: '1px solid rgba(255, 107, 107, 0.5)',
            borderRadius: '8px',
            color: '#FF6B6B',
            marginBottom: '24px'
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          {/* Left Column: Campaign Info */}
          <div>
            <div style={{
              background: '#111',
              border: '1px solid rgba(255, 214, 0, 0.3)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#FFD600',
                margin: '0 0 16px 0'
              }}>
                Informations de la campagne
              </h2>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontSize: '14px'
              }}>
                <div>
                  <strong style={{ color: '#999' }}>ID:</strong> {campaign.id}
                </div>
                <div>
                  <strong style={{ color: '#999' }}>Entreprise:</strong> {campaign.companyName}
                </div>
                {campaign.email && (
                  <div>
                    <strong style={{ color: '#999' }}>Email:</strong> {campaign.email}
                  </div>
                )}
                <div>
                  <strong style={{ color: '#999' }}>Créé le:</strong> {formatDate(campaign.createdAt)}
                </div>
                <div>
                  <strong style={{ color: '#999' }}>Format:</strong>{' '}
                  {campaign.videoOrientation === 'vertical' ? '📱 Vertical (9:16)' : '🖥️ Horizontal (16:9)'}
                </div>
                <div>
                  <strong style={{ color: '#999' }}>Statut:</strong>{' '}
                  <span style={{
                    padding: '4px 8px',
                    background: campaign.status === 'PENDING_WINSTORY_VIDEO' ? 'rgba(255, 214, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px'
                  }}>
                    {campaign.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Starting Story */}
            <div style={{
              background: '#111',
              border: '1px solid rgba(255, 214, 0, 0.3)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#FFD600',
                margin: '0 0 12px 0'
              }}>
                Starting Story
              </h3>
              <div style={{
                fontSize: '14px',
                color: '#ccc',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap'
              }}>
                {campaign.startingStory || 'Aucune starting story fournie'}
              </div>
            </div>

            {/* Guidelines */}
            {campaign.guidelines && (
              <div style={{
                background: '#111',
                border: '1px solid rgba(255, 214, 0, 0.3)',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#FFD600',
                  margin: '0 0 12px 0'
                }}>
                  Guidelines
                </h3>
                <div style={{
                  fontSize: '14px',
                  color: '#ccc',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {campaign.guidelines}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Video Upload */}
          <div>
            <div style={{
              background: '#111',
              border: '1px solid rgba(255, 214, 0, 0.3)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#FFD600',
                margin: '0 0 16px 0'
              }}>
                Uploader la vidéo
              </h2>

              <div style={{
                marginBottom: '16px',
                padding: '16px',
                background: 'rgba(255, 214, 0, 0.1)',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#ccc'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Instructions:</strong>
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                  <li>Format: MP4 recommandé</li>
                  <li>Taille max: 500MB</li>
                  <li>Format: {campaign.videoOrientation === 'vertical' ? 'Vertical (9:16)' : 'Horizontal (16:9)'}</li>
                  <li>La vidéo sera uploadée vers S3 dans /pending</li>
                  <li>Une fois uploadée, la campagne sera disponible pour modération</li>
                </ul>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                disabled={uploading}
                style={{ display: 'none' }}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: uploading ? '#666' : '#FFD600',
                  color: uploading ? '#999' : '#000',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  marginBottom: '16px',
                  opacity: uploading ? 0.6 : 1
                }}
              >
                {uploading ? '⏳ Upload en cours...' : '📤 Sélectionner et uploader la vidéo'}
              </button>

              {uploadProgress > 0 && (
                <div style={{
                  marginTop: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    fontSize: '14px',
                    color: '#999'
                  }}>
                    <span>Progression</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${uploadProgress}%`,
                      height: '100%',
                      background: '#FFD600',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              )}

              {videoUrl && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: 'rgba(0, 255, 0, 0.1)',
                  border: '1px solid rgba(0, 255, 0, 0.3)',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}>
                  <div style={{ color: '#00FF00', fontWeight: 'bold', marginBottom: '8px' }}>
                    ✅ Vidéo uploadée avec succès
                  </div>
                  <div style={{ color: '#ccc', wordBreak: 'break-all' }}>
                    {videoUrl}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

