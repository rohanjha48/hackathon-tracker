import { Hackathon } from './types';

/**
 * Dummy/Mock hackathons have been removed per requirements.
 * The application fetches live data exclusively from the Supabase Hackathons table.
 */
export const MOCK_HACKATHONS: Hackathon[] = [];

export const POPULAR_TAGS = [
  'All',
  'AI',
  'Web3',
  'Beginner-Friendly',
  'Open Source',
  'Mobile',
  'ClimateTech',
  'Healthcare',
  'FinTech',
  'Hardware',
  'Cybersecurity'
];

export const POPULAR_COUNTRIES = [
  { value: 'All', label: 'All Countries' },
  { value: 'India', label: 'India' },
  { value: 'USA', label: 'USA' },
  { value: 'Global', label: 'Online / Global' }
];

export const MAJOR_CITIES_BY_COUNTRY: Record<string, string[]> = {
  India: ['Bangalore', 'Delhi', 'Mumbai', 'Hyderabad', 'Pune', 'Chennai'],
  USA: ['San Francisco', 'New York', 'Cambridge', 'Seattle', 'Austin'],
  All: ['Bangalore', 'Delhi', 'Mumbai', 'Hyderabad', 'San Francisco', 'New York', 'Cambridge']
};
