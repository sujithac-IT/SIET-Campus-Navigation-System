import { getSupabase, isSupabaseConfigured } from './client';
import { SIET_GEO_BUILDINGS } from '../data/sietGeoData';
import { Building, Room, TimetableSlot } from '@/types';

export interface SupabaseHealth {
  connected: boolean;
  configured: boolean;
  message: string;
  counts?: {
    buildings: number;
    rooms: number;
    timetables: number;
  };
}

/**
 * Fetch buildings from Supabase if configured, or return fallback local buildings.
 */
export async function fetchCampusBuildings(): Promise<Building[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return SIET_GEO_BUILDINGS;
  }

  try {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .order('name');

    if (error || !data || data.length === 0) {
      console.warn('[Supabase] No buildings in database, using fallback:', error?.message);
      return SIET_GEO_BUILDINGS;
    }

    return data as unknown as Building[];
  } catch (err) {
    console.warn('[Supabase] Exception fetching buildings, falling back:', err);
    return SIET_GEO_BUILDINGS;
  }
}

/**
 * Fetch exam halls and classrooms from Supabase or fallback.
 */
export async function fetchCampusRooms(): Promise<Room[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('code');

    if (error || !data) {
      return [];
    }

    return data as unknown as Room[];
  } catch (err) {
    console.warn('[Supabase] Exception fetching rooms:', err);
    return [];
  }
}

/**
 * Check Supabase backend health and connectivity
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealth> {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      configured: false,
      message: 'Supabase credentials not configured in environment. Using high-precision local geospatial cache.',
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return {
      connected: false,
      configured: true,
      message: 'Failed to create Supabase client instance.',
    };
  }

  try {
    const { count: buildingsCount, error: bError } = await supabase
      .from('buildings')
      .select('*', { count: 'exact', head: true });

    if (bError) {
      return {
        connected: false,
        configured: true,
        message: `Supabase query error: ${bError.message}`,
      };
    }

    const { count: roomsCount } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true });

    const { count: ttCount } = await supabase
      .from('timetables')
      .select('*', { count: 'exact', head: true });

    return {
      connected: true,
      configured: true,
      message: 'Connected to Supabase successfully.',
      counts: {
        buildings: buildingsCount || 0,
        rooms: roomsCount || 0,
        timetables: ttCount || 0,
      },
    };
  } catch (e: any) {
    return {
      connected: false,
      configured: true,
      message: `Connection test failed: ${e?.message || 'Network error'}`,
    };
  }
}
