import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../src/utils/supabase-server';

export async function GET() {
  const supabase = createServerSupabaseClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: connections, error } = await supabase
      .from('connections')
      .select(`
        *,
        founder_a:founders!founder_a_id(*),
        founder_b:founders!founder_b_id(*)
      `)
      .or(`founder_a_id.eq.${user.id},founder_b_id.eq.${user.id}`)
      .eq('status', 'connected')
      .order('connected_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(connections);
  } catch (error) {
    console.error('Error fetching founder connections:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { founder_b_id, connection_source = 'app' } = await request.json();

    // Create connection between founders
    const { data, error } = await supabase
      .from('connections')
      .insert({
        founder_a_id: user.id,
        founder_b_id,
        connection_source,
        status: 'connected'
      })
      .select(`
        *,
        founder_a:founders!founder_a_id(*),
        founder_b:founders!founder_b_id(*)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating founder connection:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}