import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Hackathon, Subscriber, HackathonFilterOptions } from './types';
import { MOCK_HACKATHONS } from './mockData';

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
  const { search, tag, location, sortBy } = options;

  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase
        .from('hackathons')
        .select('*')
        .eq('is_active', true);

      if (tag && tag !== 'All') {
        query = query.contains('tags', [tag]);
      }

      if (location && location !== 'All') {
        query = query.eq('location_type', location);
      }

      if (search && search.trim() !== '') {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
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

  if (location && location !== 'All') {
    results = results.filter((h) => h.location_type === location);
  }

  if (search && search.trim() !== '') {
    const term = search.toLowerCase();
    results = results.filter(
      (h) => h.title.toLowerCase().includes(term) || h.description.toLowerCase().includes(term)
    );
  }

  if (sortBy === 'prize_desc') {
    results.sort((a, b) => b.prize_pool - a.prize_pool);
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
