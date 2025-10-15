// Dev Controls exhaustifs pour le système de modération
// Configuration centralisée pour tous les éléments du système

export interface ModerationDevControls {
  // === CONFIGURATION DU MOTEUR DE MODÉRATION ===
  engine: {
    minVoters: number;
    thresholdRatio: number;
    scale: number;
    autoResolvePolicy: 'escalate' | 'extend_by_hours' | 'auto_accept' | 'auto_reject';
    voteWindowHours: number;
    refreshIntervalMs: number;
  };

  // === CONFIGURATION DES TYPES DE CONTENU ===
  contentTypeConfig: {
    [key: string]: {
      mintPriceUSDC: number;
      rewardPoolPercentage: number;
      winstoryPercentage: number;
      activePoolPercentage: number;
      passivePoolPercentage: number;
      baseXP: number;
      minorityFactor: number;
      passiveFactor: number;
    };
  };

  // === CONFIGURATION DE L'INTERFACE UTILISATEUR ===
  ui: {
    bubbles: {
      defaultSize: number;
      defaultGap: number;
      fontSize: number;
      colors: {
        primary: string;
        secondary: string;
        green: string;
        red: string;
        yellow: string;
      };
      animations: {
        hoverScale: number;
        transitionDuration: string;
      };
    };
    buttons: {
      padding: string;
      fontSize: number;
      borderRadius: string;
      colors: {
        valid: string;
        refuse: string;
        disabled: string;
      };
      animations: {
        hoverTransform: string;
        transitionDuration: string;
      };
    };
    progressPanel: {
      minWidth: string;
      maxHeight: string;
      padding: string;
      borderRadius: string;
      colors: {
        background: string;
        border: string;
        text: string;
        success: string;
        warning: string;
        error: string;
      };
      thresholds: {
        excellent: number;
        good: number;
        average: number;
        poor: number;
      };
    };
  };

  // === CONFIGURATION DES MESSAGES ET TEXTES ===
  messages: {
    validation: {
      initial: {
        title: string;
        description: string;
        criteria: string[];
        additionalInfo: string;
        warning: string;
      };
      completion: {
        title: string;
        description: string;
        criteria: string[];
        additionalInfo: string;
        warning: string;
      };
    };
    refusal: {
      initial: {
        title: string;
        description: string;
        criteria: string[];
        additionalInfo: string;
        warning: string;
      };
      completion: {
        title: string;
        description: string;
        criteria: string[];
        additionalInfo: string;
        warning: string;
      };
    };
    scoring: {
      title: string;
      description: string;
      scoreDescriptions: {
        [key: number]: string;
      };
      scoreColors: {
        [key: number]: string;
      };
      usedScoreWarning: string;
      instructions: string;
    };
    status: {
      pending: string;
      inProgress: string;
      validated: string;
      rejected: string;
      requiresEscalation: string;
      loading: string;
      error: string;
    };
    conditions: {
      minVoters: string;
      stakeThreshold: string;
      hybridRatio: string;
      successMessage: string;
      failureMessage: string;
    };
  };

  // === CONFIGURATION DES COULEURS ET THÈMES ===
  theme: {
    colors: {
      primary: string;
      secondary: string;
      success: string;
      warning: string;
      error: string;
      background: string;
      surface: string;
      text: {
        primary: string;
        secondary: string;
        disabled: string;
      };
    };
    gradients: {
      valid: string;
      refuse: string;
      background: string;
    };
    shadows: {
      default: string;
      hover: string;
      focus: string;
    };
  };

