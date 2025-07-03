"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Modal = ({ open, onClose, children }: { open: boolean, onClose: () => void, children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#181818', color: '#FFD600', padding: 32, borderRadius: 18, minWidth: 320, maxWidth: 420, maxHeight: '80vh', overflowY: 'auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
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
    // Récupération des données stockées (à adapter selon la structure réelle)
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const company = JSON.parse(localStorage.getItem("company") || "null");
    const story = JSON.parse(localStorage.getItem("story") || "null");
    const film = JSON.parse(localStorage.getItem("film") || "null");
    const reward = JSON.parse(localStorage.getItem("campaignReward") || "null");
    setRecap({ user, company, story, film, reward });
  }, []);

  // Pour la maquette, fallback si pas de données
  const email = recap.user?.email || "@adressmaillogged";
  const companyName = recap.company?.name || "@companyname";
  const title = recap.story?.title || "@startingtitle";
  const startingStory = recap.story?.startingStory || "@startingstory";
  const guideline = recap.story?.guideline || "@guideline";
  const filmLabel = recap.film?.aiRequested
    ? "The video will be delivered within 24h after payment."
    : recap.film?.url
    ? "View your film"
    : "@yourfilm";
  const rewardLabel = recap.reward?.rewardLabel || "No Rewards";

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
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
          <div style={{ marginTop: 16, color: '#fff', fontWeight: 400 }}>{value}</div>
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
            Ici s'affichera l'aide contextuelle pour la page Recap.<br/>À personnaliser ultérieurement.
          </div>
        </div>
      )
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Titre centré avec ampoule cliquable */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: 'center', marginBottom: 32, width: '100%' }}>
        <span style={{ fontSize: 48, marginRight: 16 }}>💼</span>
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, textAlign: 'center' }}>Recap</h1>
        <button onClick={openHelpModal} style={{ background: 'none', border: 'none', marginLeft: 16, cursor: 'pointer', fontSize: 40, color: '#FFD600', padding: 0, lineHeight: 1 }}>💡</button>
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
      <div style={{ border: "2px solid #fff", borderRadius: 24, padding: 24, marginBottom: 40, textAlign: 'center', fontWeight: 600, fontSize: 18, maxWidth: 420, width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
        {rewardLabel}
      </div>
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
          width:  confirmed ? 88 : 88,
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
      {/* Responsive style pour mobile : cercle plus petit mais toujours rond */}
      <style>{`
        @media (max-width: 600px) {
          .confirm-fab {
            right: 10px !important;
            bottom: 10px !important;
            width: 64px !important;
            height: 64px !important;
            font-size: ${'${confirmed ? 24 : 14}'}px !important;
          }
        }
      `}</style>
      <Modal open={modal.open} onClose={() => setModal({ open: false, content: null })}>
        {modal.content}
      </Modal>
    </div>
  );
} 