import React from 'react';
import { RewardConfig } from '../lib/hooks/useRewards';
import { getContractExplorerUrl, formatAmount } from '../lib/blockchain';
import { useWalletAddress } from '../lib/hooks/useWalletConnection';

interface RewardsSummaryProps {
  standard: RewardConfig | null;
  premium: RewardConfig | null;
  maxCompletions: number;
  onProceed: () => void;
  onEdit: (type: 'standard' | 'premium') => void;
}

export default function RewardsSummary({ 
  standard, 
  premium, 
  maxCompletions, 
  onProceed, 
  onEdit 
}: RewardsSummaryProps) {
  const walletAddress = useWalletAddress();
  const isStandardValid = standard && standard.isValid && standard.hasEnoughBalance;
  const isPremiumValid = premium && premium.isValid && premium.hasEnoughBalance;
  const canProceed = isStandardValid || isPremiumValid;

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'token': return '🪙';
      case 'item': return '👾';
      case 'digital': return '🎫';
      case 'physical': return '📦';
      default: return '🎁';
    }
  };

  const getBlockchainIcon = (blockchain: string) => {
    switch (blockchain) {
      case 'Ethereum': return '🔷';
      case 'Polygon': return '🟣';
      case 'BNB Chain': return '🟡';
      case 'Avalanche': return '🔴';
      case 'Solana': return '🟢';
      case 'Bitcoin': return '🟠';
      default: return '⚪';
    }
  };

  const formatContractAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRewardTypeName = (type: string) => {
    switch (type) {
      case 'token': return 'Tokens';
      case 'item': return 'Items';
      case 'digital': return 'Digital Access';
      case 'physical': return 'Physical Items';
      default: return 'Rewards';
    }
  };

  const getValidationStatus = (reward: RewardConfig) => {
    if (!walletAddress) return { status: 'error', message: 'Wallet not connected' };
    if (!reward.hasEnoughBalance) return { status: 'error', message: 'Insufficient balance' };
    if (reward.contractAddress && !reward.tokenInfo && !reward.itemInfo) return { status: 'warning', message: 'Contract not validated' };
    return { status: 'success', message: 'Ready for distribution' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#00C46C';
      case 'warning': return '#FFD600';
      case 'error': return '#ff6b6b';
      default: return '#666';
    }
  };

  const estimatedTotalCost = standard && standard.isValid ? parseFloat(standard.totalAmount) * maxCompletions : 0 +
    (premium && premium.isValid ? parseFloat(premium.totalAmount) * 3 : 0);

  return (
    <div style={{ 
      background: 'rgba(0, 0, 0, 0.8)', 
      borderRadius: 16, 
      padding: 24, 
      border: '2px solid #FFD600',
      marginTop: 24
    }}>
      <h3 style={{ 
        color: '#FFD600', 
        fontWeight: 800, 
        fontSize: 24, 
        marginBottom: 20,
        textAlign: 'center'
      }}>
        🎯 Rewards Configuration Summary
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Wallet Status */}
        <div style={{ marginBottom: 16 }}>
          {walletAddress ? (
            <div style={{
              background: 'rgba(0, 196, 108, 0.1)',
              padding: 12,
              borderRadius: 8,
              border: '1px solid #00C46C',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ color: '#00C46C', fontSize: 16 }}>✅</span>
              <div>
                <div style={{ color: '#00C46C', fontWeight: 600, fontSize: 14 }}>
                  Wallet Connected
                </div>
                <div style={{ color: '#fff', fontSize: 12 }}>
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(255, 107, 107, 0.1)',
              padding: 12,
              borderRadius: 8,
              border: '1px solid #ff6b6b',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ color: '#ff6b6b', fontSize: 16 }}>⚠️</span>
              <div style={{ color: '#ff6b6b', fontWeight: 600 }}>
                Wallet not connected - Connect wallet to validate balances
              </div>
            </div>
          )}
        </div>

        {/* Standard Rewards */}
        <div style={{ 
          background: 'rgba(100, 181, 246, 0.1)', 
          borderRadius: 12, 
          padding: 16,
          border: `2px solid ${isStandardValid ? '#64B5F6' : '#666'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ color: '#64B5F6', fontWeight: 700, fontSize: 18 }}>
              Standard Rewards
            </h4>
            <button 
              onClick={() => onEdit('standard')}
              style={{
                background: 'none',
                border: '1px solid #64B5F6',
                color: '#64B5F6',
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Edit
            </button>
          </div>

          {standard ? (
            <div style={{ color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{getRewardIcon(standard.type)}</span>
                <span style={{ fontWeight: 600 }}>{standard.name}</span>
                <span style={{ fontSize: 16 }}>{getBlockchainIcon(standard.blockchain)}</span>
                <span style={{ fontSize: 12, color: '#aaa' }}>{standard.standard}</span>
              </div>
              
              <div style={{ fontSize: 14, marginBottom: 8 }}>
                <div>Contract: {formatContractAddress(standard.contractAddress)}</div>
                <div>Amount per user: {standard.amountPerUser}</div>
                <div>Total needed: {standard.totalAmount}</div>
                <div>Recipients: {standard.type === 'token' || standard.type === 'item' ? maxCompletions : 'All validated'}</div>
              </div>

              {standard.tokenInfo && (
                <div style={{ 
                  background: 'rgba(255, 215, 0, 0.1)', 
                  padding: 8, 
                  borderRadius: 6,
                  fontSize: 12
                }}>
                  <div>Balance: {formatAmount(standard.tokenInfo.balance, standard.tokenInfo.decimals, standard.tokenInfo.symbol)}</div>
                  <div>Decimals: {standard.tokenInfo.decimals}</div>
                </div>
              )}

              {standard.itemInfo && (
                <div style={{ 
                  background: 'rgba(255, 215, 0, 0.1)', 
                  padding: 8, 
                  borderRadius: 6,
                  fontSize: 12
                }}>
                  <div>Balance: {formatAmount(standard.itemInfo.balance, standard.itemInfo.decimals, standard.itemInfo.symbol)}</div>
                  <div>Type: {standard.itemInfo.tokenType}</div>
                </div>
              )}

              <div style={{ 
                marginTop: 8, 
                padding: 8, 
                borderRadius: 6,
                background: standard.hasEnoughBalance ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                border: `1px solid ${standard.hasEnoughBalance ? '#4CAF50' : '#f44336'}`
              }}>
                <span style={{ 
                  color: standard.hasEnoughBalance ? '#4CAF50' : '#f44336',
                  fontWeight: 600
                }}>
                  {standard.hasEnoughBalance ? '✅ Sufficient balance' : '❌ Insufficient balance'}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ color: '#666', fontStyle: 'italic' }}>
              No standard reward configured
            </div>
          )}
        </div>

        {/* Premium Rewards */}
        <div style={{ 
          background: 'rgba(255, 215, 0, 0.1)', 
          borderRadius: 12, 
          padding: 16,
          border: `2px solid ${isPremiumValid ? '#FFD700' : '#666'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ color: '#FFD700', fontWeight: 700, fontSize: 18 }}>
              Premium Rewards
            </h4>
            <button 
              onClick={() => onEdit('premium')}
              style={{
                background: 'none',
                border: '1px solid #FFD700',
                color: '#FFD700',
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Edit
            </button>
          </div>

          {premium ? (
            <div style={{ color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{getRewardIcon(premium.type)}</span>
                <span style={{ fontWeight: 600 }}>{premium.name}</span>
                <span style={{ fontSize: 16 }}>{getBlockchainIcon(premium.blockchain)}</span>
                <span style={{ fontSize: 12, color: '#aaa' }}>{premium.standard}</span>
              </div>
              
              <div style={{ fontSize: 14, marginBottom: 8 }}>
                <div>Contract: {formatContractAddress(premium.contractAddress)}</div>
                <div>Amount per user: {premium.amountPerUser}</div>
                <div>Total needed: {premium.totalAmount}</div>
                <div>Recipients: 3 best completers</div>
              </div>

              {premium.tokenInfo && (
                <div style={{ 
                  background: 'rgba(255, 215, 0, 0.1)', 
                  padding: 8, 
                  borderRadius: 6,
                  fontSize: 12
                }}>
                  <div>Balance: {formatAmount(premium.tokenInfo.balance, premium.tokenInfo.decimals, premium.tokenInfo.symbol)}</div>
                  <div>Decimals: {premium.tokenInfo.decimals}</div>
                </div>
              )}

              {premium.itemInfo && (
                <div style={{ 
                  background: 'rgba(255, 215, 0, 0.1)', 
                  padding: 8, 
                  borderRadius: 6,
                  fontSize: 12
                }}>
                  <div>Balance: {formatAmount(premium.itemInfo.balance, premium.itemInfo.decimals, premium.itemInfo.symbol)}</div>
                  <div>Type: {premium.itemInfo.tokenType}</div>
                </div>
              )}

              <div style={{ 
                marginTop: 8, 
                padding: 8, 
                borderRadius: 6,
                background: premium.hasEnoughBalance ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                border: `1px solid ${premium.hasEnoughBalance ? '#4CAF50' : '#f44336'}`
              }}>
                <span style={{ 
                  color: premium.hasEnoughBalance ? '#4CAF50' : '#f44336',
                  fontWeight: 600
                }}>
                  {premium.hasEnoughBalance ? '✅ Sufficient balance' : '❌ Insufficient balance'}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ color: '#666', fontStyle: 'italic' }}>
              No premium reward configured
            </div>
          )}
        </div>

        {/* Summary */}
        <div style={{ 
          background: 'rgba(0, 196, 108, 0.1)', 
          borderRadius: 12, 
          padding: 16,
          border: '2px solid #00C46C'
        }}>
          <h4 style={{ color: '#00C46C', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
            📊 Distribution Summary
          </h4>
          
          <div style={{ color: '#fff', fontSize: 14 }}>
            <div>Maximum completions: {maxCompletions}</div>
            <div>Standard recipients: {maxCompletions}</div>
            <div>Premium recipients: 3</div>
            <div style={{ marginTop: 8, fontWeight: 600 }}>
              Total distribution value: {
                (standard && standard.isValid ? parseFloat(standard.totalAmount) : 0) +
                (premium && premium.isValid ? parseFloat(premium.totalAmount) : 0)
              }
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onProceed}
          disabled={!canProceed}
          style={{
            background: canProceed ? '#00C46C' : '#666',
            color: '#fff',
            border: 'none',
            padding: '16px 32px',
            borderRadius: 8,
            fontSize: 18,
            fontWeight: 700,
            cursor: canProceed ? 'pointer' : 'not-allowed',
            width: '100%',
            marginTop: 16
          }}
        >
          {canProceed ? '🚀 Proceed to MINT' : '⚠️ Complete reward configuration'}
        </button>

        {!canProceed && (
          <div style={{ 
            color: '#FFD600', 
            fontSize: 14, 
            textAlign: 'center',
            marginTop: 8
          }}>
            Please configure at least one valid reward with sufficient balance
          </div>
        )}

        {/* Cost Estimation */}
        <div style={{
          background: 'rgba(255, 215, 0, 0.1)',
          padding: 16,
          borderRadius: 8,
          border: '1px solid #FFD600',
          marginTop: 16
        }}>
          <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
            💰 Estimated Total Cost
          </div>
          <div style={{ color: '#fff', fontSize: 14 }}>
            <div>Standard: {standard && standard.isValid ? standard.amountPerUser * maxCompletions : 0} tokens/items</div>
            <div>Premium: {premium && premium.isValid ? premium.amountPerUser * 3 : 0} tokens/items</div>
            <div style={{ 
              color: '#FFD600', 
              fontWeight: 700, 
              fontSize: 16, 
              marginTop: 8,
              borderTop: '1px solid #FFD600',
              paddingTop: 8
            }}>
              Total: {estimatedTotalCost} tokens/items
            </div>
          </div>
        </div>

        {/* Validation Summary */}
        <div style={{ marginTop: 16 }}>
          {!walletAddress ? (
            <div style={{
              background: 'rgba(255, 107, 107, 0.1)',
              padding: 12,
              borderRadius: 8,
              border: '1px solid #ff6b6b',
              color: '#ff6b6b',
              fontWeight: 600,
              textAlign: 'center'
            }}>
              ⚠️ Connect wallet to validate balances and complete configuration
            </div>
          ) : (
            <div style={{
              background: 'rgba(0, 196, 108, 0.1)',
              padding: 12,
              borderRadius: 8,
              border: '1px solid #00C46C',
              color: '#00C46C',
              fontWeight: 600,
              textAlign: 'center'
            }}>
              ✅ Configuration ready for campaign launch
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 