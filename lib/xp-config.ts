/**
 * XP System Configuration for Winstory Campaign Creation
 * 
 * This configuration defines XP gains and losses for different user types
 * based on campaign actions, moderation decisions, and completion events.
 */

export type UserType = 'B2C' | 'AGENCY_B2C' | 'INDIVIDUAL';
export type RecipientType = 'creator' | 'moderator' | 'completer' | 'agency' | 'b2c_client';

export interface XPAction {
  action: string;
  earn_xp: number | string; // Can be a number or a formula like "MINT_VALUE_$WINC"
  lose_xp: number | string;
  recipient: RecipientType;
  description?: string;
}

export interface XPRules {
  [key: string]: {
    actions: XPAction[];
  };
}

/**
 * Complete XP rules for all user types
 */
export const XP_SYSTEM_CONFIG: XPRules = {
  B2C: {
    actions: [
      {
        action: 'B2C_MINT_1000USD',
        earn_xp: 1000,
        lose_xp: 0,
        recipient: 'creator',
        description: 'B2C MINT of 1000 USD earns 1000 XP'
      },
      {
        action: 'Option_Winstory_Creates_Video',
        earn_xp: 500,
        lose_xp: 0,
        recipient: 'creator',
        description: 'Choosing "Winstory Creates the Video" option earns 500 XP'
      },
      {
        action: 'Option_No_Rewards',
        earn_xp: 1000,
        lose_xp: 0,
        recipient: 'creator',
        description: 'Choosing "No Rewards" option earns 1000 XP'
      },
      {
        action: 'Moderation_Validated_By_1_Moderator',
        earn_xp: 2,
        lose_xp: 0,
        recipient: 'moderator',
        description: 'Each moderator who validates earns 2 XP'
      },
      {
        action: 'Moderation_Refused_By_1_Moderator',
        earn_xp: 0,
        lose_xp: 1,
        recipient: 'moderator',
        description: 'Each moderator who refuses loses 1 XP'
      },
      {
        action: 'Creation_Validated_Final',
        earn_xp: 100,
        lose_xp: 0,
        recipient: 'creator',
        description: 'Campaign validated (final YES vote) earns 100 XP'
      },
      {
        action: 'Creation_Refused_Final',
        earn_xp: 0,
        lose_xp: 500,
        recipient: 'creator',
        description: 'Campaign refused (final NO vote) loses 500 XP'
      },
      {
        action: 'Completion_By_1_Completer',
        earn_xp: 10,
        lose_xp: 0,
        recipient: 'completer',
        description: 'Each completer earns 10 XP'
      },
      {
        action: 'Completion_100Percent_Validated',
        earn_xp: 100,
        lose_xp: 0,
        recipient: 'completer',
        description: 'Completion validated at 100% earns 100 XP'
      }
    ]
  },

  AGENCY_B2C: {
    actions: [
      {
        action: 'Agency_MINT_1000USD',
        earn_xp: 1000,
        lose_xp: 0,
        recipient: 'agency',
        description: 'Agency B2C MINT of 1000 USD earns 1000 XP for agency'
      },
      {
        action: 'Option_No_Rewards',
        earn_xp: 1000,
        lose_xp: 0,
        recipient: 'agency',
        description: 'Choosing "No Rewards" option earns 1000 XP for agency'
      },
      {
        action: 'B2C_Client_Onboarded',
        earn_xp: 1000,
        lose_xp: 0,
        recipient: 'b2c_client',
        description: 'When B2C client connects to Winstory, they earn 1000 XP (not the agency)'
      }
    ]
  },

  INDIVIDUAL: {
    actions: [
      {
        action: 'Individual_MINT',
        earn_xp: 'MINT_VALUE_$WINC',
        lose_xp: 0,
        recipient: 'creator',
        description: 'Individual MINT earns XP equivalent to $WINC minted value'
      },
      {
        action: 'Moderation_Validated_By_1_Moderator',
        earn_xp: 2,
        lose_xp: 0,
        recipient: 'moderator',
        description: 'Each moderator who validates earns 2 XP'
      },
      {
        action: 'Moderation_Refused_By_1_Moderator',
        earn_xp: 0,
        lose_xp: 1,
        recipient: 'moderator',
        description: 'Each moderator who refuses loses 1 XP'
      },
      {
        action: 'Creation_Validated_Final',
        earn_xp: 100,
        lose_xp: 0,
        recipient: 'creator',
        description: 'Campaign validated earns 100 XP'
      },
      {
        action: 'Creation_Refused_Final',
        earn_xp: 0,
        lose_xp: 'MINT_VALUE_$WINC / 2',
        recipient: 'creator',
        description: 'Campaign refused loses XP equivalent to half the $WINC minted'
      }
    ]
  }
};

