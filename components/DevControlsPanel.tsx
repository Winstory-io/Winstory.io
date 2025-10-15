import React, { useState, useEffect } from 'react';
import { useModerationDevControls } from '@/lib/hooks/useModerationDevControlsClient';

interface DevControlsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const DevControlsPanel: React.FC<DevControlsPanelProps> = ({ isOpen, onClose }) => {
  const { config, updateConfig, isLoading, error } = useModerationDevControls();
  const [activeTab, setActiveTab] = useState<'engine' | 'ui' | 'messages' | 'theme' | 'features'>('engine');
  const [localConfig, setLocalConfig] = useState(config);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
    setHasChanges(false);
  }, [config]);

  const handleConfigChange = (path: string, value: any) => {
    const newConfig = { ...localConfig };
    const keys = path.split('.');
    let current = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setLocalConfig(newConfig);
    setHasChanges(true);
  };

  const handleSave = async () => {
    await updateConfig(localConfig);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalConfig(config);
    setHasChanges(false);
  };

  const renderEngineTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h3 style={{ 
        fontSize: '20px', 
        fontWeight: '600', 
        color: '#FFD600',
        margin: 0,
        paddingBottom: '12px',
        borderBottom: '1px solid #6B5A20'
      }}>
        Moteur de Modération
      </h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#C0C0C0',
            marginBottom: '8px'
          }}>
            Nombre minimum de votants
          </label>
          <input
            type="number"
            value={localConfig.engine.minVoters}
            onChange={(e) => handleConfigChange('engine.minVoters', parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '12px',
              background: '#111',
              border: '1px solid #6B5A20',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#FFD600';
              e.target.style.boxShadow = '0 0 0 2px rgba(255, 215, 0, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#6B5A20';
              e.target.style.boxShadow = 'none';
            }}
            min="1"
          />
        </div>
        
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#C0C0C0',
            marginBottom: '8px'
          }}>
            Ratio de seuil (2:1)
          </label>
          <input
            type="number"
            value={localConfig.engine.thresholdRatio}
            onChange={(e) => handleConfigChange('engine.thresholdRatio', parseFloat(e.target.value))}
            style={{
              width: '100%',
              padding: '12px',
              background: '#111',
              border: '1px solid #6B5A20',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#FFD600';
              e.target.style.boxShadow = '0 0 0 2px rgba(255, 215, 0, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#6B5A20';
              e.target.style.boxShadow = 'none';
            }}
            min="1"
            step="0.1"
          />
        </div>
        
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#C0C0C0',
            marginBottom: '8px'
          }}>
            Fenêtre de vote (heures)
          </label>
          <input
            type="number"
            value={localConfig.engine.voteWindowHours}
            onChange={(e) => handleConfigChange('engine.voteWindowHours', parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '12px',
              background: '#111',
              border: '1px solid #6B5A20',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#FFD600';
              e.target.style.boxShadow = '0 0 0 2px rgba(255, 215, 0, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#6B5A20';
              e.target.style.boxShadow = 'none';
            }}
            min="1"
          />
        </div>
        
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#C0C0C0',
            marginBottom: '8px'
          }}>
            Intervalle de rafraîchissement (ms)
          </label>
          <input
            type="number"
            value={localConfig.engine.refreshIntervalMs}
            onChange={(e) => handleConfigChange('engine.refreshIntervalMs', parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '12px',
              background: '#111',
              border: '1px solid #6B5A20',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#FFD600';
              e.target.style.boxShadow = '0 0 0 2px rgba(255, 215, 0, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#6B5A20';
              e.target.style.boxShadow = 'none';
            }}
            min="1000"
          />
        </div>
      </div>
      
      <div>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#C0C0C0',
          marginBottom: '8px'
        }}>
          Politique de résolution automatique
        </label>
        <select
          value={localConfig.engine.autoResolvePolicy}
          onChange={(e) => handleConfigChange('engine.autoResolvePolicy', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            background: '#111',
            border: '1px solid #6B5A20',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#FFD600';
            e.target.style.boxShadow = '0 0 0 2px rgba(255, 215, 0, 0.2)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#6B5A20';
            e.target.style.boxShadow = 'none';
          }}
        >
          <option value="escalate">Escalade</option>
          <option value="extend_by_hours">Extension</option>
          <option value="auto_accept">Acceptation automatique</option>
          <option value="auto_reject">Rejet automatique</option>
        </select>
      </div>
    </div>
  );

  const renderUITab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h3 style={{ 
        fontSize: '20px', 
        fontWeight: '600', 
        color: '#FFD600',
        margin: 0,
        paddingBottom: '12px',
        borderBottom: '1px solid #6B5A20'
      }}>
        Interface Utilisateur
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: '500', 
          color: '#C0C0C0',
          margin: 0
        }}>
          Bulles
        </h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#C0C0C0',
              marginBottom: '8px'
            }}>
              Taille par défaut
            </label>
            <input
              type="number"
              value={localConfig.ui.bubbles.defaultSize}
              onChange={(e) => handleConfigChange('ui.bubbles.defaultSize', parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '12px',
                background: '#111',
                border: '1px solid #6B5A20',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#FFD600';
                e.target.style.boxShadow = '0 0 0 2px rgba(255, 215, 0, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#6B5A20';
                e.target.style.boxShadow = 'none';
              }}
              min="10"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Espacement
            </label>
            <input
              type="number"
              value={localConfig.ui.bubbles.defaultGap}
              onChange={(e) => handleConfigChange('ui.bubbles.defaultGap', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Taille de police
            </label>
            <input
              type="number"
              value={localConfig.ui.bubbles.fontSize}
              onChange={(e) => handleConfigChange('ui.bubbles.fontSize', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              min="8"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Échelle au survol
            </label>
            <input
              type="number"
              value={localConfig.ui.bubbles.animations.hoverScale}
              onChange={(e) => handleConfigChange('ui.bubbles.animations.hoverScale', parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              min="1"
              max="2"
              step="0.1"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-300">Boutons</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Padding
            </label>
            <input
              type="text"
              value={localConfig.ui.buttons.padding}
              onChange={(e) => handleConfigChange('ui.buttons.padding', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              placeholder="14px 24px"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Taille de police
            </label>
            <input
              type="number"
              value={localConfig.ui.buttons.fontSize}
              onChange={(e) => handleConfigChange('ui.buttons.fontSize', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              min="8"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rayon de bordure
            </label>
            <input
              type="text"
              value={localConfig.ui.buttons.borderRadius}
              onChange={(e) => handleConfigChange('ui.buttons.borderRadius', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              placeholder="10px"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-300">Panneau de progression</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Largeur minimale
            </label>
            <input
              type="text"
              value={localConfig.ui.progressPanel.minWidth}
              onChange={(e) => handleConfigChange('ui.progressPanel.minWidth', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              placeholder="340px"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Hauteur maximale
            </label>
            <input
              type="text"
              value={localConfig.ui.progressPanel.maxHeight}
              onChange={(e) => handleConfigChange('ui.progressPanel.maxHeight', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
              placeholder="55vh"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderMessagesTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-yellow-400">Messages et Textes</h3>
      
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-300">Validation - Histoires initiales</h4>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Titre
          </label>
          <input
            type="text"
            value={localConfig.messages.validation.initial.title}
            onChange={(e) => handleConfigChange('messages.validation.initial.title', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={localConfig.messages.validation.initial.description}
            onChange={(e) => handleConfigChange('messages.validation.initial.description', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
            rows={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Critères (un par ligne)
          </label>
          <textarea
            value={localConfig.messages.validation.initial.criteria.join('\n')}
            onChange={(e) => handleConfigChange('messages.validation.initial.criteria', e.target.value.split('\n'))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
            rows={5}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-300">Refus - Histoires initiales</h4>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Titre
          </label>
          <input
            type="text"
            value={localConfig.messages.refusal.initial.title}
            onChange={(e) => handleConfigChange('messages.refusal.initial.title', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={localConfig.messages.refusal.initial.description}
            onChange={(e) => handleConfigChange('messages.refusal.initial.description', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
            rows={3}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-300">Statuts</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              En attente
            </label>
            <input
              type="text"
              value={localConfig.messages.status.pending}
              onChange={(e) => handleConfigChange('messages.status.pending', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              En cours
            </label>
            <input
              type="text"
              value={localConfig.messages.status.inProgress}
              onChange={(e) => handleConfigChange('messages.status.inProgress', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Validé
            </label>
            <input
              type="text"
              value={localConfig.messages.status.validated}
              onChange={(e) => handleConfigChange('messages.status.validated', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rejeté
            </label>
            <input
              type="text"
              value={localConfig.messages.status.rejected}
              onChange={(e) => handleConfigChange('messages.status.rejected', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderThemeTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-yellow-400">Thème et Couleurs</h3>
      
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-300">Couleurs principales</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Couleur primaire
            </label>
            <input
              type="color"
              value={localConfig.theme.colors.primary}
              onChange={(e) => handleConfigChange('theme.colors.primary', e.target.value)}
              className="w-full h-10 bg-gray-800 border border-gray-600 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Couleur de succès
            </label>
            <input
              type="color"
              value={localConfig.theme.colors.success}
              onChange={(e) => handleConfigChange('theme.colors.success', e.target.value)}
              className="w-full h-10 bg-gray-800 border border-gray-600 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Couleur d'avertissement
            </label>
            <input
              type="color"
              value={localConfig.theme.colors.warning}
              onChange={(e) => handleConfigChange('theme.colors.warning', e.target.value)}
              className="w-full h-10 bg-gray-800 border border-gray-600 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Couleur d'erreur
            </label>
            <input
              type="color"
              value={localConfig.theme.colors.error}
              onChange={(e) => handleConfigChange('theme.colors.error', e.target.value)}
              className="w-full h-10 bg-gray-800 border border-gray-600 rounded-md"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-300">Couleurs de texte</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Texte principal
            </label>
            <input
              type="color"
              value={localConfig.theme.colors.text.primary}
              onChange={(e) => handleConfigChange('theme.colors.text.primary', e.target.value)}
              className="w-full h-10 bg-gray-800 border border-gray-600 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Texte secondaire
            </label>
            <input
              type="color"
              value={localConfig.theme.colors.text.secondary}
              onChange={(e) => handleConfigChange('theme.colors.text.secondary', e.target.value)}
              className="w-full h-10 bg-gray-800 border border-gray-600 rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeaturesTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-yellow-400">Fonctionnalités</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            Modération hybride
          </label>
          <input
            type="checkbox"
            checked={localConfig.features.enableHybridModeration}
            onChange={(e) => handleConfigChange('features.enableHybridModeration', e.target.checked)}
            className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-600 rounded focus:ring-yellow-400"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            Facteur de victoire
          </label>
          <input
            type="checkbox"
            checked={localConfig.features.enableVictoryFactor}
            onChange={(e) => handleConfigChange('features.enableVictoryFactor', e.target.checked)}
            className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-600 rounded focus:ring-yellow-400"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            Rafraîchissement automatique
          </label>
          <input
            type="checkbox"
            checked={localConfig.features.enableAutoRefresh}
            onChange={(e) => handleConfigChange('features.enableAutoRefresh', e.target.checked)}
            className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-600 rounded focus:ring-yellow-400"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            Mises à jour en temps réel
          </label>
          <input
            type="checkbox"
            checked={localConfig.features.enableRealTimeUpdates}
            onChange={(e) => handleConfigChange('features.enableRealTimeUpdates', e.target.checked)}
            className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-600 rounded focus:ring-yellow-400"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            Notation par modérateur
          </label>
          <input
            type="checkbox"
            checked={localConfig.features.enableModeratorScoring}
            onChange={(e) => handleConfigChange('features.enableModeratorScoring', e.target.checked)}
            className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-600 rounded focus:ring-yellow-400"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            Validation des enjeux
          </label>
          <input
            type="checkbox"
            checked={localConfig.features.enableStakeValidation}
            onChange={(e) => handleConfigChange('features.enableStakeValidation', e.target.checked)}
            className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-600 rounded focus:ring-yellow-400"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            Calcul XP
          </label>
          <input
            type="checkbox"
            checked={localConfig.features.enableXPCalculation}
            onChange={(e) => handleConfigChange('features.enableXPCalculation', e.target.checked)}
            className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-600 rounded focus:ring-yellow-400"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            Calcul des paiements
          </label>
          <input
            type="checkbox"
            checked={localConfig.features.enablePayoutCalculation}
            onChange={(e) => handleConfigChange('features.enablePayoutCalculation', e.target.checked)}
            className="w-4 h-4 text-yellow-400 bg-gray-800 border-gray-600 rounded focus:ring-yellow-400"
          />
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
        maxWidth: '1200px',
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
            margin: 0
          }}>
            Dev Controls - Modération
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
            { key: 'engine', label: 'Moteur' },
            { key: 'ui', label: 'Interface' },
            { key: 'messages', label: 'Messages' },
            { key: 'theme', label: 'Thème' },
            { key: 'features', label: 'Fonctionnalités' },
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
          {isLoading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: '#FFD600',
              fontSize: '18px'
            }}>
              Chargement des Dev Controls...
            </div>
          ) : error ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: '#FF6B6B',
              fontSize: '18px'
            }}>
              Erreur: {error}
            </div>
          ) : (
            <>
              {activeTab === 'engine' && renderEngineTab()}
              {activeTab === 'ui' && renderUITab()}
              {activeTab === 'messages' && renderMessagesTab()}
              {activeTab === 'theme' && renderThemeTab()}
              {activeTab === 'features' && renderFeaturesTab()}
            </>
          )}
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
              style={{
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600',
                background: '#333',
                color: '#FFFFFF',
                border: '1px solid #6B5A20',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#444';
                e.currentTarget.style.borderColor = '#FFD600';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#333';
                e.currentTarget.style.borderColor = '#6B5A20';
              }}
            >
              Réinitialiser
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              style={{
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600',
                background: hasChanges ? '#FFD600' : '#666',
                color: hasChanges ? '#000000' : '#999',
                border: 'none',
                borderRadius: '8px',
                cursor: hasChanges ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                opacity: hasChanges ? 1 : 0.5
              }}
              onMouseEnter={(e) => {
                if (hasChanges) {
                  e.currentTarget.style.background = '#FFE55C';
                }
              }}
              onMouseLeave={(e) => {
                if (hasChanges) {
                  e.currentTarget.style.background = '#FFD600';
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

export default DevControlsPanel;
