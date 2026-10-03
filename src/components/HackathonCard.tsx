'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Calendar, MapPin, Bookmark, Sparkles, Clock, Globe } from 'lucide-react';
import { Hackathon } from '@/lib/types';
import { formatPrizeAmount, formatModeWithLocation } from '@/lib/formatters';

interface HackathonCardProps {
  hackathon: Hackathon;
}

function calcTimeRemaining(targetIso: string) {
  const target = new Date(targetIso).getTime();
  const diff = target - Date.now();

  if (diff <= 0) {
    return { text: 'Registration Closed', isUrgent: false };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 48) {
    return { text: `🚨 ${hours}h left! (< 48h)`, isUrgent: true };
  }
  return { text: `⏰ ${days} days remaining`, isUrgent: false };
}

export const HackathonCard: React.FC<HackathonCardProps> = ({ hackathon }) => {
  const deadlineDate = hackathon.registration_end || hackathon.submission_deadline;

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(() => calcTimeRemaining(deadlineDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calcTimeRemaining(deadlineDate));
    }, 60000);
    return () => clearInterval(timer);
  }, [deadlineDate]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(`hacktrack_saved_${hackathon.slug}`);
        if (saved) setIsBookmarked(true);
      } catch {}
    });
    return () => cancelAnimationFrame(frame);
  }, [hackathon.slug]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !isBookmarked;
    setIsBookmarked(next);
    try {
      if (next) {
        localStorage.setItem(`hacktrack_saved_${hackathon.slug}`, 'true');
      } else {
        localStorage.removeItem(`hacktrack_saved_${hackathon.slug}`);
      }
    } catch {}
  };

  const formattedDeadline = new Date(deadlineDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Localized prize & currency formatting
  const rawPrize = hackathon.prize_amount ?? hackathon.prize_pool ?? 0;
  const currencyCode = (hackathon.prize_currency || hackathon.currency || 'USD').toUpperCase();
  const formattedPrize = formatPrizeAmount(rawPrize, currencyCode);

  // Localized mode & location info
  const modeInfo = formatModeWithLocation({
    mode: hackathon.mode,
    location_type: hackathon.location_type,
    city: hackathon.city,
    country: hackathon.country,
    location: hackathon.location,
  });

  return (
    <article className="group relative flex flex-col bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10">
      {/* Banner Image & Badges */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-950">
        <img
          src={
            hackathon.banner_url ||
            'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80'
          }
          alt={hackathon.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Top Badges: Platform + Mode Tag */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 rounded-md backdrop-blur-md">
            {hackathon.source}
          </span>
          <span
            className={`px-2 py-0.5 text-[10px] font-bold rounded-md backdrop-blur-md border ${
              modeInfo.isOnline
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                : 'bg-indigo-950/80 text-indigo-300 border-indigo-500/30'
            }`}
          >
            {modeInfo.isOnline ? 'Online' : 'In-Person'}
          </span>
        </div>

        {/* Bookmark Button */}
        <button
          type="button"
          onClick={toggleBookmark}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors backdrop-blur-md border ${
            isBookmarked
              ? 'bg-purple-600/40 text-purple-300 border-purple-400'
              : 'bg-black/50 text-slate-400 border-white/10 hover:text-white'
          }`}
          aria-label="Bookmark hackathon"
        >
          <Bookmark size={15} fill={isBookmarked ? '#c084fc' : 'none'} />
        </button>

        {/* Countdown Badge */}
        <div
          className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border flex items-center gap-1.5 ${
            timeRemaining.isUrgent
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-lg shadow-rose-500/20'
              : 'bg-purple-500/20 text-purple-200 border-purple-500/30'
          }`}
        >
          <Clock size={12} />
          <span>{timeRemaining.text}</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Location & Featured Badge */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
          <span className="flex items-center gap-1.5 truncate">
            {modeInfo.isOnline ? (
              <Globe size={13} className="text-emerald-400 flex-shrink-0" />
            ) : (
              <MapPin size={13} className="text-rose-400 flex-shrink-0" />
            )}
            <span className="truncate font-medium text-slate-300">
              {modeInfo.label}
            </span>
          </span>
          {hackathon.is_featured && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 flex-shrink-0">
              <Sparkles size={10} />
              Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-purple-300 transition-colors">
          <a href={hackathon.url} target="_blank" rel="noopener noreferrer">
            {hackathon.title}
          </a>
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {hackathon.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
          {hackathon.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium text-slate-300 bg-slate-800/80 border border-slate-700/50 px-2 py-0.5 rounded-md"
            >
              #{tag}
            </span>
          ))}
          {hackathon.tags.length > 3 && (
            <span className="text-[11px] text-slate-500 self-center">
              +{hackathon.tags.length - 3}
            </span>
          )}
        </div>

        {/* Footer: Dynamic Currency Prize Pool & CTA */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Prize Pool
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-emerald-400">
                {formattedPrize}
              </span>
              {rawPrize > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {currencyCode}
                </span>
              )}
            </div>
          </div>

          <a
            href={hackathon.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-md shadow-purple-600/30 transition-all hover:scale-105 active:scale-100"
          >
            <span>Apply</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Deadline text */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2.5">
          <Calendar size={12} />
          <span>Closes: {formattedDeadline}</span>
        </div>
      </div>
    </article>
  );
};
