'use client';
import React, { useState, useRef, useEffect } from 'react';
import ModeratorHeader from '../../../components/ModeratorHeader';
import ModerationInfoModal from '../../../components/ModerationInfoModal';
import styles from '../../../styles/Moderation.module.css';

// Données spécifiques au hackathon
const hackathonModerationData = {
  userType: 'hackathon',
  companyName: 'winstory.io',
  agencyName: '',
  walletAddress: '0xf6C3cC303D230Ce205831d35CB80C9Dcf701b436',
  userName: '@Hackathon',
  title: "Hack, hot-pepper, romance and in Paris 🌶️",
  info: {
    startingText: "Paris has won UCL 🥳 \nBut a dangerous hot-pepper took the city by storm. \nHot pepper is burning, a seductive red dress woman would she be complicit.\nAnd who is this athletic man who runs ? What is he running towards ?\nIs he the companion of the seductive woman in red, or does he want to stop the burning hot pepper ? Just a Parisian fan ?\nAnd who is this man scouring the city's rooftops with a computer, under his hackeut profile, perhaps responsible for the city turning red ?",
    guideline: "Continue the story with the same characters to unravel the relationship between the hatchet man, the woman and her companion, and the fiery chili pepper. All set in the city of Paris",
    standardRewards: "15 tokens PSG (0xc2661815C69c2B3924D3dd0c2C1358A1E38A3105)",
    premiumRewards: "50 tokens PSG (0xc2661815C69c2B3924D3dd0c2C1358A1E38A3105)",
    completionPrice: "15 $PSG",
    totalCompletions: 1280, // 19200 / 15
  },
  videoUrl: 'https://gateway.pinata.cloud/ipfs/QmSUyAr2MjKEkBxVge86XoAox25DRpjtGcYEP1FBXHJvUp',
  videoOrientation: 'horizontal',
  startingText: "Paris has won UCL 🥳 \nBut a dangerous hot-pepper took the city by storm. \nHot pepper is burning, a seductive red dress woman would she be complicit.\nAnd who is this athletic man who runs ? What is he running towards ?\nIs he the companion of the seductive woman in red, or does he want to stop the burning hot pepper ? Just a Parisian fan ?\nAnd who is this man scouring the city's rooftops with a computer, under his hackeut profile, perhaps responsible for the city turning red ?",
  guideline: "Continue the story with the same characters to unravel the relationship between the hatchet man, the woman and her companion, and the fiery chili pepper. All set in the city of Paris",
  standardRewards: "15 tokens PSG (0xc2661815C69c2B3924D3dd0c2C1358A1E38A3105)",
  premiumRewards: "50 tokens PSG (0xc2661815C69c2B3924D3dd0c2C1358A1E38A3105)",
};

const progressMock = {
  stakers: 15,
  stakersRequired: 22,
  stakedAmount: 1240,
  mintPrice: 1000,
  validRatio: 67,
  refuseRatio: 33,
};

