import { useEffect } from 'react';
import { useModerationDevControls } from '@/lib/config/moderation-dev-controls';
import { updateEngineConfig } from '@/lib/moderation-engine';

// Hook pour synchroniser les Dev Controls avec le moteur de modération
export function useModerationEngineSync() {
  const { config, isLoading } = useModerationDevControls();

  useEffect(() => {
    if (!isLoading && config) {
      // Synchroniser la configuration du moteur avec les Dev Controls
      updateEngineConfig({
        minVoters: config.engine.minVoters,
        thresholdRatio: config.engine.thresholdRatio,
        scale: config.engine.scale,
        autoResolvePolicy: config.engine.autoResolvePolicy,
        voteWindowHours: config.engine.voteWindowHours,
        refreshIntervalMs: config.engine.refreshIntervalMs,
      });

      console.log('🔄 Moteur de modération synchronisé avec les Dev Controls:', {
        minVoters: config.engine.minVoters,
        thresholdRatio: config.engine.thresholdRatio,
        autoResolvePolicy: config.engine.autoResolvePolicy,
      });
    }
  }, [config, isLoading]);

  return {
    isSynced: !isLoading && !!config,
    config,
  };
}

// Hook pour les composants qui utilisent le moteur de modération
export function useModerationEngineWithDevControls() {
  const { config, isLoading } = useModerationDevControls();
  const { isSynced } = useModerationEngineSync();

  return {
    engineConfig: config?.engine,
    isLoading,
    isSynced,
    // Fonction pour obtenir la configuration actuelle du moteur
    getEngineConfig: () => config?.engine || {
      minVoters: 22,
      thresholdRatio: 2,
      scale: 1e18,
      autoResolvePolicy: 'escalate',
      voteWindowHours: 168,
      refreshIntervalMs: 30000,
    },
  };
}
