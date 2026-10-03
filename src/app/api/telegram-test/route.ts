import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeTestPing } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId, tags, preferred_city, preferred_country, preferred_mode } = body;

    if (!chatId || String(chatId).trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Telegram Chat ID is required.' },
        { status: 400 }
      );
    }

    const result = await sendWelcomeTestPing(
      String(chatId).trim(),
      Array.isArray(tags) ? tags : [],
      undefined,
      { preferred_city, preferred_country, preferred_mode }
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to deliver message via Telegram Bot API.',
          hint: 'Ensure your bot token is set in TELEGRAM_BOT_TOKEN and you have sent /start to your bot.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test alert delivered to Telegram successfully! Check your chat.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error sending Telegram message';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
