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
      <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 sm:p-5">
        {/* Top Search & Filter Controls Grid */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 mb-4">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
            />
            <input
              type="text"
              id="hackathon-search-input"
              placeholder="Search hackathons by title, city (e.g. Bangalore), or keywords..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-lg pl-9 pr-9 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Controls Cluster: Mode Toggle + Location Dropdowns + Sort */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3">
            {/* Mode Toggle: Both | Online | In-Person */}
            <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs font-medium overflow-x-auto w-full sm:w-auto">
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
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex-1 sm:flex-initial text-center cursor-pointer ${
                    selectedMode === m.value
                      ? 'bg-zinc-100 text-zinc-950 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  onClick={() => onModeSelect(m.value)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Country Selector Dropdown */}
            <div className="relative flex items-center flex-1 sm:flex-initial min-w-[130px]">
              <Globe size={13} className="absolute left-2.5 text-zinc-500 pointer-events-none" />
              <select
                id="country-filter-select"
                value={selectedCountry}
                onChange={(e) => {
                  onCountrySelect(e.target.value);
                  onCitySelect('All');
                }}
                className="w-full appearance-none bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg pl-8 pr-7 py-1.5 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-colors cursor-pointer"
              >
                {POPULAR_COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* City Selector Dropdown */}
            <div className="relative flex items-center flex-1 sm:flex-initial min-w-[125px]">
              <Building2 size={13} className="absolute left-2.5 text-zinc-500 pointer-events-none" />
              <select
                id="city-filter-select"
                value={selectedCity}
                onChange={(e) => onCitySelect(e.target.value)}
                className="w-full appearance-none bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg pl-8 pr-7 py-1.5 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-colors cursor-pointer"
              >
                <option value="All">All Cities</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city === 'Bangalore' ? 'Bangalore (Hot)' : city}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex items-center flex-1 sm:flex-initial min-w-[135px]">
              <ArrowUpDown size={13} className="absolute left-2.5 text-zinc-500 pointer-events-none" />
              <select
                id="hackathon-sort-select"
                value={sortBy}
                onChange={(e) =>
                  onSortChange(
                    e.target.value as 'deadline_asc' | 'deadline_desc' | 'prize_desc' | 'newest'
                  )
                }
                className="w-full appearance-none bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg pl-8 pr-7 py-1.5 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-colors cursor-pointer"
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
        <div className="overflow-x-auto pb-2 mb-2 scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-zinc-100 text-zinc-950'
                    : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                }`}
                onClick={() => onTagSelect(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results Meta Summary & Active Localization Filter Pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-zinc-800/80 text-xs text-zinc-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Showing <strong className="text-zinc-200">{resultsCount}</strong> hackathons
            </span>

            {selectedMode !== 'both' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                Mode: {selectedMode === 'in-person' ? 'In-Person' : 'Online'}
              </span>
            )}

            {selectedCountry !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                <Globe size={11} />
                {selectedCountry}
              </span>
            )}

            {selectedCity !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                <MapPin size={11} />
                {selectedCity}
              </span>
            )}

            {selectedTag !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                #{selectedTag}
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="text-zinc-400 hover:text-zinc-200 underline underline-offset-4 cursor-pointer"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
