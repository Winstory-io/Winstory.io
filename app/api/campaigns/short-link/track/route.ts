import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Limites de clics pour protection anti-abus
const MAX_CLICKS_PER_HOUR_IP = 50; // Maximum 50 clics par IP par heure
const MAX_CLICKS_PER_HOUR_WALLET = 100; // Maximum 100 clics par wallet par heure
const MAX_CLICKS_PER_DAY_IP = 200; // Maximum 200 clics par IP par jour
const MAX_CLICKS_PER_DAY_WALLET = 500; // Maximum 500 clics par wallet par jour

// Fonction pour extraire l'IP de la requête
function getClientIP(request: NextRequest): string {
  // Essayer différents headers pour obtenir l'IP réelle
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}

// Fonction pour détecter le type d'appareil depuis le user agent
function detectDevice(userAgent: string): { deviceType: string; browser: string; os: string } {
  const ua = userAgent.toLowerCase();
  
  let deviceType = 'desktop';
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    deviceType = 'mobile';
  } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = 'tablet';
  }
  
  let browser = 'unknown';
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'chrome';
  else if (ua.includes('firefox')) browser = 'firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'safari';
  else if (ua.includes('edg')) browser = 'edge';
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'opera';
  
  let os = 'unknown';
  if (ua.includes('windows')) os = 'windows';
  else if (ua.includes('mac')) os = 'macos';
  else if (ua.includes('linux')) os = 'linux';
  else if (ua.includes('android')) os = 'android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'ios';
  
  return { deviceType, browser, os };
}

