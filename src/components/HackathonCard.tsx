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
    return { text: `${hours}h left (< 48h)`, isUrgent: true };
  }
  return { text: `${days} days left`, isUrgent: false };
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
    <article className="group relative flex flex-col bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden transition-colors">
      {/* Banner Image & Badges */}
      <div className="relative h-40 w-full overflow-hidden bg-zinc-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            hackathon.banner_url ||
            'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80'
          }
          alt={hackathon.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        {/* Top Badges: Platform + Mode Tag */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-300 bg-zinc-900/90 border border-zinc-700 rounded">
            {hackathon.source}
          </span>
          <span className="px-2 py-0.5 text-[10px] font-medium text-zinc-300 bg-zinc-900/90 border border-zinc-700 rounded">
            {modeInfo.isOnline ? 'Online' : 'In-Person'}
          </span>
        </div>

        {/* Bookmark Button */}
        <button
          type="button"
          onClick={toggleBookmark}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-md flex items-center justify-center bg-zinc-950/80 text-zinc-400 border border-zinc-700 hover:text-white transition-colors cursor-pointer"
          aria-label="Bookmark hackathon"
        >
          <Bookmark size={13} fill={isBookmarked ? '#ffffff' : 'none'} />
        </button>

        {/* Countdown Badge */}
        <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded text-xs font-medium bg-zinc-900/90 text-zinc-200 border border-zinc-700 flex items-center gap-1.5">
          <Clock size={11} className="text-zinc-400" />
          <span>{timeRemaining.text}</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Location & Featured Badge */}
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <span className="flex items-center gap-1.5 truncate">
            {modeInfo.isOnline ? (
              <Globe size={12} className="text-zinc-500 flex-shrink-0" />
            ) : (
              <MapPin size={12} className="text-zinc-500 flex-shrink-0" />
            )}
            <span className="truncate text-zinc-400">
              {modeInfo.label}
            </span>
          </span>
          {hackathon.is_featured && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 flex-shrink-0">
              <Sparkles size={9} />
              Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-zinc-100 mb-1.5 line-clamp-1 hover:text-white transition-colors">
          <a href={hackathon.url} target="_blank" rel="noopener noreferrer">
            {hackathon.title}
          </a>
        </h3>

        {/* Description */}
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
          {hackathon.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
          {hackathon.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-normal text-zinc-400 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
          {hackathon.tags.length > 3 && (
            <span className="text-[11px] text-zinc-500 self-center">
              +{hackathon.tags.length - 3}
            </span>
          )}
        </div>

        {/* Footer: Dynamic Currency Prize Pool & CTA */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 block">
              Prize Pool
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-bold text-zinc-100">
                {formattedPrize}
              </span>
              {rawPrize > 0 && (
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {currencyCode}
                </span>
              )}
            </div>
          </div>

          <a
            href={hackathon.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white rounded-md border border-zinc-200 transition-colors cursor-pointer"
          >
            <span>Apply</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Deadline text */}
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-2">
          <Calendar size={11} />
          <span>Closes: {formattedDeadline}</span>
        </div>
      </div>
    </article>
  );
};
