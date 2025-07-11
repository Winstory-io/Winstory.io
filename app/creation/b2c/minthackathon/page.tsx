"use client";
import React from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const PINATA_JWT = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4OTg1ZGQxMC03MTFkLTQ2MjktYTJlYy0yY2VlMzQ3OTYzZjUiLCJlbWFpbCI6InZyeEB3aW5zdG9yeS5pbyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJlODQyMDZmODEzYWIxMzNiNmU5MyIsInNjb3BlZEtleVNlY3JldCI6Ijc5MWQ1Y2FmZDVmZDRjYjQ2ZjJiMDA3ZGU4MzkzNmVlZjZjZDVhNjViNzNkOGU4Mjg5MzhkNmE1YTkxNTFkOTQiLCJleHAiOjE3ODM4MDAzMDV9.HV3-u7A_So6eILFIpX19bzwZ0lsr96DZ_h2FxwhF1WQ";

export default function MintHackathonPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");
  const [cid, setCid] = React.useState("");
  const [history, setHistory] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Charger l'historique local
    const h = JSON.parse(localStorage.getItem("ipfsHistory") || "[]");
    setHistory(h);
  }, []);

  const handleMint = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    setCid("");
    try {
      // 1. Récupérer les infos du recap
      const company = JSON.parse(localStorage.getItem("company") || "null");
      const story = JSON.parse(localStorage.getItem("story") || "null");
      const standardToken = JSON.parse(localStorage.getItem("standardTokenReward") || "null");
      const standardItem = JSON.parse(localStorage.getItem("standardItemReward") || "null");
      const premiumToken = JSON.parse(localStorage.getItem("premiumTokenReward") || "null");
      const premiumItem = JSON.parse(localStorage.getItem("premiumItemReward") || "null");
      // 2. Récupérer la vidéo (fichier stocké dans localStorage sous 'film')
      const film = JSON.parse(localStorage.getItem("film") || "null");
      if (!film || !film.file) throw new Error("No video found in /yourfilm");
      // Décoder le fichier base64
      const base64 = film.file.split(",")[1];
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const videoFile = new Blob([byteArray], { type: film.type || "video/mp4" });
      // 3. Uploader la vidéo sur Pinata
      const formData = new FormData();
      formData.append("file", videoFile, film.name || "video.mp4");
      const videoRes = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxContentLength: Infinity,
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${PINATA_JWT}`,
          },
        }
      );
      const videoCID = videoRes.data.IpfsHash;
      // 4. Construire le JSON à uploader
      const data = {
        companyName: company?.name || "",
        story: {
          title: story?.title || "",
          startingStory: story?.startingStory || "",
          guideline: story?.guideline || "",
        },
        rewards: {
          standardToken,
          standardItem,
          premiumToken,
          premiumItem,
        },
        email: "anonymous@demo.io",
        video: `ipfs://${videoCID}`,
      };
      // 5. Uploader le JSON sur Pinata
      const jsonRes = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${PINATA_JWT}`,
          },
        }
      );
      const jsonCID = jsonRes.data.IpfsHash;
      setCid(jsonCID);
      setSuccess(true);
      // 6. Historique local
      const newHistory = [jsonCID, ...history];
      setHistory(newHistory);
      localStorage.setItem("ipfsHistory", JSON.stringify(newHistory));
    } catch (e: any) {
      setError(e.message || "Error during IPFS mint");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (cid) navigator.clipboard.writeText(`https://gateway.pinata.cloud/ipfs/${cid}`);
  };

  const handleShare = () => {
    if (cid && navigator.share) {
      navigator.share({
        title: "IPFS Campaign",
        url: `https://gateway.pinata.cloud/ipfs/${cid}`,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: 'center', marginBottom: 32, width: '100%' }}>
        <span style={{ fontSize: 48, marginRight: 16 }}>💳</span>
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, textAlign: 'center' }}>MINT</h1>
      </div>
      {/* Payment box */}
      <div style={{ border: "2px solid #fff", borderRadius: 24, padding: 32, maxWidth: 420, width: '100%', background: '#181818', marginBottom: 40, boxShadow: '0 4px 32px rgba(24,201,100,0.10)' }}>
        <h2 style={{ color: '#FFD600', fontWeight: 700, fontSize: 24, marginBottom: 24, textAlign: 'center' }}>Choose your payment method</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Disabled payment buttons */}
          <button disabled style={{ background: 'none', border: '2px solid #fff', color: '#fff', opacity: 0.5, borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🪙</span> USDC (Polygon)
          </button>
          <button disabled style={{ background: 'none', border: '2px solid #fff', color: '#fff', opacity: 0.5, borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🪙</span> USDC (Base)
          </button>
          <button disabled style={{ background: 'none', border: '2px solid #fff', color: '#fff', opacity: 0.5, borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>💳</span> Visa / Mastercard
          </button>
          <button disabled style={{ background: 'none', border: '2px solid #fff', color: '#fff', opacity: 0.5, borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🌐</span> Stripe
          </button>
          <button disabled style={{ background: 'none', border: '2px solid #fff', color: '#fff', opacity: 0.5, borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🅿️</span> Paypal
          </button>
          <button disabled style={{ background: 'none', border: '2px solid #fff', color: '#fff', opacity: 0.5, borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🟩</span> Google Pay
          </button>
          <button disabled style={{ background: 'none', border: '2px solid #fff', color: '#fff', opacity: 0.5, borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🍏</span> Apple Pay
          </button>
          {/* Hackathon Chiliz FREE button */}
          <button
            style={{ background: 'none', border: '2px solid #FF2D85', color: '#FF2D85', borderRadius: 16, fontSize: 18, fontWeight: 700, padding: '16px 0', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: loading ? 0.5 : 1 }}
            onClick={handleMint}
            disabled={loading}
          >
            {loading ? 'Uploading to IPFS...' : 'Hackathon Chiliz FREE 🌶️'}
          </button>
        </div>
        <div style={{ marginTop: 32, color: '#888', fontSize: 14, textAlign: 'center' }}>
          Payments are secured and processed via our partners.<br/>You will receive your video within 24h after validation.
        </div>
      </div>
      {/* Résultat IPFS */}
      {success && cid && (
        <div style={{ marginTop: 24, background: '#181818', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid #FF2D85' }}>
          <div style={{ color: '#FF2D85', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Campaign successfully minted on IPFS!</div>
          <div style={{ color: '#FFD600', fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Your winstory is now decentralized!</div>
          <div style={{ color: '#888', fontSize: 14, marginBottom: 16 }}>Your campaign is now pending moderator validation.</div>
          <a href={`https://gateway.pinata.cloud/ipfs/${cid}`} target="_blank" rel="noopener noreferrer" style={{ color: '#FFD600', wordBreak: 'break-all', fontSize: 16 }}>{`https://gateway.pinata.cloud/ipfs/${cid}`}</a>
          <div style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={handleCopy} style={{ background: '#FF2D85', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>Copy Link</button>
            <button onClick={handleShare} style={{ background: '#FFD600', color: '#000', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>Share</button>
          </div>
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
      {/* Historique des CIDs */}
      {history.length > 0 && (
        <div style={{ marginTop: 32, width: '100%', maxWidth: 420 }}>
          <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Minted Campaigns (History)</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {history.map((h, i) => (
              <li key={h} style={{ marginBottom: 6 }}>
                <a href={`https://gateway.pinata.cloud/ipfs/${h}`} target="_blank" rel="noopener noreferrer" style={{ color: '#FF2D85', fontSize: 14 }}>{h}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Back */}
      <button onClick={() => router.back()} style={{ background: 'none', border: '2px solid #fff', color: '#fff', borderRadius: 32, fontSize: 18, fontWeight: 700, padding: '10px 32px', cursor: 'pointer', marginTop: 16 }}>Back</button>
    </div>
  );
} 