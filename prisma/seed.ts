import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Nettoyer la base de données
  await prisma.moderationSession.deleteMany();
  await prisma.moderationProgress.deleteMany();
  await prisma.campaignMetadata.deleteMany();
  await prisma.campaignRewards.deleteMany();
  await prisma.campaignContent.deleteMany();
  await prisma.creatorInfo.deleteMany();
  await prisma.campaign.deleteMany();

  console.log('🧹 Database cleaned');

  // Créer des campagnes de test

  // 1. Campagne Initial Story - B2C & Agencies
  const nikeCampaign = await prisma.campaign.create({
    data: {
      title: 'Nike Running Challenge',
      description: 'Campagne Nike pour promouvoir la course à pied',
      type: 'INITIAL',
      creatorType: 'B2C_AGENCIES',
      status: 'PENDING_MODERATION',
      creatorInfo: {
        create: {
          companyName: 'Nike Inc.',
          agencyName: 'Wieden+Kennedy',
          walletAddress: '0x1234567890123456789012345678901234567890',
          email: 'marketing@nike.com'
        }
      },
      content: {
        create: {
          videoUrl: 'https://example.com/nike-running-challenge.mp4',
          startingStory: 'Une jeune athlète découvre sa passion pour la course à pied dans les rues de sa ville. Elle commence par de courtes distances et progresse jour après jour, inspirée par la communauté des coureurs.',
          guidelines: 'Le contenu doit être inspirant, montrer la progression, inclure des éléments de communauté et respecter les valeurs de Nike (détermination, excellence, innovation).'
        }
      },
      rewards: {
        create: {
          standardReward: 'Nike Running Shoes (valeur: 150€)',
          premiumReward: 'Nike Running Shoes + Apple Watch + Coaching personnalisé (valeur: 800€)',
          completionPrice: '50 WINC'
        }
      },
      metadata: {
        create: {
          totalCompletions: 0,
          tags: ['sport', 'running', 'inspiration', 'progression']
        }
      },
      progress: {
        create: {
          stakersRequired: 22,
          stakers: 2,
          stakedAmount: 100.0,
          mintPrice: 75.0,
          validVotes: 1,
          refuseVotes: 0,
          totalVotes: 1,
          averageScore: 0.0,
          completionScores: []
        }
      }
    }
  });

  // 2. Campagne Initial Story - Individual Creators
  const artistCampaign = await prisma.campaign.create({
    data: {
      title: 'Street Art Revolution',
      description: 'Artiste de rue partageant son processus créatif',
      type: 'INITIAL',
      creatorType: 'INDIVIDUAL_CREATORS',
      status: 'PENDING_MODERATION',
      creatorInfo: {
        create: {
          companyName: null,
          agencyName: null,
          walletAddress: '0x9876543210987654321098765432109876543210',
          email: 'streetartist@email.com'
        }
      },
      content: {
        create: {
          videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          videoOrientation: 'vertical',
          startingStory: 'Un artiste de rue transforme un mur gris en une œuvre d\'art vibrante et colorée. Il partage son processus de création, de l\'inspiration à la réalisation finale. Cette vidéo verticale capture l\'essence de l\'art urbain moderne.',
          guidelines: 'Le contenu doit être authentique, montrer le processus créatif, inclure des éléments de transformation urbaine et respecter les valeurs artistiques. Format vertical optimisé pour mobile.'
        }
      },
      rewards: {
        create: {
          standardReward: null,
          premiumReward: null,
          completionPrice: null
        }
      },
      metadata: {
        create: {
          totalCompletions: 0,
          tags: ['art', 'street-art', 'créativité', 'transformation']
        }
      },
      progress: {
        create: {
          stakersRequired: 22,
          stakers: 2,
          stakedAmount: 100.0,
          mintPrice: 75.0,
          validVotes: 1,
          refuseVotes: 0,
          totalVotes: 1,
          averageScore: 0.0,
          completionScores: []
        }
      }
    }
  });

  // 3. Campagne Completion - For B2C
  const completionB2C = await prisma.campaign.create({
    data: {
      title: 'Nike Community Completions',
      description: 'Modération des complétions communautaires pour Nike',
      type: 'COMPLETION',
      creatorType: 'FOR_B2C',
      status: 'PENDING_MODERATION',
      originalCampaignCompanyName: 'Nike Inc.',
      completerWallet: '0xabcdef1234567890abcdef1234567890abcdef12',
      creatorInfo: {
        create: {
          companyName: 'Nike Inc.',
          agencyName: 'Wieden+Kennedy',
          walletAddress: '0x1234567890123456789012345678901234567890',
          email: 'marketing@nike.com'
        }
      },
      content: {
        create: {
          videoUrl: 'https://example.com/nike-community-completions.mp4',
          startingStory: 'Les membres de la communauté Nike partagent leurs histoires de course à pied, montrant comment ils ont surmonté des défis personnels.',
          guidelines: 'Les complétions doivent respecter les valeurs Nike, être authentiques, inspirantes et montrer une progression personnelle.'
        }
      },
      rewards: {
        create: {
          standardReward: 'Certificat de participation + 25 WINC',
          premiumReward: 'Certificat premium + 100 WINC + Mention spéciale',
          completionPrice: '25 WINC'
        }
      },
      metadata: {
        create: {
          totalCompletions: 12,
          tags: ['completion', 'community', 'running', 'inspiration']
        }
      },
      progress: {
        create: {
          stakersRequired: 22,
          stakers: 2,
          stakedAmount: 100.0,
          mintPrice: 75.0,
          validVotes: 8,
          refuseVotes: 2,
          totalVotes: 10,
          averageScore: 78.5,
          completionScores: [85, 72, 90, 65, 88, 75, 82, 79]
        }
      }
    }
  });

  // 4. Campagne Completion - For Individuals
  const completionIndividual = await prisma.campaign.create({
    data: {
      title: 'Art Community Collaborations',
      description: 'Modération des collaborations artistiques communautaires',
      type: 'COMPLETION',
      creatorType: 'FOR_INDIVIDUALS',
      status: 'PENDING_MODERATION',
      originalCreatorWallet: '0x9876543210987654321098765432109876543210',
      completerWallet: '0x1111111111111111111111111111111111111111',
      creatorInfo: {
        create: {
          companyName: null,
          agencyName: null,
          walletAddress: '0x9876543210987654321098765432109876543210',
          email: 'streetartist@email.com'
        }
      },
      content: {
        create: {
          videoUrl: 'https://example.com/art-community-collaborations.mp4',
          startingStory: 'Artistes de la communauté partagent leurs interprétations et collaborations basées sur le thème de la transformation urbaine.',
          guidelines: 'Les complétions doivent être créatives, respecter le thème original, montrer une approche personnelle et contribuer à la communauté artistique.'
        }
      },
      rewards: {
        create: {
          standardReward: 'Certificat de participation + 15 WINC',
          premiumReward: 'Certificat premium + 50 WINC + Exposition virtuelle',
          completionPrice: '15 WINC'
        }
      },
      metadata: {
        create: {
          totalCompletions: 8,
          tags: ['completion', 'art', 'collaboration', 'community']
        }
      },
      progress: {
        create: {
          stakersRequired: 22,
          stakers: 2,
          stakedAmount: 100.0,
          mintPrice: 75.0,
          validVotes: 6,
          refuseVotes: 1,
          totalVotes: 7,
          averageScore: 82.3,
          completionScores: [88, 75, 90, 78, 85, 80]
        }
      }
    }
  });

  console.log('✅ Test campaigns created:');
  console.log(`   - Nike Running Challenge (${nikeCampaign.id})`);
  console.log(`   - Street Art Revolution (${artistCampaign.id})`);
  console.log(`   - Nike Community Completions (${completionB2C.id})`);
  console.log(`   - Art Community Collaborations (${completionIndividual.id})`);

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 