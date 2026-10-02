'use client';

import React from 'react';
import { Terminal, Database, Bell, Cpu } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <section className="w-full border-t border-slate-800/80 py-16" id="how-it-works">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/25 mb-3">
          Architecture
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
          How{' '}
          <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            HackTrack Operates
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Automated data ingestion, database deduplication, and scheduled Telegram delivery.
        </p>
      </div>

      {/* Responsive Architecture Grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Step 1 */}
        <div className="relative bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-xl hover:border-slate-700 transition-all group">
          <span className="absolute top-4 right-4 text-2xl font-black text-slate-800 group-hover:text-purple-500/20 transition-colors">
            01
          </span>
          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-5">
              <Terminal size={22} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Automated Scraper</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Headless Puppeteer scraper running every 12 hours on a GitHub Actions cron schedule. Parses titles, prizes, and deadlines from Devpost and Unstop.
            </p>
          </div>
          <span className="inline-block text-[11px] font-semibold text-slate-500 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 w-fit">
            GitHub Actions Cron
          </span>
        </div>

        {/* Step 2 */}
        <div className="relative bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-xl hover:border-slate-700 transition-all group">
          <span className="absolute top-4 right-4 text-2xl font-black text-slate-800 group-hover:text-purple-500/20 transition-colors">
            02
          </span>
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-5">
              <Database size={22} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Supabase PostgreSQL</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Stores normalized events and student subscribers with Row Level Security. Uses slug uniqueness constraints to prevent duplicate entries.
            </p>
          </div>
          <span className="inline-block text-[11px] font-semibold text-slate-500 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 w-fit">
            Supabase DB + RLS
          </span>
        </div>

        {/* Step 3 */}
        <div className="relative bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-xl hover:border-slate-700 transition-all group">
          <span className="absolute top-4 right-4 text-2xl font-black text-slate-800 group-hover:text-purple-500/20 transition-colors">
            03
          </span>
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-5">
              <Cpu size={22} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Notifier Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Runs daily to detect hackathons closing in less than 48 hours. Logs sent notifications to ensure students are never spammed twice.
            </p>
          </div>
          <span className="inline-block text-[11px] font-semibold text-slate-500 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 w-fit">
            Idempotent Engine
          </span>
        </div>

        {/* Step 4 */}
        <div className="relative bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-xl hover:border-slate-700 transition-all group">
          <span className="absolute top-4 right-4 text-2xl font-black text-slate-800 group-hover:text-purple-500/20 transition-colors">
            04
          </span>
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-5">
              <Bell size={22} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Telegram Push</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Pushes formatted Markdown alert notifications directly to student Telegram chats with countdown timers and direct application links.
            </p>
          </div>
          <span className="inline-block text-[11px] font-semibold text-slate-500 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 w-fit">
            Telegram Bot API
          </span>
        </div>
      </div>
    </div>
  </section>
);
};
