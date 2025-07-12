"use client";
import React from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const PINATA_API_KEY = "e84206f813ab133b6e93";
const PINATA_API_SECRET = "791d5cafd5fd4cb46f2b007de83936eef6cd5a65b73d8e828938d6a5a9151d94";

export default function MintHackathonPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");
  const [cid, setCid] = React.useState("");
  const [videoCid, setVideoCid] = React.useState("");
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
    setVideoCid("");
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
      if (!film || !film.url) throw new Error("No video found in /yourfilm");
      
      // Convertir l'URL blob en fichier
      const response = await fetch(film.url);
      const videoBlob = await response.blob();
      const videoFile = new File([videoBlob], "video.mp4", { type: "video/mp4" });
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
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_API_SECRET,
          },
        }
      );
      const videoCID = videoRes.data.IpfsHash;
      setVideoCid(videoCID);
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
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_API_SECRET,
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
    if (videoCid) navigator.clipboard.writeText(`https://gateway.pinata.cloud/ipfs/${videoCid}`);
  };

  const handleShare = () => {
    if (videoCid && navigator.share) {
      navigator.share({
        title: "IPFS Campaign Video",
        url: `https://gateway.pinata.cloud/ipfs/${videoCid}`,
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
            <span style={{ fontSize: 22 }}>��</span> Google Pay
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
      {success && videoCid && (
        <div style={{ marginTop: 24, background: '#181818', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid #FF2D85' }}>
          <div style={{ color: '#FF2D85', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Campaign successfully minted on IPFS!</div>
          <div style={{ color: '#FFD600', fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Your winstory is now decentralized!</div>
          <div style={{ color: '#888', fontSize: 14, marginBottom: 16 }}>Your campaign is now pending moderator validation.</div>
          <a href={`https://gateway.pinata.cloud/ipfs/${videoCid}`} target="_blank" rel="noopener noreferrer" style={{ color: '#FFD600', wordBreak: 'break-all', fontSize: 16 }}>{`https://gateway.pinata.cloud/ipfs/${videoCid}`}</a>
          <div style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={handleCopy} style={{ background: '#FF2D85', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>Copy Link</button>
            <button onClick={handleShare} style={{ background: '#FFD600', color: '#000', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>Share</button>
          </div>
          {cid && (
            <div style={{ marginTop: 16, color: '#888', fontSize: 12 }}>
              Metadata JSON: <a href={`https://gateway.pinata.cloud/ipfs/${cid}`} target="_blank" rel="noopener noreferrer" style={{ color: '#FF2D85' }}>{cid}</a>
            </div>
          )}
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