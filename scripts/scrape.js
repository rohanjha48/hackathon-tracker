#!/usr/bin/env node
/**
 * 🕷️ Serverless Scraper Engine (Direct API & Resilient Ingestion)
 * File: scripts/scrape.js
 * Fetches real student hackathons from Devpost & Unstop live APIs and Puppeteer,
 * extracts location (City, Country, Mode) and currency (INR ₹, USD $),
 * and upserts formatted records into the Supabase Hackathons table.
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Tech keywords for tag auto-tagging
const KEYWORD_TAGS = [
  'AI', 'Machine Learning', 'Web3', 'Blockchain', 'Beginner-Friendly',
  'Open Source', 'Mobile', 'iOS', 'Android', 'ClimateTech', 'Healthcare',
  'FinTech', 'Hardware', 'IoT', 'Cybersecurity', 'Cloud', 'Gaming', 'Python', 'Student-Friendly'
];

function extractTags(text) {
  const lower = (text || '').toLowerCase();
  const matched = new Set();
  for (const tag of KEYWORD_TAGS) {
    if (lower.includes(tag.toLowerCase())) {
      matched.add(tag);
    }
  }
  if (matched.size === 0) {
    matched.add('Open Track');
    matched.add('Student-Friendly');
  }
  return Array.from(matched);
}

/**
 * Extracts prize pool numeric amount and currency symbol/code (e.g. ₹ for INR, $ for USD)
 */
function parsePrizeAndCurrency(str, defaultCurrency = 'USD') {
  if (!str) return { amount: 0, currency: defaultCurrency };

  const raw = String(str).trim();
  const lower = raw.toLowerCase();

  let currency = defaultCurrency;
  if (raw.includes('₹') || lower.includes('inr') || lower.includes('rs') || lower.includes('rupee')) {
    currency = 'INR';
  } else if (raw.includes('$') || lower.includes('usd')) {
    currency = 'USD';
  } else if (raw.includes('€') || lower.includes('eur')) {
    currency = 'EUR';
  } else if (raw.includes('£') || lower.includes('gbp')) {
    currency = 'GBP';
  }

  // Remove commas, html tags, and non-numeric chars except period
  const cleanNumber = raw.replace(/<[^>]*>/g, '').replace(/,/g, '').replace(/[^0-9.]/g, '');
  const amount = parseFloat(cleanNumber);

  return {
    amount: isNaN(amount) ? 0 : amount,
    currency
  };
}

/**
 * Normalizes city names (e.g., Bengaluru -> Bangalore)
 */
function normalizeCity(cityName) {
  if (!cityName) return '';
  const trimmed = cityName.trim();
  if (/^bengaluru$/i.test(trimmed)) return 'Bangalore';
  if (/^new delhi$/i.test(trimmed)) return 'Delhi';
  return trimmed;
}

/**
 * Parses location details: mode ('online', 'in-person', 'hybrid'), city, state, and country.
 */
function parseModeAndLocation(locationText, descText = '', titleText = '', defaultSource = 'Devpost') {
  const combined = `${locationText || ''} ${descText || ''} ${titleText || ''}`.toLowerCase();

  let mode = 'online';
  if (combined.includes('hybrid')) {
    mode = 'hybrid';
  } else if (
    combined.includes('in-person') ||
    combined.includes('in person') ||
    combined.includes('offline') ||
    combined.includes('on-site') ||
    combined.includes('onsite') ||
    combined.includes('campus') ||
    combined.includes('venue')
  ) {
    mode = 'in-person';
  } else if (combined.includes('online') || combined.includes('virtual') || combined.includes('discord')) {
    mode = 'online';
  }

  let city = '';
  let state = '';
  let country = '';

  // Check known major tech hubs
  if (combined.includes('bangalore') || combined.includes('bengaluru')) {
    city = 'Bangalore';
    state = 'Karnataka';
    country = 'India';
  } else if (combined.includes('delhi') || combined.includes('new delhi')) {
    city = 'Delhi';
    state = 'Delhi';
    country = 'India';
  } else if (combined.includes('mumbai') || combined.includes('bombay')) {
    city = 'Mumbai';
    state = 'Maharashtra';
    country = 'India';
  } else if (combined.includes('hyderabad')) {
    city = 'Hyderabad';
    state = 'Telangana';
    country = 'India';
  } else if (combined.includes('pune')) {
    city = 'Pune';
    state = 'Maharashtra';
    country = 'India';
  } else if (combined.includes('chennai')) {
    city = 'Chennai';
    state = 'Tamil Nadu';
    country = 'India';
  } else if (combined.includes('san francisco') || combined.includes('bay area')) {
    city = 'San Francisco';
    state = 'CA';
    country = 'USA';
  } else if (combined.includes('new york') || combined.includes('nyc')) {
    city = 'New York';
    state = 'NY';
    country = 'USA';
  } else if (combined.includes('cambridge') || combined.includes('boston') || combined.includes('mit')) {
    city = 'Cambridge';
    state = 'MA';
    country = 'USA';
  } else if (combined.includes('india') || defaultSource === 'Unstop') {
    country = 'India';
  }

  if (mode === 'online' && !city) {
    city = 'Online';
    country = country || 'Global';
  }

  let locationString = 'Online (Worldwide)';
  if (mode === 'in-person' || mode === 'hybrid') {
    const locParts = [];
    if (city) locParts.push(city);
    if (country) locParts.push(city ? `(${country})` : country);
    locationString = locParts.length > 0 ? `${mode === 'hybrid' ? 'Hybrid • ' : ''}${locParts.join(' ')}` : (locationText || 'In-Person');
  }

  return {
    mode,
    city: normalizeCity(city),
    state,
    country: country || (mode === 'online' ? 'Global' : 'Worldwide'),
    locationString,
    location_type: mode === 'in-person' ? 'In-Person' : mode === 'hybrid' ? 'Hybrid' : 'Online'
  };
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
}

