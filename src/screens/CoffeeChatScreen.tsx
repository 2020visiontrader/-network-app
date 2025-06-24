import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export default function CoffeeChatScreen() {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [coffeeChats, setCoffeeChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [requestForm, setRequestForm] = useState({
    time: '',
    location_or_link: '',
    message: '',
  });
  const [hasActiveRequest, setHasActiveRequest] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchConnections(),
        fetchCoffeeChats(),
        checkActiveRequest(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchConnections = async () => {
    try {
      // Fetch connections using proper RLS
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`founder_a_id.eq.${user.id},founder_b_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (error) throw error;

      // Filter to get the other person in each connection
      const processedConnections = data.map(connection => {
        const isRequester = connection.founder_a_id === user.id;
        const otherFounderId = isRequester ? connection.founder_b_id : connection.founder_a_id;
        
        return {
          ...connection,
          other_founder: { id: otherFounderId },
        };
      });

      setConnections(processedConnections);
    } catch (error) {
      console.error('Error fetching connections:', error);
      Alert.alert('Error', 'Failed to load connections');
    }
  };

  const fetchCoffeeChats = async () => {
    try {
      const { data, error } = await supabase
        .from('coffee_chats')
        .select('*')
        .or(`requester_id.eq.${user.id},requested_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoffeeChats(data || []);
    } catch (error) {
      console.error('Error fetching coffee chats:', error);
      Alert.alert('Error', 'Failed to load coffee chats');
    }
  };

  const checkActiveRequest = async () => {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('coffee_chats')
        .select('id, status, created_at')
        .eq('requester_id', user.id)
        .in('status', ['pending', 'confirmed'])
        .gte('created_at', oneWeekAgo.toISOString());

      if (error) throw error;
      setHasActiveRequest((data?.length || 0) > 0);
    } catch (error) {
      console.error('Error checking active request:', error);
    }
  };

  const requestCoffeeChat = async () => {
    if (!selectedConnection || !requestForm.message.trim()) {
      Alert.alert('Missing Information', 'Please add a message with your request');
      return;
    }

    try {
      const { error } = await supabase
        .from('coffee_chats')
        .insert({
          requester_id: user.id,
          requested_id: selectedConnection.other_founder.id,
          requester_message: requestForm.message.trim(),
          proposed_time: requestForm.time,
          location_or_link: requestForm.location_or_link,
          status: 'pending',
        });

      if (error) throw error;

      setShowRequestModal(false);
      setSelectedConnection(null);
      setRequestForm({ time: '', location_or_link: '', message: '' });
      fetchData();
      Alert.alert('Request Sent!', 'Your coffee chat request has been sent.');
    } catch (error) {
      console.error('Error requesting coffee chat:', error);
      Alert.alert('Error', 'Failed to send coffee chat request');
    }
  };

  const updateChatStatus = async (chatId, status) => {
    try {
      const { error } = await supabase
        .from('coffee_chats')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', chatId);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error updating chat status:', error);
      Alert.alert('Error', 'Failed to update chat status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f9cb40';
      case 'confirmed': return '#a855f7';
      case 'completed': return '#4ade80';
      case 'cancelled': return '#ef4444';
      default: return '#888';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading coffee chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Coffee Chats</Text>
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
        {/* Weekly Limit Notice */}
        {hasActiveRequest && (
          <View style={styles.limitNotice}>
            <Ionicons name="information-circle" size={20} color="#f9cb40" />
            <Text style={styles.limitText}>
              You have an active coffee chat request this week. Wait for it to be resolved before making another.
            </Text>
          </View>
        )}

        {/* Available Connections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available for Coffee</Text>
          {connections.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No connections available right now. Connect with more founders to see who's free for coffee!
              </Text>
            </View>
          ) : (
            connections.map((connection) => (
              <View key={connection.id} style={styles.connectionCard}>
                <View style={styles.connectionInfo}>
                  <Text style={styles.connectionName}>
                    {connection.other_founder.full_name}
                  </Text>
                  <Text style={styles.connectionRole}>
                    {connection.other_founder.role}
                    {connection.other_founder.company_name && ` at ${connection.other_founder.company_name}`}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.requestButton,
                    hasActiveRequest && styles.requestButtonDisabled
                  ]}
                  onPress={() => {
                    if (!hasActiveRequest) {
                      setSelectedConnection(connection);
                      setShowRequestModal(true);
                    }
                  }}
                  disabled={hasActiveRequest}
                >
                  <Text style={styles.requestButtonText}>
                    {hasActiveRequest ? 'Limit Reached' : 'Request Coffee'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Chat History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chat History</Text>
          {coffeeChats.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No coffee chats yet. Start by requesting a chat with one of your connections!
              </Text>
            </View>
          ) : (
            coffeeChats.map((chat) => {
              const isCreator = chat.creator_id === user.id;
              const otherPerson = isCreator ? chat.target : chat.creator;
              
              return (
                <View key={chat.id} style={styles.chatCard}>
                  <View style={styles.chatHeader}>
                    <View style={styles.chatInfo}>
                      <Text style={styles.chatName}>
                        {otherPerson.full_name}
                      </Text>
                      <Text style={styles.chatDate}>
                        {formatDate(chat.created_at)}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(chat.status) }
                    ]}>
                      <Text style={styles.statusText}>
                        {chat.status.charAt(0).toUpperCase() + chat.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  
                  {chat.message && (
                    <Text style={styles.chatMessage}>"{chat.message}"</Text>
                  )}
                  
                  {chat.time && (
                    <Text style={styles.chatDetails}>
                      <Ionicons name="time-outline" size={14} color="#a1a1aa" />
                      {" "}{chat.time}
                    </Text>
                  )}
                  
                  {chat.location_or_link && (
                    <Text style={styles.chatDetails}>
                      <Ionicons name="location-outline" size={14} color="#a1a1aa" />
                      {" "}{chat.location_or_link}
                    </Text>
                  )}

                  {/* Action buttons for target user */}
                  {!isCreator && chat.status === 'pending' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => updateChatStatus(chat.id, 'confirmed')}
                      >
                        <Text style={styles.actionButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => updateChatStatus(chat.id, 'rejected')}
                      >
                        <Text style={styles.actionButtonText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Request Modal */}
      <Modal
        visible={showRequestModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Request Coffee Chat
            </Text>
            <TouchableOpacity
              onPress={() => setShowRequestModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedConnection && (
              <View style={styles.selectedConnectionInfo}>
                <Text style={styles.selectedConnectionName}>
                  {selectedConnection.other_founder.full_name}
                </Text>
                <Text style={styles.selectedConnectionRole}>
                  {selectedConnection.other_founder.role}
                </Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Proposed Time</Text>
              <TextInput
                style={styles.input}
                value={requestForm.time}
                onChangeText={(text) => setRequestForm({...requestForm, time: text})}
                placeholder="e.g., Next Tuesday at 2pm, This Friday morning"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Location or Link</Text>
              <TextInput
                style={styles.input}
                value={requestForm.location_or_link}
                onChangeText={(text) => setRequestForm({...requestForm, location_or_link: text})}
                placeholder="e.g., Starbucks on Main St, Zoom link, etc."
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Message *</Text>
              <TextInput
                style={[styles.input, styles.messageInput]}
                value={requestForm.message}
                onChangeText={(text) => setRequestForm({...requestForm, message: text})}
                placeholder="Tell them why you'd like to connect..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={styles.sendButton}
              onPress={requestCoffeeChat}
            >
              <Text style={styles.sendButtonText}>Send Request</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
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
  scrollView: {
    flex: 1,
  },
  limitNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#422006',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f9cb40',
  },
  limitText: {
    flex: 1,
    marginLeft: 12,
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#71717a',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  connectionCard: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connectionInfo: {
    flex: 1,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  connectionRole: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  requestButton: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  requestButtonDisabled: {
    backgroundColor: '#52525b',
  },
  requestButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  chatCard: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  chatDate: {
    fontSize: 12,
    color: '#71717a',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  chatMessage: {
    fontSize: 14,
    color: '#d4d4d8',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 18,
  },
  chatDetails: {
    fontSize: 12,
    color: '#a1a1aa',
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#22c55e',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
  selectedConnectionInfo: {
    backgroundColor: '#18181b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  selectedConnectionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  selectedConnectionRole: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  formGroup: {
    marginBottom: 24,
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
  messageInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#a855f7',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