// Fonction pour vérifier les limites de clics (protection anti-abus)
async function checkRateLimit(
  shortLinkId: string,
  identifier: string,
  identifierType: 'ip' | 'wallet'
): Promise<{ allowed: boolean; reason?: string }> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // Vérifier si l'identifiant est bloqué
  const { data: blocked } = await supabase
    .from('campaign_short_link_rate_limits')
    .select('*')
    .eq('short_link_id', shortLinkId)
    .eq('identifier', identifier)
    .eq('identifier_type', identifierType)
    .eq('is_blocked', true)
    .single();
  
  if (blocked) {
    return { allowed: false, reason: blocked.block_reason || 'Blocked due to abuse' };
  }
  
  // Compter les clics de la dernière heure
  const { count: hourlyClicks } = await supabase
    .from('campaign_short_link_rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('short_link_id', shortLinkId)
    .eq('identifier', identifier)
    .eq('identifier_type', identifierType)
    .gte('window_start', oneHourAgo.toISOString())
    .lte('window_end', now.toISOString());
  
  const maxHourly = identifierType === 'ip' ? MAX_CLICKS_PER_HOUR_IP : MAX_CLICKS_PER_HOUR_WALLET;
  if ((hourlyClicks || 0) >= maxHourly) {
    // Bloquer cet identifiant
    await supabase
      .from('campaign_short_link_rate_limits')
      .insert({
        short_link_id: shortLinkId,
        identifier,
        identifier_type: identifierType,
        is_blocked: true,
        block_reason: `Exceeded hourly limit (${maxHourly} clicks/hour)`,
        window_start: now,
        window_end: new Date(now.getTime() + 24 * 60 * 60 * 1000) // Blocage de 24h
      });
    
    return { allowed: false, reason: `Exceeded hourly limit (${maxHourly} clicks/hour)` };
  }
  
  // Compter les clics du dernier jour
  const { count: dailyClicks } = await supabase
    .from('campaign_short_link_rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('short_link_id', shortLinkId)
    .eq('identifier', identifier)
    .eq('identifier_type', identifierType)
    .gte('window_start', oneDayAgo.toISOString());
  
  const maxDaily = identifierType === 'ip' ? MAX_CLICKS_PER_DAY_IP : MAX_CLICKS_PER_DAY_WALLET;
  if ((dailyClicks || 0) >= maxDaily) {
    // Bloquer cet identifiant
    await supabase
      .from('campaign_short_link_rate_limits')
      .insert({
        short_link_id: shortLinkId,
        identifier,
        identifier_type: identifierType,
        is_blocked: true,
        block_reason: `Exceeded daily limit (${maxDaily} clicks/day)`,
        window_start: now,
        window_end: new Date(now.getTime() + 24 * 60 * 60 * 1000) // Blocage de 24h
      });
    
    return { allowed: false, reason: `Exceeded daily limit (${maxDaily} clicks/day)` };
  }
  
  return { allowed: true };
}

/**
 * POST /api/campaigns/short-link/track
 * Enregistre un clic sur un lien court avec toutes les métriques
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      shortCode, 
      walletAddress,
      geolocation, // { countryCode, countryName, region, city, latitude, longitude }
      referrer 
    } = body;

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

    // Extraire les informations de la requête
    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const { deviceType, browser, os } = detectDevice(userAgent);

    // Vérifier les limites de clics (protection anti-abus)
    const ipCheck = await checkRateLimit(link.id, ipAddress, 'ip');
    if (!ipCheck.allowed) {
      // Enregistrer comme spam mais ne pas bloquer la redirection (pour éviter les faux positifs)
      await supabase
        .from('campaign_short_link_clicks')
        .insert({
          short_link_id: link.id,
          ip_address: ipAddress,
          wallet_address: walletAddress || null,
          referrer: referrer || null,
          user_agent: userAgent,
          device_type: deviceType,
          browser,
          os,
          country_code: geolocation?.countryCode || null,
          country_name: geolocation?.countryName || null,
          region: geolocation?.region || null,
          city: geolocation?.city || null,
          latitude: geolocation?.latitude || null,
          longitude: geolocation?.longitude || null,
          is_valid: false,
          is_spam: true,
          spam_reason: ipCheck.reason || 'Rate limit exceeded'
        });
      
      // Ne pas bloquer, mais marquer comme spam
      return NextResponse.json({ 
        success: true, 
        spam: true,
        message: 'Click recorded but marked as potential spam'
      });
    }

    // Vérifier aussi par wallet si disponible
    if (walletAddress) {
      const walletCheck = await checkRateLimit(link.id, walletAddress.toLowerCase(), 'wallet');
      if (!walletCheck.allowed) {
        await supabase
          .from('campaign_short_link_clicks')
          .insert({
            short_link_id: link.id,
            ip_address: ipAddress,
            wallet_address: walletAddress,
            referrer: referrer || null,
            user_agent: userAgent,
            device_type: deviceType,
            browser,
            os,
            country_code: geolocation?.countryCode || null,
            country_name: geolocation?.countryName || null,
            region: geolocation?.region || null,
            city: geolocation?.city || null,
            latitude: geolocation?.latitude || null,
            longitude: geolocation?.longitude || null,
            is_valid: false,
            is_spam: true,
            spam_reason: walletCheck.reason || 'Rate limit exceeded'
          });
        
        return NextResponse.json({ 
          success: true, 
          spam: true,
          message: 'Click recorded but marked as potential spam'
        });
      }
    }

    // Enregistrer le clic valide
    const { data: click, error: clickError } = await supabase
      .from('campaign_short_link_clicks')
      .insert({
        short_link_id: link.id,
        ip_address: ipAddress,
        wallet_address: walletAddress || null,
        referrer: referrer || null,
        user_agent: userAgent,
        device_type: deviceType,
        browser,
        os,
        country_code: geolocation?.countryCode || null,
        country_name: geolocation?.countryName || null,
        region: geolocation?.region || null,
        city: geolocation?.city || null,
        latitude: geolocation?.latitude || null,
        longitude: geolocation?.longitude || null,
        is_valid: true,
        is_spam: false
      })
      .select()
      .single();

    if (clickError) {
      console.error('Error recording click:', clickError);
      // Ne pas bloquer la redirection en cas d'erreur
    } else {
      // Enregistrer dans la table de rate limiting
      const now = new Date();
      await supabase
        .from('campaign_short_link_rate_limits')
        .insert({
          short_link_id: link.id,
          identifier: ipAddress,
          identifier_type: 'ip',
          click_count: 1,
          window_start: now,
          window_end: new Date(now.getTime() + 60 * 60 * 1000) // 1 heure
        });

      if (walletAddress) {
        await supabase
          .from('campaign_short_link_rate_limits')
          .insert({
            short_link_id: link.id,
            identifier: walletAddress.toLowerCase(),
            identifier_type: 'wallet',
            click_count: 1,
            window_start: now,
            window_end: new Date(now.getTime() + 60 * 60 * 1000) // 1 heure
          });
      }

      // Incrémenter le compteur de clics sur le lien
      await supabase
        .from('campaign_short_links')
        .update({ clicks_count: (link.clicks_count || 0) + 1 })
        .eq('id', link.id);
    }

    return NextResponse.json({ 
      success: true, 
      clickId: click?.id,
      spam: false
    });

  } catch (error: any) {
    console.error('Error in track API:', error);
    // Ne pas bloquer la redirection en cas d'erreur
    return NextResponse.json({ 
      success: true, 
      error: error.message 
    });
  }
}

