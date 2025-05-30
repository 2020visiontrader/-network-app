import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase
      .from('travel_checkins')
      .select('*, user:users(*)');

    if (city) {
      query = query.eq('city', city);
    }

    query = query
      .eq('visible_to_others', true)
      .neq('user_id', user.id)
      .gte('checkin_date', new Date().toISOString());

    const { data, error } = await query;

    if (error) throw error;

    // Filter out sensitive user data
    const travelers = data.map(checkin => ({
      id: checkin.user.id,
      full_name: checkin.user.full_name,
      preferred_name: checkin.user.preferred_name,
      interests: checkin.user.niche_tags,
      checkin_date: checkin.checkin_date,
      city: checkin.city
    }));

    return NextResponse.json(travelers);
  } catch (error) {
    console.error('Error fetching travelers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const checkinData = await request.json();
    const { data, error } = await supabase
      .from('travel_checkins')
      .insert({
        ...checkinData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating travel checkin:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 