"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from '@/components/ProtectedRoute';
import { getVideoFromIndexedDB } from '@/lib/videoStorage';

const Modal = ({ open, onClose, children }: { open: boolean, onClose: () => void, children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#181818', color: '#FFD600', padding: 32, borderRadius: 18, minWidth: 320, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#FFD600', fontSize: 28, cursor: 'pointer' }}>×</button>
        {children}
      </div>
    </div>
  );
};

export default function AgencyB2CRecap() {
  const router = useRouter();
  const [recap, setRecap] = useState<any>({});
  const [modal, setModal] = useState<{ open: boolean, content: React.ReactNode }>({ open: false, content: null });
  const [confirmed, setConfirmed] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);

  useEffect(() => {
    const readLocalStorage = () => {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const company = JSON.parse(localStorage.getItem("company") || "null");
      const story = JSON.parse(localStorage.getItem("story") || "null");
      const film = JSON.parse(localStorage.getItem("film") || "null");
      
      // Charger les infos du client B2C pour agencyb2c
      const agencyB2CContext = JSON.parse(localStorage.getItem("agencyB2CContext") || "null");
      const b2cClient = JSON.parse(localStorage.getItem("b2cClient") || "null");
      
      // Extraire les infos de l'agence et du client B2C
      const agencyInfo = agencyB2CContext?.agency || { name: company?.name || '', email: user?.email || '' };
      const clientInfo = agencyB2CContext?.b2c || b2cClient || { companyName: '', contactEmail: '' };
      
      console.log("Agency B2C Film data loaded:", {
        hasUrl: !!film?.url,
        hasVideoId: !!film?.videoId,
        urlType: film?.url ? (film.url.startsWith('data:') ? 'base64' : 'blob') : 'none',
        urlLength: film?.url?.length || 0,
        fileName: film?.fileName,
        aiRequested: film?.aiRequested,
        agencyInfo,
        clientInfo
      });
      
      // Charger la vidéo depuis IndexedDB si on a un videoId
      if (film?.videoId) {
        setVideoLoading(true);
        getVideoFromIndexedDB(film.videoId).then(videoFile => {
          if (videoFile) {
            const url = URL.createObjectURL(videoFile);
            setVideoUrl(url);
            console.log('Agency B2C Video loaded from IndexedDB:', url);
          } else {
            console.warn('Agency B2C Video not found in IndexedDB for ID:', film?.videoId);
          }
        }).catch(error => {
          console.error('Failed to load Agency B2C video from IndexedDB:', error);
        }).finally(() => {
          setVideoLoading(false);
        });
      }
      const standardToken = JSON.parse(localStorage.getItem("standardTokenReward") || "null");
      const standardItem = JSON.parse(localStorage.getItem("standardItemReward") || "null");
      const premiumToken = JSON.parse(localStorage.getItem("premiumTokenReward") || "null");
      const premiumItem = JSON.parse(localStorage.getItem("premiumItemReward") || "null");
      // Charger aussi les récompenses Digital/Physical Access
      const standardDigitalAccess = JSON.parse(localStorage.getItem("standardDigitalAccessReward") || "null");
      const premiumDigitalAccess = JSON.parse(localStorage.getItem("premiumDigitalAccessReward") || "null");
      const standardPhysicalAccess = JSON.parse(localStorage.getItem("standardPhysicalAccessReward") || "null");
      const premiumPhysicalAccess = JSON.parse(localStorage.getItem("premiumPhysicalAccessReward") || "null");
      const roiData = JSON.parse(localStorage.getItem("roiData") || "null");
      setRecap({ 
        user, 
        company, 
        story, 
        film, 
        standardToken, 
        standardItem, 
        premiumToken, 
        premiumItem, 
        standardDigitalAccess,
        premiumDigitalAccess,
        standardPhysicalAccess,
        premiumPhysicalAccess,
        roiData,
        agencyInfo,
        clientInfo 
      });
    };
    readLocalStorage();
    window.addEventListener('focus', readLocalStorage);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') readLocalStorage();
    });
    return () => {
      window.removeEventListener('focus', readLocalStorage);
      document.removeEventListener('visibilitychange', readLocalStorage);
    };
  }, []);

  // Nettoyage des URLs de blob quand le composant est démonté
  useEffect(() => {
    return () => {
      if (videoUrl && videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  // Pour la maquette, fallback si pas de données
  const agencyEmail = recap.agencyInfo?.email || recap.user?.email || '';
  const agencyCompanyName = recap.agencyInfo?.name || recap.company?.name || '';
  const clientEmail = recap.clientInfo?.contactEmail || '';
  const clientCompanyName = recap.clientInfo?.companyName || '';
  const title = recap.story?.title || "@startingtitle";
  const startingStory = recap.story?.startingStory || "@startingstory";
  const guideline = recap.story?.guideline || "@guideline";
  // Pour les agences B2C, toujours afficher "View your film" si une vidéo existe
  const filmLabel = (videoUrl || recap.film?.url) 
    ? "View your film"
    : "@yourfilm";
  const rewardLabel = recap.reward?.rewardLabel || "No Rewards";

  // Calcul du nombre total de récompenses à distribuer
  const calculateTotalRewards = () => {
    let totalStandard = 0;
    let totalPremium = 0;
    
    // Calcul des récompenses standard
    if (recap.standardToken && recap.roiData?.maxCompletions) {
      totalStandard += recap.standardToken.amountPerUser * recap.roiData.maxCompletions;
    }
    if (recap.standardItem && recap.roiData?.maxCompletions) {
      totalStandard += recap.standardItem.amountPerUser * recap.roiData.maxCompletions;
    }
    
    // Calcul des récompenses premium (toujours 3 gagnants)
    if (recap.premiumToken) {
      totalPremium += recap.premiumToken.amountPerUser * 3;
    }
    if (recap.premiumItem) {
      totalPremium += recap.premiumItem.amountPerUser * 3;
    }
    
    return { totalStandard, totalPremium, total: totalStandard + totalPremium };
  };

  const rewardTotals = calculateTotalRewards();

  const handleConfirm = async () => {
    console.log('=== CREATE AGENCY B2C CAMPAIGN - FINAL RECAP ===');
    console.log('--- Agency Information ---');
    console.log('Agency Email:', agencyEmail);
    console.log('Agency Name:', agencyCompanyName);
    console.log('--- B2C Client Information ---');
    console.log('Client Email:', clientEmail);
    console.log('Client Company Name:', clientCompanyName);
    console.log('--- Story Information ---');
    console.log('Title:', recap.story?.title);
    console.log('Starting Story:', recap.story?.startingStory);
    console.log('Guideline:', recap.story?.guideline);
    console.log('--- Film Information ---');
    console.log('AI Film Requested:', recap.film?.aiRequested);
    console.log('Video File:', recap.film?.fileName || 'No video file');
    console.log('Video Format:', recap.film?.format);
    console.log('--- ROI/Rewards Data ---');
    console.log('Unit Value:', recap.roiData?.unitValue);
    console.log('Net Profit:', recap.roiData?.netProfit);
    console.log('Max Completions:', recap.roiData?.maxCompletions);
    console.log('Free Reward:', recap.roiData?.isFreeReward);
    console.log('No Reward:', recap.roiData?.noReward);
    console.log('--- Standard Rewards ---');
    if (recap.standardToken) {
      console.log('Standard Token:', recap.standardToken.name);
      console.log('  - Contract:', recap.standardToken.contractAddress);
      console.log('  - Blockchain:', recap.standardToken.blockchain);
      console.log('  - Amount per user:', recap.standardToken.amountPerUser);
    }
    if (recap.standardItem) {
      console.log('Standard Item:', recap.standardItem.name);
      console.log('  - Contract:', recap.standardItem.contractAddress);
      console.log('  - Blockchain:', recap.standardItem.blockchain);
      console.log('  - Amount per user:', recap.standardItem.amountPerUser);
    }
    console.log('--- Premium Rewards ---');
    if (recap.premiumToken) {
      console.log('Premium Token:', recap.premiumToken.name);
      console.log('  - Contract:', recap.premiumToken.contractAddress);
      console.log('  - Blockchain:', recap.premiumToken.blockchain);
      console.log('  - Amount per user:', recap.premiumToken.amountPerUser);
    }
    if (recap.premiumItem) {
      console.log('Premium Item:', recap.premiumItem.name);
      console.log('  - Contract:', recap.premiumItem.contractAddress);
      console.log('  - Blockchain:', recap.premiumItem.blockchain);
      console.log('  - Amount per user:', recap.premiumItem.amountPerUser);
    }
    console.log('--- Economic Data ---');
    console.log('Total Standard Rewards:', rewardTotals.totalStandard);
    console.log('Total Premium Rewards:', rewardTotals.totalPremium);
    console.log('Total Rewards:', rewardTotals.total);
    console.log('=== END RECAP ===');

    // Créer la campagne dans la base de données
    try {
      // Générer un ID temporaire pour la campagne (sera remplacé par l'ID réel)
      const tempCampaignId = `temp_${Date.now()}`;
      
      // ⚠️ DEV ONLY: Upload S3 lors de la confirmation pour tester l'intégration
      // TODO PROD: Déplacer cet upload vers handlePaymentSuccess() pour éviter
      // les coûts de stockage S3 pour les utilisateurs qui ne paient pas
      // Voir S3_UPLOAD_STRATEGY.md pour plus de détails
      
      // 1. Upload la vidéo vers S3 si elle existe
      let s3VideoUrl = null;
      if (recap.film?.videoId) {
        console.log('📤 [S3] Uploading video to S3...');
        try {
          const videoFile = await getVideoFromIndexedDB(recap.film.videoId);
          if (videoFile) {
            const formData = new FormData();
            formData.append('file', videoFile);
            formData.append('folder', 'pending');
            formData.append('campaignId', tempCampaignId);

            const uploadResponse = await fetch('/api/s3/upload', {
              method: 'POST',
              body: formData,
            });

            if (uploadResponse.ok) {
              const uploadResult = await uploadResponse.json();
              s3VideoUrl = uploadResult.videoUrl;
              console.log('✅ [S3] Video uploaded successfully:', s3VideoUrl);
            } else {
              console.error('❌ [S3] Failed to upload video to S3');
            }
          }
        } catch (uploadError) {
          console.error('❌ [S3] Error uploading video:', uploadError);
        }
      }

      // 2. Créer la campagne avec l'URL S3
      const filmData = {
        ...recap.film,
        s3VideoUrl: s3VideoUrl, // Ajouter l'URL S3
      };

      const response = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: recap.user,
          company: recap.company,
          story: recap.story,
          film: filmData,
          roiData: recap.roiData,
          standardToken: recap.standardToken,
          standardItem: recap.standardItem,
          premiumToken: recap.premiumToken,
          premiumItem: recap.premiumItem,
          campaignType: 'AGENCY_B2C',
          walletAddress: localStorage.getItem('walletAddress') || null,
          walletSource: 'localStorage.walletAddress',
          agencyInfo: {
            name: agencyCompanyName,
            email: agencyEmail
          },
          clientInfo: {
            companyName: clientCompanyName,
            contactEmail: clientEmail
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign in database');
      }

      const result = await response.json();
      console.log('✅ Agency B2C campaign created successfully:', result.campaignId);
      
      // Stocker l'ID de la campagne pour utilisation ultérieure
      localStorage.setItem('currentCampaignId', result.campaignId);
      
    } catch (error) {
      console.error('Failed to create Agency B2C campaign:', error);
      // Continuer même si la création échoue pour l'instant
    }
    
    // Marquer le flow actuel comme AgencyB2C avant de rediriger
    localStorage.setItem("currentCreationFlow", "AgencyB2C");
    
    setConfirmed(true);
    setTimeout(() => {
      // TODO: Le MINT de la campagne permet de déployer sur IPFS (à améliorer ultérieurement)
      router.push("/creation/agencyb2c/mint");
    }, 1000); // 1 seconde pour laisser voir l'animation de la coche
  };

  // Gestion modals pour chaque champ
  const openModal = (label: string, value: string | undefined, isFilm?: boolean) => {
    setModal({
      open: true,
      content: isFilm && (videoUrl || (recap.film?.url && recap.film.url !== 'null' && recap.film.url.length > 10)) ? (
        <div>
          <h3 style={{ marginBottom: 16, fontSize: 20 }}>{label}</h3>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
            <video 
              controls 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '70vh', 
                borderRadius: 8,
                objectFit: 'contain'
              }}
              onError={(e) => {
                console.warn('Video failed to load in modal:', videoUrl || recap.film.url);
              }}
              onLoadStart={() => {
                console.log('Video loading started in modal');
              }}
            >
              <source src={videoUrl || recap.film.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          {/* Informations sur le fichier */}
          {recap.film.fileName && (
            <div style={{ marginTop: 12, padding: 8, background: 'rgba(255,215,0,0.1)', borderRadius: 4 }}>
              <div style={{ fontSize: 12, color: '#FFD600' }}>
                📁 {recap.film.fileName} • {recap.film.fileSize ? Math.round(recap.film.fileSize / (1024*1024) * 100)/100 + ' MB' : ''} • {recap.film.format || 'unknown format'}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3 style={{ marginBottom: 16, fontSize: 20 }}>{label}</h3>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{value || 'No data available'}</p>
        </div>
      )
    });
  };

  const openHelpModal = () => {
    setModal({
      open: true,
      content: (
        <div>
          <h3 style={{ marginBottom: 16, fontSize: 20 }}>How to edit your campaign</h3>
          <p style={{ marginBottom: 12 }}>To modify any information before confirming your campaign:</p>
          <ul style={{ paddingLeft: 20, lineHeight: 1.6 }}>
            <li>Click on any field to open the editing modal</li>
            <li>Make your changes in the modal</li>
            <li>Click outside the modal or the X button to close</li>
            <li>Your changes will be automatically saved</li>
          </ul>
          <p style={{ marginTop: 16, fontSize: 14, opacity: 0.8 }}>
            Note: You can also use the browser's back button to return to previous steps.
          </p>
        </div>
      )
    });
  };

  return (
    <ProtectedRoute>
      {/* Croix rouge en haut à droite */}
      <button
        onClick={() => setShowLeaveModal(true)}
        aria-label="Quitter la création"
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 1200,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        {/* Croix SVG rouge */}
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#181818"/>
          <path d="M12 12L24 24" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round"/>
          <path d="M24 12L12 24" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </button>
      {/* Overlay Recap transparent si modale leave ouverte */}
      <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: 'Inter, sans-serif', padding: 40, opacity: showLeaveModal ? 0.3 : 1, transition: 'opacity 0.2s' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 60, textAlign: 'center', position: 'relative' }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>Recap</h1>
          <button
            onClick={openHelpModal}
            style={{
              position: 'absolute',
              right: 0,
              background: 'none',
              border: 'none',
              color: '#FFD600',
              fontSize: 24,
              cursor: 'pointer',
              padding: 8,
            }}
            aria-label="Help"
          >
            ?
          </button>
        </header>

        <main style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Informations de l'agence */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ color: '#FFD600', fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Agency Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              <div style={{ border: "2px solid #333", borderRadius: 16, padding: 24, background: '#181818' }}>
                <h3 style={{ color: '#FFD600', marginBottom: 12, fontSize: 18 }}>Agency Name</h3>
                <p style={{ margin: 0, fontSize: 16 }}>{agencyCompanyName || 'Not specified'}</p>
              </div>
              <div style={{ border: "2px solid #333", borderRadius: 16, padding: 24, background: '#181818' }}>
                <h3 style={{ color: '#FFD600', marginBottom: 12, fontSize: 18 }}>Agency Email</h3>
                <p style={{ margin: 0, fontSize: 16 }}>{agencyEmail || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Informations du client B2C */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ color: '#FFD600', fontSize: 24, fontWeight: 700, marginBottom: 20 }}>B2C Client Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              <div style={{ border: "2px solid #333", borderRadius: 16, padding: 24, background: '#181818' }}>
                <h3 style={{ color: '#00C46C', marginBottom: 12, fontSize: 18 }}>Client Company</h3>
                <p style={{ margin: 0, fontSize: 16 }}>{clientCompanyName || 'Not specified'}</p>
              </div>
              <div style={{ border: "2px solid #333", borderRadius: 16, padding: 24, background: '#181818' }}>
                <h3 style={{ color: '#00C46C', marginBottom: 12, fontSize: 18 }}>Client Contact Email</h3>
                <p style={{ margin: 0, fontSize: 16 }}>{clientEmail || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Story Information */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ color: '#FFD600', fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Story Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              <div 
                style={{ border: "2px solid #333", borderRadius: 16, padding: 24, background: '#181818', cursor: 'pointer' }}
                onClick={() => openModal("Campaign Title", title)}
              >
                <h3 style={{ color: '#FFD600', marginBottom: 12, fontSize: 18 }}>Campaign Title</h3>
                <p style={{ margin: 0, fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
              </div>
              <div 
                style={{ border: "2px solid #333", borderRadius: 16, padding: 24, background: '#181818', cursor: 'pointer' }}
                onClick={() => openModal("Starting Story", startingStory)}
              >
                <h3 style={{ color: '#FFD600', marginBottom: 12, fontSize: 18 }}>Starting Story</h3>
                <p style={{ margin: 0, fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{startingStory}</p>
              </div>
              <div 
                style={{ border: "2px solid #333", borderRadius: 16, padding: 24, background: '#181818', cursor: 'pointer' }}
                onClick={() => openModal("Guidelines", guideline)}
              >
                <h3 style={{ color: '#FFD600', marginBottom: 12, fontSize: 18 }}>Guidelines</h3>
                <p style={{ margin: 0, fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{guideline}</p>
              </div>
            </div>
          </div>

          {/* Film Information */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ color: '#FFD600', fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Film</h2>
            <div style={{ border: "2px solid #333", borderRadius: 16, padding: 24, background: '#181818' }}>
              {videoLoading ? (
                <div style={{ textAlign: 'center', color: '#FFD600' }}>
                  Loading video...
                </div>
              ) : (videoUrl || recap.film?.url) ? (
                <div>
                  <video 
                    controls 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '400px',
                      borderRadius: 8,
                      objectFit: 'contain',
                      width: '100%'
                    }}
                    onError={(e) => {
                      console.warn('Video failed to load:', videoUrl || recap.film.url);
                    }}
                  >
                    <source src={videoUrl || recap.film.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  {/* Informations sur le fichier */}
                  {recap.film?.fileName && (
                    <div style={{ marginTop: 12, padding: 8, background: 'rgba(255,215,0,0.1)', borderRadius: 4 }}>
                      <div style={{ fontSize: 12, color: '#FFD600' }}>
                        📁 {recap.film.fileName} • {recap.film.fileSize ? Math.round(recap.film.fileSize / (1024*1024) * 100)/100 + ' MB' : ''} • {recap.film.format || 'unknown format'}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#999' }}>
                  No video provided
                </div>
              )}
            </div>
          </div>

          {/* Rewards Information */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ color: '#FFD600', fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Rewards Configuration</h2>
            <div style={{ border: "2px solid #fff", borderRadius: 24, padding: 24, marginBottom: 40, textAlign: 'center', fontWeight: 600, fontSize: 18, maxWidth: 420, width: '100%', marginLeft: 'auto', marginRight: 'auto', background: '#181818' }}>
              <div style={{ fontWeight: 700, fontSize: 22, color: '#FFD600', marginBottom: 12 }}>Rewards</div>
              {recap.roiData?.noReward && (
                <div style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid #FFD600', borderRadius: 8, padding: 12, marginBottom: 0, color: '#FFD600', fontWeight: 600, fontSize: 15, textAlign: 'center', display: 'inline-block' }}>
                  ✓ No rewards - Free completions +$1000
                </div>
              )}
              {(!recap.standardToken && !recap.standardItem && !recap.premiumToken && !recap.premiumItem && !recap.standardDigitalAccess && !recap.premiumDigitalAccess && !recap.standardPhysicalAccess && !recap.premiumPhysicalAccess) ? null :
                <div style={{ marginTop: 16 }}>
                  {recap.standardToken && (
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#FFD600', fontWeight: 600 }}>Standard Token:</span> {recap.standardToken.amountPerUser} {recap.standardToken.tokenSymbol} per user
                    </div>
                  )}
                  {recap.standardItem && (
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#FFD600', fontWeight: 600 }}>Standard Item:</span> {recap.standardItem.itemName}
                    </div>
                  )}
                  {recap.standardDigitalAccess && (
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#FFD600', fontWeight: 600 }}>Standard Digital Access:</span> {recap.standardDigitalAccess.accessName}
                      {recap.standardDigitalAccess.accessType && (
                        <span> — {recap.standardDigitalAccess.accessType}</span>
                      )}
                    </div>
                  )}
                  {recap.standardPhysicalAccess && (
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#FFD600', fontWeight: 600 }}>Standard Physical Access:</span> {recap.standardPhysicalAccess.accessName}
                      <div style={{ fontSize: 14, color: '#aaa' }}>
                        {recap.standardPhysicalAccess.eventLocation} — {recap.standardPhysicalAccess.eventDate}{recap.standardPhysicalAccess.eventTime ? ` at ${recap.standardPhysicalAccess.eventTime}` : ''}
                      </div>
                    </div>
                  )}
                  {recap.premiumToken && (
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#FFD600', fontWeight: 600 }}>Premium Token:</span> {recap.premiumToken.amountPerUser} {recap.premiumToken.tokenSymbol} per winner
                    </div>
                  )}
                  {recap.premiumItem && (
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#FFD600', fontWeight: 600 }}>Premium Item:</span> {recap.premiumItem.itemName}
                    </div>
                  )}
                  {recap.premiumDigitalAccess && (
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#FFD600', fontWeight: 600 }}>Premium Digital Access:</span> {recap.premiumDigitalAccess.accessName}
                      {recap.premiumDigitalAccess.accessType && (
                        <span> — {recap.premiumDigitalAccess.accessType}</span>
                      )}
                    </div>
                  )}
                  {recap.premiumPhysicalAccess && (
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#FFD600', fontWeight: 600 }}>Premium Physical Access:</span> {recap.premiumPhysicalAccess.accessName}
                      <div style={{ fontSize: 14, color: '#aaa' }}>
                        {recap.premiumPhysicalAccess.eventLocation} — {recap.premiumPhysicalAccess.eventDate}{recap.premiumPhysicalAccess.eventTime ? ` at ${recap.premiumPhysicalAccess.eventTime}` : ''}
                      </div>
                    </div>
                  )}
                </div>
              }
            </div>
          </div>

          {/* ROI Information */}
          {recap.roiData && !recap.roiData.noReward && (
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ color: '#FFD600', fontSize: 24, fontWeight: 700, marginBottom: 20 }}>ROI Configuration</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                {recap.roiData.unitValue > 0 && (
                  <div style={{ border: "2px solid #333", borderRadius: 16, padding: 24, background: '#181818' }}>
                    <h3 style={{ color: '#FFD600', marginBottom: 12, fontSize: 18 }}>Unit Value</h3>
                    <p style={{ margin: 0, fontSize: 16 }}>${recap.roiData.unitValue}</p>
                  </div>
                )}
                {recap.roiData.netProfit > 0 && (
                  <div style={{ border: "2px solid #333", borderRadius: 16, padding: 24, background: '#181818' }}>
                    <h3 style={{ color: '#FFD600', marginBottom: 12, fontSize: 18 }}>Net Profit Target</h3>
                    <p style={{ margin: 0, fontSize: 16 }}>${recap.roiData.netProfit}</p>
                  </div>
                )}
                {recap.roiData.maxCompletions > 0 && (
                  <div style={{ border: "2px solid #333", borderRadius: 16, padding: 24, background: '#181818' }}>
                    <h3 style={{ color: '#FFD600', marginBottom: 12, fontSize: 18 }}>Max Completions</h3>
                    <p style={{ margin: 0, fontSize: 16 }}>{recap.roiData.maxCompletions}</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
        
        {/* Bouton Confirm flottant (bulle en bas à droite, toujours un cercle) */}
        <button
          onClick={handleConfirm}
          disabled={confirmed}
          style={{
            position: 'fixed',
            right: 24,
            bottom: 24,
            zIndex: 1100,
            background: '#18C964',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            fontSize: confirmed ? 32 : 20,
            fontWeight: 700,
            width: 88,
            height: 88,
            boxShadow: '0 4px 32px rgba(24,201,100,0.35)',
            cursor: confirmed ? 'default' : 'pointer',
            transition: 'background 0.2s, color 0.2s, box-shadow 0.2s, width 0.2s, height 0.2s, font-size 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            whiteSpace: 'pre-line',
            padding: 0,
          }}
          className="confirm-fab"
          aria-label="Confirm"
        >
          {confirmed ? '✓' : 'Confirm'}
        </button>

        <Modal open={modal.open} onClose={() => setModal({ open: false, content: null })}>
          {modal.content}
        </Modal>
      </div>
      {/* Pop-up centrale rouge/noir pour quitter */}
      {showLeaveModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.7)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowLeaveModal(false)}
        >
          <div
            style={{
              background: '#181818',
              border: '3px solid #FF2D2D',
              color: '#FF2D2D',
              padding: 40,
              borderRadius: 20,
              minWidth: 340,
              maxWidth: '90vw',
              boxShadow: '0 0 32px #FF2D2D55',
              textAlign: 'center',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontWeight: 700, fontSize: 28, color: '#FF2D2D', marginBottom: 8 }}>Back to home ?</div>
            <div style={{ color: '#FF2D2D', background: '#000', border: '2px solid #FF2D2D', borderRadius: 12, padding: 18, fontSize: 18, fontWeight: 500, marginBottom: 12 }}>
              You're about to leave this campaign creation process.<br/>Your current progress won't be saved
            </div>
            <button
              onClick={() => router.push('/welcome')}
              style={{
                background: '#FF2D2D',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '14px 32px',
                fontWeight: 700,
                fontSize: 18,
                cursor: 'pointer',
                marginTop: 8,
                boxShadow: '0 2px 12px #FF2D2D55',
                transition: 'background 0.2s',
              }}
            >
              Confirm & leave
            </button>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
} 