#!/bin/bash

# This script aims to fix common TypeScript errors in the project

# 1. Install missing type definitions
echo "Installing missing type dependencies..."
npm install --save-dev @types/supabase__auth-helpers-nextjs

# 2. Create a supabase.ts file if it doesn't exist
if [ ! -f "./src/utils/supabase.ts" ]; then
  echo "Creating src/utils/supabase.ts..."
  mkdir -p ./src/utils
  cat > ./src/utils/supabase.ts << 'EOF'
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
EOF
fi

# 3. Update AuthContext.tsx to include isLoading in the interface
echo "Updating AuthContext.tsx to include isLoading in the interface..."
sed -i '' 's/export interface AuthContextType {/export interface AuthContextType {\n  isLoading: boolean;/g' ./src/context/AuthContext.tsx

# 4. Fix property errors in DiscoveryScreen.tsx
echo "Fixing Set/Map issues in DiscoveryScreen.tsx..."
sed -i '' 's/setExistingConnections(new Map(/setExistingConnections(new Set(/g' ./src/screens/DiscoveryScreen.tsx
sed -i '' 's/const connectionStatus = existingConnections.get(/const connectionStatus = Array.from(existingConnections).find(item => item === /g' ./src/screens/DiscoveryScreen.tsx
sed -i '' 's/setExistingConnections(prev => new Map(prev).set(/setExistingConnections(prev => new Set([...prev, /g' ./src/screens/DiscoveryScreen.tsx
sed -i '' 's/, "pending"));/, "pending"]));/g' ./src/screens/DiscoveryScreen.tsx

# 5. Fix AppStatusService.ts property errors
echo "Fixing AppStatusService.ts property errors..."
cat > ./src/services/AppStatusService.ts.fix << 'EOF'
// Fix for AppStatusService.ts
// Replace the beginning of the file with this properly typed version

interface ServiceStatus {
  status: string;
  [key: string]: any;
}

interface Services {
  database?: ServiceStatus;
  schema?: ServiceStatus;
  auth?: ServiceStatus;
  [key: string]: ServiceStatus | undefined;
}

interface HealthResult {
  timestamp: string;
  overall: string;
  services: Services;
  error?: string;
}

interface DiagnosticResult {
  timestamp: string;
  app: {
    version: string;
    build: string;
    environment: "development" | "production" | "test";
  };
  health: HealthResult;
  user?: any;
  recommendations?: string[];
}
EOF

# 6. Fix auth.ts property errors
echo "Fixing auth.ts property errors..."
sed -i '' 's/this.currentSession/this._currentSession/g' ./src/services/auth.ts
sed -i '' 's/this.currentUser/this._currentUser/g' ./src/services/auth.ts
sed -i '' 's/getCurrentSession() {/getCurrentSession() {\n    return this._currentSession;\n  }\n\n  _currentSession = null;\n\n  _getCurrentSession() {/g' ./src/services/auth.ts
sed -i '' 's/getCurrentUser() {/getCurrentUser() {\n    return this._currentUser;\n  }\n\n  _currentUser = null;\n\n  _getCurrentUser() {/g' ./src/services/auth.ts

# 7. Fix FounderService.ts property errors
echo "Fixing FounderService.ts property errors..."
cat > ./src/services/FounderService.ts.fix << 'EOF'
// Add this interface to the beginning of FounderService.ts

interface FounderFilters {
  industry?: string;
  location_city?: string;
  role?: string;
  limit?: number;
  [key: string]: any;
}
EOF

# 8. Fix FormValidator.ts property errors
echo "Fixing FormValidator.ts property errors..."
cat > ./src/utils/FormValidator.ts.fix << 'EOF'
// Add this interface to the beginning of FormValidator.ts

interface FormErrors {
  tags_or_interests?: string;
  linkedin_url?: string;
  full_name?: string;
  bio?: string;
  company_name?: string;
  location_city?: string;
  [key: string]: string | undefined;
}
EOF

# 9. Fix ProfileScreen.tsx missing styles
echo "Fixing ProfileScreen.tsx missing styles..."
sed -i '' 's/const styles = StyleSheet.create({/const styles = StyleSheet.create({\n  loadingContainer: {\n    flex: 1,\n    justifyContent: "center",\n    alignItems: "center"\n  },\n  loadingText: {\n    fontSize: 16,\n    marginTop: 10\n  },/g' ./src/screens/ProfileScreen.tsx

echo "Fix script completed. You'll need to manually incorporate the .fix files' content into their respective files."
