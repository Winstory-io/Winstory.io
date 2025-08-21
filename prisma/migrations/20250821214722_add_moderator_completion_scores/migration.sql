-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('PENDING_MODERATION', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('INITIAL', 'COMPLETION');

-- CreateEnum
CREATE TYPE "CreatorType" AS ENUM ('B2C_AGENCIES', 'INDIVIDUAL_CREATORS', 'FOR_B2C', 'FOR_INDIVIDUALS');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'PENDING_MODERATION',
    "type" "CampaignType" NOT NULL,
    "creatorType" "CreatorType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "originalCampaignCompanyName" TEXT,
    "originalCreatorWallet" TEXT,
    "completerWallet" TEXT,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_infos" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "companyName" TEXT,
    "agencyName" TEXT,
    "walletAddress" TEXT NOT NULL,
    "email" TEXT,

    CONSTRAINT "creator_infos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_contents" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "videoOrientation" TEXT DEFAULT 'horizontal',
    "startingStory" TEXT NOT NULL,
    "guidelines" TEXT,

    CONSTRAINT "campaign_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_rewards" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "standardReward" TEXT,
    "premiumReward" TEXT,
    "completionPrice" TEXT,

    CONSTRAINT "campaign_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_metadata" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "totalCompletions" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],

    CONSTRAINT "campaign_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_progress" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "stakersRequired" INTEGER NOT NULL DEFAULT 22,
    "stakers" INTEGER NOT NULL DEFAULT 0,
    "stakedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mintPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "validVotes" INTEGER NOT NULL DEFAULT 0,
    "refuseVotes" INTEGER NOT NULL DEFAULT 0,
    "totalVotes" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completionScores" INTEGER[],

    CONSTRAINT "moderation_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_sessions" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "moderatorWallet" TEXT NOT NULL,
    "isEligible" BOOLEAN NOT NULL DEFAULT true,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "moderation_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderator_completion_scores" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "moderatorWallet" TEXT NOT NULL,
    "completionId" TEXT,
    "score" INTEGER NOT NULL,
    "scoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderator_completion_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "creator_infos_campaignId_key" ON "creator_infos"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_contents_campaignId_key" ON "campaign_contents"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_rewards_campaignId_key" ON "campaign_rewards"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_metadata_campaignId_key" ON "campaign_metadata"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "moderation_progress_campaignId_key" ON "moderation_progress"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "moderator_completion_scores_campaignId_moderatorWallet_scor_key" ON "moderator_completion_scores"("campaignId", "moderatorWallet", "score");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_infos" ADD CONSTRAINT "creator_infos_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_contents" ADD CONSTRAINT "campaign_contents_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_rewards" ADD CONSTRAINT "campaign_rewards_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_metadata" ADD CONSTRAINT "campaign_metadata_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_progress" ADD CONSTRAINT "moderation_progress_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_sessions" ADD CONSTRAINT "moderation_sessions_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderator_completion_scores" ADD CONSTRAINT "moderator_completion_scores_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
