"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from '@/components/ProtectedRoute';

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
  const [recap, setRecap] = useState<any>({});
  const [modal, setModal] = useState<{ open: boolean, content: React.ReactNode }>({ open: false, content: null });
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const readLocalStorage = () => {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const company = JSON.parse(localStorage.getItem("company") || "null");
      const story = JSON.parse(localStorage.getItem("story") || "null");
      const film = JSON.parse(localStorage.getItem("film") || "null");
      const standardToken = JSON.parse(localStorage.getItem("standardTokenReward") || "null");
      const standardItem = JSON.parse(localStorage.getItem("standardItemReward") || "null");
      const premiumToken = JSON.parse(localStorage.getItem("premiumTokenReward") || "null");
      const premiumItem = JSON.parse(localStorage.getItem("premiumItemReward") || "null");
      const roiData = JSON.parse(localStorage.getItem("roiData") || "null");
      setRecap({ user, company, story, film, standardToken, standardItem, premiumToken, premiumItem, roiData });
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

  // Pour la maquette, fallback si pas de données
  const email = recap.user?.email || '';
  const companyName = recap.company?.name || '';
  const title = recap.story?.title || "@startingtitle";
  const startingStory = recap.story?.startingStory || "@startingstory";
  const guideline = recap.story?.guideline || "@guideline";
  const filmLabel = recap.film?.aiRequested
    ? "The video will be delivered within 24h after payment."
    : recap.film?.url
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

  const handleConfirm = () => {
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
      content: isFilm && recap.film?.url ? (
        <video src={recap.film.url} controls style={{ width: '100%', borderRadius: 12 }} />
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
      <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
              <button disabled style={{ flex: 1, border: "2px solid #FFD600", borderRadius: 12, padding: 12, color: "#FFD600", fontStyle: "italic", fontSize: 16, background: 'none', fontWeight: 700, marginLeft: 8, opacity: 0.7 }}>{filmLabel}</button>
            ) : recap.film?.url ? (
              <button onClick={() => openModal('Your film', filmLabel, true)} style={{ flex: 1, border: "2px solid #FFD600", borderRadius: 12, padding: 12, color: "#FFD600", fontStyle: "italic", fontSize: 16, background: 'none', cursor: 'pointer', fontWeight: 700, marginLeft: 8 }}>{filmLabel}</button>
            ) : (
              <button onClick={() => openModal('Your film', filmLabel)} style={{ flex: 1, border: "2px solid #FFD600", borderRadius: 12, padding: 12, color: "#FFD600", fontStyle: "italic", fontSize: 16, background: 'none', cursor: 'pointer', fontWeight: 700, marginLeft: 8 }}>{filmLabel}</button>
            )}
          </div>
        </div>
        {/* Bloc rewards */}
        <div style={{ border: "2px solid #fff", borderRadius: 24, padding: 24, marginBottom: 40, textAlign: 'center', fontWeight: 600, fontSize: 18, maxWidth: 420, width: '100%', marginLeft: 'auto', marginRight: 'auto', background: '#181818' }}>
          <div style={{ fontWeight: 700, fontSize: 22, color: '#FFD600', marginBottom: 12 }}>Rewards Recap</div>
          {(!recap.standardToken && !recap.standardItem && !recap.premiumToken && !recap.premiumItem) ? (
            <div style={{ color: '#fff', fontWeight: 400, fontSize: 16 }}>
              No Reward to give? No Problem, free completions +$1000
            </div>
          ) : (
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
            </div>
          )}
        </div>
        {/* Bloc Community & R.O.I. */}
        {recap.roiData && (
          <div style={{ border: "2px solid #fff", borderRadius: 24, padding: 24, marginBottom: 40, textAlign: 'center', fontWeight: 600, fontSize: 18, maxWidth: 420, width: '100%', marginLeft: 'auto', marginRight: 'auto', background: '#181818' }}>
            <div style={{ fontWeight: 700, fontSize: 22, color: '#FFD600', marginBottom: 12 }}>Community & R.O.I.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
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
              {recap.roiData.noReward && (
                <div style={{ background: 'rgba(255,215,0,0.1)', borderRadius: 8, padding: 12, marginTop: 8 }}>
                  <span style={{ color: '#FFD600', fontWeight: 600, fontSize: 14 }}>✓ No rewards - Free completions +$1000</span>
                </div>
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
    </ProtectedRoute>
  );
} 