import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * GET /api/campaigns/short-link/clicks?campaignId=xxx&walletAddress=xxx
 * Récupère l'historique des clics pour une campagne
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const walletAddress = searchParams.get('walletAddress');
    const includeSpam = searchParams.get('includeSpam') === 'true';

    if (!campaignId || !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'campaignId and walletAddress are required' },
        { status: 400 }
      );
    }

    // Vérifier que le wallet est bien le créateur de la campagne
    const { data: link, error: linkError } = await supabase
      .from('campaign_short_links')
      .select('id, creator_wallet')
      .eq('campaign_id', campaignId)
      .eq('creator_wallet', walletAddress.toLowerCase())
      .single();

    if (linkError || !link) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found or unauthorized' },
        { status: 404 }
      );
    }

    // Construire la requête pour récupérer les clics
    let query = supabase
      .from('campaign_short_link_clicks')
      .select('*')
      .eq('short_link_id', link.id)
      .order('clicked_at', { ascending: false });

    // Filtrer les spams si demandé
    if (!includeSpam) {
      query = query.eq('is_spam', false).eq('is_valid', true);
    }

    const { data: clicks, error: clicksError } = await query;

    if (clicksError) {
      console.error('Error fetching clicks:', clicksError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch clicks' },
        { status: 500 }
      );
    }

    // Calculer les statistiques
    const stats = {
      total: clicks?.length || 0,
      valid: clicks?.filter(c => c.is_valid && !c.is_spam).length || 0,
      spam: clicks?.filter(c => c.is_spam).length || 0,
      byCountry: {} as Record<string, number>,
      byDevice: {} as Record<string, number>,
      byBrowser: {} as Record<string, number>,
      byReferrer: {} as Record<string, number>,
      clicksByDate: {} as Record<string, number>
    };

    clicks?.forEach(click => {
      // Par pays
      if (click.country_code) {
        stats.byCountry[click.country_code] = (stats.byCountry[click.country_code] || 0) + 1;
      }

      // Par appareil
      if (click.device_type) {
        stats.byDevice[click.device_type] = (stats.byDevice[click.device_type] || 0) + 1;
      }

      // Par navigateur
      if (click.browser) {
        stats.byBrowser[click.browser] = (stats.byBrowser[click.browser] || 0) + 1;
      }

      // Par référent
      if (click.referrer) {
        try {
          const referrerUrl = new URL(click.referrer);
          const domain = referrerUrl.hostname;
          stats.byReferrer[domain] = (stats.byReferrer[domain] || 0) + 1;
        } catch {
          stats.byReferrer[click.referrer] = (stats.byReferrer[click.referrer] || 0) + 1;
        }
      } else {
        stats.byReferrer['Direct'] = (stats.byReferrer['Direct'] || 0) + 1;
      }

      // Par date
      if (click.clicked_at) {
        const date = new Date(click.clicked_at).toISOString().split('T')[0];
        stats.clicksByDate[date] = (stats.clicksByDate[date] || 0) + 1;
      }
    });

    return NextResponse.json({
      success: true,
      clicks: clicks || [],
      stats
    });

  } catch (error: any) {
    console.error('Error in clicks API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

