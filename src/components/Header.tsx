'use client';

import React from 'react';
import { Bell, Zap, Sparkles, ExternalLink, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  onOpenSubscribe: () => void;
  totalPrizes: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSubscribe, totalPrizes }) => {
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'HackTrackRadarBot';
  const botUrl = `https://t.me/${botUsername}`;

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#07080d]/85 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2.5 group">
            <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
              <Zap size={20} className="animate-pulse" />
            </span>
            <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              HackTrack
            </span>
          </a>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Live Radar
          </span>
        </div>

        {/* Actions & Telegram Bot Link */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <Sparkles size={13} className="text-amber-400" />
            <span>${totalPrizes.toLocaleString()} Tracked</span>
          </div>

          <a
            href="#how-it-works"
            className="hidden lg:inline-block text-xs font-medium text-slate-400 hover:text-white transition-colors px-2 py-1"
          >
            How it Works
          </a>

          {/* Preferences button */}
          <button
            type="button"
            onClick={onOpenSubscribe}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-all hover:-translate-y-0.5"
            title="Configure Alert Filters & Chat ID"
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Preferences</span>
          </button>

          {/* "Get Telegram Alerts" button */}
          <a
            href={botUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            id="header-subscribe-btn"
          >
            <Bell size={15} />
            <span>Get Telegram Alerts</span>
            <ExternalLink size={13} className="opacity-70 hidden sm:inline" />
          </a>
        </div>
      </div>
    </header>
  );
};
