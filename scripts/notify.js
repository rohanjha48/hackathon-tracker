#!/usr/bin/env node
/**
 * 📢 Serverless Notifier Engine (Phase 3: Notification Engine)
 * File: scripts/notify.js
 *
 * Requirements:
 * 1. Query Supabase for hackathons where registration_end is less than 48 hours away.
 * 2. Query the Users table for subscribed Telegram IDs.
 * 3. Loop through the users and use node-telegram-bot-api to send a reminder message.
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const token = process.env.TELEGRAM_BOT_TOKEN;

let supabase = null;
if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Initialize node-telegram-bot-api without polling (pure serverless push)
let bot = null;
if (token && !token.includes('sample')) {
  bot = new TelegramBot(token, { polling: false });
}

function formatReminderMessage(hackathon, hoursLeft) {
  const deadline = new Date(hackathon.registration_end || hackathon.submission_deadline);
  const formattedDate = deadline.toUTCString().replace(':00 GMT', ' UTC');
  const prize = hackathon.prize_pool > 0
    ? `💰 *Prize Pool:* $${Number(hackathon.prize_pool).toLocaleString()} ${hackathon.currency || 'USD'}`
    : '🏆 *Prizes:* Swag, Mentorship & Certificates';

  const tags = (hackathon.tags || []).map((t) => `#${t.replace(/[^a-zA-Z0-9]/g, '')}`).join(' ');

  return [
    '🚨 *HACKATHON REGISTRATION CLOSING SOON!* 🚨',
    `⏳ *Time Remaining:* ~${Math.max(1, Math.round(hoursLeft))} hours left!`,
    '',
    `🎯 *${hackathon.title}*`,
    `📍 *Format:* ${hackathon.location || hackathon.location_type || 'Online'}`,
    prize,
    `📅 *Registration Closes:* ${formattedDate}`,
    `🏢 *Platform:* ${hackathon.source || 'Devpost'}`,
    '',
    `📝 *Description:*`,
    `_${(hackathon.description || '').slice(0, 220)}..._`,
    '',
    `🏷️ *Tags:* ${tags}`,
    '',
    `🔗 [Register Now & Submit Project](${hackathon.url})`,
    '',
    '⚡ _Sent via HackTrack Student Hackathon Radar_'
  ].join('\n');
}

async function notify() {
  console.log('📢 [Notifier Engine] Checking for deadlines under 48 hours...');
  const startTime = Date.now();

  const now = new Date();
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  if (!supabase) {
    console.log('⚠️ Supabase credentials not found. Simulating notification check with sample events:');
    const sampleHackathon = {
      id: 'sample-1',
      title: 'Gemini AI Global Student Sprint 2026',
      registration_end: new Date(now.getTime() + 22 * 60 * 60 * 1000).toISOString(),
      prize_pool: 50000,
      currency: 'USD',
      location: 'Online (Worldwide)',
      source: 'Devpost',
      tags: ['AI', 'Open Source'],
      url: 'https://devpost.com',
      description: 'Build breakthrough generative AI agents and multimodal applications solving real-world student challenges.'
    };

    const text = formatReminderMessage(sampleHackathon, 22);
    console.log('\n[SIMULATED TELEGRAM MESSAGE - node-telegram-bot-api]');
    console.log(text);
    console.log('\n✅ Dry-run completed in 0.05s\n');
    return;
  }

  // 1. Query Supabase for hackathons where registration_end is less than 48 hours away
  const { data: closingHackathons, error: hError } = await supabase
    .from('hackathons')
    .select('*')
    .eq('is_active', true)
    .gt('registration_end', now.toISOString())
    .lte('registration_end', in48Hours.toISOString());

  if (hError) {
    console.error('❌ Failed to query Hackathons table:', hError.message);
    return;
  }

  if (!closingHackathons || closingHackathons.length === 0) {
    console.log('ℹ️ No hackathons found closing in less than 48 hours.');
    return;
  }

  console.log(`🔎 Found ${closingHackathons.length} hackathon(s) closing within 48 hours.`);

  // 2. Query the Users table for subscribed Telegram IDs
  const { data: users, error: uError } = await supabase
    .from('users')
    .select('*')
    .eq('is_active', true);

  if (uError) {
    console.error('❌ Failed to query Users table:', uError.message);
    return;
  }

  if (!users || users.length === 0) {
    console.log('ℹ️ No subscribed users found in Users table.');
    return;
  }

  console.log(`👥 Found ${users.length} subscribed user(s) in Users table.`);

  // 3. Loop through users and use node-telegram-bot-api to send reminder message
  let sentCount = 0;

  for (const hackathon of closingHackathons) {
    const deadline = new Date(hackathon.registration_end);
    const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    for (const user of users) {
      const telegramId = user.telegram_id || user.telegram_chat_id;
      if (!telegramId) continue;

      // Check tag filter matching (if user has preferences)
      if (user.filter_tags && user.filter_tags.length > 0 && !user.filter_tags.includes('All')) {
        const matchesTag = user.filter_tags.some((t) =>
          (hackathon.tags || []).some((ht) => ht.toLowerCase() === t.toLowerCase())
        );
        if (!matchesTag) continue;
      }

      // Check notification_logs to prevent duplicate spam (idempotency)
      const { data: alreadySent } = await supabase
        .from('notification_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('hackathon_id', hackathon.id)
        .eq('notification_type', '48_hours')
        .maybeSingle();

      if (alreadySent) {
        continue; // Already notified this user about this hackathon's 48h deadline
      }

      const messageText = formatReminderMessage(hackathon, hoursLeft);

      try {
        if (bot) {
          const sentMessage = await bot.sendMessage(telegramId, messageText, {
            parse_mode: 'Markdown',
            disable_web_page_preview: false,
          });

          console.log(`📤 [Telegram] Sent reminder to user ${telegramId} for "${hackathon.title}"`);

          // Record in notification_logs
          await supabase.from('notification_logs').insert({
            user_id: user.id,
            hackathon_id: hackathon.id,
            notification_type: '48_hours',
            status: 'sent',
            telegram_message_id: String(sentMessage.message_id),
            sent_at: new Date().toISOString(),
          });
        } else {
          console.log(`[DRY-RUN - Missing Token] Would send to ${telegramId}:\n${hackathon.title}`);
        }

        sentCount++;
      } catch (sendErr) {
        console.error(`❌ Error sending to Telegram user ${telegramId}:`, sendErr.message);
      }
    }
  }

  console.log(`\n🎉 Notifier complete: ${sentCount} reminders processed in ${((Date.now() - startTime) / 1000).toFixed(2)}s\n`);
}

notify().catch((err) => {
  console.error('Fatal Notifier Error:', err);
  process.exit(1);
});
