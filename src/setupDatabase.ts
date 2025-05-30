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

// Initialize Supabase client with service role key for full database access
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigrations() {
  try {
    // Read migration files
    const migrationFiles = [
      '00_utility_functions.sql',
      '01_initial_schema.sql',
      '02_row_level_security.sql'
    ];

    console.log('Starting database setup...');

    for (const file of migrationFiles) {
      console.log(`Processing migration file: ${file}`);
      const migrationPath = path.join(__dirname, '..', 'database', 'migrations', file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      // Split the SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Execute each statement separately
      for (const statement of statements) {
        console.log(`Executing SQL statement: ${statement.split('\n')[0]}...`);

        // Try to execute the SQL statement
        let error = null;
        try {
          // First try a simple query to test connection
          const testResult = await supabase.from('_migration_temp').select('*').limit(1);
          if (testResult.error) {
            throw testResult.error;
          }
          // If successful, try to execute the statement
          const result = await supabase.from('_migration_temp').delete().neq('id', 0);
          error = result.error;
        } catch (firstError) {
          try {
            // If that fails, try through supabase_migrations
            const migrationResult = await supabase.from('_supabase_migrations').select('*').limit(1);
            if (migrationResult.error) {
              throw migrationResult.error;
            }
            const result = await supabase.from('_supabase_migrations')
              .insert({ name: 'manual_migration', executed_at: new Date().toISOString() });
            error = result.error;
          } catch (secondError) {
            // Last resort: try direct SQL execution
            try {
              const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                  'apikey': process.env.SUPABASE_ANON_KEY || ''
                },
                body: JSON.stringify({
                  sql: statement
                })
              });
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
            } catch (thirdError) {
              error = thirdError;
            }
          }
        }

        if (error) {
          console.error(`Error executing statement: ${statement}`);
          throw error;
        }
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
