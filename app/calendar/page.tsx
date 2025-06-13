'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase-browser';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';

interface CalendarEvent {
  id: string;
  type: 'birthday' | 'travel' | 'coffee' | 'mastermind';
  title: string;
  date: string;
  time?: string;
  icon: string;
  details?: any;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchCalendarEvents();
  }, [user, currentDate]);

  const fetchCalendarEvents = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];

      const allEvents: CalendarEvent[] = [];

      // Fetch birthdays from founder connections
      const { data: connections } = await supabase
        .from('connections')
        .select(`
          *,
          founder_a:founders!founder_a_id(id, full_name, email),
          founder_b:founders!founder_b_id(id, full_name, email)
        `)
        .or(`founder_a_id.eq.${user.id as string},founder_b_id.eq.${user.id as string}`);

      if (connections) {
        connections.forEach((connection: any) => {
          // Get the other founder (not the current user)
          const otherFounder = connection.founder_a.id === user.id ? connection.founder_b : connection.founder_a;
          if (otherFounder && otherFounder.email) {
            allEvents.push({
              id: `birthday-${otherFounder.id}`,
              type: 'birthday',
              title: `${otherFounder.full_name}'s Birthday`,
              date: new Date(currentDate.getFullYear(), 5, 15).toISOString().split('T')[0], // Mock birthday date
              icon: '🎂',
              details: otherFounder
            });
          }
        });
      }

      // Skip travel check-ins for now since table structure is unclear
      // const { data: travels } = await supabase
      //   .from('location_shares')
      //   .select('*')
      //   .eq('founder_id', user.id)
      //   .gte('updated_at', startDate)
      //   .lte('updated_at', endDate);

      // if (travels) {
      //   travels.forEach((travel: any) => {
      //     allEvents.push({
      //       id: `travel-${travel.id}`,
      //       type: 'travel',
      //       title: `Currently in ${travel.city}`,
      //       date: travel.updated_at.split('T')[0],
      //       icon: '✈️',
      //       details: travel
      //     });
      //   });
      // }

      // Fetch coffee chats
      const { data: coffeeChats } = await supabase
        .from('coffee_chats')
        .select('*')
        .or(`requester_id.eq.${user.id as string},requested_id.eq.${user.id as string}`)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (coffeeChats) {
        coffeeChats.forEach((coffee: any) => {
          allEvents.push({
            id: `coffee-${coffee.id}`,
            type: 'coffee',
            title: 'Coffee Chat',
            date: coffee.confirmed_time ? coffee.confirmed_time.split('T')[0] : coffee.created_at.split('T')[0],
            time: coffee.confirmed_time ? new Date(coffee.confirmed_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
            icon: '☕',
            details: coffee
          });
        });
      }

      // Fetch events
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .gte('start_time', startDate)
        .lte('start_time', endDate);

      if (events) {
        events.forEach((event: any) => {
          allEvents.push({
            id: `event-${event.id}`,
            type: 'mastermind',
            title: event.title,
            date: event.start_time.split('T')[0],
            time: new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            icon: '🎯',
            details: event
          });
        });
      }

      setEvents(allEvents);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDate = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const handleDateClick = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    const dayEvents = getEventsForDate(day);
    
    setSelectedDate(dateStr);
    setSelectedEvents(dayEvents);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return <LoadingSpinner fullScreen message="Synchronizing temporal matrix..." />;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6 gradient-mesh min-h-screen">
        {/* Header */}
        <div className="card-mobile border-accent/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-hive rounded-hive flex items-center justify-center shadow-glow">
                <span className="text-white text-lg">📅</span>
              </div>
              <div>
                <h1 className="heading-lg-mobile text-text">Temporal Matrix</h1>
                <p className="text-xs text-subtle">Unified event synchronization</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent2 rounded-full pulse-hive"></div>
              <span className="text-xs text-subtle">{events.length} events</span>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-hive hover:bg-surface/50 transition-colors duration-200"
            >
              <svg className="w-4 h-4 text-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h2 className="heading-md-mobile text-text">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-hive hover:bg-surface/50 transition-colors duration-200"
            >
              <svg className="w-4 h-4 text-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
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

        {/* Calendar Grid */}
        <div className="card-mobile">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-subtle py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((day, index) => {
              if (day === null) {
                return <div key={index} className="h-12"></div>;
              }

              const dayEvents = getEventsForDate(day);
              const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`h-12 p-1 rounded-hive text-xs transition-all duration-200 ${
                    isToday
                      ? 'bg-accent/20 text-accent border border-accent/30'
                      : 'hover:bg-surface/50 text-text'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-medium">{day}</div>
                    <div className="flex justify-center space-x-1 mt-1">
                      {dayEvents.slice(0, 3).map((event, i) => (
                        <span key={i} className="text-xs">
                          {event.icon}
                        </span>
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-xs text-accent">+</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Events */}
        {selectedDate && selectedEvents.length > 0 && (
          <div className="card-mobile border-accent/30 animate-slide-down">
            <h3 className="heading-md-mobile text-text mb-4">
              Events for {new Date(selectedDate).toLocaleDateString()}
            </h3>
            <div className="space-y-3">
              {selectedEvents.map(event => (
                <div key={event.id} className="flex items-center space-x-3 p-2 rounded-hive bg-surface/50">
                  <span className="text-lg">{event.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-text text-sm">{event.title}</div>
                    {event.time && (
                      <div className="text-xs text-subtle">{event.time}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
