'use client';

import React, { useState, useEffect } from 'react';
import { getUnifiedRewardConfig, validateRewardConfig } from '@/lib/rewards-manager';

interface RewardDistributionStatusProps {
  onDistributionComplete?: (results: any) => void;
}

export default function RewardDistributionStatus({ onDistributionComplete }: RewardDistributionStatusProps) {
  const [unifiedConfig, setUnifiedConfig] = useState<any>(null);
  const [validation, setValidation] = useState<any>(null);
  const [distributionStatus, setDistributionStatus] = useState<'idle' | 'checking' | 'ready' | 'distributing' | 'completed' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    const config = getUnifiedRewardConfig();
    if (config) {
      setUnifiedConfig(config);
      const validationResult = validateRewardConfig(config);
      setValidation(validationResult);
      
      if (validationResult.isValid) {
        setDistributionStatus('ready');
        setStatusMessage('Rewards configuration is valid and ready for distribution');
      } else {
        setDistributionStatus('error');
        setStatusMessage(`Configuration errors: ${validationResult.errors.join(', ')}`);
      }
    } else {
      setDistributionStatus('idle');
      setStatusMessage('No reward configuration found');
    }
  }, []);

  const getStatusColor = () => {
    switch (distributionStatus) {
      case 'ready':
        return '#00C46C';
      case 'distributing':
        return '#FFD600';
      case 'completed':
        return '#00C46C';
      case 'error':
        return '#FF2D2D';
      default:
        return '#666';
    }
  };

  const getStatusIcon = () => {
    switch (distributionStatus) {
      case 'ready':
        return '✅';
      case 'distributing':
        return '🔄';
      case 'completed':
        return '🎉';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  if (!unifiedConfig) {
    return null;
  }

  return (
    <div style={{ 
      border: `2px solid ${getStatusColor()}`, 
      borderRadius: 16, 
      padding: 20, 
      background: 'rgba(0,0,0,0.8)',
      marginBottom: 24
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: 16,
        gap: 12
      }}>
        <span style={{ fontSize: 24 }}>{getStatusIcon()}</span>
        <h3 style={{ 
          color: getStatusColor(), 
          fontWeight: 700, 
          fontSize: 18, 
          margin: 0 
        }}>
          Multi-Blockchain Reward Distribution
        </h3>
      </div>

      <div style={{ color: '#fff', fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
        {statusMessage}
      </div>

      {/* Configuration Summary */}
      <div style={{ 
        background: 'rgba(255,255,255,0.05)', 
        borderRadius: 12, 
        padding: 16,
        marginBottom: 16
      }}>
        <div style={{ color: '#FFD600', fontWeight: 600, marginBottom: 12 }}>
          Configuration Summary:
        </div>
        
        {unifiedConfig.standard && (
          <div style={{ marginBottom: 8, fontSize: 13 }}>
            <span style={{ color: '#00C46C' }}>Standard Rewards:</span> {unifiedConfig.standard.name} on {unifiedConfig.standard.blockchain}
            <br />
            <span style={{ fontSize: 12, color: '#aaa' }}>
              {unifiedConfig.standard.amountPerUser} per completer × {unifiedConfig.maxCompletions} completers
            </span>
          </div>
        )}
        
        {unifiedConfig.premium && (
          <div style={{ marginBottom: 8, fontSize: 13 }}>
            <div style={{ marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: '#FFD600' }}>Premium Rewards:</span> {unifiedConfig.premium.name} on {unifiedConfig.premium.blockchain}
              <br />
              <span style={{ fontSize: 12, color: '#aaa' }}>
                {unifiedConfig.premium.amountPerUser} per winner × 3 winners
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Validation Details */}
      {validation && (
        <div style={{ 
          background: validation.isValid ? 'rgba(0,196,108,0.1)' : 'rgba(255,45,45,0.1)', 
          borderRadius: 12, 
          padding: 16,
          border: `1px solid ${validation.isValid ? '#00C46C' : '#FF2D2D'}`
        }}>
          <div style={{ 
            color: validation.isValid ? '#00C46C' : '#FF2D2D', 
            fontWeight: 600, 
            marginBottom: 8 
          }}>
            {validation.isValid ? '✅ Configuration Valid' : '❌ Configuration Invalid'}
          </div>
          
          {validation.errors.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ color: '#FF2D2D', fontWeight: 600, fontSize: 12, marginBottom: 4 }}>
                Errors:
              </div>
              {validation.errors.map((error: string, index: number) => (
                <div key={index} style={{ color: '#FF2D2D', fontSize: 12, marginLeft: 8 }}>
                  • {error}
                </div>
              ))}
            </div>
          )}
          
          {validation.warnings.length > 0 && (
            <div>
              <div style={{ color: '#FFD600', fontWeight: 600, fontSize: 12, marginBottom: 4 }}>
                Warnings:
              </div>
              {validation.warnings.map((warning: string, index: number) => (
                <div key={index} style={{ color: '#FFD600', fontSize: 12, marginLeft: 8 }}>
                  • {warning}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Distribution Instructions */}
      {distributionStatus === 'ready' && (
        <div style={{ 
          background: 'rgba(0,196,108,0.1)', 
          borderRadius: 12, 
          padding: 16,
          border: '1px solid #00C46C',
          marginTop: 16
        }}>
          <div style={{ color: '#00C46C', fontWeight: 600, marginBottom: 8 }}>
            🚀 Ready for Distribution
          </div>
          <div style={{ color: '#fff', fontSize: 13, lineHeight: 1.4 }}>
            When completers finish your campaign, Winstory will automatically:
            <br />• Distribute {unifiedConfig.standard?.name || 'standard rewards'} on {unifiedConfig.standard?.blockchain || 'blockchain A'}
            <br />• Distribute {unifiedConfig.premium?.name || 'premium rewards'} on {unifiedConfig.premium?.blockchain || 'blockchain B'}
            <br />• Handle all gas fees and transaction management
          </div>
        </div>
      )}
    </div>
  );
} 