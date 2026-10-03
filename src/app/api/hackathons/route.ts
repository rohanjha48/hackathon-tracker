import { NextRequest, NextResponse } from 'next/server';
import { fetchHackathons } from '@/lib/supabase';
import { LocationType } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const location = (searchParams.get('location') as LocationType | 'All') || undefined;
    const mode = (searchParams.get('mode') as 'both' | 'online' | 'in-person' | 'all') || undefined;
    const country = searchParams.get('country') || undefined;
    const city = searchParams.get('city') || undefined;
    const sortBy = (searchParams.get('sortBy') as 'deadline_asc' | 'deadline_desc' | 'prize_desc' | 'newest') || undefined;

    const hackathons = await fetchHackathons({
      search,
      tag,
      location,
      mode,
      country,
      city,
      sortBy,
    });

    return NextResponse.json({
      success: true,
      count: hackathons.length,
      data: hackathons,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve hackathons';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
