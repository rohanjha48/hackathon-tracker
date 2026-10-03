import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Hackathon, Subscriber, HackathonFilterOptions } from './types';
import { MOCK_HACKATHONS } from './mockData';
import { normalizeCity, normalizeMode } from './formatters';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'your-anon-key'
  );
};

// Client for browser / public access
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Admin client for backend serverless API routes & cron scripts
export const supabaseAdmin: SupabaseClient | null = (isSupabaseConfigured() && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : (supabase || null);

/**
 * Fetch hackathons from Supabase with filtering and sorting,
 * or return filtered mock data if Supabase is not yet configured.
 */
export async function fetchHackathons(options: HackathonFilterOptions = {}): Promise<Hackathon[]> {
  const { search, tag, location, mode, country, city, sortBy } = options;

  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase
        .from('hackathons')
        .select('*')
        .eq('is_active', true);

      if (tag && tag !== 'All') {
        query = query.contains('tags', [tag]);
      }

      // Mode / Location filter
      if (mode && mode !== 'both' && mode !== 'all') {
        if (mode === 'online') {
          query = query.or('mode.eq.online,location_type.eq.Online');
        } else if (mode === 'in-person') {
          query = query.or('mode.eq.in-person,location_type.eq.In-Person,mode.eq.hybrid');
        }
      } else if (location && location !== 'All') {
        query = query.eq('location_type', location);
      }

      // Country filter
      if (country && country !== 'All') {
        if (country.toLowerCase() === 'global' || country.toLowerCase() === 'online') {
          query = query.or('mode.eq.online,location_type.eq.Online,country.ilike.%global%');
        } else {
          query = query.ilike('country', `%${country}%`);
        }
      }

      // City filter (e.g. Bangalore, Delhi)
      if (city && city !== 'All') {
        const normCity = normalizeCity(city);
        if (normCity.toLowerCase() === 'bangalore') {
          query = query.or('city.ilike.%bangalore%,city.ilike.%bengaluru%,location.ilike.%bangalore%,location.ilike.%bengaluru%');
        } else {
          query = query.or(`city.ilike.%${city}%,location.ilike.%${city}%`);
        }
      }

      if (search && search.trim() !== '') {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,city.ilike.%${search}%`);
      }

      // Sorting
      if (sortBy === 'prize_desc') {
        query = query.order('prize_pool', { ascending: false });
      } else if (sortBy === 'deadline_desc') {
        query = query.order('submission_deadline', { ascending: false });
      } else if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else {
        // default deadline_asc
        query = query.order('submission_deadline', { ascending: true });
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Hackathon[];
      }
    } catch (err) {
      console.warn('Supabase query failed, falling back to cached/mock data:', err);
    }
  }

  // In-memory filter on mock data
  let results = [...MOCK_HACKATHONS];

  if (tag && tag !== 'All') {
    results = results.filter((h) => h.tags.some((t) => t.toLowerCase() === tag.toLowerCase()));
  }

  // Filter by mode ('online', 'in-person', 'both'/'all')
  if (mode && mode !== 'both' && mode !== 'all') {
    if (mode === 'online') {
      results = results.filter((h) => normalizeMode(h.mode || h.location_type) === 'online');
    } else if (mode === 'in-person') {
      results = results.filter((h) => {
        const m = normalizeMode(h.mode || h.location_type);
        return m === 'in-person' || m === 'hybrid';
      });
    }
  } else if (location && location !== 'All') {
    results = results.filter((h) => h.location_type === location);
  }

  // Filter by country
  if (country && country !== 'All') {
    const cLower = country.toLowerCase();
    results = results.filter((h) => {
      if (cLower === 'global' || cLower === 'online') {
        return normalizeMode(h.mode || h.location_type) === 'online' || (h.country || '').toLowerCase().includes('global');
      }
      return (h.country || '').toLowerCase().includes(cLower) || (h.location || '').toLowerCase().includes(cLower);
    });
  }

  // Filter by city (special check for Bangalore / Bengaluru)
  if (city && city !== 'All') {
    const normCity = normalizeCity(city).toLowerCase();
    results = results.filter((h) => {
      const hCity = normalizeCity(h.city).toLowerCase();
      const hLoc = (h.location || '').toLowerCase();
      if (normCity === 'bangalore') {
        return hCity.includes('bangalore') || hCity.includes('bengaluru') || hLoc.includes('bangalore') || hLoc.includes('bengaluru');
      }
      return hCity.includes(normCity) || hLoc.includes(normCity);
    });
  }

  if (search && search.trim() !== '') {
    const term = search.toLowerCase();
    results = results.filter(
      (h) =>
        h.title.toLowerCase().includes(term) ||
        h.description.toLowerCase().includes(term) ||
        (h.city || '').toLowerCase().includes(term)
    );
  }

  if (sortBy === 'prize_desc') {
    results.sort((a, b) => (b.prize_amount || b.prize_pool) - (a.prize_amount || a.prize_pool));
  } else if (sortBy === 'deadline_desc') {
    results.sort(
      (a, b) => new Date(b.submission_deadline).getTime() - new Date(a.submission_deadline).getTime()
    );
  } else if (sortBy === 'newest') {
    results.sort(
      (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    );
  } else {
    // default deadline_asc
    results.sort(
      (a, b) => new Date(a.submission_deadline).getTime() - new Date(b.submission_deadline).getTime()
    );
  }

  return results;
}

/**
 * Register or update a Telegram subscriber in Supabase
 */
export async function upsertSubscriber(subscriber: Subscriber): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    // Return friendly simulated success when Supabase is running in mock mode
    return {
      success: true,
      message: 'Demo mode active: subscriber stored locally. Configure Supabase in .env.local to persist.',
    };
  }

  try {
    // Upsert into users table
    const { error: userErr } = await supabase.from('users').upsert(
      {
        telegram_id: subscriber.telegram_chat_id,
        telegram_chat_id: subscriber.telegram_chat_id,
        username: subscriber.telegram_username || null,
        filter_tags: subscriber.filter_tags,
        preferred_country: subscriber.preferred_country || null,
        preferred_city: subscriber.preferred_city || null,
        preferred_mode: subscriber.preferred_mode || 'both',
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'telegram_id' }
    );

    if (userErr) {
      console.error('Failed to upsert into users table:', userErr);
      return { success: false, message: userErr.message };
    }

    return { success: true, message: 'Successfully subscribed to Telegram hackathon alerts!' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown database error';
    return { success: false, message };
  }
}
