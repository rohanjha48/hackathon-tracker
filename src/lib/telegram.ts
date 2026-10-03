import { Hackathon, NotificationType } from './types';

/**
 * Format a hackathon notification into clean Telegram Markdown
 */
export function formatHackathonAlert(hackathon: Hackathon, type: NotificationType): string {
  let urgencyHeader = '🔔 *NEW HACKATHON ALERT* 🔔';
  if (type === '1_day') {
    urgencyHeader = '🚨 *FINAL 24 HOURS TO SUBMIT!* 🚨';
  } else if (type === '3_days') {
    urgencyHeader = '⏰ *3 DAYS REMAINING!* ⏰';
  } else if (type === '7_days') {
    urgencyHeader = '📅 *DEADLINE IN 7 DAYS* 📅';
  }

  const deadline = new Date(hackathon.submission_deadline);
  const formattedDate = deadline.toUTCString().replace(':00 GMT', ' UTC');
  const prize = hackathon.prize_pool > 0
    ? `💰 *Prize Pool:* $${hackathon.prize_pool.toLocaleString()} ${hackathon.currency}`
    : '🏆 *Prizes:* Swag, Mentorship & Certificates';

  const tagsFormatted = hackathon.tags && hackathon.tags.length > 0
    ? hackathon.tags.map((t) => `#${t.replace(/[^a-zA-Z0-9]/g, '')}`).join(' ')
    : '#Hackathon #StudentDev';

  const message = [
    urgencyHeader,
    '',
    `🎯 *${hackathon.title}*`,
    `📍 *Format:* ${hackathon.location_type} (${hackathon.location_name})`,
    prize,
    `⏳ *Deadline:* ${formattedDate}`,
    `🏢 *Platform:* ${hackathon.source}`,
    '',
    `📝 *Overview:*`,
    `_${hackathon.description.slice(0, 240)}${hackathon.description.length > 240 ? '...' : ''}_`,
    '',
    `🏷️ *Tags:* ${tagsFormatted}`,
    '',
    `🔗 [Apply & Learn More](${hackathon.url})`,
    '',
    '⚡ _Sent via HackTrack Telegram Alert Radar_'
  ].join('\n');

  return message;
}

/**
 * Send a message to a Telegram Chat ID using the Telegram Bot API
 */
export async function sendTelegramMessage(
  chatId: string,
  text: string,
  botToken?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return {
      success: false,
      error: 'TELEGRAM_BOT_TOKEN is not configured in environment variables.',
    };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      return {
        success: false,
        error: data.description || `HTTP ${response.status}: Failed to deliver Telegram message`,
      };
    }

    return {
      success: true,
      messageId: String(data.result?.message_id),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: errorMsg };
  }
}

/**
 * Send a verification ping when a student subscribes from the UI
 */
export async function sendWelcomeTestPing(
  chatId: string,
  tags: string[],
  botToken?: string,
  locationInfo?: { preferred_city?: string; preferred_country?: string; preferred_mode?: string }
): Promise<{ success: boolean; message?: string; error?: string }> {
  const tagsList = tags.length > 0 ? tags.join(', ') : 'All categories';
  const city = locationInfo?.preferred_city && locationInfo.preferred_city !== 'All' ? locationInfo.preferred_city : 'All Cities (Global)';
  const mode = locationInfo?.preferred_mode === 'in-person' ? 'In-Person Only' : locationInfo?.preferred_mode === 'online' ? 'Online Only' : 'Both (Online & In-Person)';

  const welcomeText = [
    '🎉 *Welcome to HackTrack Telegram Alerts!*',
    '',
    'Your subscription is active and connected to our live serverless pipeline.',
    '',
    `📍 *Location Preferences:* ${city} • ${mode}`,
    `🎯 *Your Subscribed Tags:* \`${tagsList}\``,
    '⏰ *Alert Windows:* 7 days, 3 days, and 24-48h before submission deadlines.',
    '',
    'You will automatically receive formatted alerts directly in this chat whenever hackathons matching your interests approach their deadline!',
    '',
    '🚀 _Ready to hack? Good luck on your submissions!_'
  ].join('\n');

  const res = await sendTelegramMessage(chatId, welcomeText, botToken);
  if (!res.success) {
    return { success: false, error: res.error };
  }
  return { success: true, message: 'Test message delivered to Telegram!' };
}
