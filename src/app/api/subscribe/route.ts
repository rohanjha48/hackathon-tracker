import { NextRequest, NextResponse } from 'next/server';
import { upsertSubscriber } from '@/lib/supabase';
import { Subscriber } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      telegram_chat_id,
      telegram_username,
      filter_tags,
      notify_days_before,
      preferred_country,
      preferred_city,
      preferred_mode,
    } = body;

    if (!telegram_chat_id || String(telegram_chat_id).trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Telegram Chat ID is required to deliver alerts.' },
        { status: 400 }
      );
    }

    const subscriber: Subscriber = {
      telegram_chat_id: String(telegram_chat_id).trim(),
      telegram_username: telegram_username ? String(telegram_username).trim().replace(/^@/, '') : undefined,
      filter_tags: Array.isArray(filter_tags) ? filter_tags : [],
      preferred_country: preferred_country ? String(preferred_country).trim() : undefined,
      preferred_city: preferred_city ? String(preferred_city).trim() : undefined,
      preferred_mode: preferred_mode ? String(preferred_mode).trim() : 'both',
      notify_days_before: Array.isArray(notify_days_before) && notify_days_before.length > 0
        ? notify_days_before
        : [7, 3, 1],
    };

    const result = await upsertSubscriber(subscriber);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Subscription failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
