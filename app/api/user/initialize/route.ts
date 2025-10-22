import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, email, displayName } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Wallet address is required' 
        },
        { status: 400 }
      );
    }

    console.log('=== INITIALIZING USER ===');
    console.log('Wallet Address:', walletAddress);
    console.log('Email:', email);
    console.log('Display Name:', displayName);

    // Vérifier si l'utilisateur existe déjà
    const { data: existingProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('wallet_address')
      .eq('wallet_address', walletAddress)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking user profile:', profileError);
      throw new Error(`Failed to check user profile: ${profileError.message}`);
    }

    if (existingProfile) {
      console.log('✅ User already exists, skipping initialization');
      return NextResponse.json({
        success: true,
        message: 'User already exists',
        walletAddress,
        isNewUser: false
      });
    }

    // Créer le profil utilisateur (idempotent)
    console.log('📝 Creating user profile for:', walletAddress);
    const { error: createProfileError } = await supabase
      .from('user_profiles')
      .insert({
        wallet_address: walletAddress,
        email: email || null,
        display_name: displayName || email?.split('@')[0] || `User_${walletAddress.slice(-6)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (createProfileError) {
      // Tolérer clé dupliquée (course condition) et continuer
      if ((createProfileError as any).code === '23505') {
        console.warn('⚠️ User profile already exists (race), continuing...');
      } else {
        console.error('Error creating user profile:', createProfileError);
        throw new Error(`Failed to create user profile: ${createProfileError.message}`);
      }
    }

    // Créer les statistiques utilisateur (idempotent)
    console.log('📊 Creating user dashboard stats for:', walletAddress);
    const { error: createStatsError } = await supabase
      .from('user_dashboard_stats')
      .insert({
        user_wallet: walletAddress,
        total_creations: 0,
        total_completions: 0,
        total_moderations: 0,
        total_winc_earned: 0,
        total_winc_lost: 0,
        total_xp_earned: 0,
        current_level: 1,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (createStatsError) {
      if ((createStatsError as any).code === '23505') {
        console.warn('⚠️ User stats already exist (race), continuing...');
      } else {
        console.error('Error creating user stats:', createStatsError);
        throw new Error(`Failed to create user stats: ${createStatsError.message}`);
      }
    }

    // Créer la progression XP (idempotent)
    console.log('🎮 Creating user XP progression for:', walletAddress);
    const { error: createXpError } = await supabase
      .from('user_xp_progression')
      .insert({
        user_wallet: walletAddress,
        total_xp: 0,
        current_level: 1,
        xp_to_next_level: 100,
        achievements: [],
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (createXpError) {
      if ((createXpError as any).code === '23505') {
        console.warn('⚠️ User XP progression already exists (race), continuing...');
      } else {
        console.error('Error creating user XP:', createXpError);
        throw new Error(`Failed to create user XP: ${createXpError.message}`);
      }
    }

    // Créer le profil de modération
    console.log('⚖️ Creating user moderation profile for:', walletAddress);
    const { error: createModerationError } = await supabase
      .from('user_moderation_profiles')
      .insert({
        user_wallet: walletAddress,
        total_moderations: 0,
        successful_moderations: 0,
        failed_moderations: 0,
        total_staked: 0,
        current_stake: 0,
        reputation_score: 0,
        moderation_tier: 'bronze',
        is_active_moderator: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (createModerationError) {
      console.error('Error creating user moderation profile:', createModerationError);
      // Ne pas faire échouer l'initialisation si cette table n'existe pas encore
      console.warn('⚠️ User moderation profile creation failed, continuing...');
    }

    console.log('✅ User initialization completed for:', walletAddress);

    return NextResponse.json({
      success: true,
      message: 'User initialized successfully',
      walletAddress,
      isNewUser: true,
      data: {
        profile: {
          wallet_address: walletAddress,
          email: email || null,
          display_name: displayName || email?.split('@')[0] || `User_${walletAddress.slice(-6)}`
        },
        stats: {
          total_creations: 0,
          total_completions: 0,
          total_moderations: 0,
          total_winc_earned: 0,
          total_xp_earned: 0,
          current_level: 1
        }
      }
    });

  } catch (error) {
    console.error('User initialization error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to initialize user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Wallet address is required' 
        },
        { status: 400 }
      );
    }

    console.log('=== CHECKING USER EXISTS ===');
    console.log('Wallet Address:', walletAddress);

    // Vérifier si l'utilisateur existe
    const { data: existingProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('wallet_address, email, display_name, created_at')
      .eq('wallet_address', walletAddress)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking user profile:', profileError);
      throw new Error(`Failed to check user profile: ${profileError.message}`);
    }

    const userExists = !!existingProfile;

    console.log('✅ User check completed:', userExists ? 'exists' : 'not found');

    return NextResponse.json({
      success: true,
      userExists,
      walletAddress,
      profile: existingProfile || null
    });

  } catch (error) {
    console.error('User check error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
