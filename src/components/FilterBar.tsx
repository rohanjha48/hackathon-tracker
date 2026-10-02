'use client';

import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import { POPULAR_TAGS } from '@/lib/mockData';
import { LocationType } from '@/lib/types';

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedTag: string;
  onTagSelect: (tag: string) => void;
  selectedLocation: LocationType | 'All';
  onLocationSelect: (loc: LocationType | 'All') => void;
  sortBy: string;
  onSortChange: (sort: 'deadline_asc' | 'deadline_desc' | 'prize_desc' | 'newest') => void;
  resultsCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  selectedTag,
  onTagSelect,
  selectedLocation,
  onLocationSelect,
  sortBy,
  onSortChange,
  resultsCount,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8" id="hackathons-grid">
      <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-6 backdrop-blur-xl">
        {/* Top Search & Controls Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 mb-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            id="hackathon-search-input"
            placeholder="Search by hackathon name, tech track, or keywords..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter Controls: Flex-col on mobile, flex-row on tablet+ */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3">
          {/* Location Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold overflow-x-auto w-full sm:w-auto">
            {(['All', 'Online', 'Hybrid', 'In-Person'] as const).map((loc) => (
              <button
                key={loc}
                type="button"
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex-1 sm:flex-initial text-center ${
                  selectedLocation === loc
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                onClick={() => onLocationSelect(loc)}
              >
                {loc}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex items-center w-full sm:w-auto">
            <ArrowUpDown size={14} className="absolute left-3 text-slate-500 pointer-events-none" />
            <select
              id="hackathon-sort-select"
              value={sortBy}
              onChange={(e) =>
                onSortChange(
                  e.target.value as 'deadline_asc' | 'deadline_desc' | 'prize_desc' | 'newest'
                )
              }
              className="w-full sm:w-auto appearance-none bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl pl-8 pr-8 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
            >
              <option value="deadline_asc">Closing Soonest</option>
              <option value="prize_desc">Highest Prize Pool</option>
              <option value="newest">Recently Added</option>
              <option value="deadline_desc">Furthest Deadline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Tag Chips */}
      <div className="overflow-x-auto pb-2 mb-3 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedTag === tag
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-950/80 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
              onClick={() => onTagSelect(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Meta Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        <span>
          Showing <strong className="text-white">{resultsCount}</strong> hackathons
          {selectedTag !== 'All' && <span> in <em className="text-purple-300">#{selectedTag}</em></span>}
          {selectedLocation !== 'All' && <span> ({selectedLocation})</span>}
        </span>

        {(selectedTag !== 'All' || selectedLocation !== 'All' || search) && (
          <button
            type="button"
            className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4"
            onClick={() => {
              onSearchChange('');
              onTagSelect('All');
              onLocationSelect('All');
            }}
          >
            Reset All Filters
          </button>
        )}
      </div>
    </div>
  </div>
  );
};
