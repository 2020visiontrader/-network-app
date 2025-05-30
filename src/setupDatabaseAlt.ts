import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Validate environment variables
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is not set in .env file');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in .env file');
}

// Create Supabase client with service role
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeSql(sql: string): Promise<void> {
  // Split SQL into individual statements
  const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

  for (const statement of statements) {
    const trimmedStatement = statement.trim();
    if (trimmedStatement) {
      console.log(`Executing: ${trimmedStatement.substring(0, 100)}...`);
      const { error } = await supabase.rpc('exec_sql', { sql: trimmedStatement });
      if (error) {
        throw new Error(`SQL execution failed: ${error.message}`);
      }
    }
  }
}

async function runMigrations() {
  try {
    console.log('Starting database setup...');

    // Read migration files in order
    const migrationFiles = [
      '00_utility_functions.sql',
      '01_initial_schema.sql',
      '02_row_level_security.sql'
    ];

    for (const file of migrationFiles) {
      console.log(`Processing migration file: ${file}`);
      const migrationPath = path.join(__dirname, '..', 'database', 'migrations', file);
      const sql = fs.readFileSync(migrationPath, 'utf8');

      try {
        await executeSql(sql);
        console.log(`Successfully executed ${file}`);
      } catch (error) {
        console.error(`Error executing ${file}:`, error);
        throw error;
      }
    }

    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    process.exit(1);
  }
}

runMigrations();
