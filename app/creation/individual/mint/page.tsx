"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import EvaluationResults from '@/components/EvaluationResults';

interface EvaluationData {
  score: number;
  tier: 'S' | 'A' | 'B' | 'C' | 'F';
  collaborationProbability: number;
  scoreBreakdown: {
    storyFoundation: number;
    technicalExcellence: number;
    collaborativePotential: number;
    viralImpact: number;
  };
  strengths: string[];
  weaknesses: string[];
  optimizationRoadmap: {
    priority: string;
    secondary: string;
  };
  collaborationForecast: string;
  securityStatus: 'CLEARED' | 'FLAGGED';
  securityReason?: string;
}

export default function IndividualMintPage() {
  const router = useRouter();
  const [campaignData, setCampaignData] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(true);
  const [creationStep, setCreationStep] = useState(0);
  const [error, setError] = useState('');
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
  const [evaluationError, setEvaluationError] = useState('');
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [aiEvaluationCompleted, setAiEvaluationCompleted] = useState(false);
  const [humanModerationStatus, setHumanModerationStatus] = useState<'pending' | 'in_progress' | 'approved' | 'rejected'>('pending');

  // Simplified steps as requested
  const steps = [
    "Creating campaign in database",
    "MINT on Blockchain",
    "AI evaluation in progress",
    "Configuring pool rewards",
    "Human Moderation in progress"
  ];

  useEffect(() => {
    // Charger les données de la campagne depuis le localStorage
    const storyData = localStorage.getItem("story");
    const filmData = localStorage.getItem("film");
    const completionsData = localStorage.getItem("completions");

    if (storyData && filmData && completionsData) {
      const loaded = {
        story: JSON.parse(storyData),
        film: JSON.parse(filmData),
        completions: JSON.parse(completionsData)
      };
      setCampaignData(loaded);
      // Lancer la création uniquement une fois les données chargées
      simulateCampaignCreation(loaded);
    } else {
      // Bloquer le flux et afficher une erreur claire
      setIsCreating(false);
      setError("Missing campaign data. Please restart from recap.");
    }
  }, []);

  const createCampaignInDatabase = async (data?: any) => {
    try {
      const payload = data || campaignData;
      if (!payload) throw new Error('Missing campaign data');
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creatorId: 'current_user', // TODO: Récupérer l'ID utilisateur réel
          story: payload.story,
          film: payload.film,
          completions: payload.completions
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign in database');
      }

      const result = await response.json();
      setCampaignId(result.campaignId);
      return result.campaignId;
    } catch (error) {
      console.error('Database creation error:', error);
      throw error;
    }
  };

  const updateCampaignStatus = async (status: string, evaluation?: EvaluationData) => {
    if (!campaignId) return;

    try {
      const response = await fetch('/api/campaigns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          updates: {
            status,
            evaluation: evaluation ? {
              score: evaluation.score,
              tier: evaluation.tier,
              collaborationProbability: evaluation.collaborationProbability,
              securityStatus: evaluation.securityStatus
            } : undefined
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update campaign status');
      }
    } catch (error) {
      console.error('Campaign update error:', error);
      throw error;
    }
  };

  // TODO: Replace this function with real blockchain transaction
  // This function should handle the actual MINT transaction on blockchain
  // It should integrate with thirdweb/metamask/wallet web3 for transaction signing
  const performBlockchainMint = async () => {
    try {
      // TODO: Implement real blockchain transaction here
      // This is where you'll integrate with:
      // - thirdweb SDK for transaction handling
      // - Wallet connection (MetaMask, WalletConnect, etc.)
      // - Smart contract interaction for MINT
      // - Transaction confirmation and hash retrieval
      
      console.log('TODO: Implement real blockchain MINT transaction');
      console.log('This should:');
      console.log('1. Connect to user wallet');
      console.log('2. Sign transaction for MINT');
      console.log('3. Wait for transaction confirmation');
      console.log('4. Return transaction hash');
      
      // For now, simulate the transaction
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // TODO: Return actual transaction hash when implemented
      return '0x' + Math.random().toString(16).substr(2, 64);
    } catch (error) {
      console.error('Blockchain MINT error:', error);
      throw error;
    }
  };

  const simulateCampaignCreation = async (data?: any) => {
    try {
      const payload = data || campaignData;
      if (!payload) throw new Error('Missing campaign data');
      
      // Step 0: Creating campaign in database
      setCreationStep(0);
      await createCampaignInDatabase(payload);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 1: MINT on Blockchain - TODO: Replace with real blockchain transaction
      setCreationStep(1);
      const transactionHash = await performBlockchainMint();
      console.log('MINT transaction hash:', transactionHash);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: AI evaluation in progress
      setCreationStep(2);
      await performAIEvaluation();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mark AI evaluation as completed
      setAiEvaluationCompleted(true);
      
      // Step 3: Configuring pool rewards
      setCreationStep(3);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 4: Human Moderation in progress
      setCreationStep(4);
      setHumanModerationStatus('in_progress');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate human moderation result (for now, always approve)
      // TODO: Replace with real human moderation system
      setHumanModerationStatus('approved');
      
      // Création réussie
      setIsCreating(false);
      
    } catch (error) {
      console.error("Campaign creation error:", error);
      setError("Failed to create campaign. Please try again.");
      setIsCreating(false);
    }
  };

  const performAIEvaluation = async () => {
    try {
      if (!campaignData) {
        throw new Error('No campaign data available');
      }

      const response = await fetch('/api/evaluation/individual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: campaignId || `campaign_${Date.now()}`,
          story: campaignData.story,
          film: campaignData.film,
          completions: campaignData.completions
        })
      });

      if (!response.ok) {
        throw new Error('Evaluation failed');
      }

      const evaluation = await response.json();
      setEvaluationData(evaluation);
      
      // Mettre à jour le statut de la campagne
      if (evaluation.securityStatus === 'FLAGGED' || evaluation.tier === 'F') {
        await updateCampaignStatus('rejected', evaluation);
        setHumanModerationStatus('rejected');
        setIsCreating(false);
        return;
      } else {
        await updateCampaignStatus('evaluating', evaluation);
      }
      
    } catch (error) {
      console.error('AI Evaluation error:', error);
      setEvaluationError('AI evaluation failed. Please try again.');
      setIsCreating(false);
    }
  };

  const handleGoToCampaign = () => {
    router.push("/mywin/creations");
  };

  const handleGoHome = () => {
    router.push("/welcome");
  };

  const handleRetryEvaluation = () => {
    setEvaluationData(null);
    setEvaluationError('');
    setIsCreating(true);
    setAiEvaluationCompleted(false);
    setHumanModerationStatus('pending');
    setCreationStep(0);
    simulateCampaignCreation();
  };

  const handleContinueToCampaign = async () => {
    try {
      // Approuver la campagne et la rendre disponible aux compléteurs
      await updateCampaignStatus('approved', evaluationData || undefined);
      
      // Marquer la campagne comme approuvée localement
      localStorage.setItem('campaignApproved', 'true');
      
      // Nettoyer les données de création
      localStorage.removeItem('story');
      localStorage.removeItem('film');
      localStorage.removeItem('completions');
      
      handleGoToCampaign();
    } catch (error) {
      console.error('Error approving campaign:', error);
      setError('Failed to approve campaign. Please try again.');
    }
  };

  // Function to determine step styling with enhanced logic for Human Moderation
  const getStepStyle = (index: number) => {
    // Step 4 (Human Moderation) special handling
    if (index === 4) {
      if (!aiEvaluationCompleted) {
        // Not yet available (AI evaluation not completed)
        return {
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid #333',
          color: '#666',
          fontWeight: '400'
        };
      }
      
      if (humanModerationStatus === 'in_progress') {
        // In progress - YELLOW
        return {
          background: 'rgba(255, 215, 0, 0.1)',
          border: '1px solid #FFD600',
          color: '#FFD600',
          fontWeight: '600'
        };
      }
      
      if (humanModerationStatus === 'approved') {
        // Approved - GREEN
        return {
          background: 'rgba(24, 201, 100, 0.1)',
          border: '1px solid #18C964',
          color: '#18C964',
          fontWeight: '600'
        };
      }
      
      if (humanModerationStatus === 'rejected') {
        // Rejected - RED
        return {
          background: 'rgba(255, 45, 45, 0.1)',
          border: '1px solid #FF2D2D',
          color: '#FF2D2D',
          fontWeight: '600'
        };
      }
    }
    
    // Default styling for other steps
    if (index < creationStep) {
      return {
        background: 'rgba(24, 201, 100, 0.1)',
        border: '1px solid #18C964',
        color: '#18C964',
        fontWeight: '600'
      };
    }
    
    if (index === creationStep) {
      return {
        background: 'rgba(255, 215, 0, 0.1)',
        border: '1px solid #FFD600',
        color: '#FFD600',
        fontWeight: '600'
      };
    }
    
    // Pending steps
    return {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid #333',
      color: '#666',
      fontWeight: '400'
    };
  };

  // Function to get step icon with enhanced logic for Human Moderation
  const getStepIcon = (index: number) => {
    // Step 4 (Human Moderation) special handling
    if (index === 4) {
      if (!aiEvaluationCompleted) {
        return '○ '; // Pending
      }
      
      if (humanModerationStatus === 'in_progress') {
        return '⏳ '; // In progress
      }
      
      if (humanModerationStatus === 'approved') {
        return '✓ '; // Approved
      }
      
      if (humanModerationStatus === 'rejected') {
        return '✗ '; // Rejected
      }
    }
    
    // Default logic for other steps
    if (index < creationStep) {
      return '✓ '; // Completed
    }
    
    if (index === creationStep) {
      return '⏳ '; // In progress
    }
    
    return '○ '; // Pending
  };

  return (
    <ProtectedRoute>
      <div style={{ 
        minHeight: '100vh', 
        background: '#000', 
        color: '#fff', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: '40px' 
        }}>
          <img src="/individual.svg" alt="Individual" style={{ width: 80, height: 80, marginRight: 16 }} />
          <span style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>
            Campaign Creation
          </span>
        </div>

        {/* Contenu principal */}
        <div style={{ 
          maxWidth: 800, 
          width: '100%', 
          textAlign: 'center' 
        }}>
          
          {isCreating ? (
            <div>
              {/* Indicateur de progression */}
              <div style={{ marginBottom: '40px' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  border: '4px solid #FFD600',
                  borderTop: '4px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 20px auto'
                }}></div>
                <div style={{ color: '#FFD600', fontSize: '18px', fontWeight: '600' }}>
                  Creating your campaign...
                </div>
              </div>

              {/* Étapes de création */}
              <div style={{ marginBottom: '40px' }}>
                {steps.map((step, index) => {
                  const stepStyle = getStepStyle(index);
                  return (
                    <div
                      key={index}
                      style={{
                        padding: '12px 20px',
                        margin: '8px 0',
                        background: stepStyle.background,
                        border: stepStyle.border,
                        borderRadius: '8px',
                        color: stepStyle.color,
                        fontSize: '14px',
                        fontWeight: stepStyle.fontWeight as any,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {getStepIcon(index)}
                      {step}
                    </div>
                  );
                })}
              </div>

              {/* Barre de progression */}
              <div style={{
                background: '#333',
                borderRadius: '10px',
                height: '8px',
                marginBottom: '20px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #18C964, #FFD600)',
                  height: '100%',
                  width: `${((creationStep + 1) / steps.length) * 100}%`,
                  transition: 'width 0.5s ease'
                }}></div>
              </div>

              <div style={{ color: '#666', fontSize: '12px', marginBottom: '20px' }}>
                Step {creationStep + 1} of {steps.length}
              </div>

              {/* My Win Link */}
              <div style={{ marginTop: '30px' }}>
                <button
                  onClick={handleGoToCampaign}
                  style={{
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '1px solid #FFD600',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    color: '#FFD600',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 215, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                  }}
                >
                  📊 Track Your Campaign in My Win
                </button>
              </div>
            </div>
          ) : evaluationData ? (
            /* Résultats d'évaluation */
            <EvaluationResults
              evaluation={evaluationData}
              onContinue={handleContinueToCampaign}
              onRetry={handleRetryEvaluation}
            />
          ) : error || evaluationError ? (
            /* Erreur */
            <div>
              <div style={{ color: '#FF2D2D', fontSize: '48px', marginBottom: '20px' }}>
                ✗
              </div>
              <div style={{ color: '#FF2D2D', fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
                Creation Failed
              </div>
              <div style={{ color: '#fff', fontSize: '16px', marginBottom: '30px' }}>
                {error || evaluationError}
              </div>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#FFD600',
                  color: '#000',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 32px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginRight: '12px'
                }}
              >
                Try Again
              </button>
              <button
                onClick={handleGoHome}
                style={{
                  background: '#FF2D2D',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 32px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Go Home
              </button>
            </div>
          ) : (
            /* Succès */
            <div>
              <div style={{ color: '#18C964', fontSize: '48px', marginBottom: '20px' }}>
                ✓
              </div>
              <div style={{ color: '#18C964', fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>
                Campaign Created Successfully!
              </div>
              <div style={{ color: '#fff', fontSize: '16px', marginBottom: '30px' }}>
                Your campaign is now live and ready to receive completions from the community.
              </div>
              
              <button
                onClick={handleGoToCampaign}
                style={{
                  background: '#18C964',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 32px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginRight: '12px'
                }}
              >
                View Campaign
              </button>
              <button
                onClick={handleGoHome}
                style={{
                  background: '#FFD600',
                  color: '#000',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 32px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Go Home
              </button>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}
