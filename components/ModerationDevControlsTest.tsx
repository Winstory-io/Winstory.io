import React, { useState, useEffect } from 'react';
import { useModerationDevControlsIntegration } from '@/lib/hooks/useModerationDevControls';
import { useModerationEngineSync } from '@/lib/hooks/useModerationEngineSync';
import { evaluateModeration, ModerationStatus } from '@/lib/moderation-engine';

const ModerationDevControlsTest: React.FC = () => {
  const {
    config,
    isLoading,
    error,
    getConfigValue,
    getStyles,
    getMessages,
    getThemeColors,
    isFeatureEnabled,
    getEngineConfig,
  } = useModerationDevControlsIntegration();

  const { isSynced } = useModerationEngineSync();
  const [testResult, setTestResult] = useState<any>(null);

  // Test du moteur de modération avec la configuration actuelle
  const testModerationEngine = () => {
    if (!config) return;

    const engineConfig = getEngineConfig();
    console.log('🧪 Test du moteur avec la configuration:', engineConfig);

    // Test avec des valeurs de test
    const result = evaluateModeration(
      25, // votesYes
      5,  // votesNo
      BigInt(8000 * 1e18), // stakeYes
      BigInt(2000 * 1e18), // stakeNo
      1000, // mintPriceUSDC
      Date.now(),
      Date.now() + 7 * 24 * 3600 * 1000
    );

    setTestResult(result);
    console.log('🧪 Résultat du test:', result);
  };

  useEffect(() => {
    if (isSynced) {
      testModerationEngine();
    }
  }, [isSynced, config]);

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <div className="text-yellow-400">Chargement des Dev Controls...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900 rounded-lg">
        <div className="text-red-400">Erreur: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 rounded-lg border border-gray-700">
      <h3 className="text-xl font-bold text-yellow-400 mb-4">
        🧪 Test des Dev Controls - Modération
      </h3>

      {/* Statut de synchronisation */}
      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${isSynced ? 'bg-green-400' : 'bg-red-400'}`}></span>
          <span className="text-white">
            {isSynced ? '✅ Synchronisé avec le moteur' : '❌ Non synchronisé'}
          </span>
        </div>
      </div>

      {/* Configuration actuelle */}
      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
        <h4 className="text-lg font-semibold text-white mb-2">Configuration actuelle</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Min Voters:</span>
            <span className="text-white ml-2">{getConfigValue('engine.minVoters', 'N/A')}</span>
          </div>
          <div>
            <span className="text-gray-400">Threshold Ratio:</span>
            <span className="text-white ml-2">{getConfigValue('engine.thresholdRatio', 'N/A')}</span>
          </div>
          <div>
            <span className="text-gray-400">Vote Window:</span>
            <span className="text-white ml-2">{getConfigValue('engine.voteWindowHours', 'N/A')}h</span>
          </div>
          <div>
            <span className="text-gray-400">Refresh Interval:</span>
            <span className="text-white ml-2">{getConfigValue('engine.refreshIntervalMs', 'N/A')}ms</span>
          </div>
        </div>
      </div>

      {/* Fonctionnalités activées */}
      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
        <h4 className="text-lg font-semibold text-white mb-2">Fonctionnalités</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isFeatureEnabled('enableHybridModeration') ? 'bg-green-400' : 'bg-red-400'}`}></span>
            <span className="text-gray-300">Modération hybride</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isFeatureEnabled('enableVictoryFactor') ? 'bg-green-400' : 'bg-red-400'}`}></span>
            <span className="text-gray-300">Facteur de victoire</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isFeatureEnabled('enableAutoRefresh') ? 'bg-green-400' : 'bg-red-400'}`}></span>
            <span className="text-gray-300">Rafraîchissement auto</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isFeatureEnabled('enableModeratorScoring') ? 'bg-green-400' : 'bg-red-400'}`}></span>
            <span className="text-gray-300">Notation modérateur</span>
          </div>
        </div>
      </div>

      {/* Styles UI */}
      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
        <h4 className="text-lg font-semibold text-white mb-2">Styles UI</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Taille bulles:</span>
            <span className="text-white ml-2">{getConfigValue('ui.bubbles.defaultSize', 'N/A')}px</span>
          </div>
          <div>
            <span className="text-gray-400">Espacement bulles:</span>
            <span className="text-white ml-2">{getConfigValue('ui.bubbles.defaultGap', 'N/A')}px</span>
          </div>
          <div>
            <span className="text-gray-400">Taille police bulles:</span>
            <span className="text-white ml-2">{getConfigValue('ui.bubbles.fontSize', 'N/A')}px</span>
          </div>
          <div>
            <span className="text-gray-400">Échelle survol:</span>
            <span className="text-white ml-2">{getConfigValue('ui.bubbles.animations.hoverScale', 'N/A')}</span>
          </div>
        </div>
      </div>

      {/* Test du moteur */}
      {testResult && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <h4 className="text-lg font-semibold text-white mb-2">Test du moteur</h4>
          <div className="text-sm">
            <div className="mb-2">
              <span className="text-gray-400">Statut:</span>
              <span className={`ml-2 ${
                testResult.status === ModerationStatus.VALIDATED ? 'text-green-400' :
                testResult.status === ModerationStatus.REJECTED ? 'text-red-400' :
                'text-yellow-400'
              }`}>
                {testResult.status}
              </span>
            </div>
            <div className="mb-2">
              <span className="text-gray-400">Gagnant:</span>
              <span className="text-white ml-2">{testResult.winner || 'Aucun'}</span>
            </div>
            <div className="mb-2">
              <span className="text-gray-400">Score OUI:</span>
              <span className="text-white ml-2">{(Number(testResult.scoreYes) / 1e18 * 100).toFixed(1)}%</span>
            </div>
            <div className="mb-2">
              <span className="text-gray-400">Score NON:</span>
              <span className="text-white ml-2">{(Number(testResult.scoreNo) / 1e18 * 100).toFixed(1)}%</span>
            </div>
            <div className="mb-2">
              <span className="text-gray-400">Victory Factor:</span>
              <span className="text-white ml-2">
                {testResult.victoryFactor ? (Number(testResult.victoryFactor) / 1e18 * 100).toFixed(1) : 'N/A'}%
              </span>
            </div>
            <div>
              <span className="text-gray-400">Raison:</span>
              <span className="text-white ml-2">{testResult.reason}</span>
            </div>
          </div>
        </div>
      )}

      {/* Messages de test */}
      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
        <h4 className="text-lg font-semibold text-white mb-2">Messages</h4>
        <div className="text-sm space-y-1">
          <div>
            <span className="text-gray-400">Statut en cours:</span>
            <span className="text-white ml-2">{getConfigValue('messages.status.inProgress', 'N/A')}</span>
          </div>
          <div>
            <span className="text-gray-400">Statut validé:</span>
            <span className="text-white ml-2">{getConfigValue('messages.status.validated', 'N/A')}</span>
          </div>
          <div>
            <span className="text-gray-400">Statut rejeté:</span>
            <span className="text-white ml-2">{getConfigValue('messages.status.rejected', 'N/A')}</span>
          </div>
        </div>
      </div>

      {/* Couleurs du thème */}
      <div className="p-3 bg-gray-800 rounded-lg">
        <h4 className="text-lg font-semibold text-white mb-2">Couleurs du thème</h4>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border border-gray-600"
              style={{ backgroundColor: getConfigValue('theme.colors.primary', '#FFD600') }}
            ></div>
            <span className="text-sm text-gray-300">Primaire</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border border-gray-600"
              style={{ backgroundColor: getConfigValue('theme.colors.success', '#00FF00') }}
            ></div>
            <span className="text-sm text-gray-300">Succès</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border border-gray-600"
              style={{ backgroundColor: getConfigValue('theme.colors.warning', '#FFD600') }}
            ></div>
            <span className="text-sm text-gray-300">Avertissement</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border border-gray-600"
              style={{ backgroundColor: getConfigValue('theme.colors.error', '#FF0000') }}
            ></div>
            <span className="text-sm text-gray-300">Erreur</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModerationDevControlsTest;
