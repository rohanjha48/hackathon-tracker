#!/usr/bin/env node
/**
 * 🚀 Supabase Seed Script
 * Inserts high-quality student hackathons into Supabase PostgreSQL for testing.
 *
 * Usage:
 *   node scripts/seed.js
 * (Reads from .env.local or process.env)
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // fallback to .env
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
  console.error('\n❌ Missing Supabase credentials!');
  console.log('Please define NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const now = new Date();
const addDays = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString();

const SEED_HACKATHONS = [
  {
    slug: 'gemini-ai-global-student-sprint',
    title: 'Gemini AI Global Student Sprint 2026',
    description: 'Build breakthrough generative AI agents and multimodal applications solving real-world student challenges using Google Gemini 2.5 and Antigravity APIs.',
    url: 'https://devpost.com/hackathons/gemini-ai-sprint',
    banner_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    prize_pool: 50000,
    currency: 'USD',
    location_type: 'Online',
    location_name: 'Worldwide Virtual',
    start_date: addDays(-5),
    submission_deadline: addDays(1), // 24 hours left (Triggers 1_day alert)
    tags: ['AI', 'Machine Learning', 'API', 'Open Source', 'Beginner-Friendly'],
    source: 'Devpost',
    is_featured: true,
    is_active: true,
  },
  {
    slug: 'hackmit-2026-spring',
    title: 'HackMIT: Genesis 2026',
    description: 'MIT premier collegiate hackathon bringing together over 1,500 students worldwide to hack across hardware, quantum computing, and bio-tech tracks.',
    url: 'https://hackmit.org',
    banner_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    prize_pool: 35000,
    currency: 'USD',
    location_type: 'Hybrid',
    location_name: 'Cambridge, MA & Virtual',
    start_date: addDays(1),
    submission_deadline: addDays(3), // 3 days left (Triggers 3_days alert)
    tags: ['Hardware', 'AI', 'Quantum', 'Student Only', 'Web3'],
    source: 'MLH',
    is_featured: true,
    is_active: true,
  },
  {
    slug: 'ethglobal-berlin-hackathon',
    title: 'ETHGlobal NextGen Hack 2026',
    description: 'The world biggest decentralized application hackathon. Build layer-2 rollups, zero-knowledge proofs, and automated smart account workflows.',
    url: 'https://ethglobal.com',
    banner_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
    prize_pool: 125000,
    currency: 'USD',
    location_type: 'Online',
    location_name: 'Global Discord',
    start_date: addDays(3),
    submission_deadline: addDays(7), // 7 days left (Triggers 7_days alert)
    tags: ['Web3', 'Blockchain', 'Solidity', 'Zero Knowledge', 'FinTech'],
    source: 'Devpost',
    is_featured: false,
    is_active: true,
  },
  {
    slug: 'unstop-smart-india-campus-challenge',
    title: 'National Campus Innovation Challenge 2026',
    description: 'Design digital public infrastructure and mobile accessibility solutions for tier-2 and tier-3 colleges. Supported by leading tech firms.',
    url: 'https://unstop.com/hackathons/campus-innovation-2026',
    banner_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    prize_pool: 20000,
    currency: 'USD',
    location_type: 'In-Person',
    location_name: 'Bengaluru, India',
    start_date: addDays(5),
    submission_deadline: addDays(14),
    tags: ['Mobile', 'Public Goods', 'Beginner-Friendly', 'FinTech'],
    source: 'Unstop',
    is_featured: false,
    is_active: true,
  },
  {
    slug: 'calhacks-climate-tech-fellowship',
    title: 'CalHacks: Green Horizon Hack 2026',
    description: 'UC Berkeley climate-focused hackathon tackling carbon capture tracking, renewable energy grid optimization, and disaster mitigation tech.',
    url: 'https://calhacks.io',
    banner_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    prize_pool: 40000,
    currency: 'USD',
    location_type: 'Hybrid',
    location_name: 'Berkeley, CA & Online',
    start_date: addDays(7),
    submission_deadline: addDays(21),
    tags: ['ClimateTech', 'IoT', 'Data Science', 'AI', 'Open Source'],
    source: 'MLH',
    is_featured: true,
    is_active: true,
  }
];

async function seed() {
  console.log('🌱 Seeding Supabase database with student hackathons...');

  for (const item of SEED_HACKATHONS) {
    const { error } = await supabase
      .from('hackathons')
      .upsert(item, { onConflict: 'slug' });

    if (error) {
      console.error(`❌ Failed to seed "${item.title}":`, error.message);
    } else {
      console.log(`✅ Upserted: ${item.title}`);
    }
  }

  console.log('\n✨ Database seeding completed successfully!\n');
}

seed().catch((err) => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});
