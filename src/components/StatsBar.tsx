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
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center gap-3.5 hover:border-zinc-700 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60 flex items-center justify-center flex-shrink-0">
            <DollarSign size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              ${totalPrizes.toLocaleString()}
            </span>
            <span className="text-xs text-zinc-400">Total Tracked Prizes</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center gap-3.5 hover:border-zinc-700 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60 flex items-center justify-center flex-shrink-0">
            <Flame size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              {totalHackathons} Active
            </span>
            <span className="text-xs text-zinc-400">Verified Hackathons</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center gap-3.5 hover:border-zinc-700 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60 flex items-center justify-center flex-shrink-0">
            <Radio size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              {onlineCount} Virtual
            </span>
            <span className="text-xs text-zinc-400">Worldwide Access</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex items-center gap-3.5 hover:border-zinc-700 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60 flex items-center justify-center flex-shrink-0">
            <Clock size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              &lt; 3 Sec
            </span>
            <span className="text-xs text-zinc-400">Alert Delivery Speed</span>
          </div>
        </div>
      </div>
    </section>
  );
};
