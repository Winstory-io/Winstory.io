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
      const completionFilm = localStorage.getItem("completionFilmUrl"); // Assuming the URL is stored
      const type = localStorage.getItem("completionType") as 'b2c' | 'individual';
      
      setCompletionType(type);

      // Mock data for rewards, similar to b2c recap
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
        <video src={recap.completionFilm} controls style={{ width: '100%', borderRadius: 12 }} />
      ) : (
        <div style={{ color: '#FFD600', fontSize: 18, whiteSpace: 'pre-line' }}>
          <b>{label}</b>
          <div style={{ marginTop: 16, color: '#fff', fontWeight: 400, lineHeight: 1.6 }}>{value}</div>
        </div>
      )
    });
  };

  return (
    <ProtectedRoute>
       <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: 'center', marginBottom: 32, width: '100%' }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, textAlign: 'center' }}>Completion Recap</h1>
        </div>

        {/* Completion Film */}
        <div style={{ border: "2px solid #fff", borderRadius: 24, padding: 24, marginBottom: 40, maxWidth: 420, width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
            <span style={{ fontWeight: 600, fontSize: 18 }}>Completion Film</span>
            <button onClick={() => openModal('Completion Film', recap.completionFilm, true)} style={{ flex: 1, border: "2px solid #FFD600", borderRadius: 12, padding: 12, color: "#FFD600", fontStyle: "italic", fontSize: 16, background: 'none', cursor: 'pointer', fontWeight: 700, marginLeft: 8, width: '100%', textAlign: 'left' }}>
                {recap.completionFilm ? "View your film" : "No film uploaded"}
            </button>
        </div>

        {/* Completion Text */}
        <div style={{ border: "2px solid #fff", borderRadius: 24, padding: 24, marginBottom: 40, maxWidth: 420, width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
            <span style={{ fontWeight: 600, fontSize: 18 }}>Completion Text</span>
            <button onClick={() => openModal('Completion Text', recap.completionText)} style={{ border: "2px solid #FFD600", borderRadius: 12, padding: 12, color: "#FFD600", fontStyle: "italic", fontSize: 16, background: 'none', cursor: 'pointer', fontWeight: 700, marginLeft: 8, width: '100%', textAlign: 'left' }}>
                {recap.completionText || "No text submitted"}
            </button>
        </div>

        {completionType === 'b2c' && (
          <>
            {/* Rewards Section */}
            <div style={{ border: "2px solid #fff", borderRadius: 24, padding: 24, marginBottom: 40, textAlign: 'center', fontWeight: 600, fontSize: 18, maxWidth: 420, width: '100%', marginLeft: 'auto', marginRight: 'auto', background: '#181818' }}>
              <div style={{ fontWeight: 700, fontSize: 22, color: '#FFD600', marginBottom: 12 }}>Rewards</div>
               {/* Standard Rewards */}
              {(recap.standardToken || recap.standardItem) && (
                <div style={{ background: 'rgba(0,196,108,0.08)', borderRadius: 12, padding: 14, textAlign: 'left', marginBottom: 18 }}>
                  <div style={{ color: '#00C46C', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Standard Rewards</div>
                  {recap.standardToken && ( <div> ... </div>)}
                  {recap.standardItem && ( <div> ... </div>)}
                </div>
              )}
              {/* Premium Rewards */}
              {(recap.premiumToken || recap.premiumItem) && (
                <div style={{ background: 'rgba(255,215,0,0.08)', borderRadius: 12, padding: 14, textAlign: 'left' }}>
                  <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Premium Rewards</div>
                   {recap.premiumToken && ( <div> ... </div>)}
                   {recap.premiumItem && ( <div> ... </div>)}
                </div>
              )}
               <p style={{marginTop: "20px", fontStyle: "italic"}}>
                    If the Moderators validate your content, you win the Standard reward.
                    <br/><br/>
                    If they validate your content and score you one of the 3 best average scores, you also win the Premium reward.
                </p>
            </div>
          </>
        )}

        {/* Completion MINT */}
        <div style={{ border: "2px solid #fff", borderRadius: 24, padding: 24, marginBottom: 40, maxWidth: 420, width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
            <span style={{ fontWeight: 600, fontSize: 18 }}>Completion MINT</span>
            <div style={{ border: "2px solid #FFD600", borderRadius: 12, padding: 12, color: "#FFD600", fontStyle: "italic", fontSize: 16, background: 'none', fontWeight: 700, marginLeft: 8, width: '100%', textAlign: 'left' }}>
                Price: {recap.mintPrice}
            </div>
        </div>

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

        <Modal open={modal.open} onClose={() => setModal({ open: false, content: null })}>
          {modal.content}
        </Modal>
      </div>
    </ProtectedRoute>
  );
} 