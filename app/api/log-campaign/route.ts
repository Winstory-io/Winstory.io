import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const isIndividual = data.campaignType === 'INDIVIDUAL';
    const now = new Date();
    const timestampIso = now.toISOString(); // UTC with seconds
    const timestampLocal = now.toLocaleString(); // Local time with seconds
    
    // Afficher dans le terminal Cursor avec un format clair et visible
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`🎬 CREATE CAMPAIGN - FINAL SUBMISSION ${isIndividual ? '(INDIVIDUAL)' : '(B2C)'}`);
    console.log(`🕒 Timestamp (ISO/UTC): ${timestampIso}`);
    console.log(`🕒 Timestamp (Local):   ${timestampLocal}`);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n');
    
    // User Information
    console.log('👤 USER INFORMATION:');
    console.log('───────────────────────────────────────────────────────────────');
    console.log('  📧 Email (data.user.email):', data.user?.email || 'N/A');
    console.log('  🏢 Company Name (data.company.name):', data.company?.name || 'N/A');
    console.log('  👛 Wallet Address (data.walletAddress):', data.walletAddress || 'N/A');
    console.log('  🧭 Wallet Source (data.walletSource):', data.walletSource || 'N/A');
    console.log('\n');
    
    // Story Information
    console.log('📖 STORY INFORMATION:');
    console.log('───────────────────────────────────────────────────────────────');
    console.log('  📝 Title (data.story.title):', data.story?.title || 'N/A');
    console.log('  📄 Starting Story (data.story.startingStory):');
    console.log('     ', data.story?.startingStory?.substring(0, 100) + '...' || 'N/A');
    console.log('  📋 Guideline (data.story.guideline):');
    console.log('     ', data.story?.guideline?.substring(0, 100) + '...' || 'N/A');
    console.log('\n');
    
    // Film Information
    console.log('🎥 FILM INFORMATION:');
    console.log('───────────────────────────────────────────────────────────────');
    console.log('  🤖 AI Film Requested (data.film.aiRequested):', data.film?.aiRequested ? 'Yes' : 'No');
    console.log('  🆔 Video ID (data.film.videoId):', data.film?.videoId || 'N/A');
    console.log('  📹 Video File Name (data.film.fileName):', data.film?.fileName || 'No video file');
    console.log('  📐 Video Format (data.film.format):', data.film?.format || 'N/A');
    console.log('  💾 File Size (data.film.fileSize):', data.film?.fileSize ? `${(data.film.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'N/A');
    console.log('  🔗 Video URL (data.film.url):', data.film?.url ? '[Present - blob/base64]' : 'N/A');
    console.log('\n');
    
    // ROI/Rewards Data
    console.log('💰 ROI & REWARDS DATA:');
    console.log('───────────────────────────────────────────────────────────────');
    console.log('  💵 Unit Value (data.roiData.unitValue):', data.roiData?.unitValue ? `$${data.roiData.unitValue}` : '$0');
    console.log('  📈 Net Profit (data.roiData.netProfit):', data.roiData?.netProfit ? `$${data.roiData.netProfit}` : '$0');
    console.log('  🎯 Max Completions (data.roiData.maxCompletions):', data.roiData?.maxCompletions || 0);
    console.log('  🆓 Free Reward (data.roiData.isFreeReward):', data.roiData?.isFreeReward ? 'Yes' : 'No');
    console.log('  ❌ No Reward (data.roiData.noReward):', data.roiData?.noReward ? 'Yes' : 'No');
    console.log('\n');
    
    // Standard Rewards
    if (data.standardToken || data.standardItem) {
      console.log('🎁 STANDARD REWARDS:');
      console.log('───────────────────────────────────────────────────────────────');
      
      if (data.standardToken) {
        console.log('  🪙 Token Reward:');
        console.log('     Type (data.standardToken.type):', data.standardToken.type);
        console.log('     Name (data.standardToken.name):', data.standardToken.name);
        console.log('     Contract (data.standardToken.contractAddress):', data.standardToken.contractAddress);
        console.log('     Blockchain (data.standardToken.blockchain):', data.standardToken.blockchain);
        console.log('     Standard (data.standardToken.standard):', data.standardToken.standard);
        console.log('     Amount per User (data.standardToken.amountPerUser):', data.standardToken.amountPerUser);
        console.log('     Total Amount (data.standardToken.totalAmount):', data.standardToken.totalAmount);
        console.log('     Has Enough Balance (data.standardToken.hasEnoughBalance):', data.standardToken.hasEnoughBalance ? 'Yes' : 'No');
        console.log('     Wallet Address (data.standardToken.walletAddress):', data.standardToken.walletAddress || 'N/A');
      }
      
      if (data.standardItem) {
        console.log('  👾 Item Reward:');
        console.log('     Type (data.standardItem.type):', data.standardItem.type);
        console.log('     Name (data.standardItem.name):', data.standardItem.name);
        console.log('     Contract (data.standardItem.contractAddress):', data.standardItem.contractAddress);
        console.log('     Blockchain (data.standardItem.blockchain):', data.standardItem.blockchain);
        console.log('     Standard (data.standardItem.standard):', data.standardItem.standard || 'N/A');
        console.log('     Amount per User (data.standardItem.amountPerUser):', data.standardItem.amountPerUser);
        console.log('     Wallet Address (data.standardItem.walletAddress):', data.standardItem.walletAddress || 'N/A');
      }
      console.log('\n');
    }
    
    // Premium Rewards
    if (data.premiumToken || data.premiumItem) {
      console.log('🏆 PREMIUM REWARDS (Top 3):');
      console.log('───────────────────────────────────────────────────────────────');
      
      if (data.premiumToken) {
        console.log('  🪙 Token Reward:');
        console.log('     Type (data.premiumToken.type):', data.premiumToken.type);
        console.log('     Name (data.premiumToken.name):', data.premiumToken.name);
        console.log('     Contract (data.premiumToken.contractAddress):', data.premiumToken.contractAddress);
        console.log('     Blockchain (data.premiumToken.blockchain):', data.premiumToken.blockchain);
        console.log('     Standard (data.premiumToken.standard):', data.premiumToken.standard);
        console.log('     Amount per User (data.premiumToken.amountPerUser):', data.premiumToken.amountPerUser);
        console.log('     Wallet Address (data.premiumToken.walletAddress):', data.premiumToken.walletAddress || 'N/A');
      }
      
      if (data.premiumItem) {
        console.log('  👾 Item Reward:');
        console.log('     Type (data.premiumItem.type):', data.premiumItem.type);
        console.log('     Name (data.premiumItem.name):', data.premiumItem.name);
        console.log('     Contract (data.premiumItem.contractAddress):', data.premiumItem.contractAddress);
        console.log('     Blockchain (data.premiumItem.blockchain):', data.premiumItem.blockchain);
        console.log('     Standard (data.premiumItem.standard):', data.premiumItem.standard || 'N/A');
        console.log('     Amount per User (data.premiumItem.amountPerUser):', data.premiumItem.amountPerUser);
        console.log('     Wallet Address (data.premiumItem.walletAddress):', data.premiumItem.walletAddress || 'N/A');
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
      console.log('  💠 Unit Value (data.completions.wincValue):',
        typeof data.completions.wincValue === 'number' ? `${data.completions.wincValue} $WINC` : 'N/A');
      console.log('  📊 Max Completions (data.completions.maxCompletions):', data.completions.maxCompletions || 'N/A');
      console.log('  ⏱️  Campaign Duration (data.completions.campaignDuration):', data.completions.campaignDuration || 'N/A', 'days');
      console.log('\n');
    }
    
    if (isIndividual && data.economicData) {
      console.log('💰 ECONOMIC SIMULATION DATA:');
      console.log('───────────────────────────────────────────────────────────────');
      console.log('  🏦 MINT Price (data.economicData.mint):', data.economicData.mint ? `$${data.economicData.mint}` : 'N/A');
      console.log('  💎 Total Pool (data.economicData.poolTotal):', data.economicData.poolTotal ? `$${data.economicData.poolTotal}` : 'N/A');
      console.log('  👨‍💼 Creator Gain (data.economicData.creatorGain):', data.economicData.creatorGain ? `$${data.economicData.creatorGain}` : 'N/A');
      console.log('  📈 Creator Net Gain (data.economicData.creatorNetGain):', data.economicData.creatorNetGain ? `$${data.economicData.creatorNetGain}` : 'N/A');
      console.log('  ✅ Is Creator Profitable (data.economicData.isCreatorProfitable):', data.economicData.isCreatorProfitable ? 'Yes' : 'No');
      console.log('  📊 Completion Rate (data.economicData.tauxCompletion):', data.economicData.tauxCompletion ? `${data.economicData.tauxCompletion}%` : 'N/A');
      console.log('  🏆 Top 1 Reward (data.economicData.top1):', data.economicData.top1 ? `$${data.economicData.top1}` : 'N/A');
      console.log('  🥈 Top 2 Reward (data.economicData.top2):', data.economicData.top2 ? `$${data.economicData.top2}` : 'N/A');
      console.log('  🥉 Top 3 Reward (data.economicData.top3):', data.economicData.top3 ? `$${data.economicData.top3}` : 'N/A');
      console.log('  🎮 Platform Share (data.economicData.platform):', data.economicData.platform ? `$${data.economicData.platform}` : 'N/A');
      console.log('  👥 Moderators Share (data.economicData.moderators):', data.economicData.moderators ? `$${data.economicData.moderators}` : 'N/A');
      console.log('  🔢 Gain Multiplier (data.economicData.multiplicateurGain):', data.economicData.multiplicateurGain || 'N/A');
      console.log('  🌟 XP Multiplier (data.economicData.multiplicateurXP):', data.economicData.multiplicateurXP || 'N/A');
      console.log('  💯 Creator XP (data.economicData.creatorXP):', data.economicData.creatorXP || 'N/A');
      console.log('\n');
    }
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ Campaign data logged successfully in terminal');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n');
    
    // STRUCTURE JSON COMPLÈTE pour mapping backend
    console.log('📦 STRUCTURE JSON COMPLÈTE (pour mapping backend):');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(JSON.stringify(data, null, 2));
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n');

    // Synchronisation Supabase (journalisation et pré-mapping backend)
    try {
      const payload = {
        created_at: new Date().toISOString(),
        campaign_type: isIndividual ? 'INDIVIDUAL' : 'B2C',
        wallet_address: data.walletAddress || null,
        wallet_source: data.walletSource || null,
        user_email: data.user?.email || null,
        company_name: data.company?.name || null,
        story_title: data.story?.title || null,
        story_guideline: data.story?.guideline || null,
        film_video_id: data.film?.videoId || null,
        film_file_name: data.film?.fileName || null,
        film_format: data.film?.format || null,
        roi_unit_value: data.roiData?.unitValue ?? null,
        roi_net_profit: data.roiData?.netProfit ?? null,
        roi_max_completions: data.roiData?.maxCompletions ?? null,
        individual_unit_price: data.completions?.unitPrice ?? null,
        individual_max_completions: data.completions?.maxCompletions ?? null,
        individual_duration_days: data.completions?.campaignDuration ?? null,
        raw_payload: data,
      } as any;

      const { error } = await supabaseServer
        .from('campaign_creation_logs')
        .insert([payload]);

      if (error) {
        console.error('Supabase insert error:', error.message);
      } else {
        console.log('🗄️  Supabase: campaign_creation_logs insert OK');
      }
    } catch (e: any) {
      console.error('Supabase sync failed:', e?.message || e);
    }
    
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

