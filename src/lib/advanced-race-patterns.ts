/**
 * Advanced Race Condition Prevention Patterns
 * 
 * This module provides advanced patterns for handling race conditions
 * beyond simple retries, including:
 * - Circuit Breaker Pattern
 * - Queue-based Processing
 * - Real-time Database Listeners
 * - Server-side Verification
 */
import { SupabaseClient } from '@supabase/supabase-js';

// ------------------------------------------------------------
// Circuit Breaker Pattern
// ------------------------------------------------------------

/**
 * CircuitBreaker options interface
 */
interface CircuitBreakerOptions {
  failureThreshold: number;     // Number of failures before opening circuit
  resetTimeout: number;         // Time (ms) before trying to close circuit
  monitorInterval?: number;     // How often to check circuit state (ms)
  onOpen?: () => void;          // Callback when circuit opens
  onClose?: () => void;         // Callback when circuit closes
  onHalfOpen?: () => void;      // Callback when circuit goes half-open
}

/**
 * Circuit Breaker states
 */
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * CircuitBreaker implementation to prevent cascading failures
 * during system-wide issues
 */
export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private options: CircuitBreakerOptions;
  private monitorInterval: NodeJS.Timeout | null = null;

  constructor(options: CircuitBreakerOptions) {
    this.options = {
      failureThreshold: 5,
      resetTimeout: 30000, // 30 seconds
      monitorInterval: 5000, // 5 seconds
      ...options
    };

    // Start monitoring circuit state
    if (this.options.monitorInterval) {
      this.monitorInterval = setInterval(() => this.monitor(), this.options.monitorInterval);
    }
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === 'OPEN') {
      // Check if it's time to try half-open state
      if (Date.now() - this.lastFailureTime >= this.options.resetTimeout) {
        this.transitionToState('HALF_OPEN');
      } else {
        throw new Error('Circuit breaker is OPEN - system unavailable');
      }
    }

    // Execute the function
    try {
      const result = await fn();
      
      // Reset on success
      if (this.state === 'HALF_OPEN') {
        this.transitionToState('CLOSED');
      }
      
      this.failureCount = 0;
      return result;
    } catch (error) {
      // Handle failure
      this.lastFailureTime = Date.now();
      this.failureCount++;

      // Check if threshold reached
      if (this.state !== 'OPEN' && this.failureCount >= this.options.failureThreshold) {
        this.transitionToState('OPEN');
      }

      throw error;
    }
  }

  /**
   * Transition circuit to a new state
   */
  private transitionToState(newState: CircuitState): void {
    if (this.state === newState) return;

    this.state = newState;
    
    // Call appropriate callback
    if (newState === 'OPEN' && this.options.onOpen) {
      this.options.onOpen();
    } else if (newState === 'CLOSED' && this.options.onClose) {
      this.options.onClose();
    } else if (newState === 'HALF_OPEN' && this.options.onHalfOpen) {
      this.options.onHalfOpen();
    }
    
    console.log(`Circuit breaker state changed to: ${newState}`);
  }

  /**
   * Monitor circuit state and attempt recovery
   */
  private monitor(): void {
    // If circuit is open and reset timeout has passed, transition to half-open
    if (this.state === 'OPEN' && 
        (Date.now() - this.lastFailureTime) >= this.options.resetTimeout) {
      this.transitionToState('HALF_OPEN');
    }
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.failureCount = 0;
    this.transitionToState('CLOSED');
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }
}

// ------------------------------------------------------------
// Queue-based Processing
// ------------------------------------------------------------

/**
 * Queue item interface
 */
interface QueueItem<T> {
  id: string;
  data: T;
  priority: number;
  createdAt: number;
  maxRetries: number;
  retries: number;
}

/**
 * Queue processor options
 */
interface QueueProcessorOptions {
  concurrency: number;        // How many items to process simultaneously
  retryDelay: number;         // Delay between retries (ms)
  maxRetries: number;         // Maximum retry attempts
  processingInterval: number; // How often to check for new items (ms)
  onError?: (error: any, item: QueueItem<any>) => void; // Error callback
}

/**
 * Queue-based processor for time-consuming operations
 * Prevents race conditions by managing concurrent operations
 */
