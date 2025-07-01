"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RecapB2C() {
  const router = useRouter();
  const [recap, setRecap] = useState<any>({});

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
    // À remplacer par la navigation vers la page de paiement
    alert("Paiement à venir !");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
        <span style={{ fontSize: 48, marginRight: 16 }}>💼</span>
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0 }}>Recap</h1>
        <span style={{ fontSize: 40, marginLeft: 16 }}>💡</span>
      </div>
      {/* Bloc utilisateur/entreprise */}
      <div style={{ border: "2px solid #fff", borderRadius: 24, padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: 22, width: 160 }}>You</span>
            <div style={{ flex: 1, border: "2px solid #FFD600", borderRadius: 12, padding: 12, color: "#FFD600", fontStyle: "italic", fontSize: 18 }}>{email}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: 22, width: 160 }}>Your Company</span>
            <div style={{ flex: 1, border: "2px solid #FFD600", borderRadius: 12, padding: 12, color: "#FFD600", fontStyle: "italic", fontSize: 18 }}>{companyName}</div>
          </div>
        </div>
      </div>
      {/* Bloc story */}
      <div style={{ border: "2px solid #fff", borderRadius: 24, padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <span style={{ fontWeight: 600, fontSize: 22 }}>Title</span>
            <div style={{ border: "2px solid #FFD600", borderRadius: 12, padding: 12, color: "#FFD600", fontStyle: "italic", fontSize: 18 }}>{title}</div>
          </div>
          <div>
            <span style={{ fontWeight: 600, fontSize: 22 }}>Starting Story</span>
            <div style={{ border: "2px solid #FFD600", borderRadius: 12, padding: 12, color: "#FFD600", fontStyle: "italic", fontSize: 18 }}>{startingStory}</div>
          </div>
          <div>
            <span style={{ fontWeight: 600, fontSize: 22 }}>Guideline</span>
            <div style={{ border: "2px solid #FFD600", borderRadius: 12, padding: 12, color: "#FFD600", fontStyle: "italic", fontSize: 18 }}>{guideline}</div>
          </div>
        </div>
      </div>
      {/* Bloc film */}
      <div style={{ border: "2px solid #fff", borderRadius: 24, padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontWeight: 600, fontSize: 22, width: 160 }}>Film</span>
          <div style={{ flex: 1, border: "2px solid #FFD600", borderRadius: 12, padding: 12, color: "#FFD600", fontStyle: "italic", fontSize: 18 }}>
            {recap.film?.aiRequested ? (
              <span>{filmLabel}</span>
            ) : recap.film?.url ? (
              <button style={{ color: '#FFD600', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontSize: 18 }} onClick={() => window.open(recap.film.url, '_blank')}>View your film</button>
            ) : (
              <span>{filmLabel}</span>
            )}
          </div>
        </div>
      </div>
      {/* Bloc rewards */}
      <div style={{ border: "2px solid #fff", borderRadius: 24, padding: 24, marginBottom: 24, textAlign: 'center', fontWeight: 600, fontSize: 22 }}>
        {rewardLabel}
      </div>
      {/* Bouton Confirm */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
        <button
          onClick={handleConfirm}
          style={{
            background: 'none',
            border: '2px solid #18C964',
            color: '#18C964',
            borderRadius: 32,
            fontSize: 28,
            fontWeight: 700,
            padding: '18px 64px',
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s',
            marginTop: 16,
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
} 