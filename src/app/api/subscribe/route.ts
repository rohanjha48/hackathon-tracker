import { NextRequest, NextResponse } from 'next/server';
import { upsertSubscriber } from '@/lib/supabase';
import { Subscriber } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegram_chat_id, telegram_username, filter_tags, notify_days_before } = body;

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
