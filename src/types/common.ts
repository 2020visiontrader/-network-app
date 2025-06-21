/**
 * Common TypeScript types used throughout the application
 */

// Generic API response type
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// Error handling types
export interface AppError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Service status types
export interface ServiceStatus {
  status: string;
  message: string;
  error?: string;
}

// Generic form validation result
export interface ValidationResult<T = Record<string, string>> {
  isValid: boolean;
  errors: T;
}

// Common app metrics
export interface AppMetrics {
  connections: number;
  pendingRequests: number;
  upcomingEvents: number;
  activeMasterminds: number;
  coffeeChats: number;
}

// User analytics data
export interface UserAnalytics {
  coffeeChatsScheduled: number;
  introsMade: number;
  mastermindsCreated: number;
  eventsRSVPed: number;
  connectionsCount: number;
  profileViews: number;
}
