#!/usr/bin/env node
/**
 * 📢 Serverless Notifier Engine (Phase 4: Notification Engine with Location & Currency Localization)
 * File: scripts/notify.js
 *
 * Requirements:
 * 1. Query Supabase for hackathons where registration_end is less than 48 hours away.
 * 2. Query the Users table for subscribed Telegram IDs with location preferences (preferred_city, preferred_country, preferred_mode).
 * 3. Match users by tags AND location preferences (e.g., Bangalore in-person alerts vs Online alerts).
 * 4. Format reminder message with localized currency (₹ INR vs $ USD) and explicit mode:
 *    '📍 Mode: In-Person, Bangalore (India)' or '🌐 Mode: Online'.
 * 5. Send alerts via node-telegram-bot-api and log to prevent duplicates.
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const TelegramBotModule = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const token = process.env.TELEGRAM_BOT_TOKEN;

let supabase = null;
if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Initialize Telegram Bot instance supporting all versions of node-telegram-bot-api
let bot = null;
if (token && !token.includes('sample')) {
  try {
    const BotConstructor = TelegramBotModule.Bot || TelegramBotModule;
    bot = new BotConstructor(token, { polling: false });
  } catch (botInitErr) {
    console.warn('Telegram bot initialization note:', botInitErr.message);
  }
}

/**
 * Universal Telegram message sender using node-telegram-bot-api or HTTP fallback
 */
async function sendTelegramAlert(chatId, text) {
  if (bot) {
    if (typeof bot.sendMessage === 'function') {
      return await bot.sendMessage(chatId, text, {
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      });
    }
    if (bot.api && typeof bot.api.sendMessage === 'function') {
      return await bot.api.sendMessage(chatId, text, {
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      });
    }
  }

  // Pure serverless HTTP fallback
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.description || `HTTP ${res.status}: Failed to send Telegram message`);
  }
  return data.result;
}

/**
 * Format prize money with local currency code and numbering system
 */
function formatPrize(hackathon) {
  const amount = Number(hackathon.prize_amount ?? hackathon.prize_pool) || 0;
  const currency = (hackathon.prize_currency || hackathon.currency || 'USD').toUpperCase().trim();

  if (amount <= 0) {
    return '🏆 *Prizes:* Swag, Mentorship & Certificates';
  }

  if (currency === 'INR' || currency === '₹' || currency === 'RS') {
    return `💰 *Prize Pool:* ₹${Math.round(amount).toLocaleString('en-IN')} INR`;
  }

  if (currency === 'EUR' || currency === '€') {
    return `💰 *Prize Pool:* €${Math.round(amount).toLocaleString('de-DE')} EUR`;
  }

  if (currency === 'GBP' || currency === '£') {
    return `💰 *Prize Pool:* £${Math.round(amount).toLocaleString('en-GB')} GBP`;
  }

  return `💰 *Prize Pool:* $${Math.round(amount).toLocaleString('en-US')} USD`;
}

/**
 * Format Mode and Location explicitly per user requirement:
 * '📍 Mode: In-Person, Bangalore (India)' or '🌐 Mode: Online'
 */
function formatMode(hackathon) {
  const mode = (hackathon.mode || hackathon.location_type || 'online').toLowerCase();

  if (mode.includes('in-person') || mode.includes('offline') || mode === 'in-person') {
    const city = hackathon.city ? hackathon.city.trim() : '';
    const country = hackathon.country ? hackathon.country.trim() : '';
    let loc = '';
    if (city && country) {
      loc = `, ${city} (${country})`;
    } else if (city) {
      loc = `, ${city}`;
    } else if (country) {
      loc = `, ${country}`;
    } else if (hackathon.location && !hackathon.location.toLowerCase().includes('online')) {
      loc = `, ${hackathon.location}`;
    }
    return `📍 *Mode:* In-Person${loc}`;
  }

  if (mode.includes('hybrid')) {
    const city = hackathon.city ? hackathon.city.trim() : '';
    const country = hackathon.country ? hackathon.country.trim() : '';
    let loc = '';
    if (city && country) {
      loc = `, ${city} (${country})`;
    } else if (city) {
      loc = `, ${city}`;
    }
    return `🌐📍 *Mode:* Hybrid${loc}`;
  }

  return '🌐 *Mode:* Online';
}

