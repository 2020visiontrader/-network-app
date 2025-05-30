'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';

interface EventSuggestion {
  id: string;
  niche_tag: string;
  city: string;
  title: string;
  description: string;
  event_date: string;
  external_link: string;
}

interface TravelCheckin {
  id: string;
  city: string;
  check_in_date: string;
  check_out_date: string;
}

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventSuggestion[]>([]);
  const [travelEvents, setTravelEvents] = useState<EventSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'local' | 'travel'>('local');
  const [filterTag, setFilterTag] = useState('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get user's city and niche tags
      const { data: userData } = await supabase
        .from('users')
        .select('city, niche_tags')
        .eq('id', user.id)
        .single();

      if (!userData) throw new Error('User data not found');

      // Fetch local events
      const { data: localEvents, error: localError } = await supabase
        .from('event_suggestions')
        .select('*')
        .eq('city', userData.city)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true });

      if (localError) throw localError;

      // Fetch travel check-ins
      const { data: travelCheckins, error: travelError } = await supabase
        .from('travel_checkins')
        .select('city, check_in_date, check_out_date')
        .eq('user_id', user.id)
        .gte('check_in_date', new Date().toISOString().split('T')[0]);

      if (travelError) throw travelError;

      // Fetch events for travel cities
      let travelEventsList: EventSuggestion[] = [];
      if (travelCheckins && travelCheckins.length > 0) {
        const travelCities = travelCheckins.map(t => t.city);
        const { data: travelEventsData, error: travelEventsError } = await supabase
          .from('event_suggestions')
          .select('*')
          .in('city', travelCities)
          .gte('event_date', new Date().toISOString().split('T')[0])
          .order('event_date', { ascending: true });

        if (travelEventsError) throw travelEventsError;
        travelEventsList = travelEventsData || [];
      }

      setEvents(localEvents || []);
      setTravelEvents(travelEventsList);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load event suggestions');
    } finally {
      setLoading(false);
    }
  };

  const filteredLocalEvents = events.filter(event =>
    !filterTag || event.niche_tag.toLowerCase().includes(filterTag.toLowerCase())
  );

  const filteredTravelEvents = travelEvents.filter(event =>
    !filterTag || event.niche_tag.toLowerCase().includes(filterTag.toLowerCase())
  );

  const currentEvents = activeTab === 'local' ? filteredLocalEvents : filteredTravelEvents;

  if (loading) {
    return <LoadingSpinner fullScreen message="Scanning neural event matrix..." />;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6 gradient-mesh min-h-screen">
        {/* Header */}
        <div className="card-mobile border-accent/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-connection rounded-hive flex items-center justify-center shadow-glow-accent2">
                <span className="text-white text-lg">🌐</span>
              </div>
              <div>
                <h1 className="heading-lg-mobile text-text">Event Matrix</h1>
                <p className="text-xs text-subtle">Discover connections in your network</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent2 rounded-full pulse-hive"></div>
              <span className="text-xs text-subtle">{currentEvents.length} signals</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-4">
            <button
              onClick={() => setActiveTab('local')}
              className={`flex-1 py-2 px-3 rounded-hive text-sm font-medium transition-all duration-200 ${
                activeTab === 'local'
                  ? 'bg-accent text-white shadow-glow'
                  : 'text-subtle hover:text-text hover:bg-surface/50'
              }`}
            >
              📍 Local Matrix
            </button>
            <button
              onClick={() => setActiveTab('travel')}
              className={`flex-1 py-2 px-3 rounded-hive text-sm font-medium transition-all duration-200 ${
                activeTab === 'travel'
                  ? 'bg-accent text-white shadow-glow'
                  : 'text-subtle hover:text-text hover:bg-surface/50'
              }`}
            >
              ✈️ Travel Signals
            </button>
          </div>

          {/* Filter */}
          <input
            type="text"
            placeholder="Filter by niche tag..."
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="input-field text-sm"
          />
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
          {currentEvents.length === 0 ? (
            <div className="card-mobile text-center py-8">
              <div className="w-12 h-12 bg-accent2/20 rounded-hive flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="heading-md-mobile text-text mb-2">No Events Detected</h3>
              <p className="text-sm text-subtle">
                {activeTab === 'local' 
                  ? 'No events found in your local matrix.' 
                  : 'No events found for your travel destinations.'}
              </p>
            </div>
          ) : (
            currentEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

interface EventCardProps {
  event: EventSuggestion;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleExternalLink = () => {
    if (event.external_link) {
      window.open(event.external_link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="card-mobile border-accent2/20 hover:border-accent2/40 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-text text-sm">{event.title}</h3>
            <span className="text-xs bg-accent2/20 text-accent2 px-2 py-1 rounded-hive">
              {event.niche_tag}
            </span>
          </div>
          <p className="text-xs text-subtle line-clamp-3 mb-2">{event.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-subtle mb-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span>📅</span>
            <span>{formatDate(event.event_date)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>📍</span>
            <span>{event.city}</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        {event.external_link && (
          <button
            onClick={handleExternalLink}
            className="flex-1 bg-accent2/20 text-accent2 hover:bg-accent2/30 px-3 py-2 rounded-hive text-xs font-medium transition-colors duration-200"
          >
            View Event Site
          </button>
        )}
        <button className="flex-1 bg-accent/20 text-accent hover:bg-accent/30 px-3 py-2 rounded-hive text-xs font-medium transition-colors duration-200">
          Add to Calendar
        </button>
      </div>
    </div>
  );
};
