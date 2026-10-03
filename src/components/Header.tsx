'use client';

import React from 'react';
import { Bell, Zap, ExternalLink, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  onOpenSubscribe: () => void;
  totalPrizes: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSubscribe, totalPrizes }) => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-zinc-950/90 border-b border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-100 group-hover:border-zinc-500 transition-colors">
              <Zap size={16} />
            </span>
            <span className="text-base sm:text-lg font-bold tracking-tight text-zinc-100">
              HackTrack
            </span>
          </a>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            Radar Active
          </span>
        </div>

        {/* Actions & Telegram Bot Link */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {totalPrizes > 0 && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-zinc-300 border border-zinc-800">
              <span>${totalPrizes.toLocaleString()} Total Prizes</span>
            </div>
          )}

          <a
            href="#how-it-works"
            className="hidden lg:inline-block text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-1"
          >
            How it Works
          </a>

          {/* Preferences button */}
          <button
            type="button"
            onClick={onOpenSubscribe}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Configure Alert Filters & Chat ID"
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Preferences</span>
          </button>

          {/* Hardcoded "Get Telegram Alerts" button */}
          <a
            href="https://t.me/MyHackthonAlert_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white border border-zinc-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-none"
            id="header-subscribe-btn"
          >
            <Bell size={14} />
            <span>Get Telegram Alerts</span>
            <ExternalLink size={12} className="opacity-70 hidden sm:inline" />
          </a>
        </div>
      </div>
    </header>
  );
};
