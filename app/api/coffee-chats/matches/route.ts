import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  if (!city) {
    return NextResponse.json({ error: 'City is required' }, { status: 400 });
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('coffee_chats')
      .select('*, user:users(*)')
      .eq('city', city)
      .eq('public_visibility', true)
      .neq('user_id', user.id)
      .gte('date_available', new Date().toISOString());

    if (error) throw error;

    // Filter out sensitive user data
    const matches = data.map(match => ({
      id: match.user.id,
      full_name: match.user.full_name,
      preferred_name: match.user.preferred_name,
      interests: match.user.niche_tags,
      date_available: match.date_available
    }));

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching coffee chat matches:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 