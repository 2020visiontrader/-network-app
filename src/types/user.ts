export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: string | number | boolean | string[] | undefined;
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

