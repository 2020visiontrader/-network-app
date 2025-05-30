'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';
import { getFeatureFlag } from '@/config/features';

interface HiveEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  city: string;
  niche: string;
  host: string;
  image_url?: string;
  external_link: string;
  attendee_count?: number;
}

interface TravelDestination {
  city: string;
  check_in_date: string;
  check_out_date: string;
}

// Check if AI features are enabled
const AI_FEATURES_ENABLED = getFeatureFlag('AI_EVENT_DISCOVERY');

export default function HivePage() {
  const { user } = useAuth();
  const [localEvents, setLocalEvents] = useState<HiveEvent[]>([]);
  const [travelEvents, setTravelEvents] = useState<HiveEvent[]>([]);
  const [suggestedMatches, setSuggestedMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'local' | 'travel' | 'matches'>('local');
  const [userProfile, setUserProfile] = useState<any>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (userProfile) {
      fetchHiveEvents();
    }
  }, [userProfile]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('city, niche, role')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
    }
  };

  const fetchHiveEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!AI_FEATURES_ENABLED) {
        // AI features disabled - show placeholder state
        setLocalEvents([]);
        setTravelEvents([]);
        setSuggestedMatches([]);
        setLoading(false);
        return;
      }

      // Fetch travel destinations
      const { data: travelData } = await supabase
        .from('travel_checkins')
        .select('city, check_in_date, check_out_date')
        .eq('user_id', user?.id)
        .gte('check_in_date', new Date().toISOString().split('T')[0]);

      const travelDestinations: TravelDestination[] = travelData || [];

      // Mock AI-powered event matching (replace with real API)
      const localEventsData = await fetchEventsForCity(userProfile.city, userProfile.niche);
      setLocalEvents(localEventsData);

      // Fetch events for travel destinations
      const allTravelEvents: HiveEvent[] = [];
      for (const destination of travelDestinations) {
        const events = await fetchEventsForCity(destination.city, userProfile.niche);
        allTravelEvents.push(...events);
      }
      setTravelEvents(allTravelEvents);

      // Generate suggested matches (basic implementation)
      const matches = await generateSuggestedMatches(localEventsData);
      setSuggestedMatches(matches);

    } catch (err) {
      console.error('Error fetching hive events:', err);
      setError('Failed to load hive events');
    } finally {
      setLoading(false);
    }
  };

  // Mock AI event matching function (replace with real API)
  const fetchEventsForCity = async (city: string, niche: string): Promise<HiveEvent[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock events data (replace with real API call)
    const mockEvents: HiveEvent[] = [
      {
        id: '1',
        title: `${niche} Networking Mixer`,
        description: `Connect with fellow ${niche.toLowerCase()} professionals in ${city}`,
        date: '2024-02-20',
        time: '18:00',
        location: 'Innovation Hub',
        city: city,
        niche: niche,
        host: 'Tech Community',
        external_link: 'https://example.com/event1',
        attendee_count: 45,
        image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400'
      },
      {
        id: '2',
        title: `${niche} Startup Pitch Night`,
        description: 'Present your ideas to investors and get feedback',
        date: '2024-02-25',
        time: '19:00',
        location: 'WeWork Downtown',
        city: city,
        niche: niche,
        host: 'Startup Accelerator',
        external_link: 'https://example.com/event2',
        attendee_count: 32,
        image_url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400'
      },
      {
        id: '3',
        title: `${niche} Workshop Series`,
        description: 'Hands-on learning with industry experts',
        date: '2024-03-01',
        time: '14:00',
        location: 'Conference Center',
        city: city,
        niche: niche,
        host: 'Professional Development',
        external_link: 'https://example.com/event3',
        attendee_count: 28,
        image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'
      }
    ];

    return mockEvents;
  };

  const generateSuggestedMatches = async (events: HiveEvent[]): Promise<any[]> => {
    // Mock suggested matches based on events
    return [
      {
        id: '1',
        event: events[0],
        mutual_connections: 3,
        shared_interests: ['Tech', 'Networking'],
        attendees: [
          { name: 'Sarah Chen', role: 'Product Manager', company: 'TechCorp' },
          { name: 'Mike Rodriguez', role: 'Developer', company: 'StartupXYZ' }
        ]
      }
    ];
  };

  const handleRSVP = (event: HiveEvent) => {
    window.open(event.external_link, '_blank', 'noopener,noreferrer');
  };

  const saveToCalendar = (event: HiveEvent) => {
    // Create calendar event
    const startDate = new Date(`${event.date}T${event.time}`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;

    window.open(calendarUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Scanning hive intelligence matrix..." />;
  }

  const currentEvents = activeTab === 'local' ? localEvents : activeTab === 'travel' ? travelEvents : [];

  return (
    <ErrorBoundary>
      <div className="space-y-6 gradient-mesh min-h-screen">
        {/* Header */}
        <div className="card-mobile border-accent/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-neural rounded-hive flex items-center justify-center shadow-glow">
                <span className="text-white text-lg">🔮</span>
              </div>
              <div>
                <h1 className="heading-lg-mobile text-text">Hive Intelligence</h1>
                <p className="text-xs text-subtle">AI-powered event discovery</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent2 rounded-full pulse-hive"></div>
              <span className="text-xs text-subtle">Neural Active</span>
            </div>
          </div>

          {userProfile && (
            <div className="bg-surface/50 rounded-hive p-3 mb-4">
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-subtle">Scanning for:</span>
                <span className="bg-accent/20 text-accent px-2 py-1 rounded-hive">{userProfile.niche}</span>
                <span className="text-subtle">in</span>
                <span className="bg-accent2/20 text-accent2 px-2 py-1 rounded-hive">{userProfile.city}</span>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('local')}
              className={`flex-1 py-2 px-3 rounded-hive text-sm font-medium transition-all duration-200 ${
                activeTab === 'local'
                  ? 'bg-accent text-white shadow-glow'
                  : 'text-subtle hover:text-text hover:bg-surface/50'
              }`}
            >
              📍 Local Hive
            </button>
            <button
              onClick={() => setActiveTab('travel')}
              className={`flex-1 py-2 px-3 rounded-hive text-sm font-medium transition-all duration-200 ${
                activeTab === 'travel'
                  ? 'bg-accent text-white shadow-glow'
                  : 'text-subtle hover:text-text hover:bg-surface/50'
              }`}
            >
              ✈️ Travel Hive
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex-1 py-2 px-3 rounded-hive text-sm font-medium transition-all duration-200 ${
                activeTab === 'matches'
                  ? 'bg-accent text-white shadow-glow'
                  : 'text-subtle hover:text-text hover:bg-surface/50'
              }`}
            >
              🧠 Neural Matches
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

        {/* Events List */}
        <div className="space-y-4">
          {!AI_FEATURES_ENABLED ? (
            <div className="card-mobile text-center py-12">
              <div className="w-16 h-16 bg-accent/20 rounded-hive flex items-center justify-center mx-auto mb-6 opacity-50">
                <span className="text-3xl">🔮</span>
              </div>
              <h3 className="heading-lg-mobile text-text mb-3">Hive Intelligence Coming Soon</h3>
              <p className="text-sm text-subtle mb-6 max-w-xs mx-auto">
                AI-powered event discovery and neural matching are currently in development.
                This feature will intelligently connect you with relevant events and people.
              </p>
              <div className="bg-surface/50 rounded-hive p-4 mb-4">
                <h4 className="text-sm font-semibold text-text mb-2">Planned Features:</h4>
                <div className="space-y-1 text-xs text-subtle">
                  <div className="flex items-center space-x-2">
                    <span>🎯</span>
                    <span>Smart event matching by niche & location</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🧠</span>
                    <span>AI-powered attendee connections</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>✈️</span>
                    <span>Travel-based event recommendations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🔗</span>
                    <span>External API integrations</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-subtle">
                Neural networks are being calibrated...
              </div>
            </div>
          ) : (
            activeTab === 'matches' ? (
              suggestedMatches.length === 0 ? (
                <div className="card-mobile text-center py-8">
                  <div className="w-12 h-12 bg-accent/20 rounded-hive flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <h3 className="heading-md-mobile text-text mb-2">No Neural Matches</h3>
                  <p className="text-sm text-subtle">
                    AI is analyzing patterns. Check back soon for intelligent connections.
                  </p>
                </div>
              ) : (
                suggestedMatches.map((match) => (
                  <SuggestedMatchCard key={match.id} match={match} />
                ))
              )
            ) : (
              currentEvents.length === 0 ? (
                <div className="card-mobile text-center py-8">
                  <div className="w-12 h-12 bg-accent2/20 rounded-hive flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔮</span>
                  </div>
                  <h3 className="heading-md-mobile text-text mb-2">No Events Detected</h3>
                  <p className="text-sm text-subtle">
                    {activeTab === 'local'
                      ? 'No events found in your local hive network.'
                      : 'No events found for your travel destinations.'}
                  </p>
                </div>
              ) : (
                currentEvents.map((event) => (
                  <HiveEventCard
                    key={event.id}
                    event={event}
                    onRSVP={handleRSVP}
                    onSaveToCalendar={saveToCalendar}
                  />
                ))
              )
            )
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

interface HiveEventCardProps {
  event: HiveEvent;
  onRSVP: (event: HiveEvent) => void;
  onSaveToCalendar: (event: HiveEvent) => void;
}

const HiveEventCard: React.FC<HiveEventCardProps> = ({ event, onRSVP, onSaveToCalendar }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="card-mobile border-accent2/20 hover:border-accent2/40 transition-all duration-300">
      {event.image_url && (
        <div className="w-full h-32 bg-surface rounded-hive mb-3 overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-text text-sm">{event.title}</h3>
            <span className="text-xs bg-accent2/20 text-accent2 px-2 py-1 rounded-hive">
              {event.niche}
            </span>
          </div>
          <p className="text-xs text-subtle mb-2">Hosted by {event.host}</p>
          <p className="text-xs text-subtle line-clamp-2">{event.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-subtle mb-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span>📅</span>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>⏰</span>
            <span>{event.time}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>📍</span>
            <span>{event.location}</span>
          </div>
        </div>
      </div>

      {event.attendee_count && (
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex items-center space-x-1">
            <span className="text-xs">👥</span>
            <span className="text-xs text-subtle">{event.attendee_count} attending</span>
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={() => onRSVP(event)}
          className="flex-1 bg-accent2/20 text-accent2 hover:bg-accent2/30 px-3 py-2 rounded-hive text-xs font-medium transition-colors duration-200"
        >
          RSVP
        </button>
        <button
          onClick={() => onSaveToCalendar(event)}
          className="flex-1 bg-accent/20 text-accent hover:bg-accent/30 px-3 py-2 rounded-hive text-xs font-medium transition-colors duration-200"
        >
          Save to Calendar
        </button>
      </div>
    </div>
  );
};

interface SuggestedMatchCardProps {
  match: any;
}

const SuggestedMatchCard: React.FC<SuggestedMatchCardProps> = ({ match }) => {
  return (
    <div className="card-mobile border-accent/20 hover:border-accent/40 transition-all duration-300">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 gradient-neural rounded-hive flex items-center justify-center shadow-glow">
          <span className="text-white text-sm">🧠</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-text text-sm">{match.event.title}</h3>
          <p className="text-xs text-subtle">Neural match detected</p>
        </div>
      </div>

      <div className="bg-surface/50 rounded-hive p-3 mb-3">
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <span>🤝</span>
            <span className="text-subtle">{match.mutual_connections} mutual</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>🎯</span>
            <span className="text-subtle">{match.shared_interests.join(', ')}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <p className="text-xs text-subtle">Potential connections:</p>
        {match.attendees.map((attendee: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center">
              <span className="text-accent">👤</span>
            </div>
            <div>
              <span className="text-text font-medium">{attendee.name}</span>
              <span className="text-subtle"> • {attendee.role} at {attendee.company}</span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full bg-accent/20 text-accent hover:bg-accent/30 px-3 py-2 rounded-hive text-xs font-medium transition-colors duration-200">
        View Neural Analysis
      </button>
    </div>
  );
};