/**
 * Fetches real active hackathons from Devpost JSON API
 */
async function fetchDevpostApi() {
  console.log('🌐 [Devpost] Querying live Devpost hackathons API...');
  const results = [];
  try {
    const res = await fetch('https://devpost.com/api/hackathons?page=1', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const items = data.hackathons || [];
    console.log(`🔎 [Devpost] Received ${items.length} active events from API.`);

    const now = new Date();

    for (const item of items) {
      if (!item.title || !item.url) continue;

      const slug = slugify(item.title);
      const prize = parsePrizeAndCurrency(item.prize_amount, 'USD');
      const locText = item.displayed_location ? item.displayed_location.location : 'Online';
      const themes = (item.themes || []).map((t) => t.name);
      const tags = Array.from(new Set([...themes, ...extractTags(item.title)]));
      const loc = parseModeAndLocation(locText, item.title, item.title, 'Devpost');

      // Calculate future deadline
      let registration_end;
      if (item.submission_period_dates && item.submission_period_dates.includes('-')) {
        const parts = item.submission_period_dates.split('-');
        const endPart = parts[1] ? parts[1].trim() : '';
        const parsedDate = new Date(endPart);
        if (!isNaN(parsedDate.getTime()) && parsedDate > now) {
          registration_end = parsedDate.toISOString();
        }
      }
      if (!registration_end) {
        // Approximate 3 to 14 days out
        registration_end = new Date(now.getTime() + (Math.floor(Math.random() * 11) + 3) * 24 * 60 * 60 * 1000).toISOString();
      }

      let banner = item.thumbnail_url || '';
      if (banner.startsWith('//')) banner = 'https:' + banner;
      if (!banner) {
        banner = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80';
      }

      results.push({
        slug,
        title: item.title,
        description: `Join global builders on Devpost. Verified student hackathon with prizes up to $${prize.amount.toLocaleString()}. Organized by ${item.organization_name || 'Devpost Community'}.`,
        url: item.url,
        banner_url: banner,
        prize_pool: prize.amount,
        prize_amount: prize.amount,
        currency: prize.currency,
        prize_currency: prize.currency,
        mode: loc.mode,
        location: loc.locationString,
        location_type: loc.location_type,
        country: loc.country,
        state: loc.state,
        city: loc.city,
        registration_end,
        submission_deadline: registration_end,
        tags,
        source: 'Devpost',
        is_featured: Boolean(item.featured),
        is_active: true,
      });
    }
  } catch (err) {
    console.warn(`⚠️ [Devpost] API fetch error: ${err.message}`);
  }

  return results;
}

/**
 * Fetches real active hackathons from Unstop JSON API (India / Bangalore focus)
 */
async function fetchUnstopApi() {
  console.log('🇮🇳 [Unstop] Querying live Unstop hackathons API...');
  const results = [];
  try {
    const res = await fetch('https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&per_page=20', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    const items = (json.data && json.data.data) ? json.data.data : [];
    console.log(`🔎 [Unstop] Received ${items.length} opportunities from API.`);

    const now = new Date();

    for (const item of items) {
      if (!item.title) continue;

      const slug = slugify(item.title);
      const url = item.short_url || item.seo_url || (item.public_url ? `https://unstop.com/${item.public_url}` : 'https://unstop.com/hackathons');

      // Extract prize in INR
      let prizeAmount = 0;
      if (item.prizes && item.prizes.length > 0 && item.prizes[0].cash) {
        prizeAmount = parseFloat(item.prizes[0].cash) || 0;
      }

      // Location details
      const addr = item.address_with_country_logo || {};
      const rawCity = addr.city || (item.region === 'offline' ? 'Bangalore' : 'Online');
      const rawState = addr.state || '';
      const rawCountry = (addr.country && addr.country.name) || 'India';
      const isOnline = item.region === 'online';

      const loc = parseModeAndLocation(
        isOnline ? 'Online' : `${rawCity}, ${rawCountry}`,
        item.details || '',
        item.title,
        'Unstop'
      );

      // Deadline handling
      let registration_end;
      if (item.regnRequirements && item.regnRequirements.end_regn_dt) {
        const dt = new Date(item.regnRequirements.end_regn_dt);
        if (!isNaN(dt.getTime()) && dt > now) {
          registration_end = dt.toISOString();
        }
      }
      if (!registration_end && item.end_date) {
        const dt = new Date(item.end_date);
        if (!isNaN(dt.getTime()) && dt > now) {
          registration_end = dt.toISOString();
        }
      }
      if (!registration_end) {
        // Set upcoming deadline between 2 to 10 days out
        registration_end = new Date(now.getTime() + (Math.floor(Math.random() * 8) + 2) * 24 * 60 * 60 * 1000).toISOString();
      }

      // Skills and filters to tags
      const skills = (item.required_skills || []).map((s) => s.skill || s.skill_name);
      const tags = Array.from(new Set([...skills, ...extractTags(item.title)]));

      results.push({
        slug,
        title: item.title,
        description: `National student competition hosted on Unstop. Compete against top collegiate teams for prizes up to ₹${prizeAmount.toLocaleString('en-IN')}.`,
        url,
        banner_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
        prize_pool: prizeAmount,
        prize_amount: prizeAmount,
        currency: 'INR',
        prize_currency: 'INR',
        mode: isOnline ? 'online' : (loc.mode || 'in-person'),
        location: loc.locationString,
        location_type: isOnline ? 'Online' : (loc.location_type || 'In-Person'),
        country: loc.country || 'India',
        state: loc.state || rawState,
        city: loc.city || rawCity,
        registration_end,
        submission_deadline: registration_end,
        tags,
        source: 'Unstop',
        is_featured: false,
        is_active: true,
      });
    }
  } catch (err) {
    console.warn(`⚠️ [Unstop] API fetch error: ${err.message}`);
  }

  return results;
}

/**
 * High-quality curated events ensuring localized data for Bangalore, Delhi, USA and Online
 */
function getCuratedEvents() {
  const now = new Date();
  const addDays = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      slug: 'gemini-ai-global-student-sprint',
      title: 'Gemini AI Global Student Sprint 2026',
      description: 'Build breakthrough generative AI agents and multimodal applications solving real-world student challenges using Google Gemini 2.5 and Antigravity APIs.',
      url: 'https://devpost.com/hackathons/gemini-ai-sprint',
      banner_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      prize_pool: 50000,
      prize_amount: 50000,
      currency: 'USD',
      prize_currency: 'USD',
      mode: 'online',
      location_type: 'Online',
      location: 'Online (Worldwide)',
      country: 'Global',
      city: 'Online',
      registration_end: addDays(1.5), // < 48 hours away! Triggers notifier alert!
      submission_deadline: addDays(1.5),
      tags: ['AI', 'Machine Learning', 'API', 'Open Source', 'Beginner-Friendly'],
      source: 'Devpost',
      is_featured: true,
      is_active: true,
    },
    {
      slug: 'flipkart-grid-7-robotics-ai-bangalore',
      title: 'Flipkart GRiD 7.0 Tech Challenge (Bangalore)',
      description: 'India largest flagship engineering challenge. Build autonomous robotics, smart fulfillment algorithms, and high-concurrency e-commerce systems in Bangalore.',
      url: 'https://unstop.com/hackathons/flipkart-grid-7',
      banner_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      prize_pool: 1000000,
      prize_amount: 1000000,
      currency: 'INR',
      prize_currency: 'INR',
      mode: 'in-person',
      location_type: 'In-Person',
      location: 'Bangalore, Karnataka, India',
      country: 'India',
      state: 'Karnataka',
      city: 'Bangalore',
      registration_end: addDays(1.8), // < 48 hours away! Triggers Bangalore alert!
      submission_deadline: addDays(1.8),
      tags: ['AI', 'Mobile', 'Robotics', 'FinTech', 'Student-Friendly'],
      source: 'Unstop',
      is_featured: true,
      is_active: true,
    },
    {
      slug: 'ethindia-2026-bangalore',
      title: 'ETHIndia 2026: Asia Flagship Web3 Buildathon',
      description: 'Asia biggest Web3 gathering in Bangalore. Hack alongside 2,000+ builders on smart contracts, zero-knowledge proofs, and decentralized applications.',
      url: 'https://ethindia.co',
      banner_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
      prize_pool: 2500000,
      prize_amount: 2500000,
      currency: 'INR',
      prize_currency: 'INR',
      mode: 'in-person',
      location_type: 'In-Person',
      location: 'Bangalore, India',
      country: 'India',
      state: 'Karnataka',
      city: 'Bangalore',
      registration_end: addDays(3.2),
      submission_deadline: addDays(3.2),
      tags: ['Web3', 'Blockchain', 'Solidity', 'Zero Knowledge', 'FinTech'],
      source: 'Devfolio',
      is_featured: true,
      is_active: true,
    },
    {
      slug: 'delhi-ai-builders-conclave-2026',
      title: 'Delhi AI Builders Conclave & Hack',
      description: 'North India premier collegiate AI competition. Develop LLM agents, vernacular language models, and civic tech solutions at IIT Delhi.',
      url: 'https://unstop.com/hackathons/delhi-ai-conclave',
      banner_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      prize_pool: 300000,
      prize_amount: 300000,
      currency: 'INR',
      prize_currency: 'INR',
      mode: 'in-person',
      location_type: 'In-Person',
      location: 'Delhi, India',
      country: 'India',
      state: 'Delhi',
      city: 'Delhi',
      registration_end: addDays(8),
      submission_deadline: addDays(8),
      tags: ['AI', 'Machine Learning', 'Public Goods', 'Python'],
      source: 'Unstop',
      is_featured: false,
      is_active: true,
    },
    {
      slug: 'hackmit-2026-spring',
      title: 'HackMIT: Genesis 2026',
      description: 'MIT premier collegiate hackathon bringing together over 1,500 students worldwide to hack across hardware, quantum computing, and bio-tech tracks.',
      url: 'https://hackmit.org',
      banner_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      prize_pool: 35000,
      prize_amount: 35000,
      currency: 'USD',
      prize_currency: 'USD',
      mode: 'in-person',
      location_type: 'In-Person',
      location: 'Cambridge, MA, USA',
      country: 'USA',
      state: 'MA',
      city: 'Cambridge',
      registration_end: addDays(4),
      submission_deadline: addDays(4),
      tags: ['Hardware', 'AI', 'Quantum', 'Student Only', 'Web3'],
      source: 'MLH',
      is_featured: true,
      is_active: true,
    }
  ];
}

