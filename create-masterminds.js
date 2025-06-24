const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gbdodttegdctxvvavlqq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA'
);

async function createMastermindsTable() {
  try {
    console.log('🔧 Creating masterminds table...');
    
    // First check if table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'masterminds');
    
    if (tables && tables.length > 0) {
      console.log('✅ Masterminds table already exists');
      return;
    }
    
    // Create table using rpc call
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS masterminds (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          host_id UUID REFERENCES founders(id) ON DELETE CASCADE,
          topic TEXT NOT NULL,
          description TEXT,
          max_participants INTEGER DEFAULT 8,
          frequency TEXT DEFAULT 'weekly',
          meeting_day TEXT,
          meeting_time TIME,
          duration_minutes INTEGER DEFAULT 60,
          is_active BOOLEAN DEFAULT true,
          tags TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE masterminds ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Public read access" ON masterminds FOR SELECT USING (true);
        CREATE POLICY "Host can manage" ON masterminds USING (auth.uid() = host_id);
      `
    });
    
    if (error) {
      console.error('❌ Error creating table:', error);
      return;
    }
    
    console.log('✅ Masterminds table created successfully');
    
  } catch (error) {
    console.error('❌ Failed to create masterminds table:', error);
  }
}

createMastermindsTable().then(() => {
  console.log('🎉 Done!');
  process.exit(0);
});
