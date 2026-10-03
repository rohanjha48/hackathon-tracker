import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Hackathon, Subscriber, HackathonFilterOptions } from './types';
import { normalizeCity } from './formatters';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    !supabaseUrl.includes('your-project') &&
    (supabaseAnonKey || supabaseServiceKey)
  );
};

// Client for browser / public access
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey || supabaseServiceKey)
  : null;

// Admin client for backend serverless API routes & cron scripts
export const supabaseAdmin: SupabaseClient | null = (isSupabaseConfigured() && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : (supabase || null);

/**
 * Fetch live hackathons directly from the Supabase Hackathons table.
 * If the database is empty or not yet configured, returns an empty array.
 * NO DUMMY/MOCK DATA FALLBACK.
 */
export async function fetchHackathons(options: HackathonFilterOptions = {}): Promise<Hackathon[]> {
  const { search, tag, location, mode, country, city, sortBy } = options;

  const client = supabaseAdmin || supabase;
  if (!client) {
    console.warn('⚠️ Supabase credentials not found in environment.');
    return [];
  }

  try {
    let query = client
      .from('hackathons')
      .select('*')
      .eq('is_active', true);

    if (tag && tag !== 'All') {
      query = query.contains('tags', [tag]);
    }

    // Mode filter (online, in-person, hybrid, or both)
    if (mode && mode !== 'both' && mode !== 'all') {
      if (mode === 'online') {
        query = query.or('mode.eq.online,location_type.eq.Online');
      } else if (mode === 'in-person') {
        query = query.or('mode.eq.in-person,location_type.eq.In-Person,mode.eq.hybrid,location_type.eq.Hybrid');
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

    // Free text search
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
    if (error) {
      console.warn('⚠️ Supabase hackathons query note:', error.message);
      return [];
    }

    return (data || []) as Hackathon[];
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Failed to fetch from Supabase:', msg);
    return [];
  }
}

/**
 * Register or update a Telegram subscriber in Supabase Users table
 */
export async function upsertSubscriber(subscriber: Subscriber): Promise<{ success: boolean; message: string }> {
  const client = supabaseAdmin || supabase;
  if (!client) {
    return {
      success: false,
      message: 'Supabase credentials not configured in environment. Please set SUPABASE_URL and key in .env.',
    };
  }

  try {
    const { error: userErr } = await client.from('users').upsert(
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
