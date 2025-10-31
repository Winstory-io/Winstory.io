"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from '@/components/ProtectedRoute';
import { getVideoFromIndexedDB } from '@/lib/videoStorage';
import { getUnifiedRewardConfig, validateRewardConfig } from '@/lib/rewards-manager';
import { useActiveAccount } from "thirdweb/react";

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

export default function RecapB2C() {
  const router = useRouter();
  const account = useActiveAccount();
  const [recap, setRecap] = useState<any>({});
  const [modal, setModal] = useState<{ open: boolean, content: React.ReactNode }>({ open: false, content: null });
  const [confirmed, setConfirmed] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletSource, setWalletSource] = useState<string | null>(null);

  useEffect(() => {
    const readLocalStorage = () => {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const company = JSON.parse(localStorage.getItem("company") || "null");
      const story = JSON.parse(localStorage.getItem("story") || "null");
      const film = JSON.parse(localStorage.getItem("film") || "null");
      console.log("B2C Film data loaded:", {
        hasUrl: !!film?.url,
        hasVideoId: !!film?.videoId,
        urlType: film?.url ? (film.url.startsWith('data:') ? 'base64' : 'blob') : 'none',
        urlLength: film?.url?.length || 0,
        fileName: film?.fileName
      });
      
      // Charger la vidéo depuis IndexedDB si on a un videoId
      if (film?.videoId) {
        setVideoLoading(true);
        getVideoFromIndexedDB(film.videoId).then(videoFile => {
          if (videoFile) {
            const url = URL.createObjectURL(videoFile);
            setVideoUrl(url);
            console.log('B2C Video loaded from IndexedDB:', url);
          } else {
            console.warn('B2C Video not found in IndexedDB for ID:', film?.videoId);
          }
        }).catch(error => {
          console.error('Failed to load B2C video from IndexedDB:', error);
        }).finally(() => {
          setVideoLoading(false);
        });
      }
      
      // Charger les configurations de récompenses
      const standardToken = JSON.parse(localStorage.getItem("standardTokenReward") || "null");
      const standardItem = JSON.parse(localStorage.getItem("standardItemReward") || "null");
      const premiumToken = JSON.parse(localStorage.getItem("premiumTokenReward") || "null");
      const premiumItem = JSON.parse(localStorage.getItem("premiumItemReward") || "null");
      const roiData = JSON.parse(localStorage.getItem("roiData") || "null");
      const lsWallet = localStorage.getItem("walletAddress");
      
      // Charger la configuration unifiée
      const unifiedConfig = getUnifiedRewardConfig();
      
      setRecap({ 
        user, 
        company, 
        story, 
        film, 
        standardToken, 
        standardItem, 
        premiumToken, 
        premiumItem, 
        roiData,
        unifiedConfig 
      });

      // Déterminer l'adresse wallet (priorités: thirdweb > localStorage > rewards configs)
      const rewardWallet = standardToken?.walletAddress || premiumToken?.walletAddress || standardItem?.walletAddress || premiumItem?.walletAddress || null;
      if (account?.address) {
        setWalletAddress(account.address);
        setWalletSource('thirdweb_account');
      } else if (lsWallet) {
        setWalletAddress(lsWallet);
        setWalletSource('localStorage.walletAddress');
      } else if (rewardWallet) {
        setWalletAddress(rewardWallet);
        setWalletSource('reward_config.walletAddress');
      } else {
        setWalletAddress(null);
        setWalletSource(null);
      }
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
  const email = recap.user?.email || '';
  const companyName = recap.company?.name || '';
  const title = recap.story?.title || "@startingtitle";
  const startingStory = recap.story?.startingStory || "@startingstory";
  const guideline = recap.story?.guideline || "@guideline";
  const filmLabel = recap.film?.aiRequested
    ? "The video will be delivered within 24h after payment."
    : (videoUrl || recap.film?.url)
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
    console.log('=== CREATE CAMPAIGN - FINAL RECAP ===');
    console.log('--- User Information ---');
    console.log('Email:', recap.user?.email);
    console.log('Company Name:', recap.company?.name);
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
    console.log('==========================================');
    console.log('Proceeding to MINT page...');
    console.log('==========================================');
    
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
          campaignType: 'B2C',
          walletAddress: account?.address || walletAddress || null,
          walletSource: account?.address ? 'thirdweb_account' : (walletSource || null)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign in database');
      }

      const result = await response.json();
      console.log('✅ B2C campaign created successfully:', result.campaignId);
      
      // Stocker l'ID de la campagne pour utilisation ultérieure
      localStorage.setItem('currentCampaignId', result.campaignId);
      
    } catch (error) {
      console.error('Failed to create B2C campaign:', error);
      // Continuer même si la création échoue pour l'instant
    }
    
    setConfirmed(true);
    setTimeout(() => {
      // TODO: Le MINT de la campagne permet de déployer sur IPFS (à améliorer ultérieurement)
      router.push("/creation/b2c/mint");
    }, 1000); // 1 seconde pour laisser voir l'animation de la coche
  };

  // Gestion modals pour chaque champ
  const openModal = (label: string, value: string | undefined, isFilm?: boolean) => {
    setModal({
      open: true,
      content: isFilm && (videoUrl || recap.film?.url) ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <video 
            src={videoUrl || recap.film.url} 
            controls 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '70vh', 
              borderRadius: 12,
              objectFit: 'contain'
            }} 
          />
        </div>
      ) : (
        <div style={{ color: '#FFD600', fontSize: 18, whiteSpace: 'pre-line' }}>
          <b>{label}</b>
          <div style={{ marginTop: 16, color: '#fff', fontWeight: 400, lineHeight: 1.6 }}>{value}</div>
        </div>
      )
    });
  };

  // Modal d'aide (ampoule)
  const openHelpModal = () => {
    setModal({
      open: true,
      content: (
        <div style={{ color: '#FFD600', fontSize: 18 }}>
          <b>Recap Help</b>
          <div style={{ marginTop: 16, color: '#fff', fontWeight: 400 }}>
            Ici s'affichera l'aide contextuelle pour la page Recap.<br />À personnaliser ultérieurement.
          </div>
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
      <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: showLeaveModal ? 0.3 : 1, transition: 'opacity 0.2s' }}>
        {/* Titre centré avec ampoule cliquable */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: 'center', marginBottom: 32, width: '100%' }}>
          <img src="/company.svg" alt="Company" style={{ width: 96, height: 96, marginRight: 16 }} />
          <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, textAlign: 'center' }}>Recap</h1>
          <button onClick={openHelpModal} style={{ background: 'none', border: 'none', marginLeft: 16, cursor: 'pointer', padding: 0, lineHeight: 1 }} aria-label="Aide">
            <img src="/tooltip.svg" alt="Aide" style={{ width: 40, height: 40 }} />
          </button>
        </div>
        {/* Bloc utilisateur/entreprise */}
        <div style={{ border: "2px solid #fff", borderRadius: 24, padding: 24, marginBottom: 40, maxWidth: 420, width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: 18, width: 120 }}>You</span>
              <button onClick={() => openModal('Your email', email)} style={{ flex: 1, border: "2px solid #FFD600", borderRadius: 12, padding: 12, color: "#FFD600", fontStyle: "italic", fontSize: 16, background: 'none', cursor: 'pointer', fontWeight: 700, marginLeft: 8 }}>{email}</button>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: 18, width: 120 }}>Your Company</span>
              <button onClick={() => openModal('Your company', companyName)} style={{ flex: 1, border: "2px solid #FFD600", borderRadius: 12, padding: 12, color: "#FFD600", fontStyle: "italic", fontSize: 16, background: 'none', cursor: 'pointer', fontWeight: 700, marginLeft: 8 }}>{companyName}</button>
            </div>
          </div>
        </div>
        {/* Bloc story */}
        <div style={{ border: "2px solid #fff", borderRadius: 24, padding: 24, marginBottom: 40, maxWidth: 420, width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: 18 }}>Title</span>
              <button onClick={() => openModal('Title', title)} style={{ border: "2px solid #FFD600", borderRadius: 12, padding: 12, color: "#FFD600", fontStyle: "italic", fontSize: 16, background: 'none', cursor: 'pointer', fontWeight: 700, marginLeft: 8, width: '100%', textAlign: 'left' }}>{title}</button>
            </div>
            <div>
              <span style={{ fontWeight: 600, fontSize: 18 }}>Starting Story</span>
              <button onClick={() => openModal('Starting Story', startingStory)} style={{ border: "2px solid #FFD600", borderRadius: 12, padding: 12, color: "#FFD600", fontStyle: "italic", fontSize: 16, background: 'none', cursor: 'pointer', fontWeight: 700, marginLeft: 8, width: '100%', textAlign: 'left' }}>{startingStory}</button>
            </div>
            <div>
              <span style={{ fontWeight: 600, fontSize: 18 }}>Guideline</span>
              <button onClick={() => openModal('Guideline', guideline)} style={{ border: "2px solid #FFD600", borderRadius: 12, padding: 12, color: "#FFD600", fontStyle: "italic", fontSize: 16, background: 'none', cursor: 'pointer', fontWeight: 700, marginLeft: 8, width: '100%', textAlign: 'left' }}>{guideline}</button>
            </div>
          </div>
        </div>
        {/* Bloc film */}
        <div style={{ border: "2px solid #fff", borderRadius: 24, padding: 24, marginBottom: 40, maxWidth: 420, width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: 18, width: 120 }}>Film</span>
            {recap.film?.aiRequested ? (
              <div style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid #FFD600', borderRadius: 8, padding: 12, marginLeft: 8, color: '#FFD600', fontWeight: 600, fontSize: 15, textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Winstory creates the Film. Delivered within 24h after payment. +$500
              </div>
            ) : videoLoading ? (
              <div style={{ flex: 1, border: "2px solid #FFD600", borderRadius: 12, padding: 12, color: "#FFD600", fontStyle: "italic", fontSize: 16, background: 'none', fontWeight: 700, marginLeft: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Loading video...
              </div>
            ) : (videoUrl || recap.film?.url) ? (
              <button onClick={() => openModal('Your film', filmLabel, true)} style={{ flex: 1, border: "2px solid #FFD600", borderRadius: 12, padding: 12, color: "#FFD600", fontStyle: "italic", fontSize: 16, background: 'none', cursor: 'pointer', fontWeight: 700, marginLeft: 8 }}>{filmLabel}</button>
            ) : (
              <button onClick={() => openModal('Your film', filmLabel)} style={{ flex: 1, border: "2px solid #FFD600", borderRadius: 12, padding: 12, color: "#FFD600", fontStyle: "italic", fontSize: 16, background: 'none', cursor: 'pointer', fontWeight: 700, marginLeft: 8 }}>{filmLabel}</button>
            )}
          </div>
        </div>
        {/* Bloc rewards */}
        <div style={{ border: "2px solid #fff", borderRadius: 24, padding: 24, marginBottom: 40, textAlign: 'center', fontWeight: 600, fontSize: 18, maxWidth: 420, width: '100%', marginLeft: 'auto', marginRight: 'auto', background: '#181818' }}>
          <div style={{ fontWeight: 700, fontSize: 22, color: '#FFD600', marginBottom: 12 }}>Rewards</div>
          {recap.roiData?.noReward && (
            <div style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid #FFD600', borderRadius: 8, padding: 12, marginBottom: 0, color: '#FFD600', fontWeight: 600, fontSize: 15, textAlign: 'center', display: 'inline-block' }}>
              ✓ No rewards - Free completions +$1000
            </div>
          )}
          {(!recap.standardToken && !recap.standardItem && !recap.premiumToken && !recap.premiumItem) ? null : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Standard Rewards */}
              {(recap.standardToken || recap.standardItem) && (
                <div style={{ background: 'rgba(0,196,108,0.08)', borderRadius: 12, padding: 14, textAlign: 'left' }}>
                  <div style={{ color: '#00C46C', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Standard Rewards</div>
                  {recap.standardToken && (
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>Token:</span> {recap.standardToken.name} ({recap.standardToken.amountPerUser} per user)
                      <br /><span style={{ fontSize: 13, color: '#FFD600' }}>Contract:</span> <span style={{ fontSize: 13 }}>{recap.standardToken.contractAddress}</span>
                    </div>
                  )}
                  {recap.standardItem && (
                    <div>
                      <span style={{ fontWeight: 600 }}>Item:</span> {recap.standardItem.name} ({recap.standardItem.amountPerUser} per user)
                      <br /><span style={{ fontSize: 13, color: '#FFD600' }}>Contract:</span> <span style={{ fontSize: 13 }}>{recap.standardItem.contractAddress}</span>
                    </div>
                  )}
                </div>
              )}
              {/* Premium Rewards */}
              {(recap.premiumToken || recap.premiumItem) && (
                <div style={{ background: 'rgba(255,215,0,0.08)', borderRadius: 12, padding: 14, textAlign: 'left' }}>
                  <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Premium Rewards</div>
                  {recap.premiumToken && (
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ fontWeight: 600 }}>Token:</span> {recap.premiumToken.name} ({recap.premiumToken.amountPerUser} per winner)
                      <br /><span style={{ fontSize: 13, color: '#00C46C' }}>Contract:</span> <span style={{ fontSize: 13 }}>{recap.premiumToken.contractAddress}</span>
                    </div>
                  )}
                  {recap.premiumItem && (
                    <div>
                      <span style={{ fontWeight: 600 }}>Item:</span> {recap.premiumItem.name} ({recap.premiumItem.amountPerUser} per winner)
                      <br /><span style={{ fontSize: 13, color: '#00C46C' }}>Contract:</span> <span style={{ fontSize: 13 }}>{recap.premiumItem.contractAddress}</span>
                    </div>
                  )}
                </div>
              )}
              {/* Information sur le nombre total de récompenses à distribuer */}
              {(rewardTotals.totalStandard > 0 || rewardTotals.totalPremium > 0) && (
                <div style={{ background: 'rgba(255,215,0,0.15)', borderRadius: 12, padding: 14, textAlign: 'center', border: '1px solid #FFD600' }}>
                  <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Auto-Distribution to Completers by Winstory</div>
                  <div style={{ color: '#fff', fontSize: 14, lineHeight: 1.4 }}>
                    {rewardTotals.totalStandard > 0 && (
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ color: '#00C46C', fontWeight: 600 }}>Standard:</span> {rewardTotals.totalStandard.toFixed(5)}
                      </div>
                    )}
                    {rewardTotals.totalPremium > 0 && (
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ color: '#FFD600', fontWeight: 600 }}>Premium:</span> {rewardTotals.totalPremium.toFixed(5)}
                      </div>
                    )}
                    <div style={{ color: '#FF2D2D', fontStyle: 'italic', fontSize: 12, marginTop: 8, borderTop: '1px solid #FFD600', paddingTop: 8 }}>
                      Your logged-in account must have all the rewards
                    </div>
                  </div>
                </div>
              )}
              
              {/* Information sur les blockchains utilisées */}
              {recap.unifiedConfig && (
                <div style={{ background: 'rgba(0,196,108,0.15)', borderRadius: 12, padding: 14, textAlign: 'center', border: '1px solid #00C46C', marginTop: 12 }}>
                  <div style={{ color: '#00C46C', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Multi-Blockchain Distribution</div>
                  <div style={{ color: '#fff', fontSize: 14, lineHeight: 1.4 }}>
                    {recap.unifiedConfig.standard && (
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ color: '#00C46C', fontWeight: 600 }}>Standard Rewards:</span> {recap.unifiedConfig.standard.blockchain}
                      </div>
                    )}
                    {recap.unifiedConfig.premium && (
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ color: '#FFD600', fontWeight: 600 }}>Premium Rewards:</span> {recap.unifiedConfig.premium.blockchain}
                      </div>
                    )}
                    <div style={{ color: '#00C46C', fontStyle: 'italic', fontSize: 12, marginTop: 8, borderTop: '1px solid #00C46C', paddingTop: 8 }}>
                      Winstory will automatically distribute rewards on each blockchain
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Bloc Community & R.O.I. */}
        {recap.roiData && !recap.roiData.noReward && (
          <div style={{ border: "2px solid #fff", borderRadius: 24, padding: 24, marginBottom: 40, textAlign: 'center', fontWeight: 600, fontSize: 18, maxWidth: 420, width: '100%', marginLeft: 'auto', marginRight: 'auto', background: '#181818' }}>
            <div style={{ fontWeight: 700, fontSize: 22, color: '#FFD600', marginBottom: 12 }}>
              {recap.roiData.isFreeReward ? 'Community' : 'Community & R.O.I.'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
              {recap.roiData.isFreeReward ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>Maximum Completions:</span>
                    <span style={{ color: '#18C964', fontWeight: 700, fontSize: 18 }}>{recap.roiData.maxCompletions || '0'}</span>
                  </div>
                  <div style={{ background: 'rgba(24,201,100,0.1)', borderRadius: 8, padding: 12, marginTop: 8 }}>
                    <span style={{ color: '#18C964', fontWeight: 600, fontSize: 14 }}>✓ Free rewards enabled for community</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>Unit Value of the Completion:</span>
                    <span style={{ color: '#18C964', fontWeight: 700, fontSize: 18 }}>${recap.roiData.unitValue?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>Net Profits targeted:</span>
                    <span style={{ color: '#18C964', fontWeight: 700, fontSize: 18 }}>${recap.roiData.netProfit?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>Maximum Completions:</span>
                    <span style={{ color: '#18C964', fontWeight: 700, fontSize: 18 }}>{recap.roiData.maxCompletions || '0'}</span>
                  </div>
                  {recap.roiData.isFreeReward && (
                    <div style={{ background: 'rgba(24,201,100,0.1)', borderRadius: 8, padding: 12, marginTop: 8 }}>
                      <span style={{ color: '#18C964', fontWeight: 600, fontSize: 14 }}>✓ Free rewards enabled for community</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        {/* Bouton Confirm flottant (bulle en bas à droite, toujours un cercle) */}
        <button
          onClick={handleConfirm}
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
            width: confirmed ? 88 : 88,
            height: 88,
            boxShadow: '0 4px 32px rgba(24,201,100,0.35)',
            cursor: 'pointer',
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
              You’re about to leave this campaign creation process.<br/>Your current progress won’t be saved
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