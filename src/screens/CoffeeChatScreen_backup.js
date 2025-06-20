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
        .select(`
          *,
          founder_profile:founders!connections_founder_b_fkey(id, full_name, company_name, avatar_url, role),
          requester_profile:founders!connections_founder_a_fkey(id, full_name, company_name, avatar_url, role)
        `)
        .or(`founder_a.eq.${user.id},founder_b.eq.${user.id}`)
        .eq('status', 'accepted');

      if (error) throw error;

      // Filter to get the other person in each connection
      const processedConnections = data.map(connection => {
        const isRequester = connection.founder_a === user.id;
        const otherProfile = isRequester ? connection.founder_profile : connection.requester_profile;
        
        return {
          ...connection,
          other_founder: otherProfile,
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
        .select(`
          *,
          creator:founders!coffee_chats_creator_id_fkey(id, full_name, avatar_url, company_name),
          target:founders!coffee_chats_target_user_id_fkey(id, full_name, avatar_url, company_name)
        `)
        .or(`creator_id.eq.${user.id},target_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoffeeChats(data || []);
    } catch (error) {
      console.error('Error fetching coffee chats:', error);
      Alert.alert('Error', 'Failed to load coffee chats');
    }
  };
            preferred_name,
            avatar_url
          ),
          requested:founders!coffee_chats_requested_id_fkey (
            id,
            full_name,
            preferred_name,
            avatar_url
          )
        `)
        .or(`requester_id.eq.${user.id},requested_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoffeeChats(data || []);
    } catch (error) {
      console.error('Error fetching coffee chats:', error);
    }
  };

  const checkActiveRequest = async () => {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('coffee_chats')
        .select('id, status, created_at')
        .eq('creator_id', user.id)
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
          creator_id: user.id,
          target_user_id: selectedConnection.other_founder.id,
          message: requestForm.message.trim(),
          time: requestForm.time,
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
      case 'confirmed': return '#7d58ff';
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
            tintColor="#7d58ff"
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
              const isRequester = chat.requester_id === user.id;
              const otherPerson = isRequester ? chat.requested : chat.requester;
              
              return (
                <View key={chat.id} style={styles.chatCard}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.chatName}>
                      {otherPerson.preferred_name || otherPerson.full_name}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(chat.status) }]}>
                      <Text style={styles.statusText}>{chat.status}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.chatDirection}>
                    {isRequester ? 'You requested' : 'Requested by them'}
                  </Text>
                  
                  {chat.message && (
                    <Text style={styles.chatMessage}>"{chat.message}"</Text>
                  )}
                  
                  <Text style={styles.chatDate}>
                    {formatDate(chat.created_at)}
                  </Text>

                  {/* Action buttons for received requests */}
                  {!isRequester && chat.status === 'pending' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => updateChatStatus(chat.id, 'confirmed')}
                      >
                        <Text style={styles.actionButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.declineButton]}
                        onPress={() => updateChatStatus(chat.id, 'cancelled')}
                      >
                        <Text style={styles.actionButtonText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Mark as completed button */}
                  {chat.status === 'confirmed' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.completeButton]}
                      onPress={() => updateChatStatus(chat.id, 'completed')}
                    >
                      <Text style={styles.actionButtonText}>Mark as Completed</Text>
                    </TouchableOpacity>
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
            <TouchableOpacity onPress={() => setShowRequestModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Request Coffee Chat</Text>
            <TouchableOpacity onPress={requestCoffeeChat}>
              <Text style={styles.modalSend}>Send</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {selectedConnection && (
              <Text style={styles.requestingWith}>
                Requesting coffee with {selectedConnection.connected_user.preferred_name || selectedConnection.connected_user.full_name}
              </Text>
            )}
            
            <TextInput
              style={styles.messageInput}
              value={requestMessage}
              onChangeText={setRequestMessage}
              placeholder="Hi! I'd love to grab coffee and chat about..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            
            <Text style={styles.messageHint}>
              Add a personal message to increase your chances of acceptance!
            </Text>
          </View>
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  limitNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  limitText: {
    color: '#f9cb40',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
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
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  connectionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  connectionInfo: {
    flex: 1,
    marginRight: 16,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  connectionRole: {
    fontSize: 14,
    color: '#888',
  },
  requestButton: {
    backgroundColor: '#7d58ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  requestButtonDisabled: {
    backgroundColor: '#444',
  },
  requestButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  chatCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
  },
  chatDirection: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  chatMessage: {
    fontSize: 14,
    color: '#cccccc',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  chatDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#7d58ff',
  },
  declineButton: {
    backgroundColor: '#ef4444',
  },
  completeButton: {
    backgroundColor: '#4ade80',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
  modalSend: {
    color: '#7d58ff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  requestingWith: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  messageInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#444',
    minHeight: 120,
    marginBottom: 16,
  },
  messageHint: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});
