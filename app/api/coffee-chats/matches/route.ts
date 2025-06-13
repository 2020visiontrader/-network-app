import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../src/utils/supabase-server';

// Configure dynamic route handling for production export
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = createServerSupabaseClient();
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

    // Get all founders in the same city who are available for coffee chats
    const { data, error } = await supabase
      .from('founders')
      .select(`
        id,
        full_name,
        location_city,
        industry,
        tagline,
        profile_picture
      `)
      .eq('location_city', city)
      .neq('id', user.id) // Exclude current user
      .is('deleted_at', null); // Only active founders

    if (error) {
      console.error('Error fetching matches:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}