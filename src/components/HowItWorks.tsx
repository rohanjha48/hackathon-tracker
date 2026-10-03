'use client';

import React from 'react';
import { Terminal, Database, Bell, Cpu } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <section className="w-full border-t border-zinc-800 py-12" id="how-it-works">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800 mb-2">
            System Architecture
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight mb-2">
            How HackTrack Operates
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Automated ingestion, deduplication, and scheduled Telegram delivery.
          </p>
        </div>

        {/* Architecture Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="relative bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors">
            <span className="absolute top-4 right-4 text-xl font-bold text-zinc-700">
              01
            </span>
            <div>
              <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center mb-4">
                <Terminal size={18} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-1.5">Automated Scraper</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Headless scraper running every 12 hours via GitHub Actions. Parses titles, prizes, and deadlines from Devpost and Unstop.
              </p>
            </div>
            <span className="inline-block text-[11px] font-medium text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 w-fit">
              GitHub Actions
            </span>
          </div>

          {/* Step 2 */}
          <div className="relative bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors">
            <span className="absolute top-4 right-4 text-xl font-bold text-zinc-700">
              02
            </span>
            <div>
              <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center mb-4">
                <Database size={18} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-1.5">Supabase PostgreSQL</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Stores normalized events and subscriber preferences with Row Level Security. Deduplicates using slug uniqueness.
              </p>
            </div>
            <span className="inline-block text-[11px] font-medium text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 w-fit">
              PostgreSQL + RLS
            </span>
          </div>

          {/* Step 3 */}
          <div className="relative bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors">
            <span className="absolute top-4 right-4 text-xl font-bold text-zinc-700">
              03
            </span>
            <div>
              <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center mb-4">
                <Cpu size={18} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-1.5">Notifier Engine</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Runs daily to detect hackathons closing in &lt; 48 hours. Matches student preferences and prevents duplicate sends.
              </p>
            </div>
            <span className="inline-block text-[11px] font-medium text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 w-fit">
              Idempotent Engine
            </span>
          </div>

          {/* Step 4 */}
          <div className="relative bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors">
            <span className="absolute top-4 right-4 text-xl font-bold text-zinc-700">
              04
            </span>
            <div>
              <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center mb-4">
                <Bell size={18} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-1.5">Telegram Push</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Delivers formatted Markdown alerts directly to student Telegram chats with countdown timers and application links.
              </p>
            </div>
            <span className="inline-block text-[11px] font-medium text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 w-fit">
              Telegram Bot API
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