/**
 * XP Level Thresholds - Progression Exponentielle Infinie
 * 
 * Inspiré des systèmes de jeux vidéo (WoW, LoL, Dota, etc.)
 * où chaque niveau devient progressivement plus difficile à atteindre.
 * 
 * Formule : XP_requis = base * (multiplicateur ^ (niveau - 1))
 * - Base : 100 XP (niveau 1 → 2)
 * - Multiplicateur : 1.35 (progression modérée mais constante)
 * 
 * Cette formule crée une progression infinie naturelle :
 * - Niveaux 1-10 : Faciles (apprentissage)
 * - Niveaux 10-30 : Modérés (engagement)
 * - Niveaux 30-50 : Difficiles (dévouement)
 * - Niveaux 50+ : Très difficiles (prestige)
 * - Niveaux 100+ : Légendaires (millions d'XP)
 */

// Pré-calculer les 50 premiers niveaux pour performance
const BASE_XP = 100;
const MULTIPLIER = 1.35;

export const XP_LEVEL_THRESHOLDS = Array.from({ length: 100 }, (_, i) => {
  const level = i + 1;
  const xp_required = level === 1 ? 0 : Math.floor(BASE_XP * Math.pow(MULTIPLIER, level - 2));
  return { level, xp_required };
});

/**
 * Fonction pour calculer l'XP requis pour n'importe quel niveau
 * Utilisée pour les niveaux > 100
 */
export function calculateXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(BASE_XP * Math.pow(MULTIPLIER, level - 2));
}

/**
 * Calculate the current level based on total XP
 * Supporte des niveaux infinis avec progression exponentielle
 */
export function calculateLevel(totalXP: number): { level: number; xpToNextLevel: number; xpInCurrentLevel: number } {
  let currentLevel = 1;
  let currentLevelXP = 0;
  let nextLevelXP = BASE_XP;

  // Parcourir les niveaux pré-calculés d'abord (1-100)
  for (let i = 0; i < XP_LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= XP_LEVEL_THRESHOLDS[i].xp_required) {
      currentLevel = XP_LEVEL_THRESHOLDS[i].level;
      currentLevelXP = XP_LEVEL_THRESHOLDS[i].xp_required;
      
      // XP requis pour le niveau suivant
      if (i < XP_LEVEL_THRESHOLDS.length - 1) {
        nextLevelXP = XP_LEVEL_THRESHOLDS[i + 1].xp_required;
      } else {
        // Au-delà du niveau 100, calculer dynamiquement
        nextLevelXP = calculateXPForLevel(currentLevel + 1);
      }
    } else {
      break;
    }
  }

  // Si l'XP dépasse le niveau 100, continuer le calcul dynamiquement
  if (totalXP >= XP_LEVEL_THRESHOLDS[XP_LEVEL_THRESHOLDS.length - 1].xp_required) {
    let testLevel = 101;
    while (true) {
      const xpForLevel = calculateXPForLevel(testLevel);
      if (totalXP >= xpForLevel) {
        currentLevel = testLevel;
        currentLevelXP = xpForLevel;
        nextLevelXP = calculateXPForLevel(testLevel + 1);
        testLevel++;
      } else {
        break;
      }
    }
  }

  const xpInCurrentLevel = totalXP - currentLevelXP;
  const xpToNextLevel = nextLevelXP - totalXP;

  return {
    level: currentLevel,
    xpToNextLevel: Math.max(0, xpToNextLevel),
    xpInCurrentLevel: Math.max(0, xpInCurrentLevel)
  };
}

/**
 * Get XP action by user type and action name
 */
export function getXPAction(userType: UserType, actionName: string): XPAction | undefined {
  const userTypeConfig = XP_SYSTEM_CONFIG[userType];
  if (!userTypeConfig) return undefined;
  
  return userTypeConfig.actions.find(action => action.action === actionName);
}

/**
 * Calculate XP amount from a formula or fixed value
 */
export function calculateXPAmount(
  xpValue: number | string,
  context: {
    mintValueWINC?: number;
    mintValueUSD?: number;
  }
): number {
  // If it's a number, return it directly
  if (typeof xpValue === 'number') {
    return xpValue;
  }

  // If it's a formula string, evaluate it
  const formula = xpValue.toString();
  
  if (formula.includes('MINT_VALUE_$WINC')) {
    const mintValue = context.mintValueWINC || context.mintValueUSD || 0;
    
    // Handle division (e.g., "MINT_VALUE_$WINC / 2")
    if (formula.includes('/')) {
      const divisor = parseInt(formula.split('/')[1].trim());
      return Math.floor(mintValue / divisor);
    }
    
    return Math.floor(mintValue);
  }

  // Default: return 0 if formula cannot be evaluated
  console.warn(`Unable to evaluate XP formula: ${formula}`);
  return 0;
}

