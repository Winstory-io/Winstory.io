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

declare global {
  interface Window {
    __completionVideo?: File | null;
  }
}

export default function RecapCompletion() {
  const router = useRouter();
  const [recap, setRecap] = useState<any>({});
  const [modal, setModal] = useState<{ open: boolean, content: React.ReactNode }>({ open: false, content: null });
  const [confirmed, setConfirmed] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [completionType, setCompletionType] = useState<'b2c' | 'individual' | null>(null);

  useEffect(() => {
    const readLocalStorage = () => {
      const completionText = localStorage.getItem("completionText");
      // Récupère la vidéo depuis window.__completionVideo
      let completionFilm = null;
      if (typeof window !== 'undefined' && window.__completionVideo) {
        completionFilm = URL.createObjectURL(window.__completionVideo);
      }
      const type = localStorage.getItem("completionType") as 'b2c' | 'individual';
      setCompletionType(type);
      const standardToken = JSON.parse(localStorage.getItem("standardTokenReward") || "null");
      const standardItem = JSON.parse(localStorage.getItem("standardItemReward") || "null");
      const premiumToken = JSON.parse(localStorage.getItem("premiumTokenReward") || "null");
      const premiumItem = JSON.parse(localStorage.getItem("premiumItemReward") || "null");
      const mintPrice = localStorage.getItem("completionMintPrice") || "Free";
      setRecap({
        completionText,
        completionFilm,
        standardToken,
        standardItem,
        premiumToken,
        premiumItem,
        mintPrice
      });
    };
    readLocalStorage();
  }, []);

  const handleMint = () => {
    setConfirmed(true);
    setTimeout(() => {
      // Logic for MINT button will be refined later
      // For now, it can redirect to a placeholder page or show a modal
      console.log("Redirecting to minting process...");
      // router.push("/completion/mint"); // Example redirect
    }, 1000);
  };

  const openModal = (label: string, value: string | undefined, isFilm?: boolean) => {
    setModal({
      open: true,
      content: isFilm && recap.completionFilm ? (
        <video
          src={recap.completionFilm}
          controls
          style={{ width: '100%', borderRadius: 8, background: '#000', maxHeight: 320 }}
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <div style={{ color: '#FFD600', fontSize: 16, whiteSpace: 'pre-line' }}>
          <b>{label}</b>
          <div style={{ marginTop: 10, color: '#fff', fontWeight: 400, lineHeight: 1.4 }}>{value}</div>
        </div>
      )
    });
  };

  return (
    <ProtectedRoute>
      <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 480, height: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: 'center', margin: 0, width: '100%' }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, textAlign: 'center' }}>Completion Recap</h1>
          </div>
          {/* Encarts principaux avec espacement constant */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1, justifyContent: 'center' }}>
            {/* Completion Film */}
            <div style={{ border: "2px solid #fff", borderRadius: 12, padding: 10, maxWidth: '100%' }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>Completion Film</span>
              <button onClick={() => openModal('Completion Film', recap.completionFilm, true)} style={{ marginTop: 12, display: 'flex', alignItems: 'center', border: "2px solid #FFD600", borderRadius: 8, padding: 8, color: "#FFD600", fontStyle: "italic", fontSize: 14, background: 'none', cursor: 'pointer', fontWeight: 700, marginLeft: 6, width: '100%', textAlign: 'left' }}>
                {recap.completionFilm ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}><path d="M4 4H20V20H4V4Z" stroke="#FFD600" strokeWidth="2"/><path d="M9 9L15 12L9 15V9Z" fill="#FFD600"/></svg>
                    View your film
                  </>
                ) : "No film uploaded"}
              </button>
            </div>
            {/* Completion Text */}
            <div style={{ border: "2px solid #fff", borderRadius: 12, padding: 10, maxWidth: '100%' }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>Completion Text</span>
              <button onClick={() => openModal('Completion Text', recap.completionText)} style={{ marginTop: 12, border: "2px solid #FFD600", borderRadius: 8, padding: 8, color: "#FFD600", fontStyle: "italic", fontSize: 14, background: 'none', cursor: 'pointer', fontWeight: 700, marginLeft: 6, width: '100%', textAlign: 'left' }}>
                {recap.completionText ? (recap.completionText.length > 120 ? 'Click to access the full text' : recap.completionText) : "No text submitted"}
              </button>
            </div>
            {/* Rewards Section */}
            {completionType === 'b2c' && (
              <div style={{ border: "2px solid #fff", borderRadius: 12, padding: 10, textAlign: 'center', fontWeight: 600, fontSize: 15, maxWidth: '100%', background: '#181818' }}>
                <div style={{ fontWeight: 700, fontSize: 17, color: '#FFD600', marginBottom: 8 }}>Rewards</div>
                {/* Standard Rewards */}
                {(recap.standardToken || recap.standardItem) && (
                  <div style={{ background: 'rgba(0,196,108,0.08)', borderRadius: 8, padding: 8, textAlign: 'left', marginBottom: 8 }}>
                    <div style={{ color: '#00C46C', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Standard Rewards</div>
                    {recap.standardToken && ( <div> ... </div>)}
                    {recap.standardItem && ( <div> ... </div>)}
                    <div style={{ color: '#00C46C', marginTop: 6, fontStyle: 'italic', fontWeight: 500, fontSize: 12 }}>
                      If the Moderators validate your content, you win the Standard reward.
                    </div>
                  </div>
                )}
                {/* Premium Rewards */}
                {(recap.premiumToken || recap.premiumItem) && (
                  <div style={{ background: 'rgba(255,215,0,0.08)', borderRadius: 8, padding: 8, textAlign: 'left' }}>
                    <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Premium Rewards</div>
                    {recap.premiumToken && ( <div> ... </div>)}
                    {recap.premiumItem && ( <div> ... </div>)}
                    <div style={{ color: '#FFD600', marginTop: 6, fontStyle: 'italic', fontWeight: 500, fontSize: 12 }}>
                      If they validate your content and score you one of the 3 best average scores, you also win the Premium reward.
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Completion MINT */}
            <div style={{ border: "2px solid #fff", borderRadius: 12, padding: 10, maxWidth: '100%' }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>Completion MINT</span>
              <div style={{ border: "2px solid #FFD600", borderRadius: 8, padding: '4px 8px', color: "#FFD600", fontStyle: "italic", fontSize: 13, background: 'none', fontWeight: 700, marginLeft: 6, maxWidth: 120, display: 'inline-block', textAlign: 'left', marginTop: 6 }}>
                Price: {recap.mintPrice}
              </div>
            </div>
          </div>
          <Modal open={modal.open} onClose={() => setModal({ open: false, content: null })}>
            {modal.content}
          </Modal>
          <button
            onClick={handleMint}
            style={{
              position: 'fixed',
              right: 24,
              bottom: 24,
              zIndex: 1100,
              background: confirmed ? '#18C964' : '#FFD600',
              border: 'none',
              color: confirmed? '#fff' : '#000',
              borderRadius: '50%',
              fontSize: confirmed ? 32 : 20,
              fontWeight: 700,
              width: 88,
              height: 88,
              boxShadow: '0 4px 32px rgba(255, 214, 0, 0.35)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {confirmed ? '✓' : 'MINT'}
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
} 