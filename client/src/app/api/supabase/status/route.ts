import { NextResponse } from 'next/server';
import { checkSupabaseHealth } from '@/lib/supabase/campusService';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET() {
  const isConfigured = isSupabaseConfigured();
  const health = await checkSupabaseHealth();

  return NextResponse.json({
    status: health.connected ? 'connected' : isConfigured ? 'error' : 'offline_cache_active',
    configured: isConfigured,
    health,
    timestamp: new Date().toISOString(),
    documentation: 'To connect Supabase, set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel or client/.env.local',
  });
}
