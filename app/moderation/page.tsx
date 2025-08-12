'use client';
import React, { useState, useRef, useEffect } from 'react';
import ModeratorHeader from '../../components/ModeratorHeader';
import BrandInfo from '../../components/BrandInfo';
import ModerationBubbles from '../../components/ModerationBubbles';
import ModerationProgressPanel from '../../components/ModerationProgressPanel';
import ModerationButtons from '../../components/ModerationButtons';
import ModerationInfoModal from '../../components/ModerationInfoModal';
import ModerationTooltip from '../../components/ModerationTooltip';
import CompletionScoringModal from '../../components/CompletionScoringModal';
import styles from '../../styles/Moderation.module.css';
import { useModeration } from '../../lib/hooks/useModeration';
import { 
  getMockDataByType, 
  getMockProgressData, 
  MockModerationData, 
  MockProgressData 
} from '../../lib/mockModerationData';

const ModerationPage = () => {
  const [activeTab, setActiveTab] = useState<'initial' | 'completion'>('initial');
  const [activeSubTab, setActiveSubTab] = useState('b2c-agencies');
  const [showInfo, setShowInfo] = useState(false);
  const [showBubble, setShowBubble] = useState<string | null>(null);
  const [showBulbPopup, setShowBulbPopup] = useState(false);
  
  // States for completion moderation
  const [showScoringModal, setShowScoringModal] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoHeight, setVideoHeight] = useState(0);

  // Use custom hook for moderation data
  const { stats, completionData, submitCompletionScore, submitModerationDecision } = useModeration();

  // États pour les données dynamiques
  const [currentModerationData, setCurrentModerationData] = useState<MockModerationData>(
    getMockDataByType('b2c')
  );
  const [currentProgressData, setCurrentProgressData] = useState<MockProgressData>(
    getMockProgressData()
  );

  // Déterminer le type d'utilisateur basé sur le sous-onglet actif
  const getUserType = () => {
    if (activeTab === 'initial') {
      return activeSubTab === 'individual-creators' ? 'individual' : 'b2c';
    } else {
      return activeSubTab === 'for-individuals' ? 'individual' : 'b2c';
    }
  };

  // Mettre à jour les données quand le sous-onglet change
  useEffect(() => {
    const userType = getUserType();
    let newData: MockModerationData;
    
    if (activeTab === 'initial') {
      if (activeSubTab === 'individual-creators') {
        newData = getMockDataByType('individual');
      } else if (activeSubTab === 'b2c-agencies') {
        // Simuler une agence ou B2C selon le contexte
        newData = Math.random() > 0.5 ? getMockDataByType('agency') : getMockDataByType('b2c');
      } else {
        newData = getMockDataByType('b2c');
      }
    } else {
      // Pour les complétions, utiliser le même type que l'onglet initial
      newData = getMockDataByType(userType);
    }
    
    setCurrentModerationData(newData);
    
    // Mettre à jour les données de progression
    const newProgressData = getMockProgressData();
    newProgressData.totalVotes = newProgressData.validVotes + newProgressData.refuseVotes;
    setCurrentProgressData(newProgressData);
  }, [activeTab, activeSubTab]);

  // Functions for completion moderation
  const handleCompletionValid = () => {
    setShowScoringModal(true);
  };

  const handleCompletionRefuse = async () => {
    const success = await submitModerationDecision('refuse', 'completion');
    if (success) {
      console.log('Completion refused successfully');
      // Mettre à jour les données de progression
      const newProgressData = { ...currentProgressData };
      newProgressData.refuseVotes += 1;
      newProgressData.totalVotes += 1;
      setCurrentProgressData(newProgressData);
    }
  };

  const handleCompletionScore = async (score: number) => {
    const success = await submitCompletionScore(score);
    if (success) {
      console.log(`Completion scored successfully with ${score}/100`);
      setShowScoringModal(false);
      // Mettre à jour les données de progression
      const newProgressData = { ...currentProgressData };
      newProgressData.validVotes += 1;
      newProgressData.totalVotes += 1;
      setCurrentProgressData(newProgressData);
    }
  };

  const handleInitialValid = async () => {
    const success = await submitModerationDecision('valid', 'initial');
    if (success) {
      console.log('Initial story validated successfully');
      // Mettre à jour les données de progression
      const newProgressData = { ...currentProgressData };
      newProgressData.validVotes += 1;
      newProgressData.totalVotes += 1;
      setCurrentProgressData(newProgressData);
    }
  };

  const handleInitialRefuse = async () => {
    const success = await submitModerationDecision('refuse', 'initial');
    if (success) {
      console.log('Initial story refused successfully');
      // Mettre à jour les données de progression
      const newProgressData = { ...currentProgressData };
      newProgressData.refuseVotes += 1;
      newProgressData.totalVotes += 1;
      setCurrentProgressData(newProgressData);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      setVideoHeight(videoRef.current.clientHeight);
    }
  }, []);

  // Calcul pour aligner le panneau de droite verticalement avec la vidéo
  const panelRightStyle = videoHeight
    ? { justifyContent: 'center', minHeight: videoHeight, display: 'flex', flexDirection: 'column' as const }
    : {};

  const currentUserType = getUserType();

  return (
    <div className={styles.moderationBg}>
      <ModeratorHeader
        activeTab={activeTab}
        activeSubTab={activeSubTab}
        onTabChange={setActiveTab}
        onSubTabChange={setActiveSubTab}
        onIconClick={() => window.location.href = '/moderator/dashboard'}
        onBulbClick={() => setShowBulbPopup(true)}
      />
      
      <div className={styles.moderationContainer}>
        {/* Colonne bulles à gauche */}
        <ModerationBubbles
          userType={currentUserType}
          onBubbleClick={setShowBubble}
          bubbleSize={100}
          bubbleGap={24}
        />

        {/* Panneau gauche : vidéo */}
        <div className={styles.moderationPanelLeft}>
          {/* Informations de la marque/agence */}
          <BrandInfo
            companyName={currentModerationData.companyName}
            agencyName={currentModerationData.agencyName}
            userType={currentUserType}
            walletAddress={currentModerationData.walletAddress}
          />
          
          <div className={styles.videoSection} style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <video ref={videoRef} src={currentModerationData.videoUrl} controls className={styles.campaignVideo} style={{ margin: '0 0' }} />
          </div>
        </div>

        {/* Panneau droit : barres de progression + boutons */}
        <div className={styles.moderationPanelRight} style={panelRightStyle}>
          <ModerationProgressPanel
            stakers={currentProgressData.stakers}
            stakersRequired={currentProgressData.stakersRequired}
            stakedAmount={currentProgressData.stakedAmount}
            mintPrice={currentProgressData.mintPrice}
            validVotes={currentProgressData.validVotes}
            refuseVotes={currentProgressData.refuseVotes}
            totalVotes={currentProgressData.totalVotes}
          />
          
          <ModerationButtons
            activeTab={activeTab}
            userType={currentUserType}
            onValid={activeTab === 'initial' ? handleInitialValid : handleCompletionValid}
            onRefuse={activeTab === 'initial' ? handleInitialRefuse : handleCompletionRefuse}
            onValidWithScore={handleCompletionScore}
          />
        </div>
      </div>

      {/* Popups bulles infos */}
      {showBubble && (
        <div className={styles.popupOverlay} onClick={() => setShowBubble(null)}>
          <div className={styles.textPopup} onClick={e => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <h2 className={styles.popupTitle}>
                {showBubble === 'startingText' ? 'Starting Story' : 
                 showBubble === 'guideline' ? 'Guideline' : 
                 showBubble === 'standardRewards' ? 'Standard Reward' : 'Premium Reward'}
              </h2>
              <button className={styles.closePopup} onClick={() => setShowBubble(null)}>&times;</button>
            </div>
            <div className={styles.textPopupContent}>
              {currentModerationData.info[showBubble]}
            </div>
          </div>
        </div>
      )}

      {/* Popup infos campagne (bulle i) */}
      {showInfo && (
        <ModerationInfoModal info={currentModerationData.info} onClose={() => setShowInfo(false)} />
      )}

      {/* Moderation Tooltip */}
      <ModerationTooltip 
        isOpen={showBulbPopup} 
        onClose={() => setShowBulbPopup(false)} 
      />

      {/* Modal de notation des complétions */}
      <CompletionScoringModal
        isOpen={showScoringModal}
        onClose={() => setShowScoringModal(false)}
        onConfirm={handleCompletionScore}
        usedScores={completionData.usedScores}
        contentType={completionData.contentType}
      />
    </div>
  );
};

export default ModerationPage;