  // === CONFIGURATION DES ANIMATIONS ===
  animations: {
    durations: {
      fast: string;
      normal: string;
      slow: string;
    };
    easings: {
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
    transforms: {
      hover: string;
      focus: string;
      active: string;
    };
  };

  // === CONFIGURATION DES VALIDATIONS ===
  validation: {
    scoreRange: {
      min: number;
      max: number;
    };
    stakeRange: {
      min: number;
      max: number;
    };
    voteRange: {
      min: number;
      max: number;
    };
    timeouts: {
      api: number;
      ui: number;
      refresh: number;
    };
  };

  // === CONFIGURATION DES FONCTIONNALITÉS AVANCÉES ===
  features: {
    enableHybridModeration: boolean;
    enableVictoryFactor: boolean;
    enableAutoRefresh: boolean;
    enableRealTimeUpdates: boolean;
    enableModeratorScoring: boolean;
    enableStakeValidation: boolean;
    enableXPCalculation: boolean;
    enablePayoutCalculation: boolean;
  };

  // === CONFIGURATION DES INTÉGRATIONS ===
  integrations: {
    blockchain: {
      enabled: boolean;
      network: string;
      contractAddress: string;
      gasLimit: number;
    };
    api: {
      baseUrl: string;
      timeout: number;
      retries: number;
      endpoints: {
        moderation: string;
        campaigns: string;
        scores: string;
        evaluation: string;
      };
    };
    database: {
      enabled: boolean;
      provider: string;
      connectionString: string;
    };
  };

  // === CONFIGURATION DU DÉVELOPPEMENT ===
  development: {
    enableDebugMode: boolean;
    enableMockData: boolean;
    enableLogging: boolean;
    enablePerformanceMonitoring: boolean;
    enableErrorReporting: boolean;
    mockDelay: number;
  };
}

// Configuration par défaut
export const DEFAULT_MODERATION_DEV_CONTROLS: ModerationDevControls = {
  engine: {
    minVoters: 22,
    thresholdRatio: 2,
    scale: 1e18,
    autoResolvePolicy: 'escalate',
    voteWindowHours: 168, // 7 jours
    refreshIntervalMs: 30000, // 30 secondes
  },

  contentTypeConfig: {
    INITIAL_B2C: {
      mintPriceUSDC: 1000,
      rewardPoolPercentage: 0.51,
      winstoryPercentage: 0.49,
      activePoolPercentage: 0.90,
      passivePoolPercentage: 0.10,
      baseXP: 10,
      minorityFactor: 0.25,
      passiveFactor: 0.1,
    },
    INITIAL_AGENCY_B2C: {
      mintPriceUSDC: 1000,
      rewardPoolPercentage: 0.51,
      winstoryPercentage: 0.49,
      activePoolPercentage: 0.90,
      passivePoolPercentage: 0.10,
      baseXP: 10,
      minorityFactor: 0.25,
      passiveFactor: 0.1,
    },
    COMPLETION_PAID_B2C: {
      mintPriceUSDC: 0,
      rewardPoolPercentage: 0.40,
      winstoryPercentage: 0.10,
      activePoolPercentage: 0.90,
      passivePoolPercentage: 0.10,
      baseXP: 20,
      minorityFactor: 0.25,
      passiveFactor: 0.1,
    },
    COMPLETION_FREE_B2C: {
      mintPriceUSDC: 0,
      rewardPoolPercentage: 0,
      winstoryPercentage: 0,
      activePoolPercentage: 0,
      passivePoolPercentage: 0,
      baseXP: 100,
      minorityFactor: 0.25,
      passiveFactor: 0.1,
    },
    INITIAL_INDIVIDUAL: {
      mintPriceUSDC: 0,
      rewardPoolPercentage: 0,
      winstoryPercentage: 0,
      activePoolPercentage: 0,
      passivePoolPercentage: 0,
      baseXP: 0,
      minorityFactor: 0.25,
      passiveFactor: 0.1,
    },
    COMPLETION_INDIVIDUAL: {
      mintPriceUSDC: 0,
      rewardPoolPercentage: 0,
      winstoryPercentage: 0,
      activePoolPercentage: 0,
      passivePoolPercentage: 0,
      baseXP: 0,
      minorityFactor: 0.25,
      passiveFactor: 0.1,
    },
  },

  ui: {
    bubbles: {
      defaultSize: 100,
      defaultGap: 24,
      fontSize: 14,
      colors: {
        primary: '#FFD600',
        secondary: '#FFD600',
        green: '#00FF00',
        red: '#FF0000',
        yellow: '#FFD700',
      },
      animations: {
        hoverScale: 1.05,
        transitionDuration: '0.3s ease',
      },
    },
    buttons: {
      padding: '14px 24px',
      fontSize: 16,
      borderRadius: '10px',
      colors: {
        valid: '#37FF00',
        refuse: '#FF0000',
        disabled: '#666',
      },
      animations: {
        hoverTransform: 'translateY(-2px)',
        transitionDuration: '0.3s ease',
      },
    },
    progressPanel: {
      minWidth: '340px',
      maxHeight: '55vh',
      padding: '18px',
      borderRadius: '16px',
      colors: {
        background: 'rgba(0, 0, 0, 0.8)',
        border: 'rgba(255, 215, 0, 0.3)',
        text: '#CCCCCC',
        success: '#00FF00',
        warning: '#FFD600',
        error: '#FF0000',
      },
      thresholds: {
        excellent: 80,
        good: 60,
        average: 40,
        poor: 20,
      },
    },
  },

  messages: {
    validation: {
      initial: {
        title: '🟢 Validate this Initial Story',
        description: 'By validating this content, you confirm that it:',
        criteria: [
          '✅ Respects Winstory\'s moderation standards (clarity, coherence, creativity, and potential to inspire community completions)',
          '✅ Contains an initial story that is understandable and usable as a narrative starting point',
          '✅ Does not violate any of the listed refusal rules',
          '✅ Proposes an original, engaging and AI-enhanceable narrative seed',
        ],
        additionalInfo: 'Once validated, this content will be eligible for community completions.',
        warning: 'V1 Staking: Only ACTIVE voters (stake ≥ 50 and stake age ≥ 7 days) earn XP and are subject to proportional slashing if they vote against the final decision.',
      },
      completion: {
        title: '🟢 Validate & Score this Completion',
        description: 'By validating this content, you confirm that it:',
        criteria: [
          '✅ Complies with Winstory\'s moderation standards (overall coherence)',
          '✅ Follows the narrative, visual, and guideline defined by the initial company',
          '✅ Does not violate any of the listed refusal rules',
        ],
        additionalInfo: 'Once validated, you\'ll assign a score from 1/100 to 100/100 based on the overall quality of the completion.',
        warning: 'V1 Staking: Only ACTIVE voters (stake ≥ 50 and stake age ≥ 7 days) earn XP and are subject to proportional slashing if they vote against the final decision.',
      },
    },
    refusal: {
      initial: {
        title: '🔴 Refuse this Initial Story',
        description: 'You should refuse this content if it falls under any of the following criteria:',
        criteria: [
          '🚫 The text or video is incomplete, incoherent, or lacks clear narrative direction',
          '🚫 It cannot reasonably inspire meaningful community completions',
          '🚫 It includes hate speech, racism, xenophobia, or apology for harassment and bullying',
          '🚫 It contains deepfakes that may harm the dignity or identity of a specific (group of) person',
          '🚫 It presents geopolitical risks',
          '🚫 It contains explicit sexual content or pornography',
          '🚫 It has clearly not been enhanced, assisted, or post-produced using generative AI or similar post-prod technologies',
        ],
        additionalInfo: 'Refusing content is a strong decision. Make sure it clearly meets at least one of these criteria.',
        warning: 'V1 Staking: Only ACTIVE voters (stake ≥ 50 and stake age ≥ 7 days) earn XP and may be slashed if they vote against the final decision.',
      },
      completion: {
        title: '🔴 Refuse this Completion',
        description: 'You should refuse this content if it falls under any of the following criteria:',
        criteria: [
          '🚫 The film was not created, assisted, or enhanced by Generative A.I. or digital post-production',
          '🚫 The film or text does not follow the company\'s initial creative guidelines',
          '🚫 The content promotes hate, racism, xenophobia, or harassment',
          '🚫 The content includes a deepfake that may threaten the dignity or integrity of a person',
          '🚫 It presents clear geopolitical risks',
          '🚫 It contains explicit pornography',
        ],
        additionalInfo: 'Refusing content is a strong decision. Make sure it clearly meets at least one of these criteria.',
        warning: 'V1 Staking: Only ACTIVE voters (stake ≥ 50 and stake age ≥ 7 days) earn XP and may be slashed if they vote against the final decision.',
      },
    },
    scoring: {
      title: 'Score this completion',
      description: 'Move the slider to assign a score from 1 to 100 based on the overall quality of this completion.',
      scoreDescriptions: {
        0: 'Refusal (use the Refuse button)',
        30: 'Poor quality content',
        50: 'Below average content',
        70: 'Average quality content',
        90: 'Good quality content',
        100: 'Excellent quality content',
      },
      scoreColors: {
        0: '#ff4444',
        30: '#ff8800',
        50: '#ffcc00',
        70: '#88cc00',
        90: '#00ff88',
        100: '#00ff88',
      },
      usedScoreWarning: '⚠️ You have already used this score for another completion from this campaign',
      instructions: 'Each score can only be used once per campaign by the same moderator. Unavailable scores are marked in red.',
    },
    status: {
      pending: 'En attente des conditions',
      inProgress: 'Modération en cours',
      validated: '✅ Contenu validé',
      rejected: '❌ Contenu rejeté',
      requiresEscalation: '⚠️ Escalade requise',
      loading: 'Chargement...',
      error: 'Erreur lors du chargement',
    },
    conditions: {
      minVoters: 'Minimum 22 moderators voted',
      stakeThreshold: '$WINC Staked > MINT Price',
      hybridRatio: 'Hybrid 50/50: score ≥ 2:1 (Yes vs No)',
      successMessage: '🎉 All conditions met!',
      failureMessage: 'Conditions not met',
    },
  },

  theme: {
    colors: {
      primary: '#FFD600',
      secondary: '#FFD600',
      success: '#00FF00',
      warning: '#FFD600',
      error: '#FF0000',
      background: '#000000',
      surface: 'rgba(0, 0, 0, 0.8)',
      text: {
        primary: '#FFFFFF',
        secondary: '#CCCCCC',
        disabled: '#999999',
      },
    },
    gradients: {
      valid: 'linear-gradient(135deg, #37FF00 0%, #2eea8b 100%)',
      refuse: 'linear-gradient(135deg, #FF0000 0%, #ff4444 100%)',
      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
    },
    shadows: {
      default: '0 4px 20px rgba(255, 215, 0, 0.2)',
      hover: '0 6px 25px rgba(255, 215, 0, 0.3)',
      focus: '0 0 0 2px rgba(255, 215, 0, 0.5)',
    },
  },

  animations: {
    durations: {
      fast: '0.2s',
      normal: '0.3s',
      slow: '0.5s',
    },
    easings: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
    transforms: {
      hover: 'translateY(-2px)',
      focus: 'scale(1.02)',
      active: 'scale(0.98)',
    },
  },

  validation: {
    scoreRange: {
      min: 1,
      max: 100,
    },
    stakeRange: {
      min: 0,
      max: 1000000,
    },
    voteRange: {
      min: 0,
      max: 1000,
    },
    timeouts: {
      api: 10000,
      ui: 5000,
      refresh: 30000,
    },
  },

  features: {
    enableHybridModeration: true,
    enableVictoryFactor: true,
    enableAutoRefresh: true,
    enableRealTimeUpdates: true,
    enableModeratorScoring: true,
    enableStakeValidation: true,
    enableXPCalculation: true,
    enablePayoutCalculation: true,
  },

  integrations: {
    blockchain: {
      enabled: true,
      network: 'mainnet',
      contractAddress: '',
      gasLimit: 500000,
    },
    api: {
      baseUrl: '/api',
      timeout: 10000,
      retries: 3,
      endpoints: {
        moderation: '/moderation',
        campaigns: '/moderation/campaigns',
        scores: '/moderation/moderator-scores',
        evaluation: '/moderation/hybrid-evaluation',
      },
    },
    database: {
      enabled: true,
      provider: 'supabase',
      connectionString: '',
    },
  },

  development: {
    enableDebugMode: false,
    enableMockData: true,
    enableLogging: true,
    enablePerformanceMonitoring: false,
    enableErrorReporting: false,
    mockDelay: 1000,
  },
};

// Fonction pour charger la configuration depuis le backend
export async function loadModerationDevControls(): Promise<ModerationDevControls> {
  try {
    const response = await fetch('/api/moderation/dev-controls');
    if (response.ok) {
      const config = await response.json();
      return { ...DEFAULT_MODERATION_DEV_CONTROLS, ...config };
    }
  } catch (error) {
    console.warn('Failed to load dev controls from backend, using defaults:', error);
  }
  
  return DEFAULT_MODERATION_DEV_CONTROLS;
}

// Fonction pour sauvegarder la configuration vers le backend
export async function saveModerationDevControls(config: Partial<ModerationDevControls>): Promise<boolean> {
  try {
    const response = await fetch('/api/moderation/dev-controls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to save dev controls to backend:', error);
    return false;
  }
}