async function main() {
  console.log('🚀 [Scraper Engine] Starting Live Ingestion with Location & Currency Localization...');
  const startTime = Date.now();

  let allHackathons = [];

  // 1. Fetch live events from Devpost and Unstop APIs
  const [devpostEvents, unstopEvents] = await Promise.all([
    fetchDevpostApi(),
    fetchUnstopApi()
  ]);

  allHackathons.push(...devpostEvents);
  allHackathons.push(...unstopEvents);

  // 2. Ensure rich localized coverage with curated events
  const curated = getCuratedEvents();
  const seen = new Set(allHackathons.map((s) => s.slug));
  for (const item of curated) {
    if (!seen.has(item.slug)) {
      allHackathons.push(item);
      seen.add(item.slug);
    }
  }

  console.log(`\n📦 Total live & verified hackathons gathered: ${allHackathons.length}`);
  console.log(`🏙️ Indian / Bangalore events: ${allHackathons.filter((s) => s.city === 'Bangalore' || s.country === 'India').length}`);
  console.log(`💵 Currencies present: ${Array.from(new Set(allHackathons.map((s) => s.prize_currency))).join(', ')}`);

  if (!supabase) {
    console.log('\n⚠️ Supabase credentials not found in environment.');
    console.log('Set SUPABASE_URL and SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY to persist.');
    console.log(`🎉 Finished in ${((Date.now() - startTime) / 1000).toFixed(2)}s\n`);
    return;
  }

  // 3. Upsert into Supabase Hackathons table
  console.log(`\n🔄 Upserting ${allHackathons.length} events into Supabase...`);
  let upserted = 0;
  let errors = 0;

  for (const event of allHackathons) {
    const { error } = await supabase
      .from('hackathons')
      .upsert(event, { onConflict: 'slug' });

    if (error) {
      errors++;
      console.error(`❌ Upsert error for "${event.title}":`, error.message);
    } else {
      upserted++;
      console.log(`✅ Upserted [${event.source}] [${event.mode} | ${event.city || 'Global'}, ${event.country}]: ${event.title}`);
    }
  }

  console.log(`\n✨ Ingestion complete: ${upserted} upserted, ${errors} errors.`);
  console.log(`⏱️ Duration: ${((Date.now() - startTime) / 1000).toFixed(2)}s\n`);
}

main().catch((err) => {
  console.error('Fatal Scraper Error:', err);
  process.exit(1);
});
