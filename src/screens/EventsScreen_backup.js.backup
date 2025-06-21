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
    capacity: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          event_rsvps (
            id,
            user_id,
            founders!inner (
              id,
              full_name,
              preferred_name
            )
          )
        `)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (eventsError) throw eventsError;

      // Get connections to filter RSVP names
      const { data: connections } = await supabase
        .from('connections')
        .select('connected_user_id')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      const connectedUserIds = connections?.map(c => c.connected_user_id) || [];
      connectedUserIds.push(user.id); // Include self

      // Process events with filtered RSVP data
      const processedEvents = eventsData?.map(event => ({
        ...event,
        rsvp_count: event.event_rsvps?.length || 0,
        visible_attendees: event.event_rsvps?.filter(rsvp => 
          connectedUserIds.includes(rsvp.user_id)
        ) || [],
        user_rsvp: event.event_rsvps?.find(rsvp => rsvp.user_id === user.id),
        is_host: event.host_id === user.id,
      })) || [];

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
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    try {
      const eventDateTime = `${newEvent.date}T${newEvent.time}:00`;
      
      const { error } = await supabase
        .from('events')
        .insert({
          host_id: user.id,
          title: newEvent.title,
          description: newEvent.description,
          location: newEvent.location,
          date: eventDateTime,
          capacity: newEvent.capacity ? parseInt(newEvent.capacity) : null,
          anonymous_post: true,
        });

      if (error) throw error;

      setShowCreateModal(false);
      setNewEvent({
        title: '',
        description: '',
        location: '',
        date: '',
        time: '',
        capacity: '',
      });
      fetchEvents();
      Alert.alert('Success!', 'Your event has been created.');
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event');
    }
  };

  const toggleRSVP = async (eventId) => {
    try {
      const event = events.find(e => e.id === eventId);
      
      if (event.user_rsvp) {
        // Remove RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Add RSVP
        if (event.capacity && event.rsvp_count >= event.capacity) {
          Alert.alert('Event Full', 'This event has reached its capacity.');
          return;
        }

        const { error } = await supabase
          .from('event_rsvps')
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
      weekday: 'short',
      month: 'short',
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
            tintColor="#7d58ff"
          />
        }
      >
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#444" />
            <Text style={styles.emptyTitle}>No Events Yet</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to create an event for the community
            </Text>
          </View>
        ) : (
          events.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                {event.is_host && (
                  <View style={styles.hostBadge}>
                    <Text style={styles.hostBadgeText}>Your Event</Text>
                  </View>
                )}
              </View>

              <Text style={styles.eventDate}>
                <Ionicons name="time-outline" size={16} color="#7d58ff" />
                {' '}
                {formatDate(event.date)}
              </Text>

              {event.location && (
                <Text style={styles.eventLocation}>
                  <Ionicons name="location-outline" size={16} color="#7d58ff" />
                  {' '}
                  {event.location}
                </Text>
              )}

              {event.description && (
                <Text style={styles.eventDescription}>{event.description}</Text>
              )}

              <View style={styles.eventFooter}>
                <View style={styles.attendeeInfo}>
                  <Text style={styles.attendeeCount}>
                    {event.rsvp_count} attending
                    {event.capacity && ` / ${event.capacity}`}
                  </Text>
                  
                  {event.visible_attendees.length > 0 && (
                    <Text style={styles.visibleAttendees}>
                      You know: {event.visible_attendees
                        .map(rsvp => rsvp.founders.preferred_name || rsvp.founders.full_name)
                        .join(', ')
                      }
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.rsvpButton,
                    event.user_rsvp && styles.rsvpButtonActive,
                  ]}
                  onPress={() => toggleRSVP(event.id)}
                >
                  <Text style={[
                    styles.rsvpButtonText,
                    event.user_rsvp && styles.rsvpButtonTextActive,
                  ]}>
                    {event.user_rsvp ? 'Going' : 'RSVP'}
                  </Text>
                </TouchableOpacity>
              </View>
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
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Event</Text>
            <TouchableOpacity onPress={createEvent}>
              <Text style={styles.modalCreate}>Create</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Event Title *</Text>
              <TextInput
                style={styles.input}
                value={newEvent.title}
                onChangeText={(text) => setNewEvent({...newEvent, title: text})}
                placeholder="What's happening?"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newEvent.description}
                onChangeText={(text) => setNewEvent({...newEvent, description: text})}
                placeholder="Tell people what to expect..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date *</Text>
              <TextInput
                style={styles.input}
                value={newEvent.date}
                onChangeText={(text) => setNewEvent({...newEvent, date: text})}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time *</Text>
              <TextInput
                style={styles.input}
                value={newEvent.time}
                onChangeText={(text) => setNewEvent({...newEvent, time: text})}
                placeholder="HH:MM (24-hour format)"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={newEvent.location}
                onChangeText={(text) => setNewEvent({...newEvent, location: text})}
                placeholder="Where is this happening?"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Capacity (Optional)</Text>
              <TextInput
                style={styles.input}
                value={newEvent.capacity}
                onChangeText={(text) => setNewEvent({...newEvent, capacity: text})}
                placeholder="Maximum number of attendees"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.anonymousNotice}>
              <Ionicons name="eye-off-outline" size={20} color="#f9cb40" />
              <Text style={styles.anonymousText}>
                Your event will be posted anonymously. Only people in your network can see that you're the host.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#100c1c',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#100c1c',
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  createButton: {
    backgroundColor: '#7d58ff',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    marginRight: 12,
  },
  hostBadge: {
    backgroundColor: '#7d58ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hostBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  eventDate: {
    fontSize: 16,
    color: '#7d58ff',
    marginBottom: 8,
  },
  eventLocation: {
    fontSize: 16,
    color: '#7d58ff',
    marginBottom: 12,
  },
  eventDescription: {
    fontSize: 16,
    color: '#cccccc',
    lineHeight: 24,
    marginBottom: 16,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  attendeeInfo: {
    flex: 1,
    marginRight: 16,
  },
  attendeeCount: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  visibleAttendees: {
    fontSize: 12,
    color: '#f9cb40',
    marginTop: 4,
  },
  rsvpButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#7d58ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  rsvpButtonActive: {
    backgroundColor: '#7d58ff',
  },
  rsvpButtonText: {
    color: '#7d58ff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rsvpButtonTextActive: {
    color: '#ffffff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#100c1c',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  modalCancel: {
    color: '#888',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalCreate: {
    color: '#7d58ff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#444',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  anonymousNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  anonymousText: {
    color: '#f9cb40',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});
