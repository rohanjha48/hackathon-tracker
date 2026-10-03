'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { HeroBanner } from '@/components/HeroBanner';
import { StatsBar } from '@/components/StatsBar';
import { FilterBar, ModeFilter } from '@/components/FilterBar';
import { HackathonCard } from '@/components/HackathonCard';
import { HowItWorks } from '@/components/HowItWorks';
import { SubscribeModal } from '@/components/SubscribeModal';
import { Hackathon } from '@/lib/types';
import { normalizeMode } from '@/lib/formatters';
import { Zap, Bell, ExternalLink, RefreshCw } from 'lucide-react';

export default function Home() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedMode, setSelectedMode] = useState<ModeFilter>('both');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [sortBy, setSortBy] = useState<'deadline_asc' | 'deadline_desc' | 'prize_desc' | 'newest'>('deadline_asc');
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

  // Fetch live hackathon data directly from Supabase via API route
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (selectedTag && selectedTag !== 'All') params.set('tag', selectedTag);
        if (selectedMode && selectedMode !== 'both') params.set('mode', selectedMode);
        if (selectedCountry && selectedCountry !== 'All') params.set('country', selectedCountry);
        if (selectedCity && selectedCity !== 'All') params.set('city', selectedCity);
        if (sortBy) params.set('sortBy', sortBy);

        const res = await fetch(`/api/hackathons?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch hackathons');
        const json = await res.json();

        if (!isCancelled) {
          setHackathons(Array.isArray(json.data) ? json.data : []);
        }
      } catch (err) {
        console.warn('API fetch note:', err);
        if (!isCancelled) {
          setHackathons([]);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    const timer = setTimeout(loadData, 150);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [search, selectedTag, selectedMode, selectedCountry, selectedCity, sortBy]);

  // Compute live statistics
  const { totalPrizes, onlineCount, urgentHackathon } = useMemo(() => {
    const total = hackathons.reduce(
      (acc, h) => acc + (Number(h.prize_amount ?? h.prize_pool) || 0),
      0
    );
    const online = hackathons.filter(
      (h) => normalizeMode(h.mode || h.location_type) === 'online'
    ).length;

    const sorted = [...hackathons].sort((a, b) => {
      const tA = new Date(a.registration_end || a.submission_deadline).getTime();
      const tB = new Date(b.registration_end || b.submission_deadline).getTime();
      return tA - tB;
    });

    return {
      totalPrizes: total,
      onlineCount: online,
      urgentHackathon: sorted[0] || undefined,
    };
  }, [hackathons]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-zinc-800 selection:text-white">
      {/* Navigation Header */}
      <Header
        onOpenSubscribe={() => setIsSubscribeOpen(true)}
        totalPrizes={totalPrizes}
      />

      {/* Main Content Container */}
      <main className="w-full flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <HeroBanner
          onOpenSubscribe={() => setIsSubscribeOpen(true)}
          urgentHackathon={urgentHackathon}
        />

        {/* Key Metrics */}
        <StatsBar
          totalPrizes={totalPrizes}
          totalHackathons={hackathons.length}
          onlineCount={onlineCount}
        />

        {/* Search, Filter & Sort Controls */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          selectedTag={selectedTag}
          onTagSelect={setSelectedTag}
          selectedMode={selectedMode}
          onModeSelect={setSelectedMode}
          selectedCountry={selectedCountry}
          onCountrySelect={setSelectedCountry}
          selectedCity={selectedCity}
          onCitySelect={setSelectedCity}
          sortBy={sortBy}
          onSortChange={setSortBy}
          resultsCount={hackathons.length}
        />

        {/* Live Hackathons Responsive Grid Section */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                <span>Active Student Hackathons</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                  {hackathons.length} live
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Aggregated from Devpost & Unstop • Filtered by Bangalore, India & Worldwide Hubs
              </p>
            </div>

            {/* Hardcoded Telegram Alerts Callout */}
            <a
              href="https://t.me/MyHackthonAlert_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <Bell size={13} className="text-zinc-400" />
              <span>Get Telegram Alerts</span>
              <ExternalLink size={12} className="opacity-70" />
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-80 rounded-xl bg-zinc-900/40 border border-zinc-800/80 animate-pulse p-4 flex flex-col justify-between"
                >
                  <div className="h-40 bg-zinc-800/50 rounded-lg mb-4" />
                  <div className="h-4 bg-zinc-800/60 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-zinc-800/40 rounded w-1/2 mb-4" />
                  <div className="h-8 bg-zinc-800/30 rounded-lg" />
                </div>
              ))}
            </div>
          ) : hackathons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hackathons.map((h) => (
                <HackathonCard key={h.id || h.slug} hackathon={h} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 sm:py-20 px-4 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl w-full">
              <h3 className="text-base sm:text-lg font-semibold text-zinc-200 mb-2">
                No active hackathons found. Please run the scraper.
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 mb-5 max-w-md mx-auto">
                No events currently match your filters or the database needs to be populated. You can run the scraper manually from the GitHub Actions dashboard.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedTag('All');
                  setSelectedMode('both');
                  setSelectedCountry('All');
                  setSelectedCity('All');
                }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white rounded-md border border-zinc-200 transition-colors cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </section>

        {/* How HackTrack Operates Section */}
        <HowItWorks />
      </main>

      {/* Minimal Monochromatic Footer */}
      <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 py-8 text-zinc-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-100">
                <Zap size={14} />
              </span>
              <span className="text-sm font-bold text-zinc-100">HackTrack</span>
              <span className="text-[11px] text-zinc-500 ml-2">Collegiate Hackathon Radar</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-[11px] text-zinc-400">
                Next.js 16 + Tailwind CSS
              </span>
              <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-[11px] text-zinc-400">
                Supabase Postgres
              </span>
              <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-[11px] text-zinc-400">
                GitHub Actions Cron
              </span>
              <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-[11px] text-zinc-400">
                Telegram Bot API
              </span>
            </div>
          </div>

          <div className="border-t border-zinc-800/50 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-zinc-500 text-[11px]">
            <span>Automated collegiate hackathon tracker and notification system with location & currency localization.</span>
            <span>Built for students worldwide</span>
          </div>
        </div>
      </footer>

      {/* Interactive Telegram Subscribe Modal */}
      <SubscribeModal
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
      />
    </div>
  );
}
