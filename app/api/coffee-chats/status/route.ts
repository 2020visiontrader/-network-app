import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../src/utils/supabase-server';

// Configure dynamic route handling for production export
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = createServerSupabaseClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('coffee_chats')
      .select(`
        *,
        requester:founders!requester_id(*),
        requested:founders!requested_id(*)
      `)
      .or(`requester_id.eq.${user.id},requested_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"

    return NextResponse.json(data || null);
  } catch (error) {
    console.error('Error fetching coffee chat status:', error);
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

    const chatData = await request.json();
    const { data, error } = await supabase
      .from('coffee_chats')
      .insert({
        ...chatData,
        requester_id: user.id,
        status: 'pending'
      })
      .select(`
        *,
        requester:founders!requester_id(*),
        requested:founders!requested_id(*)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating coffee chat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const supabase = createServerSupabaseClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chatData = await request.json();
    const { data, error } = await supabase
      .from('coffee_chats')
      .update(chatData)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating coffee chat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}