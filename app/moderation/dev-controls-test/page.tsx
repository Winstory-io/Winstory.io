'use client';

import React, { useState } from 'react';
import ModerationDevControlsTest from '../../components/ModerationDevControlsTest';
import DevControlsPanel from '../../components/DevControlsPanel';
import DevControlsButton from '../../components/DevControlsButton';

const DevControlsTestPage: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 mb-8">
          🧪 Test des Dev Controls - Système de Modération
        </h1>
        
        <div className="mb-8 p-4 bg-gray-900 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Instructions</h2>
          <ul className="text-gray-300 space-y-2">
            <li>• Utilisez le bouton "Dev Controls" en bas à droite pour ouvrir le panneau de configuration</li>
            <li>• Modifiez les paramètres dans les différents onglets (Moteur, Interface, Messages, Thème, Fonctionnalités)</li>
            <li>• Les changements sont appliqués en temps réel dans cette page de test</li>
            <li>• Le composant de test ci-dessous affiche l'état actuel de la configuration</li>
            <li>• Tous les éléments codés en dur sont maintenant configurables via les Dev Controls</li>
          </ul>
        </div>

        <ModerationDevControlsTest />
        
        {/* Bouton Dev Controls */}
        <DevControlsButton />
        
        {/* Panneau Dev Controls */}
        <DevControlsPanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
        />
      </div>
    </div>
  );
};

export default DevControlsTestPage;
