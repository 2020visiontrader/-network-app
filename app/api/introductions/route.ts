import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('introductions')
      .select(`
        *,
        contact_1:contacts!contact_1_id(*),
        contact_2:contacts!contact_2_id(*)
      `)
      .eq('introduced_by_id', user.id);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching introductions:', error);
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

    const introduction = await request.json();

    // Verify that both contacts belong to the user
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id')
      .in('id', [introduction.contact1_id, introduction.contact2_id])
      .eq('owner_id', user.id);

    if (contactsError || !contacts || contacts.length !== 2) {
      return NextResponse.json({ error: 'Invalid contacts' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('introductions')
      .insert({
        ...introduction,
        introduced_by_id: user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating introduction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 