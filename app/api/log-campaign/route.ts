import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const isIndividual = data.campaignType === 'INDIVIDUAL';
    
    // Afficher dans le terminal Cursor avec un format clair et visible
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`🎬 CREATE CAMPAIGN - FINAL SUBMISSION ${isIndividual ? '(INDIVIDUAL)' : '(B2C)'}`);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n');
    
    // User Information
    console.log('👤 USER INFORMATION:');
    console.log('───────────────────────────────────────────────────────────────');
    console.log('  📧 Email:', data.user?.email || 'N/A');
    console.log('  🏢 Company Name:', data.company?.name || 'N/A');
    console.log('\n');
    
    // Story Information
    console.log('📖 STORY INFORMATION:');
    console.log('───────────────────────────────────────────────────────────────');
    console.log('  📝 Title:', data.story?.title || 'N/A');
    console.log('  📄 Starting Story:');
    console.log('     ', data.story?.startingStory?.substring(0, 100) + '...' || 'N/A');
    console.log('  📋 Guideline:');
    console.log('     ', data.story?.guideline?.substring(0, 100) + '...' || 'N/A');
    console.log('\n');
    
    // Film Information
    console.log('🎥 FILM INFORMATION:');
    console.log('───────────────────────────────────────────────────────────────');
    console.log('  🤖 AI Film Requested:', data.film?.aiRequested ? 'Yes' : 'No');
    console.log('  📹 Video File:', data.film?.fileName || 'No video file');
    console.log('  📐 Video Format:', data.film?.format || 'N/A');
    console.log('  💾 File Size:', data.film?.fileSize ? `${(data.film.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'N/A');
    console.log('\n');
    
    // ROI/Rewards Data
    console.log('💰 ROI & REWARDS DATA:');
    console.log('───────────────────────────────────────────────────────────────');
    console.log('  💵 Unit Value:', data.roiData?.unitValue ? `$${data.roiData.unitValue}` : '$0');
    console.log('  📈 Net Profit:', data.roiData?.netProfit ? `$${data.roiData.netProfit}` : '$0');
    console.log('  🎯 Max Completions:', data.roiData?.maxCompletions || 0);
    console.log('  🆓 Free Reward:', data.roiData?.isFreeReward ? 'Yes' : 'No');
    console.log('  ❌ No Reward:', data.roiData?.noReward ? 'Yes' : 'No');
    console.log('\n');
    
    // Standard Rewards
    if (data.standardToken || data.standardItem) {
      console.log('🎁 STANDARD REWARDS:');
      console.log('───────────────────────────────────────────────────────────────');
      
      if (data.standardToken) {
        console.log('  🪙 Token Reward:');
        console.log('     Name:', data.standardToken.name);
        console.log('     Contract:', data.standardToken.contractAddress);
        console.log('     Blockchain:', data.standardToken.blockchain);
        console.log('     Standard:', data.standardToken.standard);
        console.log('     Amount per User:', data.standardToken.amountPerUser);
        console.log('     Total Amount:', data.standardToken.totalAmount);
        console.log('     Has Enough Balance:', data.standardToken.hasEnoughBalance ? 'Yes' : 'No');
      }
      
      if (data.standardItem) {
        console.log('  👾 Item Reward:');
        console.log('     Name:', data.standardItem.name);
        console.log('     Contract:', data.standardItem.contractAddress);
        console.log('     Blockchain:', data.standardItem.blockchain);
        console.log('     Amount per User:', data.standardItem.amountPerUser);
      }
      console.log('\n');
    }
    
    // Premium Rewards
    if (data.premiumToken || data.premiumItem) {
      console.log('🏆 PREMIUM REWARDS (Top 3):');
      console.log('───────────────────────────────────────────────────────────────');
      
      if (data.premiumToken) {
        console.log('  🪙 Token Reward:');
        console.log('     Name:', data.premiumToken.name);
        console.log('     Contract:', data.premiumToken.contractAddress);
        console.log('     Blockchain:', data.premiumToken.blockchain);
        console.log('     Standard:', data.premiumToken.standard);
        console.log('     Amount per User:', data.premiumToken.amountPerUser);
      }
      
      if (data.premiumItem) {
        console.log('  👾 Item Reward:');
        console.log('     Name:', data.premiumItem.name);
        console.log('     Contract:', data.premiumItem.contractAddress);
        console.log('     Blockchain:', data.premiumItem.blockchain);
        console.log('     Amount per User:', data.premiumItem.amountPerUser);
      }
      console.log('\n');
    }
    
    // Unified Config (if available)
    if (data.unifiedConfig) {
      console.log('⚙️  UNIFIED REWARD CONFIGURATION:');
      console.log('───────────────────────────────────────────────────────────────');
      console.log('  Standard Rewards Count:', data.unifiedConfig.standard?.length || 0);
      console.log('  Premium Rewards Count:', data.unifiedConfig.premium?.length || 0);
      console.log('\n');
    }
    
    // Individual Creator specific data
    if (isIndividual && data.completions) {
      console.log('🎯 INDIVIDUAL CREATOR COMPLETIONS:');
      console.log('───────────────────────────────────────────────────────────────');
      console.log('  💵 Unit Price:', data.completions.unitPrice ? `$${data.completions.unitPrice}` : 'N/A');
      console.log('  📊 Max Completions:', data.completions.maxCompletions || 'N/A');
      console.log('  ⏱️  Campaign Duration:', data.completions.campaignDuration || 'N/A', 'days');
      console.log('\n');
    }
    
    if (isIndividual && data.economicData) {
      console.log('💰 ECONOMIC SIMULATION DATA:');
      console.log('───────────────────────────────────────────────────────────────');
      console.log('  🏦 MINT Price:', data.economicData.mint ? `$${data.economicData.mint}` : 'N/A');
      console.log('  💎 Total Pool:', data.economicData.poolTotal ? `$${data.economicData.poolTotal}` : 'N/A');
      console.log('  👨‍💼 Creator Gain:', data.economicData.creatorGain ? `$${data.economicData.creatorGain}` : 'N/A');
      console.log('  📈 Creator Net Gain:', data.economicData.creatorNetGain ? `$${data.economicData.creatorNetGain}` : 'N/A');
      console.log('  ✅ Is Creator Profitable:', data.economicData.isCreatorProfitable ? 'Yes' : 'No');
      console.log('  📊 Completion Rate:', data.economicData.tauxCompletion ? `${data.economicData.tauxCompletion}%` : 'N/A');
      console.log('  🏆 Top 1 Reward:', data.economicData.top1 ? `$${data.economicData.top1}` : 'N/A');
      console.log('  🥈 Top 2 Reward:', data.economicData.top2 ? `$${data.economicData.top2}` : 'N/A');
      console.log('  🥉 Top 3 Reward:', data.economicData.top3 ? `$${data.economicData.top3}` : 'N/A');
      console.log('  🎮 Platform Share:', data.economicData.platform ? `$${data.economicData.platform}` : 'N/A');
      console.log('  👥 Moderators Share:', data.economicData.moderators ? `$${data.economicData.moderators}` : 'N/A');
      console.log('\n');
    }
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ Campaign data logged successfully in terminal');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Campaign data logged in terminal' 
    });
  } catch (error) {
    console.error('Error logging campaign data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log campaign data' },
      { status: 500 }
    );
  }
}