function formatReminderMessage(hackathon, hoursLeft) {
  const deadline = new Date(hackathon.registration_end || hackathon.submission_deadline);
  const formattedDate = deadline.toUTCString().replace(':00 GMT', ' UTC');
  const prize = formatPrize(hackathon);
  const modeLine = formatMode(hackathon);

  const tags = (hackathon.tags || []).map((t) => `#${t.replace(/[^a-zA-Z0-9]/g, '')}`).join(' ');

  return [
    '🚨 *HACKATHON REGISTRATION CLOSING SOON!* 🚨',
    `⏳ *Time Remaining:* ~${Math.max(1, Math.round(hoursLeft))} hours left!`,
    '',
    `🎯 *${hackathon.title}*`,
    modeLine,
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

/**
 * Checks if a hackathon matches the subscriber's location preferences:
 * - preferred_mode: 'both', 'online', 'in-person'
 * - preferred_city: 'Bangalore', 'Delhi', etc.
 * - preferred_country: 'India', 'USA', etc.
 */
function matchesLocationPreferences(user, hackathon) {
  const userMode = (user.preferred_mode || 'both').toLowerCase().trim();
  const hackMode = (hackathon.mode || hackathon.location_type || 'online').toLowerCase().trim();
  const isOnlineHack = hackMode.includes('online');
  const isInPersonHack = hackMode.includes('in-person') || hackMode.includes('offline') || hackMode.includes('hybrid');

  // Mode filter
  if (userMode === 'online' && !isOnlineHack) {
    return false;
  }
  if (userMode === 'in-person' && isOnlineHack && !hackMode.includes('hybrid')) {
    return false;
  }

  // City filter for In-Person / Hybrid hackathons
  if (user.preferred_city && user.preferred_city !== 'All' && user.preferred_city.trim() !== '') {
    const userCity = user.preferred_city.toLowerCase().trim();
    if (isInPersonHack) {
      const hackCity = (hackathon.city || '').toLowerCase().trim();
      const hackLoc = (hackathon.location || '').toLowerCase();

      // Normalize Bangalore / Bengaluru alias matching
      const matchesBangalore =
        userCity === 'bangalore' &&
        (hackCity.includes('bangalore') || hackCity.includes('bengaluru') || hackLoc.includes('bangalore') || hackLoc.includes('bengaluru'));

      const matchesDirect = hackCity.includes(userCity) || hackLoc.includes(userCity);

      if (!matchesBangalore && !matchesDirect) {
        return false;
      }
    }
  }

  // Country filter for In-Person / Hybrid hackathons
  if (user.preferred_country && user.preferred_country !== 'All' && user.preferred_country.trim() !== '') {
    const userCountry = user.preferred_country.toLowerCase().trim();
    if (isInPersonHack) {
      const hackCountry = (hackathon.country || '').toLowerCase().trim();
      const hackLoc = (hackathon.location || '').toLowerCase();

      if (!hackCountry.includes(userCountry) && !hackLoc.includes(userCountry)) {
        return false;
      }
    }
  }

  return true;
}

async function notify() {
  console.log('📢 [Notifier Engine] Checking for deadlines under 48 hours with Location & Currency Localization...');
  const startTime = Date.now();

  const now = new Date();
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  if (!supabase) {
    console.log('⚠️ Supabase credentials not found. Simulating localized notification messages:');

    // Sample 1: In-Person Bangalore event with INR prize
    const sampleBangaloreHackathon = {
      id: 'sample-blr-1',
      title: 'Flipkart GRiD 7.0 Tech Challenge (Bangalore)',
      registration_end: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      prize_pool: 1000000,
      prize_amount: 1000000,
      currency: 'INR',
      prize_currency: 'INR',
      mode: 'in-person',
      location_type: 'In-Person',
      location: 'Bangalore, Karnataka, India',
      city: 'Bangalore',
      country: 'India',
      source: 'Unstop',
      tags: ['AI', 'Robotics', 'FinTech'],
      url: 'https://unstop.com/hackathons/flipkart-grid-7',
      description: 'India largest flagship engineering challenge. Build autonomous robotics, smart fulfillment algorithms, and high-concurrency e-commerce systems in Bangalore.'
    };

    // Sample 2: Online event with USD prize
    const sampleOnlineHackathon = {
      id: 'sample-online-2',
      title: 'Gemini AI Global Student Sprint 2026',
      registration_end: new Date(now.getTime() + 18 * 60 * 60 * 1000).toISOString(),
      prize_pool: 50000,
      prize_amount: 50000,
      currency: 'USD',
      prize_currency: 'USD',
      mode: 'online',
      location_type: 'Online',
      location: 'Online (Worldwide)',
      city: 'Online',
      country: 'Global',
      source: 'Devpost',
      tags: ['AI', 'Open Source', 'Beginner-Friendly'],
      url: 'https://devpost.com/hackathons/gemini-ai-sprint',
      description: 'Build breakthrough generative AI agents and multimodal applications solving real-world student challenges.'
    };

    console.log('\n--- [SAMPLE 1: BANGALORE IN-PERSON EVENT - INR CURRENCY] ---');
    console.log(formatReminderMessage(sampleBangaloreHackathon, 24));

    console.log('\n--- [SAMPLE 2: GLOBAL ONLINE EVENT - USD CURRENCY] ---');
    console.log(formatReminderMessage(sampleOnlineHackathon, 18));

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
    console.warn(`⚠️ Supabase table query note: ${hError.message}`);
    console.log('💡 Tip: Apply supabase/migrations/20261003010000_location_and_currency_localization.sql in your Supabase SQL Editor.');
    console.log('\nSimulating localized notification messages below:');

    // Sample 1: In-Person Bangalore event with INR prize
    const sampleBangaloreHackathon = {
      id: 'sample-blr-1',
      title: 'Flipkart GRiD 7.0 Tech Challenge (Bangalore)',
      registration_end: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      prize_pool: 1000000,
      prize_amount: 1000000,
      currency: 'INR',
      prize_currency: 'INR',
      mode: 'in-person',
      location_type: 'In-Person',
      location: 'Bangalore, Karnataka, India',
      city: 'Bangalore',
      country: 'India',
      source: 'Unstop',
      tags: ['AI', 'Robotics', 'FinTech'],
      url: 'https://unstop.com/hackathons/flipkart-grid-7',
      description: 'India largest flagship engineering challenge. Build autonomous robotics, smart fulfillment algorithms, and high-concurrency e-commerce systems in Bangalore.'
    };

    // Sample 2: Online event with USD prize
    const sampleOnlineHackathon = {
      id: 'sample-online-2',
      title: 'Gemini AI Global Student Sprint 2026',
      registration_end: new Date(now.getTime() + 18 * 60 * 60 * 1000).toISOString(),
      prize_pool: 50000,
      prize_amount: 50000,
      currency: 'USD',
      prize_currency: 'USD',
      mode: 'online',
      location_type: 'Online',
      location: 'Online (Worldwide)',
      city: 'Online',
      country: 'Global',
      source: 'Devpost',
      tags: ['AI', 'Open Source', 'Beginner-Friendly'],
      url: 'https://devpost.com/hackathons/gemini-ai-sprint',
      description: 'Build breakthrough generative AI agents and multimodal applications solving real-world student challenges.'
    };

    console.log('\n--- [SAMPLE 1: BANGALORE IN-PERSON EVENT - INR CURRENCY] ---');
    console.log(formatReminderMessage(sampleBangaloreHackathon, 24));

    console.log('\n--- [SAMPLE 2: GLOBAL ONLINE EVENT - USD CURRENCY] ---');
    console.log(formatReminderMessage(sampleOnlineHackathon, 18));

    console.log('\n✅ Localized notification simulation completed!\n');
    return;
  }

  if (!closingHackathons || closingHackathons.length === 0) {
    console.log('ℹ️ No hackathons found closing in less than 48 hours.');
    return;
  }

  console.log(`🔎 Found ${closingHackathons.length} hackathon(s) closing within 48 hours.`);

  // 2. Query the Users table for subscribed Telegram IDs & location preferences
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

  // 3. Loop through users and send localized reminder messages
  let sentCount = 0;

  for (const hackathon of closingHackathons) {
    const deadline = new Date(hackathon.registration_end);
    const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    for (const user of users) {
      const telegramId = user.telegram_id || user.telegram_chat_id;
      if (!telegramId) continue;

      // 3a. Check tag filter matching
      if (user.filter_tags && user.filter_tags.length > 0 && !user.filter_tags.includes('All')) {
        const matchesTag = user.filter_tags.some((t) =>
          (hackathon.tags || []).some((ht) => ht.toLowerCase() === t.toLowerCase())
        );
        if (!matchesTag) continue;
      }

      // 3b. Check location & mode preferences (Bangalore / Delhi / Online / Both)
      if (!matchesLocationPreferences(user, hackathon)) {
        continue;
      }

      // 3c. Check notification_logs to prevent duplicate spam (idempotency)
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
        if (token && !token.includes('sample')) {
          const sentResult = await sendTelegramAlert(telegramId, messageText);
          const messageId = sentResult?.message_id || 'unknown';

          console.log(`📤 [Telegram] Sent reminder to user ${telegramId} for "${hackathon.title}" [${hackathon.city || 'Online'}]`);

          // Record in notification_logs
          await supabase.from('notification_logs').insert({
            user_id: user.id,
            hackathon_id: hackathon.id,
            notification_type: '48_hours',
            status: 'sent',
            telegram_message_id: String(messageId),
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
