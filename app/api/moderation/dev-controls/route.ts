import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_MODERATION_DEV_CONTROLS, ModerationDevControls } from '@/lib/config/moderation-dev-controls';

// Simuler un stockage en mémoire (en production, utiliser une base de données)
let devControlsConfig: ModerationDevControls = DEFAULT_MODERATION_DEV_CONTROLS;

export async function GET(request: NextRequest) {
  try {
    // En production, charger depuis la base de données
    // const config = await loadDevControlsFromDatabase();
    
    return NextResponse.json(devControlsConfig);
  } catch (error) {
    console.error('Error loading dev controls:', error);
    return NextResponse.json(
      { error: 'Failed to load dev controls' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const updates = await request.json();
    
    // Valider les mises à jour
    const validationResult = validateDevControlsUpdate(updates);
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }
    
    // Mettre à jour la configuration
    devControlsConfig = { ...devControlsConfig, ...updates };
    
    // En production, sauvegarder dans la base de données
    // await saveDevControlsToDatabase(devControlsConfig);
    
    return NextResponse.json({ success: true, config: devControlsConfig });
  } catch (error) {
    console.error('Error updating dev controls:', error);
    return NextResponse.json(
      { error: 'Failed to update dev controls' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const newConfig = await request.json();
    
    // Valider la configuration complète
    const validationResult = validateDevControlsConfig(newConfig);
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }
    
    // Remplacer la configuration
    devControlsConfig = newConfig;
    
    // En production, sauvegarder dans la base de données
    // await saveDevControlsToDatabase(devControlsConfig);
    
    return NextResponse.json({ success: true, config: devControlsConfig });
  } catch (error) {
    console.error('Error replacing dev controls:', error);
    return NextResponse.json(
      { error: 'Failed to replace dev controls' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Réinitialiser à la configuration par défaut
    devControlsConfig = DEFAULT_MODERATION_DEV_CONTROLS;
    
    // En production, supprimer de la base de données
    // await deleteDevControlsFromDatabase();
    
    return NextResponse.json({ success: true, config: devControlsConfig });
  } catch (error) {
    console.error('Error resetting dev controls:', error);
    return NextResponse.json(
      { error: 'Failed to reset dev controls' },
      { status: 500 }
    );
  }
}

// Fonctions de validation
function validateDevControlsUpdate(updates: any): { valid: boolean; error?: string } {
  try {
    // Valider les types de base
    if (updates.engine) {
      if (typeof updates.engine.minVoters !== 'number' || updates.engine.minVoters < 1) {
        return { valid: false, error: 'minVoters must be a positive number' };
      }
      if (typeof updates.engine.thresholdRatio !== 'number' || updates.engine.thresholdRatio < 1) {
        return { valid: false, error: 'thresholdRatio must be a positive number' };
      }
    }
    
    if (updates.ui?.bubbles) {
      if (typeof updates.ui.bubbles.defaultSize !== 'number' || updates.ui.bubbles.defaultSize < 10) {
        return { valid: false, error: 'bubble defaultSize must be at least 10' };
      }
    }
    
    if (updates.validation?.scoreRange) {
      if (updates.validation.scoreRange.min < 0 || updates.validation.scoreRange.max > 100) {
        return { valid: false, error: 'scoreRange must be between 0 and 100' };
      }
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid update format' };
  }
}

function validateDevControlsConfig(config: any): { valid: boolean; error?: string } {
  try {
    // Vérifier que toutes les sections requises sont présentes
    const requiredSections = [
      'engine', 'contentTypeConfig', 'ui', 'messages', 'theme', 
      'animations', 'validation', 'features', 'integrations', 'development'
    ];
    
    for (const section of requiredSections) {
      if (!config[section]) {
        return { valid: false, error: `Missing required section: ${section}` };
      }
    }
    
    // Valider la configuration du moteur
    if (!config.engine.minVoters || config.engine.minVoters < 1) {
      return { valid: false, error: 'Engine minVoters must be a positive number' };
    }
    
    // Valider la configuration UI
    if (!config.ui.bubbles || !config.ui.buttons || !config.ui.progressPanel) {
      return { valid: false, error: 'UI configuration is incomplete' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid configuration format' };
  }
}

// Fonctions pour la base de données (à implémenter en production)
async function loadDevControlsFromDatabase(): Promise<ModerationDevControls> {
  // TODO: Implémenter la logique de chargement depuis la base de données
  return DEFAULT_MODERATION_DEV_CONTROLS;
}

async function saveDevControlsToDatabase(config: ModerationDevControls): Promise<void> {
  // TODO: Implémenter la logique de sauvegarde vers la base de données
  console.log('Saving dev controls to database:', config);
}

async function deleteDevControlsFromDatabase(): Promise<void> {
  // TODO: Implémenter la logique de suppression de la base de données
  console.log('Deleting dev controls from database');
}