const HackathonModerationPage = () => {
  const [activeTab, setActiveTab] = useState<'initial' | 'completion'>('initial');
  const [showInfo, setShowInfo] = useState(false);
  const [showBubble, setShowBubble] = useState<string | null>(null);
  const [showValidPopup, setShowValidPopup] = useState(false);
  const [showRefusePopup, setShowRefusePopup] = useState(false);
  const [showBulbPopup, setShowBulbPopup] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoHeight, setVideoHeight] = useState(0);

  // Taille et espacement des bulles
  const bubbleSize = 135;
  const bubbleGap = 32;

  useEffect(() => {
    if (videoRef.current) {
      setVideoHeight(videoRef.current.clientHeight);
    }
  }, []);

  // Calcul pour aligner le panneau de droite verticalement avec la vidéo
  const panelRightStyle = videoHeight
    ? { justifyContent: 'center', minHeight: videoHeight, display: 'flex', flexDirection: 'column' as const }
    : {};

  return (
    <div className={styles.moderationBg}>
      <ModeratorHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onIconClick={() => window.location.href = '/moderator/dashboard'}
        onBulbClick={() => setShowBulbPopup(true)}
      />
      <div className={styles.moderationContainer} style={{ position: 'relative', overflow: 'visible' }}>
        {/* Colonne bulles à gauche, position fixed sur desktop pour ne pas être masquée */}
        <div
          style={{
            position: 'fixed',
            left: 32,
            top: 'calc(50% + 60px)',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: bubbleGap,
            zIndex: 20,
            width: bubbleSize,
          }}
        >
          {[
            { label: 'Premium Reward', onClick: () => setShowBubble('premiumRewards') },
            { label: 'Standard Reward', onClick: () => setShowBubble('standardRewards') },
            { label: 'Guideline', onClick: () => setShowBubble('guideline') },
            { label: 'Starting Story', onClick: () => setShowBubble('startingText') },
          ].map((bulle, idx) => (
            <div
              key={bulle.label}
              className={styles.cornerBubble}
              style={{ width: bubbleSize, height: bubbleSize, fontSize: 20 }}
              onClick={bulle.onClick}
            >
              {bulle.label}
            </div>
          ))}
        </div>
        {/* Panneau gauche : vidéo */}
        <div className={styles.moderationPanelLeft}>
          <div className={styles.videoSection} style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <video ref={videoRef} src={hackathonModerationData.videoUrl} controls className={styles.campaignVideo} style={{ margin: '0 0' }} />
          </div>
        </div>
        {/* Panneau droit : barres de progression + boutons, centré verticalement sur la vidéo */}
        <div className={styles.moderationPanelRight} style={panelRightStyle}>
          <div className={styles.progressContainer}>
            <div className={styles.progressItem}>
              <div className={styles.progressHeader}>
                <span>Minimum {progressMock.stakersRequired} active stakers have voted</span>
                <span>{progressMock.stakers}/{progressMock.stakersRequired}</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${Math.round((progressMock.stakers / progressMock.stakersRequired) * 100)}%`, background: 'var(--primary)' }}></div>
              </div>
            </div>
            <div className={styles.progressItem}>
              <div className={styles.progressHeader}>
                <span>Total staked amount exceeds MINT price</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '100%', background: 'var(--secondary)' }}></div>
              </div>
              <div className={styles.stakingComparison}>
                <span className={styles.stakedAmount}>{progressMock.stakedAmount} $WINC</span>
                <span className={styles.mintPrice}>{progressMock.mintPrice} $WINC</span>
              </div>
            </div>
            <div className={styles.progressItem}>
              <div className={styles.progressHeader}>
                <span>Vote results</span>
                <span>2:1 ratio needed</span>
              </div>
              <div className={styles.voteResults}>
                <div className={styles.voteValid} style={{ width: `${progressMock.validRatio}%` }}></div>
                <div className={styles.voteRefuse} style={{ width: `${progressMock.refuseRatio}%` }}></div>
              </div>
            </div>
          </div>
          <div className={styles.moderationControls}>
            <button className={`${styles.moderationButton} ${styles.validButton}`} onClick={() => setShowValidPopup(true)}>Valid</button>
            <button className={`${styles.moderationButton} ${styles.refuseButton}`} onClick={() => setShowRefusePopup(true)}>Refuse</button>
          </div>
        </div>
      </div>
      {/* Popups bulles infos */}
      {showBubble && (
        <div className={styles.popupOverlay} onClick={() => setShowBubble(null)}>
          <div className={styles.textPopup} onClick={e => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <h2 className={styles.popupTitle}>{showBubble === 'startingText' ? 'Starting Story' : showBubble === 'guideline' ? 'Guideline' : showBubble === 'standardRewards' ? 'Standard Reward' : 'Premium Reward'}</h2>
              <button className={styles.closePopup} onClick={() => setShowBubble(null)}>&times;</button>
            </div>
            <div className={styles.textPopupContent}>
              {hackathonModerationData.info[showBubble]}
            </div>
          </div>
        </div>
      )}
      {/* Popup infos campagne (bulle i) */}
      {showInfo && (
        <ModerationInfoModal info={hackathonModerationData.info} onClose={() => setShowInfo(false)} />
      )}
      {/* Popup Valid */}
      {showValidPopup && (
        <div className={styles.popupOverlay} onClick={() => setShowValidPopup(false)}>
          <div className={styles.textPopup} style={{ border: '2px solid #37FF00' }} onClick={e => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <button className={styles.closePopup} onClick={() => setShowValidPopup(false)}>&times;</button>
            </div>
            <div className={styles.textPopupContent}>
              <b style={{ color: '#37FF00' }}>Validate this Hackathon Story</b>, confirming that it :<br /><br />
              <ul style={{ color: '#37FF00', fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
                <li>Respects Winstory's moderation standards</li>
                <li>(clarity, coherence, creativity, and potential to inspire community completions)</li>
                <li>Contains an initial story that is understandable and usable as a narrative starting point</li>
                <li>Does not violate any of the listed refusal rules</li>
                <li>For hackathon stories: follows the creative structure and purpose of the hackathon theme</li>
                <li>Proposes an original, engaging and AI-enhanceable narrative seed</li>
              </ul>
              <div style={{ marginBottom: 8, color: '#fff', fontWeight: 600 }}>
                Once validated,<br />this content will be eligible for community completions.<br /><br />
                Your decision engages a proportional part of your staked WINC.<br />
                If the majority of stakers vote YES and you also voted YES, you earn a share of the rewards pool.<br />
                If the final vote is NO and you validated it, you lose proportional part of your stake.
              </div>
              <button className={styles.validButton} style={{ margin: '24px auto 0', display: 'block', minWidth: 180 }} onClick={() => setShowValidPopup(false)}>Valid</button>
            </div>
          </div>
        </div>
      )}
      {/* Popup Refuse */}
      {showRefusePopup && (
        <div className={styles.popupOverlay} onClick={() => setShowRefusePopup(false)}>
          <div className={styles.textPopup} style={{ border: '2px solid #FF0000' }} onClick={e => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <button className={styles.closePopup} onClick={() => setShowRefusePopup(false)}>&times;</button>
            </div>
            <div className={styles.textPopupContent}>
              <b style={{ color: '#FF0000' }}>Refuse this Hackathon Story</b><br />if it falls under any of the following criteria :<br /><br />
              <ul style={{ color: '#FF0000', fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
                <li>The text or video is incomplete, incoherent, or lacks clear narrative direction</li>
                <li>It cannot reasonably inspire meaningful community completions</li>
                <li>It includes hate speech, racism, xenophobia, or apology for harassment and bullying</li>
                <li>It contains deepfakes that may harm the dignity or identity of a specific (group of) person</li>
                <li>It presents geopolitical risks</li>
                <li>It contains explicit sexual content or pornography</li>
                <li>It has clearly not been enhanced, assisted, or post-produced using generative AI or similar post-prod technologies</li>
              </ul>
              <div style={{ marginBottom: 8, color: '#fff', fontWeight: 600 }}>
                Refusing content is a strong decision.<br />Make sure it clearly meets at least one of these criteria.<br /><br />
                Your decision engages a proportional part of your staked WINC.<br />
                If the majority of stakers vote Refuse, and you also voted Refuse, you win a share of the rewards pool.<br />
                If the final vote is Valid and you refused it, you lose proportional part of your stake.
              </div>
              <button className={styles.refuseButton} style={{ margin: '24px auto 0', display: 'block', minWidth: 180 }} onClick={() => setShowRefusePopup(false)}>Refuse</button>
            </div>
          </div>
        </div>
      )}
      {/* Popup ampoule */}
      {showBulbPopup && (
        <div className={styles.popupOverlay} onClick={() => setShowBulbPopup(false)}>
          <div className={styles.textPopup} onClick={e => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <button className={styles.closePopup} onClick={() => setShowBulbPopup(false)}>&times;</button>
            </div>
            <div className={styles.textPopupContent}>
              <b>Hackathon Moderation</b><br /><br />
              This is a special moderation page for the hackathon.<br />
              The video and story content are specific to the hackathon theme.<br />
              Standard rewards: 15 PSG tokens<br />
              Premium rewards: 50 PSG tokens (top 3 completions)<br />
              Maximum completions: 1280
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonModerationPage; 