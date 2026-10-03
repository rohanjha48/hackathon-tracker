'use client';

import React from 'react';
import { Search, X, ArrowUpDown, MapPin, Globe, Building2 } from 'lucide-react';
import { POPULAR_TAGS, POPULAR_COUNTRIES, MAJOR_CITIES_BY_COUNTRY } from '@/lib/mockData';

export type ModeFilter = 'both' | 'online' | 'in-person';

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedTag: string;
  onTagSelect: (tag: string) => void;
  selectedMode: ModeFilter;
  onModeSelect: (mode: ModeFilter) => void;
  selectedCountry: string;
  onCountrySelect: (country: string) => void;
  selectedCity: string;
  onCitySelect: (city: string) => void;
  sortBy: string;
  onSortChange: (sort: 'deadline_asc' | 'deadline_desc' | 'prize_desc' | 'newest') => void;
  resultsCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  selectedTag,
  onTagSelect,
  selectedMode,
  onModeSelect,
  selectedCountry,
  onCountrySelect,
  selectedCity,
  onCitySelect,
  sortBy,
  onSortChange,
  resultsCount,
}) => {
  // Available cities dependent on selected country
  const availableCities = MAJOR_CITIES_BY_COUNTRY[selectedCountry] || MAJOR_CITIES_BY_COUNTRY['All'];

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedTag !== 'All' ||
    selectedMode !== 'both' ||
    selectedCountry !== 'All' ||
    selectedCity !== 'All';

  const handleResetFilters = () => {
    onSearchChange('');
    onTagSelect('All');
    onModeSelect('both');
    onCountrySelect('All');
    onCitySelect('All');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8" id="hackathons-grid">
      <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-xl">
        {/* Top Search & Filter Controls Grid */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3.5 mb-4">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              id="hackathon-search-input"
              placeholder="Search hackathons by title, city (e.g. Bangalore), or keywords..."
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

          {/* Controls Cluster: Mode Toggle + Location Dropdowns + Sort */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3">
            {/* Mode Toggle: Both | Online | In-Person */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold overflow-x-auto w-full sm:w-auto">
              {(
                [
                  { value: 'both', label: 'Both' },
                  { value: 'online', label: 'Online' },
                  { value: 'in-person', label: 'In-Person' },
                ] as const
              ).map((m) => (
                <button
                  key={m.value}
                  type="button"
                  id={`mode-toggle-${m.value}`}
                  className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex-1 sm:flex-initial text-center ${
                    selectedMode === m.value
                      ? 'bg-purple-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  onClick={() => onModeSelect(m.value)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Country Selector Dropdown */}
            <div className="relative flex items-center flex-1 sm:flex-initial min-w-[140px]">
              <Globe size={14} className="absolute left-3 text-purple-400 pointer-events-none" />
              <select
                id="country-filter-select"
                value={selectedCountry}
                onChange={(e) => {
                  onCountrySelect(e.target.value);
                  onCitySelect('All'); // Reset city on country change
                }}
                className="w-full appearance-none bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl pl-8 pr-7 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
              >
                {POPULAR_COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* City Selector Dropdown (Features Bangalore, Delhi, etc.) */}
            <div className="relative flex items-center flex-1 sm:flex-initial min-w-[130px]">
              <Building2 size={14} className="absolute left-3 text-emerald-400 pointer-events-none" />
              <select
                id="city-filter-select"
                value={selectedCity}
                onChange={(e) => onCitySelect(e.target.value)}
                className="w-full appearance-none bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl pl-8 pr-7 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
              >
                <option value="All">All Cities</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city === 'Bangalore' ? 'Bangalore 🇮🇳 (Hot)' : city}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex items-center flex-1 sm:flex-initial min-w-[140px]">
              <ArrowUpDown size={14} className="absolute left-3 text-slate-500 pointer-events-none" />
              <select
                id="hackathon-sort-select"
                value={sortBy}
                onChange={(e) =>
                  onSortChange(
                    e.target.value as 'deadline_asc' | 'deadline_desc' | 'prize_desc' | 'newest'
                  )
                }
                className="w-full appearance-none bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl pl-8 pr-7 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
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

        {/* Results Meta Summary & Active Localization Filter Pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Showing <strong className="text-white">{resultsCount}</strong> hackathons
            </span>

            {selectedMode !== 'both' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/30">
                Mode: {selectedMode === 'in-person' ? 'In-Person' : 'Online'}
              </span>
            )}

            {selectedCountry !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/30">
                <Globe size={11} />
                {selectedCountry}
              </span>
            )}

            {selectedCity !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                <MapPin size={11} />
                {selectedCity}
              </span>
            )}

            {selectedTag !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                #{selectedTag}
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4 cursor-pointer"
              onClick={handleResetFilters}
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
