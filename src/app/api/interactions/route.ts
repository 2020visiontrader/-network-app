import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const interaction = await request.json();
    
    // First, verify that the contact belongs to the user
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('id')
      .eq('id', interaction.contact_id)
      .eq('owner_id', user.id)
      .single();

    if (contactError || !contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Log the interaction
    const { data, error } = await supabase
      .from('interactions')
      .insert({
        ...interaction,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Update the contact's last_interaction_date
    await supabase
      .from('contacts')
      .update({ last_interaction_date: interaction.date })
      .eq('id', interaction.contact_id);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error logging interaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}