import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export default function EventsScreen() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    max_attendees: '',
  });
  const [connectedUserIds, setConnectedUserIds] = useState(new Set());

  useEffect(() => {
    fetchEvents();
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('founder_a, founder_b')
        .or(`founder_a.eq.${user.id},founder_b.eq.${user.id}`)
        .eq('status', 'accepted');

      if (error) throw error;

      const connectedIds = new Set();
      data?.forEach(conn => {
        if (conn.founder_a === user.id) {
          connectedIds.add(conn.founder_b);
        } else {
          connectedIds.add(conn.founder_a);
        }
      });
      connectedIds.add(user.id); // Include self
      setConnectedUserIds(connectedIds);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      // Fetch all public events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          host:founders(id, full_name, company_name)
        `)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true });

      if (eventsError) throw eventsError;

      // Fetch event attendees
      const { data: attendeesData, error: attendeesError } = await supabase
        .from('event_attendees')
        .select(`
          event_id,
          user_id,
          founder:founders(id, full_name, company_name)
        `);

      if (attendeesError) throw attendeesError;

      // Group attendees by event
      const attendeesByEvent = {};
      attendeesData?.forEach(attendee => {
        if (!attendeesByEvent[attendee.event_id]) {
          attendeesByEvent[attendee.event_id] = [];
        }
        attendeesByEvent[attendee.event_id].push(attendee);
      });

      // Process events with attendee data
      const processedEvents = eventsData?.map(event => {
        const eventAttendees = attendeesByEvent[event.id] || [];
        const userRSVP = eventAttendees.find(a => a.user_id === user.id);
        
        // Filter visible attendees (only show names of connected users)
        const visibleAttendees = eventAttendees.filter(attendee => 
          connectedUserIds.has(attendee.user_id)
        );
        
        return {
          ...event,
          attendees: eventAttendees,
          visible_attendees: visibleAttendees,
          attendee_count: eventAttendees.length,
          user_rsvp: !!userRSVP,
          is_host: event.host_id === user.id,
          host_name: connectedUserIds.has(event.host_id) ? event.host?.full_name : 'Anonymous Host'
        };
      }) || [];

      setEvents(processedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const createEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      Alert.alert('Missing Information', 'Please fill in title, date, and time.');
      return;
    }

    try {
      const eventDateTime = `${newEvent.date}T${newEvent.time}:00Z`;
      
      const { error } = await supabase
        .from('events')
        .insert({
          title: newEvent.title.trim(),
          description: newEvent.description.trim(),
          location: newEvent.location.trim(),
          event_date: eventDateTime,
          max_attendees: newEvent.max_attendees ? parseInt(newEvent.max_attendees) : null,
          host_id: user.id,
        });

      if (error) throw error;

      setShowCreateModal(false);
      setNewEvent({
        title: '',
        description: '',
        location: '',
        date: '',
        time: '',
        max_attendees: '',
      });
      fetchEvents();
      Alert.alert('Success!', 'Your event has been created and is now visible to all users.');
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event');
    }
  };

  const toggleRSVP = async (eventId, currentRSVPStatus) => {
    try {
      if (currentRSVPStatus) {
        // Remove RSVP
        const { error } = await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Add RSVP
        const { error } = await supabase
          .from('event_attendees')
          .insert({
            event_id: eventId,
            user_id: user.id,
          });

        if (error) throw error;
      }

      fetchEvents();
    } catch (error) {
      console.error('Error toggling RSVP:', error);
      Alert.alert('Error', 'Failed to update RSVP');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#a855f7"
          />
        }
      >
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#52525b" />
            <Text style={styles.emptyTitle}>No Upcoming Events</Text>
            <Text style={styles.emptyText}>
              Be the first to create an event for the community!
            </Text>
          </View>
        ) : (
          events.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View style={styles.eventTitleContainer}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventHost}>
                    Hosted by {event.host_name}
                  </Text>
                </View>
                {event.is_host && (
                  <View style={styles.hostBadge}>
                    <Text style={styles.hostBadgeText}>Host</Text>
                  </View>
                )}
              </View>

              <View style={styles.eventDetails}>
                <View style={styles.eventDetail}>
                  <Ionicons name="time-outline" size={16} color="#a1a1aa" />
                  <Text style={styles.eventDetailText}>
                    {formatDate(event.event_date)}
                  </Text>
                </View>

                {event.location && (
                  <View style={styles.eventDetail}>
                    <Ionicons name="location-outline" size={16} color="#a1a1aa" />
                    <Text style={styles.eventDetailText}>{event.location}</Text>
                  </View>
                )}

                <View style={styles.eventDetail}>
                  <Ionicons name="people-outline" size={16} color="#a1a1aa" />
                  <Text style={styles.eventDetailText}>
                    {event.attendee_count} attending
                    {event.max_attendees && ` • Max ${event.max_attendees}`}
                  </Text>
                </View>
              </View>

              {event.description && (
                <Text style={styles.eventDescription}>{event.description}</Text>
              )}

              {/* Visible Attendees */}
              {event.visible_attendees.length > 0 && (
                <View style={styles.attendeesSection}>
                  <Text style={styles.attendeesTitle}>
                    Attendees you know ({event.visible_attendees.length}):
                  </Text>
                  <View style={styles.attendeesList}>
                    {event.visible_attendees.map((attendee, index) => (
                      <Text key={attendee.user_id} style={styles.attendeeName}>
                        {attendee.founder.full_name}
                        {index < event.visible_attendees.length - 1 && ', '}
                      </Text>
                    ))}
                  </View>
                </View>
              )}

              {/* RSVP Button */}
              <TouchableOpacity
                style={[
                  styles.rsvpButton,
                  event.user_rsvp && styles.rsvpButtonActive
                ]}
                onPress={() => toggleRSVP(event.id, event.user_rsvp)}
              >
                <Ionicons
                  name={event.user_rsvp ? "checkmark-circle" : "add-circle-outline"}
                  size={20}
                  color={event.user_rsvp ? "#ffffff" : "#a855f7"}
                />
                <Text style={[
                  styles.rsvpButtonText,
                  event.user_rsvp && styles.rsvpButtonTextActive
                ]}>
                  {event.user_rsvp ? 'You\'re Going!' : 'RSVP'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Event Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Event</Text>
            <TouchableOpacity
              onPress={() => setShowCreateModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Event Title *</Text>
              <TextInput
                style={styles.input}
                value={newEvent.title}
                onChangeText={(text) => setNewEvent({...newEvent, title: text})}
                placeholder="Enter event title"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newEvent.description}
                onChangeText={(text) => setNewEvent({...newEvent, description: text})}
                placeholder="What's this event about?"
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={newEvent.location}
                onChangeText={(text) => setNewEvent({...newEvent, location: text})}
                placeholder="Where is this happening?"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Date *</Text>
                <TextInput
                  style={styles.input}
                  value={newEvent.date}
                  onChangeText={(text) => setNewEvent({...newEvent, date: text})}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Time *</Text>
                <TextInput
                  style={styles.input}
                  value={newEvent.time}
                  onChangeText={(text) => setNewEvent({...newEvent, time: text})}
                  placeholder="HH:MM"
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Max Attendees (Optional)</Text>
              <TextInput
                style={styles.input}
                value={newEvent.max_attendees}
                onChangeText={(text) => setNewEvent({...newEvent, max_attendees: text})}
                placeholder="Leave blank for unlimited"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color="#a855f7" />
                <Text style={styles.infoText}>
                  Events are public to all NETWORK users. Only the names of attendees you're connected with will be visible to you.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.createEventButton}
              onPress={createEvent}
            >
              <Text style={styles.createEventButtonText}>Create Event</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09090b',
  },
  loadingText: {
    color: '#a1a1aa',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  createButton: {
    backgroundColor: '#a855f7',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 24,
  },
  eventCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  eventTitleContainer: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  eventHost: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  hostBadge: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 12,
  },
  hostBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  eventDetails: {
    marginBottom: 16,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#d4d4d8',
    marginLeft: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#d4d4d8',
    lineHeight: 20,
    marginBottom: 16,
  },
  attendeesSection: {
    marginBottom: 16,
  },
  attendeesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  attendeesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  attendeeName: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  rsvpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#a855f7',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  rsvpButtonActive: {
    backgroundColor: '#a855f7',
  },
  rsvpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a855f7',
    marginLeft: 8,
  },
  rsvpButtonTextActive: {
    color: '#ffffff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#27272a',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#18181b',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#a1a1aa',
    marginLeft: 12,
    lineHeight: 20,
  },
  createEventButton: {
    backgroundColor: '#a855f7',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  createEventButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
