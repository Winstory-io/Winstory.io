import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * GET /api/campaigns/short-link/redirect?shortCode=xxx
 * Récupère l'URL complète pour un code court
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shortCode = searchParams.get('shortCode');

    if (!shortCode) {
      return NextResponse.json(
        { success: false, error: 'shortCode is required' },
        { status: 400 }
      );
    }

    // Récupérer le lien depuis la base de données
    const { data: link, error: linkError } = await supabase
      .from('campaign_short_links')
      .select('*')
      .eq('short_code', shortCode)
      .single();

    if (linkError || !link) {
      return NextResponse.json(
        { success: false, error: 'Short link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      fullUrl: link.full_url,
      campaignId: link.campaign_id
    });

  } catch (error: any) {
    console.error('Error in redirect API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/campaigns/short-link/redirect
 * Incrémente le compteur de clics pour un code court
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shortCode } = body;

    if (!shortCode) {
      return NextResponse.json(
        { success: false, error: 'shortCode is required' },
        { status: 400 }
      );
    }

    // Incrémenter le compteur de clics
    const { error: updateError } = await supabase.rpc('increment_short_link_clicks', {
      link_short_code: shortCode
    });

    // Si la fonction RPC n'existe pas, utiliser une mise à jour directe
    if (updateError && updateError.message.includes('function') && updateError.message.includes('does not exist')) {
      const { data: link } = await supabase
        .from('campaign_short_links')
        .select('clicks_count')
        .eq('short_code', shortCode)
        .single();

      if (link) {
        const { error: directUpdateError } = await supabase
          .from('campaign_short_links')
          .update({ clicks_count: (link.clicks_count || 0) + 1 })
          .eq('short_code', shortCode);

        if (directUpdateError) {
          console.error('Error incrementing clicks:', directUpdateError);
          // Ne pas retourner d'erreur, juste logger
        }
      }
    } else if (updateError) {
      console.error('Error incrementing clicks:', updateError);
      // Ne pas retourner d'erreur, juste logger
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error in redirect POST API:', error);
    // Ne pas retourner d'erreur pour l'incrémentation des clics
    return NextResponse.json({ success: true });
  }
}