export class QueueProcessor<T> {
  private queue: QueueItem<T>[] = [];
  private processing: Set<string> = new Set();
  private options: QueueProcessorOptions;
  private processorInterval: NodeJS.Timeout | null = null;
  private processor: (item: T) => Promise<void>;
  private paused: boolean = false;

  constructor(
    processor: (item: T) => Promise<void>,
    options: Partial<QueueProcessorOptions> = {}
  ) {
    this.processor = processor;
    this.options = {
      concurrency: 2,
      retryDelay: 5000,
      maxRetries: 3,
      processingInterval: 1000,
      ...options
    };

    // Start processing loop
    this.processorInterval = setInterval(
      () => this.processQueue(), 
      this.options.processingInterval
    );
  }

  /**
   * Add item to the queue
   */
  enqueue(data: T, priority: number = 0, maxRetries: number = this.options.maxRetries): string {
    const id = `queue-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    this.queue.push({
      id,
      data,
      priority,
      createdAt: Date.now(),
      maxRetries,
      retries: 0
    });

    // Sort queue by priority (higher first)
    this.queue.sort((a, b) => b.priority - a.priority);
    
    return id;
  }

  /**
   * Process items in the queue
   */
  private async processQueue(): Promise<void> {
    if (this.paused || this.processing.size >= this.options.concurrency) {
      return;
    }

    // Get next item from queue
    const item = this.queue.shift();
    if (!item) return;

    // Mark as processing
    this.processing.add(item.id);

    try {
      // Process the item
      await this.processor(item.data);
      
      // Remove from processing set
      this.processing.delete(item.id);
    } catch (error) {
      // Handle error
      if (this.options.onError) {
        this.options.onError(error, item);
      }

      // Check if we should retry
      if (item.retries < item.maxRetries) {
        // Increment retry count
        item.retries++;
        
        // Re-add to queue after delay
        setTimeout(() => {
          // Re-add with same priority but track retries
          this.queue.push(item);
          this.processing.delete(item.id);
          
          // Re-sort queue
          this.queue.sort((a, b) => b.priority - a.priority);
        }, this.options.retryDelay);
      } else {
        // Max retries reached, remove from processing
        this.processing.delete(item.id);
        console.error(`Queue item ${item.id} failed after ${item.retries} retries:`, error);
      }
    }
  }

  /**
   * Pause queue processing
   */
  pause(): void {
    this.paused = true;
  }

  /**
   * Resume queue processing
   */
  resume(): void {
    this.paused = false;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0 && this.processing.size === 0;
  }

  /**
   * Get queue statistics
   */
  getStats(): { queuedItems: number; processingItems: number; paused: boolean } {
    return {
      queuedItems: this.queue.length,
      processingItems: this.processing.size,
      paused: this.paused
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.processorInterval) {
      clearInterval(this.processorInterval);
      this.processorInterval = null;
    }
  }
}

// ------------------------------------------------------------
// Real-time Database Listeners
// ------------------------------------------------------------

/**
 * Listener options
 */
interface RealtimeListenerOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  errorHandler?: (error: any) => void;
}

/**
 * Real-time database listener for immediate updates
 * Prevents race conditions by receiving push notifications
 * instead of polling for changes
 */
export class RealtimeListener {
  private supabase: SupabaseClient;
  private options: RealtimeListenerOptions;
  private subscription: any = null;
  private listeners: Map<string, (payload: any) => void> = new Map();
  private isConnected: boolean = false;

  constructor(supabase: SupabaseClient, options: RealtimeListenerOptions) {
    this.supabase = supabase;
    this.options = {
      event: '*',
      ...options
    };
  }

  /**
   * Start listening for changes
   */
  start(): void {
    if (this.subscription) return;

    let channel = this.supabase
      .channel(`${this.options.table}-changes`)
      .on(
        'postgres_changes',
        {
          event: this.options.event,
          schema: 'public',
          table: this.options.table,
          filter: this.options.filter
        },
        (payload) => this.handleChange(payload)
      )
      .on('system', (event) => {
        if (event === 'connected') {
          this.isConnected = true;
          console.log(`✅ Realtime listener connected to ${this.options.table}`);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to ${this.options.table} changes`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to ${this.options.table} changes`);
          if (this.options.errorHandler) {
            this.options.errorHandler(new Error(`Subscription error for ${this.options.table}`));
          }
        }
      });

    this.subscription = channel;
  }

  /**
   * Handle change event
   */
  private handleChange(payload: any): void {
    // Notify all listeners
    this.listeners.forEach((callback) => {
      try {
        callback(payload);
      } catch (error) {
        console.error('Error in realtime listener callback:', error);
      }
    });
  }

  /**
   * Add change listener
   */
  onChange(id: string, callback: (payload: any) => void): void {
    this.listeners.set(id, callback);
  }

  /**
   * Remove change listener
   */
  removeListener(id: string): void {
    this.listeners.delete(id);
  }

  /**
   * Check if connected
   */
  isActive(): boolean {
    return this.isConnected;
  }

  /**
   * Stop listening for changes
   */
  stop(): void {
    if (this.subscription) {
      this.supabase.removeChannel(this.subscription);
      this.subscription = null;
      this.isConnected = false;
    }
  }
}

// ------------------------------------------------------------
// Server-side Verification
// ------------------------------------------------------------

/**
 * Verification job options
 */
interface VerificationJobOptions {
  table: string;
  idColumn: string;
  dataValidator: (data: any) => boolean;
  fixMissingData?: (id: string) => Promise<void>;
  interval: number;
  batchSize: number;
  errorHandler?: (error: any) => void;
}

/**
 * Server-side verification job for scheduled data checks
 * Prevents race conditions by verifying data consistency
 */
export class ServerSideVerification {
  private supabase: SupabaseClient;
  private options: VerificationJobOptions;
  private jobInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private lastRun: number = 0;
  private problemCount: number = 0;
  private fixedCount: number = 0;

  constructor(
    supabase: SupabaseClient,
    options: VerificationJobOptions
  ) {
    this.supabase = supabase;
    this.options = options;
  }

  /**
   * Start scheduled verification
   */
  start(): void {
    if (this.jobInterval) return;

    // Run verification job at specified interval
    this.jobInterval = setInterval(
      () => this.runVerification(),
      this.options.interval
    );
    
    // Run immediately
    this.runVerification();
  }

  /**
   * Run verification job
   */
  private async runVerification(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastRun = Date.now();
    
    try {
      // Fetch batch of records to verify
      const { data, error } = await this.supabase
        .from(this.options.table)
        .select('*')
        .limit(this.options.batchSize);
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        this.isRunning = false;
        return;
      }
      
      // Check each record for validity
      const problemIds = [];
      
      for (const record of data) {
        if (!this.options.dataValidator(record)) {
          problemIds.push(record[this.options.idColumn]);
        }
      }
      
      // Handle problem records
      if (problemIds.length > 0) {
        this.problemCount += problemIds.length;
        
        console.warn(`Found ${problemIds.length} records that need fixing in ${this.options.table}`);
        
        // Fix missing data if handler provided
        if (this.options.fixMissingData) {
          for (const id of problemIds) {
            try {
              await this.options.fixMissingData(id);
              this.fixedCount++;
            } catch (error) {
              console.error(`Error fixing record ${id}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error running verification job:', error);
      
      if (this.options.errorHandler) {
        this.options.errorHandler(error);
      }
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Run verification immediately
   */
  runNow(): Promise<void> {
    return this.runVerification();
  }

  /**
   * Get verification statistics
   */
  getStats(): { lastRun: number; problemCount: number; fixedCount: number; isRunning: boolean } {
    return {
      lastRun: this.lastRun,
      problemCount: this.problemCount,
      fixedCount: this.fixedCount,
      isRunning: this.isRunning
    };
  }

  /**
   * Stop scheduled verification
   */
  stop(): void {
    if (this.jobInterval) {
      clearInterval(this.jobInterval);
      this.jobInterval = null;
    }
  }
}

// ------------------------------------------------------------
// Exports
// ------------------------------------------------------------

export const AdvancedPatterns = {
  CircuitBreaker,
  QueueProcessor,
  RealtimeListener,
  ServerSideVerification
};

export default AdvancedPatterns;
