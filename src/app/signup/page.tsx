'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../../../lib/database.types';

type Role = 'member' | 'mentor' | 'mentee' | 'ambassador' | 'founder';

export default function SignUpPage() {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
    preferredName: '',
    role: 'member' as Role,
    city: '',
    niche: '',
    linkedinUrl: '',
    websiteUrl: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            preferred_name: formData.preferredName,
            role: formData.role,
            city: formData.city,
            niche: formData.niche,
            linkedin_url: formData.linkedinUrl,
            website_url: formData.websiteUrl,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      // Check if user was created successfully
      if (data.user) {
        // Try to create user profile in founders table, but don't fail if table doesn't exist
        try {
          const { error: profileError } = await supabase
            .from('founders')
            .insert([
              {
                id: data.user.id,
                email: formData.email,
                full_name: formData.fullName,
                company_name: formData.companyName || 'Startup',
                role: formData.role || 'founder',
                location_city: formData.city,
                industry: formData.niche,
                linkedin_url: formData.linkedinUrl,
                company_website: formData.websiteUrl,
              },
            ]);

          if (profileError) {
            console.warn('Could not create user profile:', profileError.message);
            // Don't throw error here - user auth was successful
          }
        } catch (profileError) {
          console.warn('User profile creation failed:', profileError);
          // Continue anyway - the auth user was created successfully
        }

        // Check if email confirmation is required
        if (data.user && !data.session) {
          // Email confirmation required
          setError('Account created successfully! Please check your email to verify your account. The confirmation link will redirect you back to this app.');
        } else if (data.session) {
          // User is already logged in (email confirmation disabled)
          setError('Account created successfully! Redirecting to dashboard...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setError('Account created successfully!');
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  return (
    <div className="min-h-screen bg-background gradient-mesh flex items-center justify-center py-8 px-4 safe-area-top safe-area-bottom">
      <div className="relative w-full max-w-sm">
        {/* Hivemind Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="mx-auto w-16 h-16 gradient-hive rounded-hive flex items-center justify-center mb-6 shadow-glow pulse-hive">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-white">
              <circle cx="10" cy="10" r="3" fill="currentColor"/>
              <circle cx="22" cy="10" r="3" fill="currentColor"/>
              <circle cx="16" cy="22" r="3" fill="currentColor"/>
              <line x1="10" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="10" y1="10" x2="16" y2="22" stroke="currentColor" strokeWidth="2"/>
              <line x1="22" y1="10" x2="16" y2="22" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h1 className="heading-lg-mobile mb-2 text-text">Join the Network</h1>
          <p className="body-base-mobile text-subtle">Initialize your neural profile</p>

          {/* Connection Status */}
          <div className="flex items-center justify-center space-x-2 mt-3">
            <div className="w-2 h-2 bg-accent2 rounded-full pulse-hive"></div>
            <span className="text-xs text-subtle">Network Ready</span>
          </div>
        </div>
        {/* Hivemind Signup Form */}
        <div className="card-mobile border-accent/20 animate-slide-up">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className={`border rounded-hive px-4 py-3 animate-slide-down ${
                error.includes('successfully')
                  ? 'bg-accent2/10 border-accent2/30 text-accent2'
                  : 'bg-error/10 border-error/30 text-error'
              }`}>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>

            </div>
          )}
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                  Neural ID
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field touch-target"
                  placeholder="Enter your neural identifier"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text mb-2">
                  Access Key
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field touch-target"
                  placeholder="Enter your access key"
                />
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-text mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="input-field touch-target"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="preferredName" className="block text-sm font-medium text-text mb-2">
                  Preferred Name
                </label>
                <input
                  id="preferredName"
                  name="preferredName"
                  type="text"
                  value={formData.preferredName}
                  onChange={handleInputChange}
                  className="input-field touch-target"
                  placeholder="How you'd like to be called (optional)"
                />
              </div>

              <div>
                <label htmlFor="niche" className="block text-sm font-medium text-text mb-2">
                  Neural Specialization
                </label>
                <select
                  id="niche"
                  name="niche"
                  value={formData.niche}
                  onChange={handleInputChange}
                  className="input-field touch-target"
                  required
                >
                  <option value="">Select your niche</option>
                  <option value="Tech">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Design">Design</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Startup">Startup</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Legal">Legal</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-text mb-2">
                  Network Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="input-field touch-target"
                >
                  <option value="member">Member</option>
                  <option value="mentor">Mentor</option>
                  <option value="mentee">Mentee</option>
                  <option value="ambassador">Ambassador</option>
                </select>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-text mb-2">
                  Location Node
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input-field touch-target"
                  placeholder="Enter your city"
                />
              </div>

              <div>
                <label htmlFor="linkedinUrl" className="block text-sm font-medium text-text mb-2">
                  LinkedIn Profile
                </label>
                <input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  className="input-field touch-target"
                  placeholder="https://linkedin.com/in/yourname"
                />
              </div>

              <div>
                <label htmlFor="websiteUrl" className="block text-sm font-medium text-text mb-2">
                  Website (Optional)
                </label>
                <input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                  className="input-field touch-target"
                  placeholder="https://yourbusiness.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-mobile-primary w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Initializing neural profile...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Join Network</span>
                  <div className="w-2 h-2 bg-white rounded-full pulse-hive"></div>
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <Link
              href="/login"
              className="text-accent hover:text-accent-light font-medium transition-colors duration-300 touch-target inline-block"
            >
              Already connected? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
