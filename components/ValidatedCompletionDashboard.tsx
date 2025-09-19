"use client";

import { useEffect, useMemo, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import RadarChart from './RadarChart';
import RadarChartModal from './RadarChartModal';
import { evaluateModeration, ModerationStatus, SCALE } from '../lib/moderation-engine';

interface ModeratorScore {
  stakerId: string;
  stakerName: string;
  score: number; // 0-100
  stakedAmount: number; // Amount staked by this moderator in WINC
}

interface ValidatedCompletion {
  id: string;
  campaignTitle: string;
  completionTitle: string;
  moderatorScores: ModeratorScore[];
  averageScore: number;
  ranking: number; // User's rank
  totalCompletions: number; // Total number of MINT completions for this campaign
  isTopThree: boolean; // Whether user is in top 3
  standardRewards: string[];
  premiumRewards?: string[];
  campaignEndStatus: 'finished' | 'in_progress';
  campaignEndTime?: number; // Timestamp for campaign end
  stakedAmount: number; // Amount staked by moderators
  mintPrice: number; // Required staking amount
}

interface ValidatedCompletionDashboardProps {
  forceValidated?: boolean;
  onForceValidated?: (enabled: boolean) => void;
  // Dev controls for dynamic data
  devCompletionData?: {
    moderatorScores?: ModeratorScore[]; // Individual moderator configurations
    ranking?: number;
    totalCompletions?: number;
    stakedAmount?: number;
    mintPrice?: number;
    isTopThree?: boolean;
    campaignEndTime?: number;
  };
}

// Format countdown timer
function formatCountdown(msRemaining: number): string {
  if (msRemaining <= 0) return 'FINISHED';
  
  const totalSeconds = Math.floor(msRemaining / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
  }
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
}

export default function ValidatedCompletionDashboard({ 
  forceValidated, 
  onForceValidated,
  devCompletionData
}: ValidatedCompletionDashboardProps) {
  const account = useActiveAccount();
  const [completion, setCompletion] = useState<ValidatedCompletion | null>(null);
  const [showRadarModal, setShowRadarModal] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Update current time every second for countdown
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (account) {
      // Use dev controls data or defaults
      const ranking = devCompletionData?.ranking || 1;
      const totalCompletions = devCompletionData?.totalCompletions || 524;
      const stakedAmount = devCompletionData?.stakedAmount || 80; // Less than mint price by default
      const mintPrice = devCompletionData?.mintPrice || 100;
      const isTopThree = devCompletionData?.isTopThree ?? (ranking <= 3);
      const campaignEndTime = devCompletionData?.campaignEndTime || (Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now

      // Use configured moderator scores or default ones
      const moderatorScores = devCompletionData?.moderatorScores || [
        { stakerId: '1', stakerName: 'Staker 1', score: 92, stakedAmount: 1200 },
        { stakerId: '2', stakerName: 'Staker 2', score: 95, stakedAmount: 800 },
        { stakerId: '3', stakerName: 'Staker 3', score: 88, stakedAmount: 1500 },
        { stakerId: '4', stakerName: 'Staker 4', score: 91, stakedAmount: 900 },
        { stakerId: '5', stakerName: 'Staker 5', score: 87, stakedAmount: 1100 },
        { stakerId: '6', stakerName: 'Staker 6', score: 94, stakedAmount: 750 },
        { stakerId: '7', stakerName: 'Staker 7', score: 89, stakedAmount: 1300 },
        { stakerId: '8', stakerName: 'Staker 8', score: 93, stakedAmount: 850 },
        { stakerId: '9', stakerName: 'Staker 9', score: 90, stakedAmount: 1000 },
        { stakerId: '10', stakerName: 'Staker 10', score: 86, stakedAmount: 950 },
        { stakerId: '11', stakerName: 'Staker 11', score: 88, stakedAmount: 1400 },
        { stakerId: '12', stakerName: 'Staker 12', score: 92, stakedAmount: 700 },
        { stakerId: '13', stakerName: 'Staker 13', score: 85, stakedAmount: 1250 },
        { stakerId: '14', stakerName: 'Staker 14', score: 96, stakedAmount: 600 },
        { stakerId: '15', stakerName: 'Staker 15', score: 91, stakedAmount: 1350 },
        { stakerId: '16', stakerName: 'Staker 16', score: 89, stakedAmount: 800 },
        { stakerId: '17', stakerName: 'Staker 17', score: 93, stakedAmount: 1150 },
        { stakerId: '18', stakerName: 'Staker 18', score: 87, stakedAmount: 900 },
        { stakerId: '19', stakerName: 'Staker 19', score: 94, stakedAmount: 1050 },
        { stakerId: '20', stakerName: 'Staker 20', score: 90, stakedAmount: 750 },
        { stakerId: '21', stakerName: 'Staker 21', score: 88, stakedAmount: 1200 }
      ];

      const actualAverage = Math.round(moderatorScores.reduce((sum, mod) => sum + mod.score, 0) / moderatorScores.length);

      const mockCompletion: ValidatedCompletion = {
        id: '1',
        campaignTitle: 'Amazing Brand Campaign',
        completionTitle: 'My Creative Video Completion',
        moderatorScores,
        averageScore: actualAverage, // Use calculated average
        ranking,
        totalCompletions,
        isTopThree,
        standardRewards: ['Digital NFT Certificate', 'Brand Merchandise'],
        premiumRewards: isTopThree ? ['Exclusive Brand Partnership', '$500 USDT Prize'] : undefined,
        campaignEndStatus: campaignEndTime <= now ? 'finished' : 'in_progress',
        campaignEndTime,
        stakedAmount,
        mintPrice
      };

      setCompletion(mockCompletion);
    }
  }, [account, devCompletionData, now]);

  const validationStatus = useMemo(() => {
    if (!completion) return null;
    
    const numModerators = completion.moderatorScores.length;
    const validVotes = completion.moderatorScores.filter(s => s.score > 0).length; // Only score = 0 is refused
    const refuseVotes = completion.moderatorScores.filter(s => s.score === 0).length; // Only exact 0 is refused
    
    // Calculate staking amounts for each side using the hybrid system
    const validatedModerators = completion.moderatorScores.filter(s => s.score > 0);
    const refusedModerators = completion.moderatorScores.filter(s => s.score === 0);
    
    const stakeYes = validatedModerators.reduce((sum, mod) => sum + mod.stakedAmount, 0);
    const stakeNo = refusedModerators.reduce((sum, mod) => sum + mod.stakedAmount, 0);
    
    // Use hybrid moderation engine for evaluation
    const hybridResult = evaluateModeration(
      validVotes, // votesYes
      refuseVotes, // votesNo
      BigInt(Math.floor(stakeYes * SCALE)), // stakeYes in WINC scaled
      BigInt(Math.floor(stakeNo * SCALE)), // stakeNo in WINC scaled
      completion.mintPrice, // mintPriceUSDC
      Date.now(), // currentTimestamp
      Date.now() + 7 * 24 * 3600 * 1000, // voteWindowEnd (7 days)
      BigInt(SCALE) // wincPerUSDC (1 WINC = 1 USDC)
    );
    
    // Extract results from hybrid evaluation
    const minVotesOk = numModerators >= 22;
    const stakingOk = completion.stakedAmount >= completion.mintPrice;
    const requirementsMet = minVotesOk && stakingOk;
    
    // Hybrid ratio calculation for display
    const hybridScoreYes = Number(hybridResult.scoreYes) / SCALE;
    const hybridScoreNo = Number(hybridResult.scoreNo) / SCALE;
    const hybridRatio = hybridScoreNo > 0 ? hybridScoreYes / hybridScoreNo : hybridScoreYes;
    const hasSufficientRatio = hybridResult.status !== ModerationStatus.EN_COURS;
    
    // Vote can close based on hybrid evaluation
    const voteCanClose = hybridResult.status === ModerationStatus.VALIDATED || 
                         hybridResult.status === ModerationStatus.REJECTED;
    
    const majorityRefuses = hybridResult.status === ModerationStatus.REJECTED;
    const majorityValidates = hybridResult.status === ModerationStatus.VALIDATED;
    
    // Vote continues if requirements met but hybrid system says EN_COURS
    const voteContinues = requirementsMet && (hybridResult.status === ModerationStatus.EN_COURS);
    
    // Determine completion status
    const allValidated = majorityValidates;
    const isRefused = majorityRefuses;
    
    return {
      minVotesOk,
      stakingOk,
      requirementsMet,
      voteCanClose,
      voteContinues,
      majorityRefuses,
      majorityValidates,
      allValidated,
      isRefused,
      validVotes,
      refuseVotes,
      numModerators,
      majorityRatio: hybridRatio,
      hasSufficientRatio,
      majorityCount: Math.max(refuseVotes, validVotes),
      minorityCount: Math.min(refuseVotes, validVotes),
      hybridResult, // Expose hybrid results for debugging
      stakeYes,
      stakeNo,
      hybridScoreYes,
      hybridScoreNo
    };
  }, [completion]);

  // Calculate remaining time
  const remainingTime = useMemo(() => {
    if (!completion?.campaignEndTime) return 'FINISHED';
    return formatCountdown(completion.campaignEndTime - now);
  }, [completion?.campaignEndTime, now]);

  if (!completion) {
    return (
      <div style={{ 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        paddingTop: 80,
        color: '#C0C0C0',
        fontSize: 18
      }}>
        Loading completion data...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}> {/* Reduced margin */}
        <h1 style={{ 
          color: validationStatus?.isRefused ? '#FF3B30' : 
                 validationStatus?.allValidated ? '#18C964' : '#FFD600', 
          fontSize: 38, // Reduced from 42
          fontWeight: 900, 
          marginBottom: 8 
        }}>
          {validationStatus?.isRefused 
            ? 'Moderators refused your Completion'
            : validationStatus?.allValidated 
            ? 'Moderators validated and scored your Completion !'
            : validationStatus?.requirementsMet 
            ? 'Vote in progress - Requirements met'
            : 'Waiting for requirements to be met'
          }
        </h1>
        <p style={{ 
          color: validationStatus?.isRefused ? '#FF3B30' : 
                 validationStatus?.allValidated ? '#18C964' : '#FFD600', 
          fontSize: 16, // Reduced from 18
          fontWeight: 600,
          margin: 0
        }}>
          {validationStatus?.isRefused 
            ? 'Unfortunately, your Completion content has been rejected by the Stakers moderators.'
            : validationStatus?.allValidated 
            ? `Congratulations on respecting the Moderation rules ! ${completion.ranking <= 3 ? `You are the N°${completion.ranking}` : ''}`
            : validationStatus?.requirementsMet 
            ? 'Once majority is reached, vote will close automatically'
            : 'Waiting for minimum votes and staking requirements'
          }
        </p>
        {validationStatus?.isRefused && (
          <p style={{ 
            color: '#FF3B30', 
            fontSize: 14,
            fontWeight: 500,
            margin: '8px 0 0 0',
            fontStyle: 'italic'
          }}>
            It was deemed that the content did not comply with the moderation rules.
          </p>
        )}
      </div>

      {/* Campaign info */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}> {/* Reduced margin */}
        <div style={{ color: '#FFD600', fontSize: 14, fontWeight: 600, marginBottom: 4 }}> {/* Reduced font */}
          Campaign :
        </div>
        <h2 style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 800, margin: 0 }}> {/* Reduced font */}
          {completion.campaignTitle}
        </h2>
      </div>

      {/* Main content grid - REDUCED LEFT PANEL, BIGGER RADAR */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '260px 500px 260px', // Slightly reduced side columns for more breathing room
        gap: 64, // Increased from 32 to 64 for much better spacing
        alignItems: 'start',
        marginBottom: 24,
        justifyContent: 'center' // Center the entire grid
      }}>
        {/* Left: Requirements - REDUCED SIZE */}
        <div style={{ justifySelf: 'end' }}>
          <div style={{ 
            color: '#FFFFFF', 
            fontSize: 16, // Reduced from 20
            fontWeight: 800, 
            marginBottom: 12 // Reduced from 16
          }}>
            3 Requirements for Completion
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}> {/* Reduced gap */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}> {/* Reduced gap */}
              <div style={{ 
                width: 16, // Reduced from 22
                height: 16, 
                borderRadius: '50%', 
                background: validationStatus?.minVotesOk ? '#18C964' : '#444',
                border: `1px solid ${validationStatus?.minVotesOk ? '#18C964' : '#FFD600'}` // Reduced border
              }} />
              <span style={{ color: validationStatus?.minVotesOk ? '#18C964' : '#FFD600', fontSize: 14 }}> {/* Reduced font */}
                Minimum 22 Stakers votes
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ 
                width: 16, 
                height: 16, 
                borderRadius: '50%', 
                background: validationStatus?.stakingOk ? '#18C964' : '#444',
                border: `1px solid ${validationStatus?.stakingOk ? '#18C964' : '#FFD600'}`
              }} />
              <span style={{ color: validationStatus?.stakingOk ? '#18C964' : '#FFD600', fontSize: 14 }}>
                Pool Staking &gt; Completion Price $
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ 
                width: 16, 
                height: 16, 
                borderRadius: '50%', 
                background: validationStatus?.hasSufficientRatio ? '#18C964' : '#444',
                border: `1px solid ${validationStatus?.hasSufficientRatio ? '#18C964' : '#FFD600'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* No cross needed since this only shows if ratio is met or not */}
              </div>
              <span style={{ color: validationStatus?.hasSufficientRatio ? '#18C964' : '#FFD600', fontSize: 14 }}>
                Majority / Minority ≥ 2:1 ratio
              </span>
            </div>
          </div>

          {/* Completion Moderation Status - REDUCED SIZE */}
          <div style={{ 
            marginTop: 16, // Reduced from 24
            padding: 12, // Reduced from 16
            background: validationStatus?.allValidated 
              ? 'rgba(24, 201, 100, 0.1)' 
              : validationStatus?.isRefused 
              ? 'rgba(255, 59, 48, 0.1)' 
              : 'rgba(255, 214, 0, 0.1)',
            border: `1px solid ${validationStatus?.allValidated ? '#18C964' : validationStatus?.isRefused ? '#FF3B30' : '#FFD600'}`, // Reduced border
            borderRadius: 8 // Reduced from 12
          }}>
            <div style={{ 
              color: validationStatus?.allValidated ? '#18C964' : validationStatus?.isRefused ? '#FF3B30' : '#FFD600', 
              fontSize: 13, // Reduced from 16
              fontWeight: 800, 
              marginBottom: 6 // Reduced from 8
            }}>
              {validationStatus?.voteCanClose
                ? `Vote Closed - ${validationStatus?.numModerators} Stakers`
                : validationStatus?.voteContinues
                ? `Vote Continues - ${validationStatus?.numModerators} Stakers (Need ≥2:1 ratio)`
                : `Completion Moderation by ${validationStatus?.numModerators} Stakers`
              }
            </div>
            <div style={{ color: '#18C964', fontSize: 15, fontWeight: 700 }}> {/* Reduced from 18 */}
              {validationStatus?.validVotes} Validated
            </div>
            <div style={{ color: '#FF3B30', fontSize: 15, fontWeight: 700, marginTop: 2 }}> {/* Reduced from 4 */}
              {validationStatus?.refuseVotes} Refused
            </div>
            {validationStatus?.voteCanClose && (
              <div style={{ 
                marginTop: 8,
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                background: validationStatus?.allValidated ? 'rgba(24, 201, 100, 0.2)' : 'rgba(255, 59, 48, 0.2)',
                color: validationStatus?.allValidated ? '#18C964' : '#FF3B30'
              }}>
                {validationStatus?.allValidated ? '✓ Majority Validates' : '✗ Majority Refuses'}
              </div>
            )}
          </div>

          {/* Average Score Display - New compact section */}
          <div style={{ 
            marginTop: 12,
            padding: 10,
            background: 'rgba(255, 214, 0, 0.1)',
            border: '1px solid #FFD600',
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <div style={{ 
              color: '#FFD600', 
              fontSize: 11, 
              fontWeight: 700, 
              marginBottom: 4
            }}>
              Average Score
            </div>
            <div style={{ 
              color: '#FFFFFF', 
              fontSize: 18, 
              fontWeight: 900 
            }}>
              {completion.averageScore} / 100
            </div>
          </div>
        </div>

        {/* Center: Radar Chart - BIGGER SIZE */}
        <div style={{ justifySelf: 'center' }}>
          <RadarChart 
            moderatorScores={completion.moderatorScores}
            size={500} // Increased from 400
            showLabels={true}
            isClickable={true}
            onClick={() => setShowRadarModal(true)}
          />
        </div>

        {/* Right: Time, Ranking and Rewards */}
        <div style={{ justifySelf: 'start', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Time Section */}
          <div style={{ 
            padding: 12,
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 8,
            border: '1px solid #333'
          }}>
            <div style={{ color: '#C0C0C0', fontSize: 14, marginBottom: 6 }}>
              Time before End of Campaign :
            </div>
            <div style={{ 
              color: remainingTime === 'FINISHED' ? '#18C964' : '#FFD600', 
              fontSize: 20,
              fontWeight: 900 
            }}>
              {remainingTime}
            </div>
          </div>

          {/* Ranking and Rewards - Only show if validated */}
          {validationStatus?.allValidated && (
            <>
              {/* Your Rank */}
              <div style={{
                background: 'rgba(24, 201, 100, 0.1)',
                border: '2px solid #18C964',
                borderRadius: 10,
                padding: '12px 16px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#18C964', fontSize: 14, fontWeight: 800, marginBottom: 4 }}>
                  🏆 Your Rank
                </div>
                <div style={{ color: '#FFD600', fontSize: 22, fontWeight: 900 }}>
                  #{completion.ranking}/{completion.totalCompletions}
                </div>
              </div>

              {/* You Receive */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '2px solid #C0C0C0',
                borderRadius: 10,
                padding: '12px 16px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  color: completion.isTopThree ? '#FFD600' : '#18C964', 
                  fontSize: 14, 
                  fontWeight: 800,
                  marginBottom: 4
                }}>
                  You receive
                </div>
                <div style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 700 }}>
                  {completion.isTopThree 
                    ? 'Standard + Premium' 
                    : 'Standard Rewards'
                  }
                </div>
              </div>

              {/* Standard Rewards */}
              <div style={{
                background: 'rgba(24, 201, 100, 0.1)',
                border: '1px solid #18C964',
                borderRadius: 8,
                padding: '10px 12px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#18C964', fontSize: 13, fontWeight: 800, marginBottom: 6 }}>
                  Standard
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {completion.standardRewards.slice(0, 2).map((reward, index) => (
                    <div 
                      key={index}
                      style={{
                        background: '#18C964',
                        color: '#000',
                        padding: '4px 8px',
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 600
                      }}
                    >
                      {reward.length > 15 ? reward.substring(0, 12) + '...' : reward}
                    </div>
                  ))}
                </div>
              </div>

              {/* Premium Rewards (only if top 3) */}
              {completion.isTopThree && completion.premiumRewards && (
                <div style={{
                  background: 'rgba(255, 214, 0, 0.1)',
                  border: '1px solid #FFD600',
                  borderRadius: 8,
                  padding: '10px 12px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#FFD600', fontSize: 13, fontWeight: 800, marginBottom: 6 }}>
                    Premium
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {completion.premiumRewards.slice(0, 2).map((reward, index) => (
                      <div 
                        key={index}
                        style={{
                          background: '#FFD600',
                          color: '#000',
                          padding: '4px 8px',
                          borderRadius: 10,
                          fontSize: 11,
                          fontWeight: 600
                        }}
                      >
                        {reward.length > 15 ? reward.substring(0, 12) + '...' : reward}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>



      {/* Radar Chart Modal */}
      <RadarChartModal
        isOpen={showRadarModal}
        onClose={() => setShowRadarModal(false)}
        moderatorScores={completion.moderatorScores}
        campaignTitle={completion.campaignTitle}
        averageScore={completion.averageScore}
        ranking={completion.ranking}
        totalCompletions={completion.totalCompletions}
      />
    </div>
  );
} 