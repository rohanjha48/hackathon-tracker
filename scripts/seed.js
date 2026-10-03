#!/usr/bin/env node
/**
 * 🚀 Supabase Seed Script
 * Inserts high-quality student hackathons into Supabase PostgreSQL for testing,
 * with full location and currency localization (Bangalore, India INR & Global USD).
 *
 * Usage:
 *   node scripts/seed.js
 * (Reads from .env.local or process.env)
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // fallback to .env
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

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
    prize_amount: 50000,
    currency: 'USD',
    prize_currency: 'USD',
    mode: 'online',
    location_type: 'Online',
    location: 'Online (Worldwide)',
    country: 'Global',
    city: 'Online',
    start_date: addDays(-5),
    registration_end: addDays(1), // < 24 hours left (Triggers 1_day alert)
    submission_deadline: addDays(1),
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
    start_date: addDays(2),
    registration_end: addDays(1.8), // < 48 hours left!
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
    start_date: addDays(3),
    registration_end: addDays(3),
    submission_deadline: addDays(3),
    tags: ['Web3', 'Blockchain', 'Solidity', 'Zero Knowledge', 'FinTech'],
    source: 'Devfolio',
    is_featured: true,
    is_active: true,
  },
  {
    slug: 'unstop-smart-india-campus-challenge',
    title: 'National Campus Innovation Challenge 2026',
    description: 'Design digital public infrastructure and mobile accessibility solutions for tier-2 and tier-3 colleges. Supported by leading tech firms.',
    url: 'https://unstop.com/hackathons/campus-innovation-2026',
    banner_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    prize_pool: 500000,
    prize_amount: 500000,
    currency: 'INR',
    prize_currency: 'INR',
    mode: 'in-person',
    location_type: 'In-Person',
    location: 'Bangalore, India',
    country: 'India',
    state: 'Karnataka',
    city: 'Bangalore',
    start_date: addDays(5),
    registration_end: addDays(14),
    submission_deadline: addDays(14),
    tags: ['Mobile', 'Public Goods', 'Beginner-Friendly', 'FinTech'],
    source: 'Unstop',
    is_featured: false,
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
    start_date: addDays(6),
    registration_end: addDays(10),
    submission_deadline: addDays(10),
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
    start_date: addDays(1),
    registration_end: addDays(3),
    submission_deadline: addDays(3),
    tags: ['Hardware', 'AI', 'Quantum', 'Student Only', 'Web3'],
    source: 'MLH',
    is_featured: true,
    is_active: true,
  },
  {
    slug: 'calhacks-climate-tech-fellowship',
    title: 'CalHacks: Green Horizon Hack 2026',
    description: 'UC Berkeley climate-focused hackathon tackling carbon capture tracking, renewable energy grid optimization, and disaster mitigation tech.',
    url: 'https://calhacks.io',
    banner_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    prize_pool: 40000,
    prize_amount: 40000,
    currency: 'USD',
    prize_currency: 'USD',
    mode: 'hybrid',
    location_type: 'Hybrid',
    location: 'San Francisco, CA, USA & Online',
    country: 'USA',
    state: 'CA',
    city: 'San Francisco',
    start_date: addDays(7),
    registration_end: addDays(21),
    submission_deadline: addDays(21),
    tags: ['ClimateTech', 'IoT', 'Data Science', 'AI', 'Open Source'],
    source: 'MLH',
    is_featured: true,
    is_active: true,
  }
];

async function seed() {
  console.log('🌱 Seeding Supabase database with localized student hackathons...');

  for (const item of SEED_HACKATHONS) {
    const { error } = await supabase
      .from('hackathons')
      .upsert(item, { onConflict: 'slug' });

    if (error) {
      console.error(`❌ Failed to seed "${item.title}":`, error.message);
    } else {
      console.log(`✅ Upserted [${item.currency}]: ${item.title} (${item.city || 'Online'})`);
    }
  }

  console.log('\n✨ Database seeding completed!\n');
}

seed().catch((err) => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});
