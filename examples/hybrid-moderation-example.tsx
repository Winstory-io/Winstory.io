import React, { useState } from 'react';
import { 
  useHybridModeration, 
  ContentType, 
  ParticipantData 
} from '@/lib/hooks/useHybridModeration';
import ModerationProgressPanelHybrid from '@/components/ModerationProgressPanelHybrid';

const HybridModerationExample: React.FC = () => {
  const [votesYes, setVotesYes] = useState(20);
  const [votesNo, setVotesNo] = useState(5);
  const [stakeYes, setStakeYes] = useState(8000);
  const [stakeNo, setStakeNo] = useState(2000);
  const [mintPrice, setMintPrice] = useState(1000);
  const [contentType, setContentType] = useState<ContentType>(ContentType.INITIAL_B2C);
  const [priceUSDC, setPriceUSDC] = useState(1000);

  // Participants de test
  const participantsActive: ParticipantData[] = [
    { address: '0x1', stakeWINC: BigInt(1000 * 1e18), voteChoice: 'YES' },
    { address: '0x2', stakeWINC: BigInt(2000 * 1e18), voteChoice: 'YES' },
    { address: '0x3', stakeWINC: BigInt(500 * 1e18), voteChoice: 'NO' },
    { address: '0x4', stakeWINC: BigInt(1500 * 1e18), voteChoice: 'YES' },
    { address: '0x5', stakeWINC: BigInt(1000 * 1e18), voteChoice: 'NO' },
  ];

  const participantsPassive: ParticipantData[] = [
    { address: '0x6', stakeWINC: BigInt(3000 * 1e18), voteChoice: 'YES' },
  ];

  const {
    moderationResult,
    payoutResult,
    isLoading,
    error,
    refreshModeration,
    isDecisionFinal,
    victoryFactor,
    scores
  } = useHybridModeration({
    votesYes,
    votesNo,
    stakeYes,
    stakeNo,
    mintPriceUSDC: mintPrice,
    contentType,
    priceUSDC,
    participantsActive,
    participantsPassive,
    autoRefresh: true,
    refreshInterval: 10000 // 10 secondes
  });

  const handleScenario = (scenario: string) => {
    switch (scenario) {
      case 'whale-vs-micros':
        setVotesYes(1);
        setVotesNo(21);
        setStakeYes(48392111.75);
        setStakeNo(0.21);
        break;
      case 'community-vs-whale':
        setVotesYes(1);
        setVotesNo(21);
        setStakeYes(1000);
        setStakeNo(12600);
        break;
      case 'close-decision':
        setVotesYes(13);
        setVotesNo(12);
        setStakeYes(5500);
        setStakeNo(4500);
        break;
      case 'strong-majority':
        setVotesYes(20);
        setVotesNo(5);
        setStakeYes(9000);
        setStakeNo(1000);
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Système de Modération Hybride 50/50 - Exemple</h1>
      
      {/* Contrôles */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '20px',
        padding: '16px',
        background: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '8px'
      }}>
        <div>
          <label>Votes OUI:</label>
          <input 
            type="number" 
            value={votesYes} 
            onChange={(e) => setVotesYes(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>
        
        <div>
          <label>Votes NON:</label>
          <input 
            type="number" 
            value={votesNo} 
            onChange={(e) => setVotesNo(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>
        
        <div>
          <label>Stake OUI (WINC):</label>
          <input 
            type="number" 
            value={stakeYes} 
            onChange={(e) => setStakeYes(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>
        
        <div>
          <label>Stake NON (WINC):</label>
          <input 
            type="number" 
            value={stakeNo} 
            onChange={(e) => setStakeNo(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>
        
        <div>
          <label>MINT Price (USDC):</label>
          <input 
            type="number" 
            value={mintPrice} 
            onChange={(e) => setMintPrice(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>
        
        <div>
          <label>Content Type:</label>
          <select 
            value={contentType} 
            onChange={(e) => setContentType(e.target.value as ContentType)}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          >
            <option value={ContentType.INITIAL_B2C}>Initial B2C</option>
            <option value={ContentType.INITIAL_AGENCY_B2C}>Initial Agency B2C</option>
            <option value={ContentType.COMPLETION_PAID_B2C}>Completion Paid B2C</option>
            <option value={ContentType.COMPLETION_FREE_B2C}>Completion Free B2C</option>
          </select>
        </div>
      </div>

      {/* Scénarios prédéfinis */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Scénarios de test :</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => handleScenario('whale-vs-micros')}
            style={{ padding: '8px 16px', background: '#FF6B6B', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Whale vs Micro-stakers
          </button>
          <button 
            onClick={() => handleScenario('community-vs-whale')}
            style={{ padding: '8px 16px', background: '#4ECDC4', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Communauté vs Whale
          </button>
          <button 
            onClick={() => handleScenario('close-decision')}
            style={{ padding: '8px 16px', background: '#FFE66D', color: 'black', border: 'none', borderRadius: '4px' }}
          >
            Décision serrée
          </button>
          <button 
            onClick={() => handleScenario('strong-majority')}
            style={{ padding: '8px 16px', background: '#95E1D3', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Majorité forte
          </button>
        </div>
      </div>

      {/* Panneau de modération */}
      <ModerationProgressPanelHybrid
        stakers={votesYes + votesNo}
        stakedAmount={stakeYes + stakeNo}
        mintPrice={mintPrice}
        validVotes={votesYes}
        refuseVotes={votesNo}
        totalVotes={votesYes + votesNo}
        campaignType="creation"
        creatorType="b2c"
        stakeYes={stakeYes}
        stakeNo={stakeNo}
        participantsActive={participantsActive}
        participantsPassive={participantsPassive}
        contentType={contentType}
        priceUSDC={priceUSDC}
        style={{ marginBottom: '20px' }}
      />

      {/* Détails des scores */}
      {moderationResult && (
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.1)', 
          padding: '16px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3>Détails des scores hybrides :</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <strong>Poids démocratique :</strong>
              <div>OUI: {(scores.demYes * 100).toFixed(1)}%</div>
              <div>NON: {(scores.demNo * 100).toFixed(1)}%</div>
            </div>
            <div>
              <strong>Poids ploutocratique :</strong>
              <div>OUI: {(scores.plutoYes * 100).toFixed(1)}%</div>
              <div>NON: {(scores.plutoNo * 100).toFixed(1)}%</div>
            </div>
            <div>
              <strong>Score hybride final :</strong>
              <div>OUI: {(scores.scoreYes * 100).toFixed(1)}%</div>
              <div>NON: {(scores.scoreNo * 100).toFixed(1)}%</div>
            </div>
            <div>
              <strong>VictoryFactor :</strong>
              <div>{(victoryFactor * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Résultats des paiements */}
      {payoutResult && (
        <div style={{ 
          background: 'rgba(0, 255, 0, 0.1)', 
          padding: '16px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3>Résultats des paiements :</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <strong>Payouts (WINC) :</strong>
              {payoutResult.payouts.map((payout, index) => (
                <div key={index} style={{ fontSize: '12px' }}>
                  {payout.address.slice(0, 6)}...{payout.address.slice(-4)}: {(Number(payout.payoutWINC) / 1e18).toFixed(2)} WINC
                </div>
              ))}
            </div>
            <div>
              <strong>Penalties (WINC) :</strong>
              {payoutResult.penalties.map((penalty, index) => (
                <div key={index} style={{ fontSize: '12px' }}>
                  {penalty.address.slice(0, 6)}...{penalty.address.slice(-4)}: {(Number(penalty.lossWINC) / 1e18).toFixed(2)} WINC
                </div>
              ))}
            </div>
            <div>
              <strong>Résumé :</strong>
              <div>Total Payout: {(Number(payoutResult.summary.totalPaidWINC) / 1e18).toFixed(2)} WINC</div>
              <div>Total Penalties: {(Number(payoutResult.summary.totalPenaltiesWINC) / 1e18).toFixed(2)} WINC</div>
              <div>Active Pool: {(Number(payoutResult.summary.activePoolWINC) / 1e18).toFixed(2)} WINC</div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={refreshModeration}
          disabled={isLoading}
          style={{ 
            padding: '8px 16px', 
            background: isLoading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px' 
          }}
        >
          {isLoading ? 'Calcul...' : 'Actualiser'}
        </button>
        
        {error && (
          <div style={{ color: 'red', padding: '8px' }}>
            Erreur: {error}
          </div>
        )}
      </div>

      {/* Statut de décision */}
      <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
        <h3>Statut de la décision :</h3>
        <div>
          <strong>Finalisée :</strong> {isDecisionFinal ? 'Oui' : 'Non'}
        </div>
        <div>
          <strong>Statut :</strong> {moderationResult?.status || 'En cours...'}
        </div>
        <div>
          <strong>Gagnant :</strong> {moderationResult?.winner || 'Aucun'}
        </div>
        <div>
          <strong>Raison :</strong> {moderationResult?.reason || 'N/A'}
        </div>
      </div>
    </div>
  );
};

export default HybridModerationExample;
