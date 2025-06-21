import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const ConnectionsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('connections'); // connections, requests, sent
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'connections') {
        await loadConnections();
      } else if (activeTab === 'requests') {
        await loadRequests();
      } else if (activeTab === 'sent') {
        await loadSentRequests();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadConnections = async () => {
    const { data, error } = await supabase
      .from('connections')
      .select(`
        id,
        created_at,
        user_id,
        connected_user_id,
        user:founders!connections_user_id_fkey(
          id, full_name, preferred_name, company_name, role, location, avatar_url
        ),
        connected_user:founders!connections_connected_user_id_fkey(
          id, full_name, preferred_name, company_name, role, location, avatar_url
        )
      `)
      .eq('status', 'accepted')
      .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data to always show the other person
    const transformedConnections = (data || []).map(conn => ({
      id: conn.id,
      created_at: conn.created_at,
      founder: conn.user_id === user.id ? conn.connected_user : conn.user
    }));

    setConnections(transformedConnections);
  };

  const loadRequests = async () => {
    const { data, error } = await supabase
      .from('connections')
      .select(`
        id,
        created_at,
        user:founders!connections_user_id_fkey(
          id, full_name, preferred_name, company_name, role, location, bio, avatar_url
        )
      `)
      .eq('connected_user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setRequests(data || []);
  };

  const loadSentRequests = async () => {
    const { data, error } = await supabase
      .from('connections')
      .select(`
        id,
        created_at,
        connected_user:founders!connections_connected_user_id_fkey(
          id, full_name, preferred_name, company_name, role, location, avatar_url
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setSentRequests(data || []);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleConnectionRequest = async (requestId, action) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ 
          status: action === 'accept' ? 'accepted' : 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      Alert.alert(
        'Success',
        `Connection request ${action === 'accept' ? 'accepted' : 'declined'}`
      );
      
      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error handling connection request:', error);
      Alert.alert('Error', 'Failed to handle connection request');
    }
  };

  const cancelRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      Alert.alert('Success', 'Connection request cancelled');
      await loadData();
    } catch (error) {
      console.error('Error cancelling request:', error);
      Alert.alert('Error', 'Failed to cancel request');
    }
  };

  const ConnectionCard = ({ connection }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          {connection.founder.avatar_url ? (
            <Image source={{ uri: connection.founder.avatar_url }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {connection.founder.full_name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.name}>
            {connection.founder.preferred_name || connection.founder.full_name}
          </Text>
          <Text style={styles.role}>
            {connection.founder.role}{connection.founder.company_name ? ` at ${connection.founder.company_name}` : ''}
          </Text>
          {connection.founder.location && (
            <Text style={styles.location}>📍 {connection.founder.location}</Text>
          )}
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => navigation.navigate('CoffeeChat')}
        >
          <Text style={styles.chatButtonText}>Coffee Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const RequestCard = ({ request }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          {request.user.avatar_url ? (
            <Image source={{ uri: request.user.avatar_url }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {request.user.full_name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.name}>
            {request.user.preferred_name || request.user.full_name}
          </Text>
          <Text style={styles.role}>
            {request.user.role}{request.user.company_name ? ` at ${request.user.company_name}` : ''}
          </Text>
          {request.user.location && (
            <Text style={styles.location}>📍 {request.user.location}</Text>
          )}
          {request.user.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {request.user.bio}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.requestActions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleConnectionRequest(request.id, 'accept')}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.declineButton}
          onPress={() => handleConnectionRequest(request.id, 'decline')}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const SentRequestCard = ({ request }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          {request.connected_user.avatar_url ? (
            <Image source={{ uri: request.connected_user.avatar_url }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {request.connected_user.full_name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.name}>
            {request.connected_user.preferred_name || request.connected_user.full_name}
          </Text>
          <Text style={styles.role}>
            {request.connected_user.role}{request.connected_user.company_name ? ` at ${request.connected_user.company_name}` : ''}
          </Text>
          {request.connected_user.location && (
            <Text style={styles.location}>📍 {request.connected_user.location}</Text>
          )}
        </View>
      </View>

      <View style={styles.sentRequestActions}>
        <Text style={styles.pendingText}>Pending...</Text>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => cancelRequest(request.id)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const TabButton = ({ title, value, count = 0 }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === value && styles.activeTabButton]}
      onPress={() => setActiveTab(value)}
    >
      <Text style={[styles.tabButtonText, activeTab === value && styles.activeTabButtonText]}>
        {title} {count > 0 && `(${count})`}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    let data = [];
    let renderItem = null;
    let emptyMessage = '';

    switch (activeTab) {
      case 'connections':
        data = connections;
        renderItem = ({ item }) => <ConnectionCard connection={item} />;
        emptyMessage = 'No connections yet. Start by discovering founders!';
        break;
      case 'requests':
        data = requests;
        renderItem = ({ item }) => <RequestCard request={item} />;
        emptyMessage = 'No pending requests.';
        break;
      case 'sent':
        data = sentRequests;
        renderItem = ({ item }) => <SentRequestCard request={item} />;
        emptyMessage = 'No sent requests.';
        break;
    }

    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Connections</Text>
        <Text style={styles.subtitle}>Manage your founder network</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TabButton title="Connections" value="connections" count={connections.length} />
        <TabButton title="Requests" value="requests" count={requests.length} />
        <TabButton title="Sent" value="sent" count={sentRequests.length} />
      </View>

      {/* Content */}
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#100c1c',
  },
  header: {
    backgroundColor: '#100c1c',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#100c1c',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  activeTabButton: {
    backgroundColor: '#7d58ff',
    borderColor: '#7d58ff',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: '#ffffff',
  },
  listContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7d58ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: '#888',
  },
  bio: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chatButton: {
    backgroundColor: '#7d58ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  acceptButton: {
    backgroundColor: '#7d58ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  sentRequestActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingText: {
    color: '#f9cb40',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ConnectionsScreen;
