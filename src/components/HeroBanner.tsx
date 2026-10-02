'use client';

import React from 'react';
import { Bell, ArrowRight, Clock, Award, ExternalLink, Zap } from 'lucide-react';
import { Hackathon } from '@/lib/types';

interface HeroBannerProps {
  onOpenSubscribe: () => void;
  urgentHackathon?: Hackathon;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenSubscribe,
  urgentHackathon,
}) => {
  const botUrl = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || 'https://t.me/MyHackthonAlert_bot';

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-8 sm:pb-12 text-center overflow-hidden">
      {/* Subtle decorative background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-purple-600/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-3xl mx-auto flex flex-col items-center">
        {/* Top Minimal Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/25 mb-5 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          <span>Automated Student Hackathon Radar</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight sm:leading-tight mb-5">
          Never Miss a{' '}
          <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Hackathon Deadline
          </span>{' '}
          Again.
        </h1>

        {/* Minimal Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-slate-400 leading-relaxed mb-8 max-w-2xl">
          Aggregates top collegiate hackathons from Devpost and Unstop. Get automated alerts delivered directly to your Telegram within <strong className="text-white">48 hours</strong> of registration closing.
        </p>

        {/* CTA Group: Responsive flex-col on mobile, flex-row on desktop */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto mb-8">
          <a
            href={botUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 transition-all hover:-translate-y-0.5"
            id="hero-subscribe-cta"
          >
            <Bell size={18} />
            <span>Get Telegram Alerts</span>
            <ExternalLink size={15} />
          </a>

          <button
            type="button"
            onClick={onOpenSubscribe}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm sm:text-base font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl backdrop-blur-md transition-all hover:-translate-y-0.5"
          >
            <span>Filter by Track</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Approaching Deadline Ticker Banner */}
        {urgentHackathon && (
          <div className="w-full max-w-2xl inline-flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 px-4 py-2.5 rounded-2xl sm:rounded-full bg-rose-500/10 border border-rose-500/25 text-xs sm:text-sm mb-6 backdrop-blur-sm">
            <span className="flex items-center gap-1.5 font-bold text-rose-400 flex-shrink-0">
              <Clock size={15} />
              <span>Closing in &lt; 48h:</span>
            </span>
            <a
              href={urgentHackathon.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-white hover:text-rose-200 underline decoration-rose-400/50 truncate max-w-xs sm:max-w-md"
            >
              {urgentHackathon.title}
            </a>
            <span className="text-rose-300/80 font-medium whitespace-nowrap">
              ${urgentHackathon.prize_pool.toLocaleString()} Prize
            </span>
          </div>
        )}

        {/* Minimal Feature Badges */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-400 flex-wrap pt-2">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-cyan-400" />
            <span>Instant Telegram Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <Award size={15} className="text-purple-400" />
            <span>Devpost & Unstop Feeds</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-emerald-400" />
            <span>48-Hour Deadline Triggers</span>
          </div>
        </div>
      </div>
    </section>
  );
};
