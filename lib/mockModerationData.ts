export interface MockModerationData {
  userType: 'b2c' | 'agency' | 'individual';
  companyName: string;
  agencyName?: string;
  walletAddress: string;
  userName: string;
  title: string;
  info: {
    startingText: string;
    guideline: string;
    standardRewards?: string;
    premiumRewards?: string;
    completionPrice: string;
    totalCompletions: number;
  };
  videoUrl: string;
  videoOrientation: 'horizontal' | 'vertical';
  startingText: string;
  guideline: string;
  standardRewards?: string;
  premiumRewards?: string;
}

export const mockModerationData: MockModerationData = {
  userType: 'b2c',
  companyName: 'Acme Corp',
  agencyName: '',
  walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
  userName: '@User',
  title: "La grande aventure de l'innovation",
  info: {
    startingText: "Ceci est le texte initial de l'utilisateur dans /yourwinstory. Une histoire captivante sur l'innovation et la créativité qui inspire la communauté.",
    guideline: "Consignes de l'utilisateur dans /yourwinstory. Créez des complétions qui respectent l'esprit innovant et la vision créative de l'entreprise.",
    standardRewards: "Récompenses standard : 50 $WINC pour chaque complétion validée. Accessible à tous les créateurs de la communauté.",
    premiumRewards: "Récompenses premium : 200 $WINC pour les 3 meilleures complétions. Évaluées par les modérateurs selon la qualité et la créativité.",
    completionPrice: "100 $WINC",
    totalCompletions: 10,
  },
  videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  videoOrientation: 'horizontal',
  startingText: "Ceci est le texte initial de l'utilisateur dans /yourwinstory. Une histoire captivante sur l'innovation et la créativité qui inspire la communauté.",
  guideline: "Consignes de l'utilisateur dans /yourwinstory. Créez des complétions qui respectent l'esprit innovant et la vision créative de l'entreprise.",
  standardRewards: "Récompenses standard : 50 $WINC pour chaque complétion validée. Accessible à tous les créateurs de la communauté.",
  premiumRewards: "Récompenses premium : 200 $WINC pour les 3 meilleures complétions. Évaluées par les modérateurs selon la qualité et la créativité.",
};

export const mockAgencyData: MockModerationData = {
  userType: 'agency',
  companyName: 'TechStart Inc',
  agencyName: 'Creative Solutions Agency',
  walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
  userName: '@AgencyUser',
  title: "Révolution technologique et innovation",
  info: {
    startingText: "Une histoire captivante sur la révolution technologique, créée par notre agence pour TechStart Inc. Un récit qui inspire l'innovation et la créativité.",
    guideline: "Créez des complétions qui respectent la vision technologique de TechStart Inc et l'approche créative de notre agence. L'innovation et la créativité sont au cœur de cette campagne.",
    standardRewards: "Récompenses standard : 75 $WINC pour chaque complétion validée. Une récompense généreuse pour encourager la participation.",
    premiumRewards: "Récompenses premium : 300 $WINC pour les 3 meilleures complétions. Une reconnaissance exceptionnelle pour l'excellence créative.",
    completionPrice: "150 $WINC",
    totalCompletions: 15,
  },
  videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  videoOrientation: 'horizontal',
  startingText: "Une histoire captivante sur la révolution technologique, créée par notre agence pour TechStart Inc. Un récit qui inspire l'innovation et la créativité.",
  guideline: "Créez des complétions qui respectent la vision technologique de TechStart Inc et l'approche créative de notre agence. L'innovation et la créativité sont au cœur de cette campagne.",
  standardRewards: "Récompenses standard : 75 $WINC pour chaque complétion validée. Une récompense généreuse pour encourager la participation.",
  premiumRewards: "Récompenses premium : 300 $WINC pour les 3 meilleures complétions. Une reconnaissance exceptionnelle pour l'excellence créative.",
};

export const mockIndividualData: MockModerationData = {
  userType: 'individual',
  companyName: 'Individual Creator',
  agencyName: '',
  walletAddress: '0x9876543210fedcba9876543210fedcba98765432',
  userName: '@IndividualCreator',
  title: "Mon histoire personnelle d'innovation",
  info: {
    startingText: "Une histoire personnelle et authentique sur mon parcours d'innovation. Un récit qui reflète mes expériences et ma vision créative unique.",
    guideline: "Créez des complétions qui respectent l'authenticité et la vision personnelle de cette histoire. L'originalité et la créativité individuelle sont valorisées.",
    completionPrice: "50 $WINC",
    totalCompletions: 5,
  },
  videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  videoOrientation: 'vertical',
  startingText: "Une histoire personnelle et authentique sur mon parcours d'innovation. Un récit qui reflète mes expériences et ma vision créative unique.",
  guideline: "Créez des complétions qui respectent l'authenticité et la vision personnelle de cette histoire. L'originalité et la créativité individuelle sont valorisées.",
};

export const getMockDataByType = (userType: 'b2c' | 'agency' | 'individual'): MockModerationData => {
  switch (userType) {
    case 'agency':
      return mockAgencyData;
    case 'individual':
      return mockIndividualData;
    default:
      return mockModerationData;
  }
};

export interface MockProgressData {
  stakers: number;
  stakersRequired: number;
  stakedAmount: number;
  mintPrice: number;
  validVotes: number;
  refuseVotes: number;
  totalVotes: number;
}

export const mockProgressData: MockProgressData = {
  stakers: 15,
  stakersRequired: 22,
  stakedAmount: 1240,
  mintPrice: 1000,
  validVotes: 10,
  refuseVotes: 5,
  totalVotes: 15,
};

export const getMockProgressData = (): MockProgressData => {
  // Simuler des variations dans les données de progression
  return {
    stakers: Math.floor(Math.random() * 10) + 10, // 10-19
    stakersRequired: 22,
    stakedAmount: Math.floor(Math.random() * 500) + 1000, // 1000-1499
    mintPrice: 1000,
    validVotes: Math.floor(Math.random() * 8) + 5, // 5-12
    refuseVotes: Math.floor(Math.random() * 6) + 2, // 2-7
    totalVotes: 0, // Sera calculé
  };
}; 