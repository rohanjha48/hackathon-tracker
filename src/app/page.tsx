'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { HeroBanner } from '@/components/HeroBanner';
import { StatsBar } from '@/components/StatsBar';
import { FilterBar } from '@/components/FilterBar';
import { HackathonCard } from '@/components/HackathonCard';
import { HowItWorks } from '@/components/HowItWorks';
import { SubscribeModal } from '@/components/SubscribeModal';
import { Hackathon, LocationType } from '@/lib/types';
import { MOCK_HACKATHONS } from '@/lib/mockData';
import { Zap, Bell, ExternalLink, RefreshCw } from 'lucide-react';

export default function Home() {
  const [hackathons, setHackathons] = useState<Hackathon[]>(MOCK_HACKATHONS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState<LocationType | 'All'>('All');
  const [sortBy, setSortBy] = useState<'deadline_asc' | 'deadline_desc' | 'prize_desc' | 'newest'>('deadline_asc');
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

  const botUrl = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || 'https://t.me/MyHackthonAlert_bot';

  // Fetch live hackathon data directly from Supabase / API
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (selectedTag && selectedTag !== 'All') params.set('tag', selectedTag);
        if (selectedLocation && selectedLocation !== 'All') params.set('location', selectedLocation);
        if (sortBy) params.set('sortBy', sortBy);

        const res = await fetch(`/api/hackathons?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch hackathons');
        const json = await res.json();

        if (!isCancelled && json.data) {
          setHackathons(json.data);
        }
      } catch (err) {
        console.warn('API fetch fell back to client cache:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    const timer = setTimeout(loadData, 200);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [search, selectedTag, selectedLocation, sortBy]);

  // Compute live statistics
  const { totalPrizes, onlineCount, urgentHackathon } = useMemo(() => {
    const total = hackathons.reduce((acc, h) => acc + (Number(h.prize_pool) || 0), 0);
    const online = hackathons.filter((h) => h.location_type === 'Online').length;

    // Filter hackathons approaching deadline
    const now = Date.now();
    const sortedUpcoming = [...hackathons]
      .filter((h) => new Date(h.registration_end || h.submission_deadline).getTime() > now)
      .sort((a, b) => {
        const tA = new Date(a.registration_end || a.submission_deadline).getTime();
        const tB = new Date(b.registration_end || b.submission_deadline).getTime();
        return tA - tB;
      });

    return {
      totalPrizes: total,
      onlineCount: online,
      urgentHackathon: sortedUpcoming[0] || hackathons[0],
    };
  }, [hackathons]);

  return (
    <div className="min-h-screen bg-[#07080d] text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      {/* Centered Navigation Header */}
      <Header
        onOpenSubscribe={() => setIsSubscribeOpen(true)}
        totalPrizes={totalPrizes}
      />

      {/* Main Content Container */}
      <main className="w-full flex-1 flex flex-col items-center">
        {/* Hero Section with Live 48h Countdown Banner */}
        <HeroBanner
          onOpenSubscribe={() => setIsSubscribeOpen(true)}
          urgentHackathon={urgentHackathon}
        />

        {/* Live Key Metrics */}
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
          selectedLocation={selectedLocation}
          onLocationSelect={setSelectedLocation}
          sortBy={sortBy}
          onSortChange={setSortBy}
          resultsCount={hackathons.length}
        />

        {/* Live Hackathons Responsive Grid Section */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Active Student Hackathons</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  {hackathons.length} live
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Aggregated from Devpost & Unstop • Automated reminder alerts at 48 hours to deadline
              </p>
            </div>

            {/* Direct Telegram Alerts Callout */}
            <a
              href={botUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all hover:scale-105"
            >
              <Bell size={14} className="text-purple-400" />
              <span>Get Telegram Alerts</span>
              <ExternalLink size={12} className="opacity-70" />
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-96 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse p-4 flex flex-col justify-between"
                >
                  <div className="h-44 bg-slate-800/50 rounded-xl mb-4" />
                  <div className="h-5 bg-slate-800/60 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-slate-800/40 rounded w-1/2 mb-4" />
                  <div className="h-10 bg-slate-800/30 rounded-xl" />
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
            <div className="text-center py-16 sm:py-20 px-4 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl w-full">
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">No Hackathons Match Your Query</h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-6">
                Try changing your search keywords or switching tags to view other events.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedTag('All');
                  setSelectedLocation('All');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-all"
              >
                <RefreshCw size={14} />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </section>

        {/* How HackTrack Operates Section */}
        <HowItWorks />
      </main>

      {/* Centered Minimal Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#050609] py-10 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white">
                <Zap size={16} />
              </span>
              <span className="text-base font-extrabold text-white">HackTrack</span>
              <span className="text-[11px] text-slate-500 ml-2">Student Hackathon Radar</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-400">
                Next.js 16 + Tailwind CSS
              </span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-400">
                Supabase Postgres
              </span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-400">
                GitHub Actions Cron
              </span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-400">
                Telegram Bot API
              </span>
            </div>
          </div>

          <div className="border-t border-slate-800/50 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-[11px]">
            <span>Automated collegiate hackathon tracker and notification system.</span>
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
