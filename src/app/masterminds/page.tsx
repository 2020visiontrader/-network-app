'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';

interface MastermindSession {
  id: string;
  host_id: string;
  title: string;
  topic: string;
  date_time: string;
  format: 'virtual' | 'in-person';
  location: string;
  description: string;
  max_capacity: number;
  attendees: string[];
  created_at: string;
  host_name?: string;
}

export default function MastermindsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<MastermindSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterTopic, setFilterTopic] = useState('');
  const supabase = createClientComponentClient();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    description: '',
    date_time: '',
    format: 'virtual' as 'virtual' | 'in-person',
    location: '',
    max_capacity: 8
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('mastermind_sessions')
        .select(`
          *,
          users:host_id (
            full_name,
            preferred_name
          )
        `)
        .gte('date_time', new Date().toISOString())
        .order('date_time', { ascending: true });

      if (error) throw error;

      const sessionsWithHostNames = data?.map(session => ({
        ...session,
        host_name: session.users?.preferred_name || session.users?.full_name || 'Unknown Host'
      })) || [];

      setSessions(sessionsWithHostNames);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load mastermind sessions');
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('mastermind_sessions')
        .insert([{
          ...formData,
          host_id: user.id,
          attendees: [user.id]
        }]);

      if (error) throw error;

      setFormData({
        title: '',
        topic: '',
        description: '',
        date_time: '',
        format: 'virtual',
        location: '',
        max_capacity: 8
      });
      setShowCreateForm(false);
      fetchSessions();
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = async (sessionId: string, currentAttendees: string[]) => {
    if (!user) return;

    try {
      const isAttending = currentAttendees.includes(user.id);
      const newAttendees = isAttending
        ? currentAttendees.filter(id => id !== user.id)
        : [...currentAttendees, user.id];

      const { error } = await supabase
        .from('mastermind_sessions')
        .update({ attendees: newAttendees })
        .eq('id', sessionId);

      if (error) throw error;
      fetchSessions();
    } catch (err) {
      console.error('Error updating attendance:', err);
      setError('Failed to update attendance');
    }
  };

  const filteredSessions = sessions.filter(session =>
    !filterTopic || session.topic.toLowerCase().includes(filterTopic.toLowerCase())
  );

  if (loading && sessions.length === 0) {
    return <LoadingSpinner fullScreen message="Loading neural collective sessions..." />;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6 gradient-mesh min-h-screen">
        {/* Header */}
        <div className="card-mobile border-accent/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-hive rounded-hive flex items-center justify-center shadow-glow">
                <span className="text-white text-lg">🧠</span>
              </div>
              <div>
                <h1 className="heading-lg-mobile text-text">Neural Collective</h1>
                <p className="text-xs text-subtle">Mastermind sessions for collective intelligence</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn-mobile-primary text-sm px-4 py-2"
            >
              Host Session
            </button>
          </div>

          {/* Topic Filter */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Filter by topic..."
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="input-field text-sm"
            />
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent2 rounded-full pulse-hive"></div>
              <span className="text-xs text-subtle">{filteredSessions.length} active</span>
            </div>
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

        {/* Create Session Form */}
        {showCreateForm && (
          <div className="card-mobile border-accent/30 animate-slide-down">
            <h2 className="heading-md-mobile text-text mb-4">Host Neural Session</h2>
            <form onSubmit={createSession} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  placeholder="Session title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="input-field"
                  required
                />
                <input
                  type="text"
                  placeholder="Topic/Theme"
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  className="input-field"
                  required
                />
                <textarea
                  placeholder="Session description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field h-20 resize-none"
                  required
                />
                <input
                  type="datetime-local"
                  value={formData.date_time}
                  onChange={(e) => setFormData({...formData, date_time: e.target.value})}
                  className="input-field"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({...formData, format: e.target.value as 'virtual' | 'in-person'})}
                    className="input-field"
                  >
                    <option value="virtual">Virtual</option>
                    <option value="in-person">In-Person</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Max capacity"
                    value={formData.max_capacity}
                    onChange={(e) => setFormData({...formData, max_capacity: parseInt(e.target.value)})}
                    className="input-field"
                    min="2"
                    max="20"
                  />
                </div>
                {formData.format === 'in-person' && (
                  <input
                    type="text"
                    placeholder="Location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="input-field"
                    required
                  />
                )}
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="btn-mobile-primary flex-1">
                  Create Session
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-mobile-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions.length === 0 ? (
            <div className="card-mobile text-center py-8">
              <div className="w-12 h-12 bg-accent/20 rounded-hive flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="heading-md-mobile text-text mb-2">No Active Sessions</h3>
              <p className="text-sm text-subtle">
                {filterTopic ? 'No sessions match your filter.' : 'Be the first to host a neural collective session.'}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                currentUserId={user?.id}
                onToggleAttendance={toggleAttendance}
              />
            ))
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

interface SessionCardProps {
  session: MastermindSession;
  currentUserId?: string;
  onToggleAttendance: (sessionId: string, currentAttendees: string[]) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, currentUserId, onToggleAttendance }) => {
  const isAttending = currentUserId ? session.attendees.includes(currentUserId) : false;
  const isHost = currentUserId === session.host_id;
  const isFull = session.attendees.length >= session.max_capacity;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const { date, time } = formatDate(session.date_time);

  return (
    <div className="card-mobile border-accent/20 hover:border-accent/40 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-text text-sm">{session.title}</h3>
            <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-hive">
              {session.topic}
            </span>
          </div>
          <p className="text-xs text-subtle mb-2">Hosted by {session.host_name}</p>
          <p className="text-xs text-subtle line-clamp-2">{session.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-subtle mb-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span>📅</span>
            <span>{date}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>⏰</span>
            <span>{time}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>{session.format === 'virtual' ? '💻' : '📍'}</span>
            <span>{session.format === 'virtual' ? 'Virtual' : session.location}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <span className="text-xs">👥</span>
            <span className="text-xs text-subtle">
              {session.attendees.length}/{session.max_capacity}
            </span>
          </div>
          {isFull && !isAttending && (
            <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded-hive">
              Full
            </span>
          )}
        </div>

        <div className="flex space-x-2">
          {isHost ? (
            <span className="text-xs bg-accent2/20 text-accent2 px-3 py-1 rounded-hive">
              Host
            </span>
          ) : (
            <button
              onClick={() => onToggleAttendance(session.id, session.attendees)}
              disabled={!isAttending && isFull}
              className={`text-xs px-3 py-1 rounded-hive font-medium transition-colors duration-200 ${
                isAttending
                  ? 'bg-error/20 text-error hover:bg-error/30'
                  : isFull
                  ? 'bg-border text-subtle cursor-not-allowed'
                  : 'bg-accent/20 text-accent hover:bg-accent/30'
              }`}
            >
              {isAttending ? 'Leave' : isFull ? 'Full' : 'Join'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
