const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyRLSPolicies() {
  console.log('🔒 Applying Individual RLS Policies...');
  
  try {
    // Drop existing policies first
    console.log('1. Dropping existing founder policies...');
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Users can view their own profile" ON founders;` 
    });
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Users can update their own profile" ON founders;` 
    });
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Users can insert their own profile" ON founders;` 
    });
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON founders;` 
    });
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Enable select for users based on user_id" ON founders;` 
    });
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Enable update for users based on user_id" ON founders;` 
    });

    // Apply new founder policies
    console.log('2. Creating new founder policies...');
    
    // Founders SELECT policy - allow users to see their own profile and connected users
    await supabase.rpc('exec_sql', { 
      sql: `CREATE POLICY "founders_select_policy" ON founders
        FOR SELECT USING (
          id = auth.uid() OR 
          (profile_visibility = true AND id IN (
            SELECT founder_b FROM connections 
            WHERE founder_a = auth.uid() AND status = 'accepted'
            UNION
            SELECT founder_a FROM connections 
            WHERE founder_b = auth.uid() AND status = 'accepted'
          ))
        );` 
    });

    // Founders UPDATE policy - only own profile
    await supabase.rpc('exec_sql', { 
      sql: `CREATE POLICY "founders_update_policy" ON founders
        FOR UPDATE USING (id = auth.uid());` 
    });

    // Founders INSERT policy - only own profile
    await supabase.rpc('exec_sql', { 
      sql: `CREATE POLICY "founders_insert_policy" ON founders
        FOR INSERT WITH CHECK (id = auth.uid());` 
    });

    console.log('3. Creating connection policies...');
    
    // Drop existing connection policies
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Users can view their connections" ON connections;` 
    });
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Users can create connections" ON connections;` 
    });
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Users can update their connections" ON connections;` 
    });

    // Connection policies
    await supabase.rpc('exec_sql', { 
      sql: `CREATE POLICY "connections_select_policy" ON connections
        FOR SELECT USING (founder_a = auth.uid() OR founder_b = auth.uid());` 
    });

    await supabase.rpc('exec_sql', { 
      sql: `CREATE POLICY "connections_insert_policy" ON connections
        FOR INSERT WITH CHECK (founder_a = auth.uid());` 
    });

    await supabase.rpc('exec_sql', { 
      sql: `CREATE POLICY "connections_update_policy" ON connections
        FOR UPDATE USING (founder_a = auth.uid() OR founder_b = auth.uid());` 
    });

    console.log('4. Creating coffee chat policies...');
    
    // Drop existing coffee chat policies
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Users can view their coffee chats" ON coffee_chats;` 
    });
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Users can create coffee chats" ON coffee_chats;` 
    });
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Users can update their coffee chats" ON coffee_chats;` 
    });

    // Coffee chat policies
    await supabase.rpc('exec_sql', { 
      sql: `CREATE POLICY "coffee_chats_select_policy" ON coffee_chats
        FOR SELECT USING (creator_id = auth.uid() OR target_user_id = auth.uid());` 
    });

    await supabase.rpc('exec_sql', { 
      sql: `CREATE POLICY "coffee_chats_insert_policy" ON coffee_chats
        FOR INSERT WITH CHECK (creator_id = auth.uid());` 
    });

    await supabase.rpc('exec_sql', { 
      sql: `CREATE POLICY "coffee_chats_update_policy" ON coffee_chats
        FOR UPDATE USING (creator_id = auth.uid() OR target_user_id = auth.uid());` 
    });

    console.log('5. Creating event policies...');
    
    // Drop existing event policies
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Users can view all events" ON events;` 
    });
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Users can create events" ON events;` 
    });
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Users can update their events" ON events;` 
    });

    // Events policies (public events)
    await supabase.rpc('exec_sql', { 
      sql: `CREATE POLICY "events_select_policy" ON events
        FOR SELECT USING (true);` 
    });

    await supabase.rpc('exec_sql', { 
      sql: `CREATE POLICY "events_insert_policy" ON events
        FOR INSERT WITH CHECK (host_id = auth.uid());` 
    });

    await supabase.rpc('exec_sql', { 
      sql: `CREATE POLICY "events_update_policy" ON events
        FOR UPDATE USING (host_id = auth.uid());` 
    });

    // Event attendees policies
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Users can view event attendees" ON event_attendees;` 
    });
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Users can join events" ON event_attendees;` 
    });
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Users can update their attendance" ON event_attendees;` 
    });

    await supabase.rpc('exec_sql', { 
      sql: `CREATE POLICY "event_attendees_select_policy" ON event_attendees
        FOR SELECT USING (true);` 
    });

    await supabase.rpc('exec_sql', { 
      sql: `CREATE POLICY "event_attendees_insert_policy" ON event_attendees
        FOR INSERT WITH CHECK (user_id = auth.uid());` 
    });

    await supabase.rpc('exec_sql', { 
      sql: `CREATE POLICY "event_attendees_update_policy" ON event_attendees
        FOR UPDATE USING (user_id = auth.uid());` 
    });

    await supabase.rpc('exec_sql', { 
      sql: `CREATE POLICY "event_attendees_delete_policy" ON event_attendees
        FOR DELETE USING (user_id = auth.uid());` 
    });

    console.log('✅ All RLS Policies applied successfully!');
    
  } catch (error) {
    console.error('❌ Error applying RLS policies:', error);
  }
}

applyRLSPolicies();
