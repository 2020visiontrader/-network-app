#!/bin/bash

# Continue TypeScript Migration Script
# This script helps complete the TypeScript migration process

echo "📝 Continuing TypeScript Migration..."

# Check for any remaining TypeScript errors
echo "🔍 Checking for TypeScript errors..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
  echo "✅ No TypeScript errors found!"
else
  echo "⚠️ Some TypeScript errors still exist. Let's fix them incrementally."
fi

# Create any missing type definitions
echo "📦 Creating any missing type definition files..."

# Define a function to create a type definition file if it doesn't exist
create_type_def_file() {
  local filepath="$1"
  local content="$2"
  
  if [ ! -f "$filepath" ]; then
    echo "Creating $filepath"
    mkdir -p "$(dirname "$filepath")"
    echo "$content" > "$filepath"
  fi
}

# Add more common type definitions
create_type_def_file "src/types/api.ts" "export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  count?: number;
  page?: number;
  totalPages?: number;
}
"

create_type_def_file "src/types/user.ts" "export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface FounderProfile extends User {
  linkedin_url?: string;
  location_city?: string;
  industry?: string;
  company_name?: string;
  role?: string;
  bio?: string;
  tags_or_interests?: string[];
  onboarding_completed?: boolean;
  profile_visible?: boolean;
  profile_progress?: number;
}
"

# Final type-check to confirm progress
echo "🔄 Running final type check..."
npx tsc --noEmit

echo "🚀 TypeScript migration continuation complete!"
echo "📋 Next steps:"
echo "  1. Address any remaining TypeScript errors incrementally"
echo "  2. Improve type coverage by adding more specific types"
echo "  3. Test the application to ensure functionality is preserved"
echo "  4. Update documentation to reflect TypeScript usage"
