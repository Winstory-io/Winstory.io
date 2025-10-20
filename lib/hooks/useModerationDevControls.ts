import { useState, useEffect, useCallback } from 'react';
import { useModerationDevControls } from './useModerationDevControlsClient';

// Hook pour utiliser les Dev Controls dans les composants de modération
export function useModerationDevControlsIntegration() {
  const { config, updateConfig, isLoading, error } = useModerationDevControls();
  const [isDevMode, setIsDevMode] = useState(false);

  // Détecter le mode développement
  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         window.location.hostname === 'localhost' ||
                         window.location.search.includes('dev=true');
    setIsDevMode(isDevelopment);
  }, []);

  // Fonction pour obtenir une valeur de configuration avec fallback
  const getConfigValue = useCallback((path: string, fallback: any = null) => {
    if (!config) return fallback;
    
    const keys = path.split('.');
    let current = config;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return fallback;
      }
    }
    
    return current;
  }, [config]);

  // Fonction pour obtenir les styles CSS basés sur la configuration
  const getStyles = useCallback((component: 'bubbles' | 'buttons' | 'progressPanel') => {
    if (!config) return {};
    
    const componentConfig = config.ui[component];
    if (!componentConfig) return {};
    
    switch (component) {
      case 'bubbles':
        return {
          defaultSize: (componentConfig as any).defaultSize,
          defaultGap: (componentConfig as any).defaultGap,
          fontSize: (componentConfig as any).fontSize,
          colors: (componentConfig as any).colors,
          animations: (componentConfig as any).animations,
        };
      
      case 'buttons':
        return {
          padding: (componentConfig as any).padding,
          fontSize: (componentConfig as any).fontSize,
          borderRadius: (componentConfig as any).borderRadius,
          colors: (componentConfig as any).colors,
          animations: (componentConfig as any).animations,
        };
      
      case 'progressPanel':
        return {
          minWidth: (componentConfig as any).minWidth,
          maxHeight: (componentConfig as any).maxHeight,
          padding: (componentConfig as any).padding,
          borderRadius: (componentConfig as any).borderRadius,
          colors: (componentConfig as any).colors,
          thresholds: (componentConfig as any).thresholds,
        };
      
      default:
        return {};
    }
  }, [config]);

  // Fonction pour obtenir les messages basés sur la configuration
  const getMessages = useCallback((type: 'validation' | 'refusal' | 'scoring' | 'status' | 'conditions', subtype?: string) => {
    if (!config) return {};
    
    const messages = config.messages[type];
    if (!messages) return {};
    
    if (subtype && typeof messages === 'object' && subtype in messages) {
      return messages[subtype];
    }
    
    return messages;
  }, [config]);

  // Fonction pour obtenir les couleurs du thème
  const getThemeColors = useCallback(() => {
    if (!config) return {};
    
    return {
      colors: config.theme.colors,
      gradients: config.theme.gradients,
      shadows: config.theme.shadows,
    };
  }, [config]);

  // Fonction pour vérifier si une fonctionnalité est activée
  const isFeatureEnabled = useCallback((feature: keyof typeof config.features) => {
    if (!config) return false;
    
    return config.features[feature];
  }, [config]);

  // Fonction pour obtenir la configuration du moteur
  const getEngineConfig = useCallback(() => {
    if (!config) return {};
    
    return {
      minVoters: config.engine.minVoters,
      thresholdRatio: config.engine.thresholdRatio,
      scale: config.engine.scale,
      autoResolvePolicy: config.engine.autoResolvePolicy,
      voteWindowHours: config.engine.voteWindowHours,
      refreshIntervalMs: config.engine.refreshIntervalMs,
    };
  }, [config]);

  // Fonction pour obtenir la configuration des types de contenu
  const getContentTypeConfig = useCallback((contentType: string) => {
    if (!config) return {};
    
    return config.contentTypeConfig[contentType] || {};
  }, [config]);

  // Fonction pour obtenir les paramètres de validation
  const getValidationConfig = useCallback(() => {
    if (!config) return {};
    
    return {
      scoreRange: config.validation.scoreRange,
      stakeRange: config.validation.stakeRange,
      voteRange: config.validation.voteRange,
      timeouts: config.validation.timeouts,
    };
  }, [config]);

  // Fonction pour obtenir les paramètres d'animation
  const getAnimationConfig = useCallback(() => {
    if (!config) return {};
    
    return {
      durations: config.animations.durations,
      easings: config.animations.easings,
      transforms: config.animations.transforms,
    };
  }, [config]);

  // Fonction pour obtenir la configuration de développement
  const getDevelopmentConfig = useCallback(() => {
    if (!config) return {};
    
    return {
      enableDebugMode: config.development.enableDebugMode,
      enableMockData: config.development.enableMockData,
      enableLogging: config.development.enableLogging,
      enablePerformanceMonitoring: config.development.enablePerformanceMonitoring,
      enableErrorReporting: config.development.enableErrorReporting,
      mockDelay: config.development.mockDelay,
    };
  }, [config]);

  // Fonction pour obtenir la configuration des intégrations
  const getIntegrationConfig = useCallback(() => {
    if (!config) return {};
    
    return {
      blockchain: config.integrations.blockchain,
      api: config.integrations.api,
      database: config.integrations.database,
    };
  }, [config]);

  // Fonction pour mettre à jour une valeur de configuration
  const updateConfigValue = useCallback(async (path: string, value: any) => {
    const updates = { [path]: value };
    await updateConfig(updates);
  }, [updateConfig]);

  // Fonction pour réinitialiser la configuration
  const resetConfig = useCallback(async () => {
    // Implémenter la logique de réinitialisation si nécessaire
    console.log('Resetting configuration to defaults');
  }, []);

  // Fonction pour exporter la configuration
  const exportConfig = useCallback(() => {
    if (!config) return null;
    
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'moderation-dev-controls.json';
    link.click();
    
    URL.revokeObjectURL(url);
  }, [config]);

  // Fonction pour importer la configuration
  const importConfig = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const importedConfig = JSON.parse(text);
      
      // Valider la configuration importée
      if (typeof importedConfig === 'object' && importedConfig !== null) {
        await updateConfig(importedConfig);
        return true;
      } else {
        throw new Error('Invalid configuration format');
      }
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return false;
    }
  }, [updateConfig]);

  return {
    // État
    config,
    isLoading,
    error,
    isDevMode,
    
    // Fonctions utilitaires
    getConfigValue,
    getStyles,
    getMessages,
    getThemeColors,
    isFeatureEnabled,
    getEngineConfig,
    getContentTypeConfig,
    getValidationConfig,
    getAnimationConfig,
    getDevelopmentConfig,
    getIntegrationConfig,
    
    // Fonctions de gestion
    updateConfigValue,
    resetConfig,
    exportConfig,
    importConfig,
    
    // Fonction de mise à jour complète
    updateConfig,
  };
}

