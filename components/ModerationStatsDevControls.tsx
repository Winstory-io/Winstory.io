'use client';

import React, { useState, useEffect } from 'react';
import { devControlsStyles } from '@/lib/styles/devControlsStyles';

interface ModerationStatsDevControls {
  // Configuration des statistiques de modération
  stats: {
    // Nombre de modérateurs
    minModerators: number;
    maxModerators: number;
    currentModerators: number;
    
    // Montants de stake
    minStakeAmount: number;
    maxStakeAmount: number;
    currentStakeAmount: number;
    mintPrice: number;
    
    // Votes
    minValidVotes: number;
    maxValidVotes: number;
    currentValidVotes: number;
    minRefuseVotes: number;
    maxRefuseVotes: number;
    currentRefuseVotes: number;
    
    // Scores (pour les complétions)
    minAverageScore: number;
    maxAverageScore: number;
    currentAverageScore: number;
    
    // Seuils et ratios
    hybridThreshold: number; // 2:1 = 2, 3:1 = 3, etc.
    stakeThresholdMultiplier: number; // Multiplicateur pour le seuil de stake vs mint price
  };
  
  // Configuration de l'affichage
  display: {
    showDetailedStats: boolean;
    showHybridCalculation: boolean;
    showStakeComparison: boolean;
    showScoreBreakdown: boolean;
    animateNumbers: boolean;
    refreshInterval: number; // en millisecondes
  };
  
  // Configuration des couleurs et styles
  styling: {
    primaryColor: string;
    successColor: string;
    warningColor: string;
    errorColor: string;
    backgroundColor: string;
    borderColor: string;
  };
}

const DEFAULT_MODERATION_STATS_DEV_CONTROLS: ModerationStatsDevControls = {
  stats: {
    minModerators: 1,
    maxModerators: 50,
    currentModerators: 12,
    
    minStakeAmount: 1000,
    maxStakeAmount: 1000000,
    currentStakeAmount: 45000,
    mintPrice: 25000,
    
    minValidVotes: 0,
    maxValidVotes: 100,
    currentValidVotes: 8,
    minRefuseVotes: 0,
    maxRefuseVotes: 100,
    currentRefuseVotes: 4,
    
    minAverageScore: 0,
    maxAverageScore: 100,
    currentAverageScore: 75,
    
    hybridThreshold: 2,
    stakeThresholdMultiplier: 1.0,
  },
  
  display: {
    showDetailedStats: true,
    showHybridCalculation: true,
    showStakeComparison: true,
    showScoreBreakdown: true,
    animateNumbers: true,
    refreshInterval: 5000,
  },
  
  styling: {
    primaryColor: '#FFD600',
    successColor: '#00FF00',
    warningColor: '#FFD600',
    errorColor: '#FF6B6B',
    backgroundColor: '#0a0a0a',
    borderColor: '#6B5A20',
  },
};

interface ModerationStatsDevControlsProps {
  isOpen: boolean;
  onClose: () => void;
  onStatsUpdate?: (stats: Partial<ModerationStatsDevControls['stats']>) => void;
}

