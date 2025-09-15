// Données mockées pour tester l'interface de modération
export const mockCampaigns = [
  {
    id: 'cmebxme5q0000v8t5stv7634v', // ID exact utilisé dans l'URL
    title: 'Nike Running Challenge',
    description: 'Campagne Nike pour promouvoir la course à pied',
    status: 'APPROVED',
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
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      startingStory: 'Une jeune athlète découvre sa passion pour la course à pied dans les rues de sa ville. Elle commence par de petits joggings matinaux et progressivement développe sa technique et son endurance.',
      guidelines: 'Le contenu doit être inspirant et respecter les valeurs de Nike : dépassement de soi, authenticité, et inclusion. Pas de contenu violent ou offensant.'
    },
    rewards: {
      standardReward: 'Nike Running Shoes (valeur: 150€)',
      premiumReward: 'Nike Running Shoes + Apple Watch + Coaching personnalisé (valeur: 800€)',
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
      completionScores: [],
      stakeYes: 120.0,
      stakeNo: 30.0
    }
  },
  {
    id: '2',
    title: 'Street Art Revolution',
    description: 'Artiste de rue partageant son processus créatif',
    status: 'APPROVED',
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
      videoUrl: '/IMG_1476.mp4', // Votre vidéo verticale de test
      videoOrientation: 'vertical', // Configuration pour test d'ergonomie verticale
      startingStory: 'Un artiste de rue transforme un mur gris en une œuvre d\'art vibrante qui raconte l\'histoire de son quartier et de sa communauté. Cette vidéo verticale capture l\'essence de l\'art urbain moderne et permet de tester l\'ergonomie de l\'interface.',
      guidelines: 'Le contenu doit être authentique et montrer le processus créatif. Respecter les espaces publics et les réglementations locales. Format vertical respectant l\'orientation naturelle de la vidéo importée par le créateur.'
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
      completionScores: [],
      stakeYes: 80.0,
      stakeNo: 20.0
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
      startingStory: 'Un créateur de contenu met en valeur une entreprise locale en créant une vidéo authentique qui montre l\'impact positif de Nike dans la communauté.',
      guidelines: 'Le contenu doit être authentique et promouvoir l\'entreprise locale tout en respectant les valeurs de la marque Nike.'
    },
    rewards: {
      standardReward: '50 WINC + Nike merchandise',
      premiumReward: '100 WINC + Nike merchandise + Event access',
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
      refuseVotes: 1,
      totalVotes: 4,
      averageScore: 78,
      completionScores: [],
      stakeYes: 140.0,
      stakeNo: 60.0
    },
    // Informations supplémentaires pour les complétions FOR_B2C
    originalCampaignCompanyName: 'Nike Inc.',
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
      startingStory: 'Un artiste complète le projet d\'un autre artiste de la communauté en ajoutant sa propre vision créative tout en respectant l\'intention originale.',
      guidelines: 'Le contenu doit respecter la vision originale tout en apportant une touche personnelle. Favoriser la collaboration et l\'entraide artistique.'
    },
    rewards: {
      standardReward: '30 WINC',
      premiumReward: '60 WINC + Art supplies',
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
      completionScores: [75, 70, 71],
      stakeYes: 90.0,
      stakeNo: 30.0
    },
    // Informations supplémentaires pour les complétions FOR_INDIVIDUALS
    originalCreatorWallet: '0x9876543210987654321098765432109876543210',
    completerWallet: '0x1111111111111111111111111111111111111111'
  },
  {
    id: '5',
    title: 'Adidas Sport Innovation',
    description: 'Campagne Adidas pour l\'innovation sportive',
    status: 'APPROVED',
    type: 'INITIAL',
    creatorType: 'B2C_AGENCIES',
    createdAt: new Date(),
    updatedAt: new Date(),
    creatorInfo: {
      companyName: 'Adidas AG',
      agencyName: 'TBWA',
      walletAddress: '0x2345678901234567890123456789012345678901',
      email: 'marketing@adidas.com'
    },
    content: {
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      startingStory: 'Découvrez comment Adidas révolutionne le monde du sport avec des technologies innovantes et durables.',
      guidelines: 'Mettre en avant l\'innovation technologique et l\'engagement environnemental d\'Adidas.'
    },
    rewards: {
      standardReward: 'Adidas Ultraboost (valeur: 180€)',
      premiumReward: 'Adidas Ultraboost + Tracksuit + Training session (valeur: 500€)',
      completionPrice: '40 WINC'
    },
    metadata: {
      totalCompletions: 0,
      tags: ['sport', 'innovation', 'technology', 'sustainability']
    },
    progress: {
      stakersRequired: 5,
      stakers: 1,
      stakedAmount: 80.0,
      mintPrice: 120.0,
      validVotes: 0,
      refuseVotes: 0,
      totalVotes: 0,
      averageScore: 0,
      completionScores: [],
      stakeYes: 60.0,
      stakeNo: 20.0
    }
  },
  {
    id: '6',
    title: 'Music Producer Journey',
    description: 'Producteur de musique partageant son processus créatif',
    status: 'APPROVED',
    type: 'INITIAL',
    creatorType: 'INDIVIDUAL_CREATORS',
    createdAt: new Date(),
    updatedAt: new Date(),
    creatorInfo: {
      companyName: null,
      agencyName: null,
      walletAddress: '0x3456789012345678901234567890123456789012',
      email: 'musicproducer@email.com'
    },
    content: {
      videoUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
      startingStory: 'Suivez le parcours d\'un producteur de musique indépendant qui crée des beats uniques dans son home studio.',
      guidelines: 'Le contenu doit être éducatif et montrer le processus de création musicale. Respecter les droits d\'auteur.'
    },
    rewards: {
      standardReward: null,
      premiumReward: null,
      completionPrice: null
    },
    metadata: {
      totalCompletions: 0,
      tags: ['music', 'production', 'creativity', 'education']
    },
    progress: {
      stakersRequired: 5,
      stakers: 2,
      stakedAmount: 90.0,
      mintPrice: 60.0,
      validVotes: 1,
      refuseVotes: 0,
      totalVotes: 1,
      averageScore: 0,
      completionScores: [],
      stakeYes: 70.0,
      stakeNo: 20.0
    }
  },
  {
    id: '7',
    title: 'Adidas Campaign Completion - Fitness Journey',
    description: 'Complétion de campagne Adidas par un fitness enthusiast',
    status: 'PENDING_MODERATION',
    type: 'COMPLETION',
    creatorType: 'FOR_B2C',
    createdAt: new Date(),
    updatedAt: new Date(),
    creatorInfo: {
      companyName: null,
      agencyName: null,
      walletAddress: '0x4567890123456789012345678901234567890123',
      email: 'fitness@email.com'
    },
    content: {
      videoUrl: 'https://example.com/adidas-fitness-completion.mp4',
      startingStory: 'Un passionné de fitness montre comment les produits Adidas l\'accompagnent dans sa transformation physique.',
      guidelines: 'Montrer l\'utilisation authentique des produits Adidas dans un contexte de fitness et bien-être.'
    },
    rewards: {
      standardReward: '45 WINC + Adidas gear',
      premiumReward: '90 WINC + Adidas gear + Gym membership',
      completionPrice: '20 WINC'
    },
    metadata: {
      totalCompletions: 0,
      tags: ['fitness', 'lifestyle', 'transformation']
    },
    progress: {
      stakersRequired: 5,
      stakers: 3,
      stakedAmount: 160.0,
      mintPrice: 70.0,
      validVotes: 2,
      refuseVotes: 0,
      totalVotes: 2,
      averageScore: 78,
      completionScores: [80, 76],
      stakeYes: 120.0,
      stakeNo: 40.0
    },
    // Informations supplémentaires pour les complétions FOR_B2C
    originalCampaignCompanyName: 'Adidas AG',
    completerWallet: '0x4567890123456789012345678901234567890123'
  },
  {
    id: '8',
    title: 'Music Collaboration - Producer Completion',
    description: 'Complétion de campagne musicale par un autre producteur',
    status: 'PENDING_MODERATION',
    type: 'COMPLETION',
    creatorType: 'FOR_INDIVIDUALS',
    createdAt: new Date(),
    updatedAt: new Date(),
    creatorInfo: {
      companyName: null,
      agencyName: null,
      walletAddress: '0x5678901234567890123456789012345678901234',
      email: 'collaborator@email.com'
    },
    content: {
      videoUrl: 'https://example.com/music-collaboration.mp4',
      startingStory: 'Un producteur collabore avec l\'artiste original pour créer un remix unique qui fusionne leurs styles respectifs.',
      guidelines: 'Respecter le style original tout en apportant une créativité personnelle. Favoriser la collaboration artistique.'
    },
    rewards: {
      standardReward: '25 WINC',
      premiumReward: '50 WINC + Studio time',
      completionPrice: '12 WINC'
    },
    metadata: {
      totalCompletions: 0,
      tags: ['music', 'collaboration', 'remix']
    },
    progress: {
      stakersRequired: 5,
      stakers: 2,
      stakedAmount: 95.0,
      mintPrice: 55.0,
      validVotes: 1,
      refuseVotes: 0,
      totalVotes: 1,
      averageScore: 88,
      completionScores: [88],
      stakeYes: 70.0,
      stakeNo: 25.0
    },
    // Informations supplémentaires pour les complétions FOR_INDIVIDUALS
    originalCreatorWallet: '0x3456789012345678901234567890123456789012',
    completerWallet: '0x5678901234567890123456789012345678901234'
  }
];

export const mockCampaignsAvailability = {
  hasInitialB2CCampaigns: true,
  hasInitialIndividualCampaigns: true,
  hasCompletionB2CCampaigns: true,
  hasCompletionIndividualCampaigns: true
}; 