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

export default function MastermindScreen() {
  const { user } = useAuth();
  const [masterminds, setMasterminds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMastermind, setNewMastermind] = useState({
    topic: '',
    description: '',
    time: '',
    location: '',
    max_members: '',
  });

  useEffect(() => {
    fetchMasterminds();
  }, []);

  const fetchMasterminds = async () => {
    try {
      const { data: mastermindsData, error: mastermindsError } = await supabase
        .from('masterminds')
        .select(`
          *,
          mastermind_members (
            id,
            user_id,
            founders!inner (
              id,
              full_name,
              preferred_name
            )
          ),
          founders!masterminds_host_id_fkey (
            id,
            full_name,
            preferred_name
          )
        `)
        .gte('time', new Date().toISOString())
        .order('time', { ascending: true });

      if (mastermindsError) throw mastermindsError;

      // Get connections to filter member names and host visibility
      const { data: connections } = await supabase
        .from('connections')
        .select('connected_user_id')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      const connectedUserIds = connections?.map(c => c.connected_user_id) || [];
      connectedUserIds.push(user.id); // Include self

      // Process masterminds with filtered data
      const processedMasterminds = mastermindsData?.map(mastermind => ({
        ...mastermind,
        member_count: mastermind.mastermind_members?.length || 0,
        visible_members: mastermind.mastermind_members?.filter(member => 
          connectedUserIds.includes(member.user_id)
        ) || [],
        user_joined: mastermind.mastermind_members?.find(member => member.user_id === user.id),
        is_host: mastermind.host_id === user.id,
        host_visible: connectedUserIds.includes(mastermind.host_id),
        host_name: connectedUserIds.includes(mastermind.host_id) 
          ? (mastermind.founders?.preferred_name || mastermind.founders?.full_name)
          : 'Anonymous Host',
      })) || [];

      setMasterminds(processedMasterminds);
    } catch (error) {
      console.error('Error fetching masterminds:', error);
      Alert.alert('Error', 'Failed to load masterminds');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const createMastermind = async () => {
    if (!newMastermind.topic || !newMastermind.time) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    try {
      const { error } = await supabase
        .from('masterminds')
        .insert({
          host_id: user.id,
          topic: newMastermind.topic,
          description: newMastermind.description,
          time: newMastermind.time,
          location: newMastermind.location,
          max_members: newMastermind.max_members ? parseInt(newMastermind.max_members) : null,
          anonymous: true,
        });

      if (error) throw error;

      setShowCreateModal(false);
      setNewMastermind({
        topic: '',
        description: '',
        time: '',
        location: '',
        max_members: '',
      });
      fetchMasterminds();
      Alert.alert('Success!', 'Your mastermind has been created.');
    } catch (error) {
      console.error('Error creating mastermind:', error);
      Alert.alert('Error', 'Failed to create mastermind');
    }
  };

  const joinMastermind = async (mastermindId) => {
    try {
      const mastermind = masterminds.find(m => m.id === mastermindId);
      
      if (mastermind.user_joined) {
        // Leave mastermind
        const { error } = await supabase
          .from('mastermind_members')
          .delete()
          .eq('mastermind_id', mastermindId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Join mastermind
        if (mastermind.max_members && mastermind.member_count >= mastermind.max_members) {
          Alert.alert('Mastermind Full', 'This mastermind has reached its capacity.');
          return;
        }

        const { error } = await supabase
          .from('mastermind_members')
          .insert({
            mastermind_id: mastermindId,
            user_id: user.id,
          });

        if (error) throw error;
      }

      fetchMasterminds();
    } catch (error) {
      console.error('Error joining mastermind:', error);
      Alert.alert('Error', 'Failed to update membership');
    }
  };

  const formatDateTime = (dateString) => {
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
    fetchMasterminds();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading masterminds...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Masterminds</Text>
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
        {masterminds.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#444" />
            <Text style={styles.emptyTitle}>No Masterminds Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start a mastermind group to connect with like-minded founders
            </Text>
          </View>
        ) : (
          masterminds.map((mastermind) => (
            <View key={mastermind.id} style={styles.mastermindCard}>
              <View style={styles.mastermindHeader}>
                <Text style={styles.mastermindTopic}>{mastermind.topic}</Text>
                {mastermind.is_host && (
                  <View style={styles.hostBadge}>
                    <Text style={styles.hostBadgeText}>Hosting</Text>
                  </View>
                )}
              </View>

              <Text style={styles.hostInfo}>
                Hosted by {mastermind.host_name}
                {!mastermind.host_visible && (
                  <Text style={styles.anonymousNote}> (Connect to see who)</Text>
                )}
              </Text>

              <Text style={styles.mastermindTime}>
                <Ionicons name="time-outline" size={16} color="#7d58ff" />
                {' '}
                {formatDateTime(mastermind.time)}
              </Text>

              {mastermind.location && (
                <Text style={styles.mastermindLocation}>
                  <Ionicons name="location-outline" size={16} color="#7d58ff" />
                  {' '}
                  {mastermind.location}
                </Text>
              )}

              {mastermind.description && (
                <Text style={styles.mastermindDescription}>{mastermind.description}</Text>
              )}

              <View style={styles.mastermindFooter}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberCount}>
                    {mastermind.member_count} members
                    {mastermind.max_members && ` / ${mastermind.max_members}`}
                  </Text>
                  
                  {mastermind.visible_members.length > 0 && (
                    <Text style={styles.visibleMembers}>
                      You know: {mastermind.visible_members
                        .map(member => member.founders.preferred_name || member.founders.full_name)
                        .join(', ')
                      }
                    </Text>
                  )}
                </View>

                {!mastermind.is_host && (
                  <TouchableOpacity
                    style={[
                      styles.joinButton,
                      mastermind.user_joined && styles.joinButtonActive,
                    ]}
                    onPress={() => joinMastermind(mastermind.id)}
                  >
                    <Text style={[
                      styles.joinButtonText,
                      mastermind.user_joined && styles.joinButtonTextActive,
                    ]}>
                      {mastermind.user_joined ? 'Joined' : 'Join'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Mastermind Modal */}
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
            <Text style={styles.modalTitle}>Host Mastermind</Text>
            <TouchableOpacity onPress={createMastermind}>
              <Text style={styles.modalCreate}>Create</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Topic *</Text>
              <TextInput
                style={styles.input}
                value={newMastermind.topic}
                onChangeText={(text) => setNewMastermind({...newMastermind, topic: text})}
                placeholder="What will you discuss?"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newMastermind.description}
                onChangeText={(text) => setNewMastermind({...newMastermind, description: text})}
                placeholder="Provide more details about the mastermind..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date & Time *</Text>
              <TextInput
                style={styles.input}
                value={newMastermind.time}
                onChangeText={(text) => setNewMastermind({...newMastermind, time: text})}
                placeholder="YYYY-MM-DDTHH:MM:SS"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={newMastermind.location}
                onChangeText={(text) => setNewMastermind({...newMastermind, location: text})}
                placeholder="Where will you meet?"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Max Members (Optional)</Text>
              <TextInput
                style={styles.input}
                value={newMastermind.max_members}
                onChangeText={(text) => setNewMastermind({...newMastermind, max_members: text})}
                placeholder="Maximum number of members"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.anonymousNotice}>
              <Ionicons name="eye-off-outline" size={20} color="#f9cb40" />
              <Text style={styles.anonymousText}>
                You'll be listed as "Anonymous Host" unless people are in your network. Connected founders can join directly.
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
  mastermindCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  mastermindHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  mastermindTopic: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    marginRight: 12,
  },
  hostBadge: {
    backgroundColor: '#f9cb40',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hostBadgeText: {
    color: '#100c1c',
    fontSize: 12,
    fontWeight: '600',
  },
  hostInfo: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  anonymousNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  mastermindTime: {
    fontSize: 16,
    color: '#7d58ff',
    marginBottom: 8,
  },
  mastermindLocation: {
    fontSize: 16,
    color: '#7d58ff',
    marginBottom: 12,
  },
  mastermindDescription: {
    fontSize: 16,
    color: '#cccccc',
    lineHeight: 24,
    marginBottom: 16,
  },
  mastermindFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  memberInfo: {
    flex: 1,
    marginRight: 16,
  },
  memberCount: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  visibleMembers: {
    fontSize: 12,
    color: '#f9cb40',
    marginTop: 4,
  },
  joinButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#f9cb40',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  joinButtonActive: {
    backgroundColor: '#f9cb40',
  },
  joinButtonText: {
    color: '#f9cb40',
    fontSize: 14,
    fontWeight: 'bold',
  },
  joinButtonTextActive: {
    color: '#100c1c',
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
