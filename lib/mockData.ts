// Données mockées pour tester l'interface de modération
export const mockCampaigns = [
  {
    id: '1',
    title: 'Nike Running Challenge',
    description: 'Campagne Nike pour promouvoir la course à pied',
    status: 'PENDING_MODERATION',
    type: 'INITIAL',
    creatorType: 'B2C_AGENCIES',
    createdAt: new Date(),
    updatedAt: new Date(),
    creatorInfo: {
      companyName: 'Nike Inc.',
      agencyName: 'Wieden+Kennedy',
      walletAddress: '0x1234567890123456789012345678901234567890',
      email: 'marketing@nike.com'
    },
    content: {
      videoUrl: 'https://example.com/nike-running-challenge.mp4',
      startingStory: 'Une jeune athlète découvre sa passion pour la course à pied dans les rues de sa ville.',
      guidelines: 'Le contenu doit être inspirant et respecter les valeurs de Nike.'
    },
    rewards: {
      standardReward: 'Nike Running Shoes (valeur: 150€)',
      premiumReward: 'Nike Running Shoes + Apple Watch (valeur: 800€)',
      completionPrice: '50 WINC'
    },
    metadata: {
      totalCompletions: 0,
      tags: ['sport', 'running', 'inspiration']
    },
    progress: {
      stakersRequired: 5,
      stakers: 3,
      stakedAmount: 150.0,
      mintPrice: 100.0,
      validVotes: 2,
      refuseVotes: 0,
      totalVotes: 2,
      averageScore: 0,
      completionScores: []
    }
  },
  {
    id: '2',
    title: 'Street Art Revolution',
    description: 'Artiste de rue partageant son processus créatif',
    status: 'PENDING_MODERATION',
    type: 'INITIAL',
    creatorType: 'INDIVIDUAL_CREATORS',
    createdAt: new Date(),
    updatedAt: new Date(),
    creatorInfo: {
      companyName: null,
      agencyName: null,
      walletAddress: '0x9876543210987654321098765432109876543210',
      email: 'streetartist@email.com'
    },
    content: {
      videoUrl: 'https://example.com/street-art-revolution.mp4',
      startingStory: 'Un artiste de rue transforme un mur gris en une œuvre d\'art vibrante.',
      guidelines: 'Le contenu doit être authentique et montrer le processus créatif.'
    },
    rewards: {
      standardReward: null,
      premiumReward: null,
      completionPrice: null
    },
    metadata: {
      totalCompletions: 0,
      tags: ['art', 'street-art', 'creativity']
    },
    progress: {
      stakersRequired: 5,
      stakers: 2,
      stakedAmount: 100.0,
      mintPrice: 75.0,
      validVotes: 1,
      refuseVotes: 0,
      totalVotes: 1,
      averageScore: 0,
      completionScores: []
    }
  },
  {
    id: '3',
    title: 'Local Business Spotlight - Nike Campaign Completion',
    description: 'Complétion de campagne pour Nike par un créateur individuel',
    status: 'PENDING_MODERATION',
    type: 'COMPLETION',
    creatorType: 'FOR_B2C',
    createdAt: new Date(),
    updatedAt: new Date(),
    creatorInfo: {
      companyName: null,
      agencyName: null,
      walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      email: 'creator@email.com'
    },
    content: {
      videoUrl: 'https://example.com/local-business-spotlight.mp4',
      startingStory: 'Un créateur de contenu met en valeur une entreprise locale.',
      guidelines: 'Le contenu doit être authentique et promouvoir l\'entreprise locale.'
    },
    rewards: {
      standardReward: '50 WINC',
      premiumReward: '100 WINC + Merchandising',
      completionPrice: '25 WINC'
    },
    metadata: {
      totalCompletions: 0,
      tags: ['local-business', 'promotion', 'community']
    },
    progress: {
      stakersRequired: 5,
      stakers: 4,
      stakedAmount: 200.0,
      mintPrice: 50.0,
      validVotes: 3,
      refuseVotes: 0,
      totalVotes: 3,
      averageScore: 85,
      completionScores: [90, 85, 80]
    },
    // Informations supplémentaires pour les complétions
    originalCampaign: {
      companyName: 'Nike Inc.',
      walletAddress: '0x1234567890123456789012345678901234567890'
    },
    completerWallet: '0xabcdef1234567890abcdef1234567890abcdef12'
  },
  {
    id: '4',
    title: 'Community Art Project - Individual Creator Completion',
    description: 'Complétion de campagne pour un autre créateur individuel',
    status: 'PENDING_MODERATION',
    type: 'COMPLETION',
    creatorType: 'FOR_INDIVIDUALS',
    createdAt: new Date(),
    updatedAt: new Date(),
    creatorInfo: {
      companyName: null,
      agencyName: null,
      walletAddress: '0x1111111111111111111111111111111111111111',
      email: 'completer@email.com'
    },
    content: {
      videoUrl: 'https://example.com/community-art-project.mp4',
      startingStory: 'Un artiste complète le projet d\'un autre artiste de la communauté.',
      guidelines: 'Le contenu doit respecter la vision originale tout en apportant une touche personnelle.'
    },
    rewards: {
      standardReward: '30 WINC',
      premiumReward: '60 WINC',
      completionPrice: '15 WINC'
    },
    metadata: {
      totalCompletions: 0,
      tags: ['community', 'collaboration', 'art']
    },
    progress: {
      stakersRequired: 5,
      stakers: 3,
      stakedAmount: 120.0,
      mintPrice: 80.0,
      validVotes: 2,
      refuseVotes: 1,
      totalVotes: 3,
      averageScore: 72,
      completionScores: [75, 70, 71]
    },
    // Informations supplémentaires pour les complétions
    originalCreator: {
      walletAddress: '0x9876543210987654321098765432109876543210'
    },
    completerWallet: '0x1111111111111111111111111111111111111111'
  }
];

export const mockCampaignsAvailability = {
  hasInitialB2CCampaigns: true,
  hasInitialIndividualCampaigns: true,
  hasCompletionB2CCampaigns: true,
  hasCompletionIndividualCampaigns: true
}; 