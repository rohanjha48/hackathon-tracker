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
  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-8 sm:pb-10 text-center">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        {/* Top Minimal Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
          <span>Collegiate Hackathon Tracker & Alerts</span>
        </div>

        {/* Main Headline - Clean, bold, monochromatic */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-100 leading-tight sm:leading-tight mb-4">
          Never Miss a Hackathon Deadline Again.
        </h1>

        {/* Minimal Subtitle */}
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-7 max-w-2xl">
          Aggregates collegiate hackathons from Devpost and Unstop. Delivers automated alerts directly to your Telegram within 48 hours of registration closing.
        </p>

        {/* CTA Group: Responsive flex-col on mobile, flex-row on desktop */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-8">
          <a
            href="https://t.me/MyHackthonAlert_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-zinc-950 bg-zinc-100 hover:bg-white border border-zinc-200 rounded-lg transition-colors cursor-pointer"
            id="hero-subscribe-cta"
          >
            <Bell size={16} />
            <span>Get Telegram Alerts</span>
            <ExternalLink size={14} />
          </a>

          <button
            type="button"
            onClick={onOpenSubscribe}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <span>Set Preferences</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Approaching Deadline Ticker Banner */}
        {urgentHackathon && (
          <div className="w-full max-w-2xl inline-flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 mb-6">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-200 flex-shrink-0">
              <Clock size={14} className="text-zinc-400" />
              <span>Closing in &lt; 48h:</span>
            </span>
            <a
              href={urgentHackathon.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-100 hover:underline truncate max-w-xs sm:max-w-md"
            >
              {urgentHackathon.title}
            </a>
          </div>
        )}

        {/* Minimal Feature Highlights */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 text-xs text-zinc-500 flex-wrap pt-1">
          <div className="flex items-center gap-1.5">
            <Zap size={14} className="text-zinc-400" />
            <span>Instant Telegram Delivery</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award size={14} className="text-zinc-400" />
            <span>Devpost & Unstop Feeds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-zinc-400" />
            <span>48-Hour Deadline Triggers</span>
          </div>
        </div>
      </div>
    </section>
  );
};
