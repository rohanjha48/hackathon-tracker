'use client';

import React from 'react';
import { DollarSign, Flame, Clock, Radio } from 'lucide-react';

interface StatsBarProps {
  totalPrizes: number;
  totalHackathons: number;
  onlineCount: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  totalPrizes,
  totalHackathons,
  onlineCount,
}) => {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 backdrop-blur-xl hover:border-slate-700/80 transition-all">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <DollarSign size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ${totalPrizes.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium">Total Student Prizes</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 backdrop-blur-xl hover:border-slate-700/80 transition-all">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Flame size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {totalHackathons} Active
            </span>
            <span className="text-xs text-slate-400 font-medium">Verified Hackathons</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 backdrop-blur-xl hover:border-slate-700/80 transition-all">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <Radio size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {onlineCount} Virtual
            </span>
            <span className="text-xs text-slate-400 font-medium">Worldwide Access</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 backdrop-blur-xl hover:border-slate-700/80 transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Clock size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
              &lt; 3 Sec
            </span>
            <span className="text-xs text-slate-400 font-medium">Telegram Alert Speed</span>
          </div>
        </div>
      </div>
    </section>
  );
};
