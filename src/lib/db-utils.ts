/**
 * Database Utilities
 * 
 * Provides helper functions for common database operations,
 * especially those that need to handle race conditions.
 */
import { SupabaseClient } from '@supabase/supabase-js';

type RetryOptions = {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  logPrefix?: string;
};

type RetryResult<T> = {
  data: T | null;
  error: Error | null;
  attempts: number;
  success: boolean;
  timeTaken: number;
};

/**
 * Execute a database query with automatic retries for race conditions
 * 
 * @param queryFn Function that executes the query and returns a promise with data/error
 * @param options Configuration options for retries
 * @returns The query result with metadata about retry attempts
 */
export async function withRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    logPrefix = 'DB Retry'
  } = options;

  let attempts = 0;
  let success = false;
  let finalData: T | null = null;
  let finalError: Error | null = null;
  
  const startTime = Date.now();

  // First attempt
  try {
    console.log(`${logPrefix}: Initial attempt`);
    const { data, error } = await queryFn();
    
    if (!error && data) {
      console.log(`${logPrefix}: Succeeded on initial attempt`);
      return {
        data,
        error: null,
        attempts: 1,
        success: true,
        timeTaken: Date.now() - startTime
      };
    }
    
    if (error) {
      console.warn(`${logPrefix}: Initial attempt failed with error:`, error.message || error);
      finalError = error;
    } else {
      console.warn(`${logPrefix}: Initial attempt returned no data (null/undefined)`);
    }
  } catch (err) {
    console.error(`${logPrefix}: Initial attempt threw exception:`, err);
    finalError = err as Error;
  }

  // Retry logic
  attempts = 1; // Count the first attempt
  
  while (attempts < maxRetries + 1) {
    // Calculate delay - use exponential backoff if enabled
    const currentDelay = exponentialBackoff 
      ? retryDelay * Math.pow(2, attempts - 1) 
      : retryDelay;
    
    console.log(`${logPrefix}: Waiting ${currentDelay}ms before retry ${attempts}/${maxRetries}...`);
    await new Promise(resolve => setTimeout(resolve, currentDelay));
    
    try {
      console.log(`${logPrefix}: Executing retry ${attempts}/${maxRetries}`);
      const { data, error } = await queryFn();
      
      if (!error && data) {
        console.log(`${logPrefix}: Succeeded on retry ${attempts}/${maxRetries}`, {
          timeTaken: Date.now() - startTime
        });
        
        return {
          data,
          error: null,
          attempts: attempts + 1,
          success: true,
          timeTaken: Date.now() - startTime
        };
      }
      
      if (error) {
        console.warn(`${logPrefix}: Retry ${attempts}/${maxRetries} failed with error:`, 
          error.message || error);
        finalError = error;
      } else {
        console.warn(`${logPrefix}: Retry ${attempts}/${maxRetries} returned no data (null/undefined)`);
      }
    } catch (err) {
      console.error(`${logPrefix}: Retry ${attempts}/${maxRetries} threw exception:`, err);
      finalError = err as Error;
    }
    
    attempts++;
  }
  
  console.error(`${logPrefix}: All retries failed after ${attempts} attempts and ${Date.now() - startTime}ms`);
  
  return {
    data: null,
    error: finalError,
    attempts,
    success: false,
    timeTaken: Date.now() - startTime
  };
}

/**
 * Fetch a record with automatic retries for race conditions
 * 
 * @param supabase Supabase client instance
 * @param table Table name to query
 * @param column Column name for the where condition
 * @param value Value to match in the where condition
 * @param select Columns to select (default: '*')
 * @param options Retry options
 * @returns The query result with metadata about retry attempts
 */
export async function fetchWithRetry<T>(
  supabase: SupabaseClient,
  table: string,
  column: string,
  value: any,
  select: string = '*',
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  return withRetry<T>(
    () => supabase.from(table).select(select).eq(column, value).maybeSingle(),
    {
      logPrefix: `[${table}:${column}=${value}]`,
      ...options
    }
  );
}

/**
 * Helper to verify a write operation with retries
 * 
 * @param supabase Supabase client instance
 * @param table Table name to query
 * @param column Column name for the where condition
 * @param value Value to match in the where condition
 * @param verifyFn Optional function to validate the data meets criteria
 * @param options Retry options
 * @returns The query result with metadata about retry attempts
 */
export async function verifyWriteWithRetry<T>(
  supabase: SupabaseClient,
  table: string,
  column: string,
  value: any,
  verifyFn?: (data: T) => boolean,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  return withRetry<T>(
    async () => {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(column, value)
        .maybeSingle();
      
      // If there's a verification function, make sure the data passes it
      if (!error && data && verifyFn && !verifyFn(data)) {
        return { 
          data: null, 
          error: new Error('Data verification failed: Record exists but does not meet criteria') 
        };
      }
      
      return { data, error };
    },
    {
      logPrefix: `[Verify:${table}:${column}=${value}]`,
      ...options
    }
  );
}

/**
 * Performance monitoring for database operations
 * 
 * @param label Operation label for logging
 * @param fn Function to execute and time
 * @returns The result of the function
 */
export async function measureDbOperation<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    
    // Log operations that take longer than expected
    if (duration > 500) {
      console.warn(`⚠️ Slow DB operation: ${label} took ${duration}ms`);
    } else {
      console.log(`✅ DB operation: ${label} completed in ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`❌ Failed DB operation: ${label} failed after ${duration}ms`, error);
    throw error;
  }
}

/**
 * Race Condition Monitoring Utilities
 * 
 * Provides enhanced monitoring and logging for race conditions
 */

/**
 * Log detailed race condition diagnostics
 * 
 * @param operation Name of the operation being monitored
 * @param metrics Performance metrics (attempts, time, etc.)
 * @param context Additional context like userId, resource being accessed
 */
export function logRaceConditionDiagnostics(
  operation: string,
  metrics: {
    attempts: number;
    timeTaken: number;
    success: boolean;
  },
  context: Record<string, any> = {}
): void {
  const { attempts, timeTaken, success } = metrics;
  
  // Determine if this might be a race condition
  const raceConditionLikelihood = 
    attempts > 2 ? 'High' : 
    attempts > 1 ? 'Possible' : 
    'Unlikely';
  
  // Categorize performance
  const performanceCategory = 
    timeTaken < 300 ? 'Fast' : 
    timeTaken < 1000 ? 'Normal' : 
    timeTaken < 3000 ? 'Slow' : 
    'Very Slow';
  
  // Generate detailed diagnostics
  const diagnostics = {
    operation,
    timestamp: new Date().toISOString(),
    success,
    metrics: {
      attempts,
      timeTaken,
      averageAttemptTime: Math.round(timeTaken / Math.max(attempts, 1))
    },
    analysis: {
      raceConditionLikelihood,
      performanceCategory,
      retryPattern: attempts > 1 ? `Needed ${attempts - 1} retries` : 'First attempt succeeded',
      needsOptimization: timeTaken > 2000 || attempts > 2
    },
    ...context
  };
  
  // Log with appropriate level based on outcome
  if (!success) {
    console.error(`❌ Race condition monitoring - ${operation} failed:`, diagnostics);
  } else if (attempts > 1 || timeTaken > 2000) {
    console.warn(`⚠️ Race condition monitoring - ${operation} succeeded with retries:`, diagnostics);
  } else {
    console.log(`✅ Race condition monitoring - ${operation} succeeded:`, diagnostics);
  }
  
  // Return diagnostics for potential telemetry reporting
  return diagnostics;
}