const ModerationStatsDevControls: React.FC<ModerationStatsDevControlsProps> = ({
  isOpen,
  onClose,
  onStatsUpdate
}) => {
  const [config, setConfig] = useState<ModerationStatsDevControls>(DEFAULT_MODERATION_STATS_DEV_CONTROLS);
  const [activeTab, setActiveTab] = useState<'stats' | 'display' | 'styling'>('stats');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Charger la configuration depuis le localStorage ou l'API
    const savedConfig = localStorage.getItem('moderation-stats-dev-controls');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
      }
    }
  }, []);

  const handleConfigChange = (path: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i] as keyof typeof current] as any;
      }
      
      current[keys[keys.length - 1] as keyof typeof current] = value;
      return newConfig;
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem('moderation-stats-dev-controls', JSON.stringify(config));
    setHasChanges(false);
    
    // Notifier le composant parent des changements de stats
    if (onStatsUpdate) {
      onStatsUpdate(config.stats);
    }
    
    console.log('📊 Configuration des statistiques de modération sauvegardée:', config);
  };

  const handleReset = () => {
    setConfig(DEFAULT_MODERATION_STATS_DEV_CONTROLS);
    setHasChanges(true);
  };

  const renderStatsTab = () => (
    <div style={devControlsStyles.container}>
      <h3 style={devControlsStyles.sectionTitle}>
        📊 Statistiques de Modération
      </h3>
      
      <div style={devControlsStyles.grid}>
        <div>
          <h4 style={devControlsStyles.subsectionTitle}>Modérateurs</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={devControlsStyles.label}>Modérateurs actuels</label>
              <input
                type="number"
                value={config.stats.currentModerators}
                onChange={(e) => handleConfigChange('stats.currentModerators', parseInt(e.target.value))}
                style={devControlsStyles.input}
                min={config.stats.minModerators}
                max={config.stats.maxModerators}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <label style={devControlsStyles.label}>Min</label>
                <input
                  type="number"
                  value={config.stats.minModerators}
                  onChange={(e) => handleConfigChange('stats.minModerators', parseInt(e.target.value))}
                  style={devControlsStyles.input}
                  min="1"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={devControlsStyles.label}>Max</label>
                <input
                  type="number"
                  value={config.stats.maxModerators}
                  onChange={(e) => handleConfigChange('stats.maxModerators', parseInt(e.target.value))}
                  style={devControlsStyles.input}
                  min="1"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 style={devControlsStyles.subsectionTitle}>Stake & Mint</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={devControlsStyles.label}>Stake actuel (WINC)</label>
              <input
                type="number"
                value={config.stats.currentStakeAmount}
                onChange={(e) => handleConfigChange('stats.currentStakeAmount', parseInt(e.target.value))}
                style={devControlsStyles.input}
                min="0"
              />
            </div>
            <div>
              <label style={devControlsStyles.label}>Prix MINT (WINC)</label>
              <input
                type="number"
                value={config.stats.mintPrice}
                onChange={(e) => handleConfigChange('stats.mintPrice', parseInt(e.target.value))}
                style={devControlsStyles.input}
                min="0"
              />
            </div>
            <div>
              <label style={devControlsStyles.label}>Multiplicateur seuil</label>
              <input
                type="number"
                value={config.stats.stakeThresholdMultiplier}
                onChange={(e) => handleConfigChange('stats.stakeThresholdMultiplier', parseFloat(e.target.value))}
                style={devControlsStyles.input}
                min="0.1"
                max="5"
                step="0.1"
              />
            </div>
          </div>
        </div>

        <div>
          <h4 style={devControlsStyles.subsectionTitle}>Votes</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={devControlsStyles.label}>Votes Valid</label>
              <input
                type="number"
                value={config.stats.currentValidVotes}
                onChange={(e) => handleConfigChange('stats.currentValidVotes', parseInt(e.target.value))}
                style={devControlsStyles.input}
                min="0"
              />
            </div>
            <div>
              <label style={devControlsStyles.label}>Votes Refuse</label>
              <input
                type="number"
                value={config.stats.currentRefuseVotes}
                onChange={(e) => handleConfigChange('stats.currentRefuseVotes', parseInt(e.target.value))}
                style={devControlsStyles.input}
                min="0"
              />
            </div>
            <div>
              <label style={devControlsStyles.label}>Seuil Hybrid (ratio)</label>
              <input
                type="number"
                value={config.stats.hybridThreshold}
                onChange={(e) => handleConfigChange('stats.hybridThreshold', parseInt(e.target.value))}
                style={devControlsStyles.input}
                min="1"
                max="10"
              />
            </div>
          </div>
        </div>

        <div>
          <h4 style={devControlsStyles.subsectionTitle}>Scores (Complétions)</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={devControlsStyles.label}>Score moyen actuel</label>
              <input
                type="number"
                value={config.stats.currentAverageScore}
                onChange={(e) => handleConfigChange('stats.currentAverageScore', parseInt(e.target.value))}
                style={devControlsStyles.input}
                min="0"
                max="100"
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <label style={devControlsStyles.label}>Min</label>
                <input
                  type="number"
                  value={config.stats.minAverageScore}
                  onChange={(e) => handleConfigChange('stats.minAverageScore', parseInt(e.target.value))}
                  style={devControlsStyles.input}
                  min="0"
                  max="100"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={devControlsStyles.label}>Max</label>
                <input
                  type="number"
                  value={config.stats.maxAverageScore}
                  onChange={(e) => handleConfigChange('stats.maxAverageScore', parseInt(e.target.value))}
                  style={devControlsStyles.input}
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDisplayTab = () => (
    <div style={devControlsStyles.container}>
      <h3 style={devControlsStyles.sectionTitle}>
        🎨 Affichage des Statistiques
      </h3>
      
      <div style={devControlsStyles.grid}>
        <div>
          <h4 style={devControlsStyles.subsectionTitle}>Options d'affichage</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={devControlsStyles.checkbox}>
              <input
                type="checkbox"
                checked={config.display.showDetailedStats}
                onChange={(e) => handleConfigChange('display.showDetailedStats', e.target.checked)}
                style={{ accentColor: '#FFD600' }}
              />
              <span>Afficher les statistiques détaillées</span>
            </label>
            
            <label style={devControlsStyles.checkbox}>
              <input
                type="checkbox"
                checked={config.display.showHybridCalculation}
                onChange={(e) => handleConfigChange('display.showHybridCalculation', e.target.checked)}
                style={{ accentColor: '#FFD600' }}
              />
              <span>Afficher le calcul Hybrid 50/50</span>
            </label>
            
            <label style={devControlsStyles.checkbox}>
              <input
                type="checkbox"
                checked={config.display.showStakeComparison}
                onChange={(e) => handleConfigChange('display.showStakeComparison', e.target.checked)}
                style={{ accentColor: '#FFD600' }}
              />
              <span>Afficher la comparaison Stake vs MINT</span>
            </label>
            
            <label style={devControlsStyles.checkbox}>
              <input
                type="checkbox"
                checked={config.display.showScoreBreakdown}
                onChange={(e) => handleConfigChange('display.showScoreBreakdown', e.target.checked)}
                style={{ accentColor: '#FFD600' }}
              />
              <span>Afficher la répartition des scores</span>
            </label>
            
            <label style={devControlsStyles.checkbox}>
              <input
                type="checkbox"
                checked={config.display.animateNumbers}
                onChange={(e) => handleConfigChange('display.animateNumbers', e.target.checked)}
                style={{ accentColor: '#FFD600' }}
              />
              <span>Animer les nombres</span>
            </label>
          </div>
        </div>

        <div>
          <h4 style={devControlsStyles.subsectionTitle}>Rafraîchissement</h4>
          <div>
            <label style={devControlsStyles.label}>Intervalle de rafraîchissement (ms)</label>
            <input
              type="number"
              value={config.display.refreshInterval}
              onChange={(e) => handleConfigChange('display.refreshInterval', parseInt(e.target.value))}
              style={devControlsStyles.input}
              min="1000"
              max="60000"
              step="1000"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStylingTab = () => (
    <div style={devControlsStyles.container}>
      <h3 style={devControlsStyles.sectionTitle}>
        🎨 Style et Couleurs
      </h3>
      
      <div style={devControlsStyles.grid}>
        <div>
          <h4 style={devControlsStyles.subsectionTitle}>Couleurs principales</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={devControlsStyles.label}>Couleur primaire</label>
              <input
                type="color"
                value={config.styling.primaryColor}
                onChange={(e) => handleConfigChange('styling.primaryColor', e.target.value)}
                style={{ ...devControlsStyles.input, height: '40px' }}
              />
            </div>
            
            <div>
              <label style={devControlsStyles.label}>Couleur de succès</label>
              <input
                type="color"
                value={config.styling.successColor}
                onChange={(e) => handleConfigChange('styling.successColor', e.target.value)}
                style={{ ...devControlsStyles.input, height: '40px' }}
              />
            </div>
            
            <div>
              <label style={devControlsStyles.label}>Couleur d'avertissement</label>
              <input
                type="color"
                value={config.styling.warningColor}
                onChange={(e) => handleConfigChange('styling.warningColor', e.target.value)}
                style={{ ...devControlsStyles.input, height: '40px' }}
              />
            </div>
            
            <div>
              <label style={devControlsStyles.label}>Couleur d'erreur</label>
              <input
                type="color"
                value={config.styling.errorColor}
                onChange={(e) => handleConfigChange('styling.errorColor', e.target.value)}
                style={{ ...devControlsStyles.input, height: '40px' }}
              />
            </div>
          </div>
        </div>

        <div>
          <h4 style={devControlsStyles.subsectionTitle}>Arrière-plan</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={devControlsStyles.label}>Couleur de fond</label>
              <input
                type="color"
                value={config.styling.backgroundColor}
                onChange={(e) => handleConfigChange('styling.backgroundColor', e.target.value)}
                style={{ ...devControlsStyles.input, height: '40px' }}
              />
            </div>
            
            <div>
              <label style={devControlsStyles.label}>Couleur de bordure</label>
              <input
                type="color"
                value={config.styling.borderColor}
                onChange={(e) => handleConfigChange('styling.borderColor', e.target.value)}
                style={{ ...devControlsStyles.input, height: '40px' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: '#0a0a0a',
        border: '1px solid #6B5A20',
        borderRadius: 16,
        width: '100%',
        maxWidth: '1000px',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 6px 24px rgba(0,0,0,0.5)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid #6B5A20',
          background: 'rgba(255, 215, 0, 0.05)'
        }}>
          <h2 style={{
            color: '#FFD600',
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            📊 Dev Controls - Moderation Statistics
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#C0C0C0',
              fontSize: '24px',
              cursor: 'pointer',
              fontWeight: 'bold',
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFD600';
              e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#C0C0C0';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #6B5A20',
          background: 'rgba(255, 215, 0, 0.02)'
        }}>
          {[
            { key: 'stats', label: '📊 Statistiques' },
            { key: 'display', label: '🎨 Affichage' },
            { key: 'styling', label: '🎨 Style' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: '600',
                background: 'transparent',
                border: 'none',
                color: activeTab === tab.key ? '#FFD600' : '#C0C0C0',
                cursor: 'pointer',
                borderBottom: activeTab === tab.key ? '2px solid #FFD600' : '2px solid transparent',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.key) {
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.key) {
                  e.currentTarget.style.color = '#C0C0C0';
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px',
          background: 'radial-gradient(ellipse at center, #000000 0%, #0a0a0a 100%)'
        }}>
          {activeTab === 'stats' && renderStatsTab()}
          {activeTab === 'display' && renderDisplayTab()}
          {activeTab === 'styling' && renderStylingTab()}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderTop: '1px solid #6B5A20',
          background: 'rgba(255, 215, 0, 0.05)'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#C0C0C0'
          }}>
            {hasChanges ? 'Modifications non sauvegardées' : 'Toutes les modifications sont sauvegardées'}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleReset}
              style={devControlsStyles.button}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, devControlsStyles.buttonHover);
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, devControlsStyles.button);
              }}
            >
              Réinitialiser
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              style={{
                ...devControlsStyles.button,
                background: hasChanges ? '#FFD600' : '#666',
                color: hasChanges ? '#000000' : '#999',
                border: 'none',
                cursor: hasChanges ? 'pointer' : 'not-allowed',
                opacity: hasChanges ? 1 : 0.5
              }}
              onMouseEnter={(e) => {
                if (hasChanges) {
                  Object.assign(e.currentTarget.style, devControlsStyles.buttonPrimaryHover);
                }
              }}
              onMouseLeave={(e) => {
                if (hasChanges) {
                  Object.assign(e.currentTarget.style, devControlsStyles.buttonPrimary);
                }
              }}
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModerationStatsDevControls;
