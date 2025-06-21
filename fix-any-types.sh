#!/bin/bash
# fix-any-types.sh
# Script to help improve type safety by replacing 'any' with more specific types

echo "=== Improving Type Safety ==="

# Create a common types file for shared types
mkdir -p src/types

# Check if common.ts already exists
if [ ! -f "src/types/common.ts" ]; then
  echo "Creating common types file..."
  cat > src/types/common.ts << 'EOF'
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
EOF
fi

# Create an improved database types file
if [ ! -f "src/types/database.types.ts" ]; then
  echo "Creating improved database types file..."
  cat > src/types/database.types.ts << 'EOF'
/**
 * Database and Supabase related types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      founders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string
          preferred_name?: string
          avatar_url?: string
          linkedin_url?: string
          location_city?: string
          industry?: string
          company_name?: string
          role?: string
          bio?: string
          tags_or_interests?: string[]
          onboarding_completed: boolean
          profile_visible: boolean
          profile_progress: number
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          // Add other fields as needed
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          // Add other fields as needed
        }
      }
      connections: {
        Row: {
          id: string
          created_at: string
          founder_id: string
          connected_user_id: string
          status: 'pending' | 'accepted' | 'declined'
        }
        // Add Insert and Update as needed
      }
      coffee_chats: {
        Row: {
          id: string
          created_at: string
          founder_id: string
          requested_user_id: string
          status: 'pending' | 'accepted' | 'declined' | 'completed'
          scheduled_time?: string
          notes?: string
        }
        // Add Insert and Update as needed
      }
      // Add other tables as needed
    }
    Functions: {
      complete_onboarding: {
        Args: { p_user_id: string; user_email: string; founder_data: Record<string, unknown> };
        Returns: boolean;
      }
      // Add other functions as needed
    }
  }
}
EOF
fi

echo "✅ Created improved type definitions!"

# Find files with 'any' type and suggest improvements
echo "📊 Summary of 'any' type usage in the codebase:"
grep -r ": any" --include="*.ts" --include="*.tsx" src | wc -l

echo "🔍 Creating a report of files that need type improvements..."
grep -r ": any" --include="*.ts" --include="*.tsx" src > type-improvements-needed.txt

echo "✅ Done! A list of files that need type improvements has been saved to type-improvements-needed.txt"
echo "You can now incrementally improve these files by replacing 'any' with more specific types."
echo ""
echo "Next steps:"
echo "1. Review type-improvements-needed.txt and prioritize important files"
echo "2. Use the common types in src/types/common.ts where appropriate"
echo "3. Create more specific interfaces for your data models"
echo "4. Run npx tsc --noEmit to verify your changes"