// Hook spécialisé pour les composants de modération
export function useModerationComponentConfig(componentName: string) {
  const {
    config,
    getStyles,
    getMessages,
    getThemeColors,
    isFeatureEnabled,
    getConfigValue,
  } = useModerationDevControlsIntegration();

  // Obtenir les styles spécifiques au composant
  const styles = getStyles(componentName as any);
  
  // Obtenir les couleurs du thème
  const theme = getThemeColors();
  
  // Obtenir les messages spécifiques au composant
  const messages = getMessages('status');
  
  // Vérifier les fonctionnalités activées
  const features = {
    hybridModeration: isFeatureEnabled('enableHybridModeration'),
    victoryFactor: isFeatureEnabled('enableVictoryFactor'),
    autoRefresh: isFeatureEnabled('enableAutoRefresh'),
    realTimeUpdates: isFeatureEnabled('enableRealTimeUpdates'),
    moderatorScoring: isFeatureEnabled('enableModeratorScoring'),
    stakeValidation: isFeatureEnabled('enableStakeValidation'),
    xpCalculation: isFeatureEnabled('enableXPCalculation'),
    payoutCalculation: isFeatureEnabled('enablePayoutCalculation'),
  };

  return {
    styles,
    theme,
    messages,
    features,
    config,
    getConfigValue,
  };
}

// Hook pour les animations
export function useModerationAnimations() {
  const { getAnimationConfig, getConfigValue } = useModerationDevControlsIntegration();
  
  const animationConfig = getAnimationConfig();
  
  const getAnimationStyle = useCallback((type: 'hover' | 'focus' | 'active') => {
    if (!animationConfig) return {};
    
    return {
      transition: `all ${animationConfig.durations.normal} ${animationConfig.easings.ease}`,
      transform: animationConfig.transforms[type] || 'none',
    };
  }, [animationConfig]);
  
  const getTransitionStyle = useCallback((duration: 'fast' | 'normal' | 'slow' = 'normal') => {
    if (!animationConfig) return {};
    
    return {
      transition: `all ${animationConfig.durations[duration]} ${animationConfig.easings.ease}`,
    };
  }, [animationConfig]);
  
  return {
    animationConfig,
    getAnimationStyle,
    getTransitionStyle,
  };
}

// Hook pour les couleurs dynamiques
export function useModerationColors() {
  const { getThemeColors, getConfigValue } = useModerationDevControlsIntegration();
  
  const theme = getThemeColors();
  
  const getColor = useCallback((colorName: string, opacity: number = 1) => {
    if (!theme.colors) return colorName;
    
    const color = theme.colors[colorName as keyof typeof theme.colors];
    if (typeof color === 'string') {
      return opacity < 1 ? `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` : color;
    }
    
    return colorName;
  }, [theme]);
  
  const getGradient = useCallback((gradientName: string) => {
    if (!theme.gradients) return gradientName;
    
    return theme.gradients[gradientName as keyof typeof theme.gradients] || gradientName;
  }, [theme]);
  
  const getShadow = useCallback((shadowName: string) => {
    if (!theme.shadows) return shadowName;
    
    return theme.shadows[shadowName as keyof typeof theme.shadows] || shadowName;
  }, [theme]);
  
  return {
    theme,
    getColor,
    getGradient,
    getShadow,
  };
}
