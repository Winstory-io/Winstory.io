import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/notifications/my
 * 
 * Récupère les notifications pour un wallet donné
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    const limit = parseInt(searchParams.get('limit') || '50');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'wallet is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('system_notifications')
      .select('*')
      .eq('user_wallet', wallet.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notifications || [],
      count: notifications?.length || 0
    });

  } catch (error) {
    console.error('Error in GET /api/notifications/my:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications/my
 * 
 * Marque une notification comme lue
 */
export async function PATCH(request: NextRequest) {
  try {
    const { notificationId, wallet } = await request.json();

    if (!notificationId || !wallet) {
      return NextResponse.json(
        { success: false, error: 'notificationId and wallet are required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('system_notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_wallet', wallet.toLowerCase());

    if (error) {
      console.error('Error marking notification as read:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error in PATCH /api/notifications/my:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

