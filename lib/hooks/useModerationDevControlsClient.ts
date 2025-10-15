'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  DEFAULT_MODERATION_DEV_CONTROLS, 
  ModerationDevControls,
  loadModerationDevControls,
  saveModerationDevControls
} from '@/lib/config/moderation-dev-controls';

// Hook React pour utiliser les Dev Controls
export function useModerationDevControls() {
  const [config, setConfig] = useState<ModerationDevControls>(DEFAULT_MODERATION_DEV_CONTROLS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const loadedConfig = await loadModerationDevControls();
        setConfig(loadedConfig);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load config');
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  const updateConfig = useCallback(async (updates: Partial<ModerationDevControls>) => {
    try {
      const newConfig = { ...config, ...updates };
      setConfig(newConfig);
      
      const success = await saveModerationDevControls(updates);
      if (!success) {
        console.warn('Failed to save config to backend');
      }
    } catch (err) {
      console.error('Failed to update config:', err);
    }
  }, [config]);

  return {
    config,
    updateConfig,
    isLoading,
    error,
  };
}
