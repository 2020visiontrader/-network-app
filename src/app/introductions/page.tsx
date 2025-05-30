'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';
import { getFeatureFlag } from '@/config/features';

interface SmartIntroduction {
  id: string;
  suggested_by: string;
  user_1_id: string;
  user_2_id: string;
  reason: string;
  status: 'pending' | 'accepted' | 'ignored';
  created_at: string;
  user_1?: any;
  user_2?: any;
}

// Check if AI matching is enabled
const AI_MATCHING_ENABLED = getFeatureFlag('AI_SMART_INTRODUCTIONS');

export default function IntroductionsPage() {
  const { user } = useAuth();
  const [pendingIntros, setPendingIntros] = useState<SmartIntroduction[]>([]);
  const [acceptedIntros, setAcceptedIntros] = useState<SmartIntroduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted'>('pending');
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user) {
      fetchIntroductions();
    }
  }, [user]);

  const fetchIntroductions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch pending introductions where user is involved
      const { data: pendingData, error: pendingError } = await supabase
        .from('smart_introductions')
        .select(`
          *,
          user_1:user_1_id (
            id,
            full_name,
            preferred_name,
            role,
            city,
            niche,
            linkedin_url
          ),
          user_2:user_2_id (
            id,
            full_name,
            preferred_name,
            role,
            city,
            niche,
            linkedin_url
          )
        `)
        .or(`user_1_id.eq.${user?.id},user_2_id.eq.${user?.id}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;

      // Fetch accepted introductions
      const { data: acceptedData, error: acceptedError } = await supabase
        .from('smart_introductions')
        .select(`
          *,
          user_1:user_1_id (
            id,
            full_name,
            preferred_name,
            role,
            city,
            niche,
            linkedin_url
          ),
          user_2:user_2_id (
            id,
            full_name,
            preferred_name,
            role,
            city,
            niche,
            linkedin_url
          )
        `)
        .or(`user_1_id.eq.${user?.id},user_2_id.eq.${user?.id}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (acceptedError) throw acceptedError;

      setPendingIntros(pendingData || []);
      setAcceptedIntros(acceptedData || []);
    } catch (err) {
      console.error('Error fetching introductions:', err);
      setError('Failed to load smart introductions');
    } finally {
      setLoading(false);
    }
  };

  const handleIntroductionAction = async (introId: string, action: 'accepted' | 'ignored') => {
    try {
      const { error } = await supabase
        .from('smart_introductions')
        .update({ status: action })
        .eq('id', introId);

      if (error) throw error;

      // Refresh the data
      fetchIntroductions();
    } catch (err) {
      console.error('Error updating introduction:', err);
      setError('Failed to update introduction');
    }
  };

  const generateSmartIntroductions = async () => {
    if (!AI_MATCHING_ENABLED) {
      setError('AI matching is currently disabled. This feature is coming soon!');
      return;
    }

    try {
      setLoading(true);

      // Simple matching algorithm - find users with same niche and city
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, preferred_name, role, city, niche')
        .neq('id', user?.id);

      if (usersError) throw usersError;

      const { data: currentUser, error: currentUserError } = await supabase
        .from('users')
        .select('city, niche, role')
        .eq('id', user?.id)
        .single();

      if (currentUserError) throw currentUserError;

      // Find potential matches
      const potentialMatches = users?.filter(otherUser =>
        (otherUser.city === currentUser.city && otherUser.niche === currentUser.niche) ||
        (otherUser.city === currentUser.city &&
         ((currentUser.role === 'mentor' && otherUser.role === 'mentee') ||
          (currentUser.role === 'mentee' && otherUser.role === 'mentor')))
      ) || [];

      // Create smart introductions
      for (const match of potentialMatches.slice(0, 3)) { // Limit to 3 suggestions
        const reason = match.city === currentUser.city && match.niche === currentUser.niche
          ? `Both in ${match.niche} & ${match.city}`
          : `${currentUser.role === 'mentor' ? 'Mentor' : 'Mentee'} match in ${match.city}`;

        // Check if introduction already exists
        const { data: existing } = await supabase
          .from('smart_introductions')
          .select('id')
          .or(`and(user_1_id.eq.${user?.id},user_2_id.eq.${match.id}),and(user_1_id.eq.${match.id},user_2_id.eq.${user?.id})`)
          .single();

        if (!existing) {
          await supabase
            .from('smart_introductions')
            .insert({
              suggested_by: 'system',
              user_1_id: user?.id,
              user_2_id: match.id,
              reason: reason,
              status: 'pending'
            });
        }
      }

      fetchIntroductions();
    } catch (err) {
      console.error('Error generating introductions:', err);
      setError('Failed to generate smart introductions');
    } finally {
      setLoading(false);
    }
  };

  if (loading && pendingIntros.length === 0 && acceptedIntros.length === 0) {
    return <LoadingSpinner fullScreen message="Analyzing neural connections..." />;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6 gradient-mesh min-h-screen">
        {/* Header */}
        <div className="card-mobile border-accent/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-neural rounded-hive flex items-center justify-center shadow-glow">
                <span className="text-white text-lg">🤖</span>
              </div>
              <div>
                <h1 className="heading-lg-mobile text-text">Smart Connections</h1>
                <p className="text-xs text-subtle">AI-powered introduction matching</p>
              </div>
            </div>
            <button
              onClick={generateSmartIntroductions}
              disabled={loading}
              className="btn-mobile-primary text-sm px-4 py-2"
            >
              {loading ? 'Analyzing...' : 'Generate Matches'}
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-2 px-3 rounded-hive text-sm font-medium transition-all duration-200 ${
                activeTab === 'pending'
                  ? 'bg-accent text-white shadow-glow'
                  : 'text-subtle hover:text-text hover:bg-surface/50'
              }`}
            >
              🤖 Suggested ({pendingIntros.length})
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`flex-1 py-2 px-3 rounded-hive text-sm font-medium transition-all duration-200 ${
                activeTab === 'accepted'
                  ? 'bg-accent text-white shadow-glow'
                  : 'text-subtle hover:text-text hover:bg-surface/50'
              }`}
            >
              ✅ Connected ({acceptedIntros.length})
            </button>
          </div>
        </div>

        {error && (
          <div className="card-mobile border-error/30 bg-surface/90">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-error" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-error">{error}</span>
            </div>
          </div>
        )}

        {/* Introductions List */}
        <div className="space-y-4">
          {activeTab === 'pending' ? (
            pendingIntros.length === 0 ? (
              <div className="card-mobile text-center py-8">
                <div className="w-12 h-12 bg-accent/20 rounded-hive flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="heading-md-mobile text-text mb-2">
                  {AI_MATCHING_ENABLED ? 'No Pending Connections' : 'Smart Matching Coming Soon'}
                </h3>
                <p className="text-sm text-subtle mb-4">
                  {AI_MATCHING_ENABLED
                    ? 'AI is analyzing your network for potential matches.'
                    : 'AI-powered introduction matching is currently in development. This feature will intelligently suggest connections based on shared interests, location, and professional goals.'
                  }
                </p>
                <button
                  onClick={generateSmartIntroductions}
                  disabled={!AI_MATCHING_ENABLED}
                  className={`text-sm px-4 py-2 ${
                    AI_MATCHING_ENABLED
                      ? 'btn-mobile-primary'
                      : 'bg-border text-subtle cursor-not-allowed rounded-hive'
                  }`}
                >
                  {AI_MATCHING_ENABLED ? 'Generate Smart Matches' : 'Feature Coming Soon'}
                </button>
              </div>
            ) : (
              pendingIntros.map((intro) => (
                <IntroductionCard
                  key={intro.id}
                  introduction={intro}
                  currentUserId={user?.id}
                  onAction={handleIntroductionAction}
                  isPending={true}
                />
              ))
            )
          ) : (
            acceptedIntros.length === 0 ? (
              <div className="card-mobile text-center py-8">
                <div className="w-12 h-12 bg-accent2/20 rounded-hive flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="heading-md-mobile text-text mb-2">No Connections Yet</h3>
                <p className="text-sm text-subtle">
                  Accepted introductions will appear here.
                </p>
              </div>
            ) : (
              acceptedIntros.map((intro) => (
                <IntroductionCard
                  key={intro.id}
                  introduction={intro}
                  currentUserId={user?.id}
                  onAction={handleIntroductionAction}
                  isPending={false}
                />
              ))
            )
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

interface IntroductionCardProps {
  introduction: SmartIntroduction;
  currentUserId?: string;
  onAction: (introId: string, action: 'accepted' | 'ignored') => void;
  isPending: boolean;
}

const IntroductionCard: React.FC<IntroductionCardProps> = ({ introduction, currentUserId, onAction, isPending }) => {
  const otherUser = introduction.user_1_id === currentUserId ? introduction.user_2 : introduction.user_1;

  return (
    <div className="card-mobile border-accent/20 hover:border-accent/40 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
              <span className="text-accent text-sm">👤</span>
            </div>
            <div>
              <h3 className="font-semibold text-text text-sm">
                {otherUser?.preferred_name || otherUser?.full_name}
              </h3>
              <p className="text-xs text-subtle">{otherUser?.role} • {otherUser?.city}</p>
            </div>
          </div>

          <div className="bg-surface/50 rounded-hive p-3 mb-3">
            <p className="text-xs text-subtle mb-1">Match Reason:</p>
            <p className="text-sm text-text">{introduction.reason}</p>
          </div>

          {otherUser?.niche && (
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-accent2/20 text-accent2 px-2 py-1 rounded-hive">
                {otherUser.niche}
              </span>
              {otherUser.linkedin_url && (
                <a
                  href={otherUser.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:text-accent-light"
                >
                  LinkedIn
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {isPending && (
        <div className="flex space-x-2">
          <button
            onClick={() => onAction(introduction.id, 'accepted')}
            className="flex-1 bg-accent2/20 text-accent2 hover:bg-accent2/30 px-3 py-2 rounded-hive text-xs font-medium transition-colors duration-200"
          >
            Accept Connection
          </button>
          <button
            onClick={() => onAction(introduction.id, 'ignored')}
            className="flex-1 bg-border text-subtle hover:bg-border/80 px-3 py-2 rounded-hive text-xs font-medium transition-colors duration-200"
          >
            Ignore
          </button>
        </div>
      )}

      {!isPending && (
        <div className="text-center">
          <span className="text-xs bg-accent2/20 text-accent2 px-3 py-1 rounded-hive">
            ✅ Connected
          </span>
        </div>
      )}
    </div>
  );
};
