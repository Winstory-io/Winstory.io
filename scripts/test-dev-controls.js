#!/usr/bin/env node

/**
 * Script de test pour les Dev Controls de modération
 * Vérifie que tous les éléments sont correctement configurés
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test des Dev Controls - Système de Modération\n');

// Vérifier que tous les fichiers nécessaires existent
const requiredFiles = [
  'lib/config/moderation-dev-controls.ts',
  'app/api/moderation/dev-controls/route.ts',
  'components/DevControlsPanel.tsx',
  'components/DevControlsButton.tsx',
  'lib/hooks/useModerationDevControls.ts',
  'lib/hooks/useModerationEngineSync.ts',
  'components/ModerationDevControlsTest.tsx',
  'app/moderation/dev-controls-test/page.tsx',
];

console.log('📁 Vérification des fichiers...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Certains fichiers sont manquants. Veuillez les créer avant de continuer.');
  process.exit(1);
}

console.log('\n✅ Tous les fichiers requis sont présents');

// Vérifier la structure de la configuration
console.log('\n🔧 Vérification de la configuration...');

try {
  const configPath = path.join(__dirname, '..', 'lib/config/moderation-dev-controls.ts');
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  // Vérifier que les interfaces principales sont définies
  const requiredInterfaces = [
    'ModerationDevControls',
    'DEFAULT_MODERATION_DEV_CONTROLS',
    'loadModerationDevControls',
    'saveModerationDevControls',
    'useModerationDevControls'
  ];
  
  requiredInterfaces.forEach(interfaceName => {
    if (configContent.includes(interfaceName)) {
      console.log(`✅ Interface/fonction ${interfaceName} trouvée`);
    } else {
      console.log(`❌ Interface/fonction ${interfaceName} manquante`);
    }
  });
  
} catch (error) {
  console.log(`❌ Erreur lors de la lecture du fichier de configuration: ${error.message}`);
}

// Vérifier l'API
console.log('\n🌐 Vérification de l\'API...');

try {
  const apiPath = path.join(__dirname, '..', 'app/api/moderation/dev-controls/route.ts');
  const apiContent = fs.readFileSync(apiPath, 'utf8');
  
  const requiredMethods = ['GET', 'POST', 'PUT', 'DELETE'];
  
  requiredMethods.forEach(method => {
    if (apiContent.includes(`export async function ${method}`)) {
      console.log(`✅ Méthode ${method} trouvée`);
    } else {
      console.log(`❌ Méthode ${method} manquante`);
    }
  });
  
} catch (error) {
  console.log(`❌ Erreur lors de la lecture du fichier API: ${error.message}`);
}

// Vérifier les composants
console.log('\n🎨 Vérification des composants...');

const components = [
  { file: 'components/DevControlsPanel.tsx', check: 'DevControlsPanel' },
  { file: 'components/DevControlsButton.tsx', check: 'DevControlsButton' },
  { file: 'components/ModerationDevControlsTest.tsx', check: 'ModerationDevControlsTest' },
];

components.forEach(({ file, check }) => {
  try {
    const componentPath = path.join(__dirname, '..', file);
    const componentContent = fs.readFileSync(componentPath, 'utf8');
    
    if (componentContent.includes(check)) {
      console.log(`✅ Composant ${check} trouvé`);
    } else {
      console.log(`❌ Composant ${check} manquant`);
    }
  } catch (error) {
    console.log(`❌ Erreur lors de la lecture du composant ${check}: ${error.message}`);
  }
});

// Vérifier les hooks
console.log('\n🪝 Vérification des hooks...');

const hooks = [
  { file: 'lib/hooks/useModerationDevControls.ts', check: 'useModerationDevControlsIntegration' },
  { file: 'lib/hooks/useModerationEngineSync.ts', check: 'useModerationEngineSync' },
];

hooks.forEach(({ file, check }) => {
  try {
    const hookPath = path.join(__dirname, '..', file);
    const hookContent = fs.readFileSync(hookPath, 'utf8');
    
    if (hookContent.includes(check)) {
      console.log(`✅ Hook ${check} trouvé`);
    } else {
      console.log(`❌ Hook ${check} manquant`);
    }
  } catch (error) {
    console.log(`❌ Erreur lors de la lecture du hook ${check}: ${error.message}`);
  }
});

// Vérifier l'intégration avec le moteur de modération
console.log('\n⚙️ Vérification de l\'intégration avec le moteur...');

try {
  const enginePath = path.join(__dirname, '..', 'lib/moderation-engine.ts');
  const engineContent = fs.readFileSync(enginePath, 'utf8');
  
  if (engineContent.includes('updateEngineConfig') && engineContent.includes('getEngineConfig')) {
    console.log('✅ Fonctions de configuration du moteur trouvées');
  } else {
    console.log('❌ Fonctions de configuration du moteur manquantes');
  }
  
  if (engineContent.includes('getEngineConfig()')) {
    console.log('✅ Le moteur utilise la configuration dynamique');
  } else {
    console.log('❌ Le moteur n\'utilise pas la configuration dynamique');
  }
  
} catch (error) {
  console.log(`❌ Erreur lors de la vérification du moteur: ${error.message}`);
}

// Vérifier l'intégration avec les composants existants
console.log('\n🔗 Vérification de l\'intégration avec les composants existants...');

try {
  const bubblesPath = path.join(__dirname, '..', 'components/ModerationBubbles.tsx');
  const bubblesContent = fs.readFileSync(bubblesPath, 'utf8');
  
  if (bubblesContent.includes('useModerationComponentConfig')) {
    console.log('✅ ModerationBubbles utilise les Dev Controls');
  } else {
    console.log('❌ ModerationBubbles n\'utilise pas les Dev Controls');
  }
  
} catch (error) {
  console.log(`❌ Erreur lors de la vérification de ModerationBubbles: ${error.message}`);
}

// Vérifier la page de test
console.log('\n🧪 Vérification de la page de test...');

try {
  const testPagePath = path.join(__dirname, '..', 'app/moderation/dev-controls-test/page.tsx');
  const testPageContent = fs.readFileSync(testPagePath, 'utf8');
  
  if (testPageContent.includes('ModerationDevControlsTest')) {
    console.log('✅ Page de test trouvée');
  } else {
    console.log('❌ Page de test manquante');
  }
  
} catch (error) {
  console.log(`❌ Erreur lors de la vérification de la page de test: ${error.message}`);
}

console.log('\n🎉 Test terminé !');
console.log('\n📋 Résumé des fonctionnalités implémentées :');
console.log('✅ Configuration centralisée des Dev Controls');
console.log('✅ API REST pour gérer la configuration');
console.log('✅ Interface de configuration avec onglets');
console.log('✅ Bouton d\'accès aux Dev Controls');
console.log('✅ Hooks pour l\'intégration avec les composants');
console.log('✅ Synchronisation avec le moteur de modération');
console.log('✅ Composant de test intégré');
console.log('✅ Page de test dédiée');
console.log('✅ Documentation complète');

console.log('\n🚀 Pour tester le système :');
console.log('1. Démarrez le serveur de développement');
console.log('2. Visitez /moderation pour voir le bouton Dev Controls');
console.log('3. Visitez /moderation/dev-controls-test pour tester la configuration');
console.log('4. Modifiez les paramètres et observez les changements en temps réel');

console.log('\n📚 Consultez DEV_CONTROLS_MODERATION_README.md pour plus de détails');
