import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
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

const DiscoveryScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [founders, setFounders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, role, location
  const [existingConnections, setExistingConnections] = useState(new Set());

  useEffect(() => {
    loadFounders();
    loadExistingConnections();
  }, [filter]);

  const loadExistingConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('founder_a, founder_b, status')
        .or(`founder_a.eq.${user.id},founder_b.eq.${user.id}`);

      if (error) throw error;

      const connectedIds = new Set();
      const pendingIds = new Set();
      
      data?.forEach(conn => {
        const otherId = conn.founder_a === user.id ? conn.founder_b : conn.founder_a;
        
        if (conn.status === 'accepted') {
          connectedIds.add(otherId);
        } else if (conn.status === 'pending') {
          pendingIds.add(otherId);
        }
      });

      setExistingConnections(new Set([
        ...Array.from(connectedIds).map(id => [id, 'accepted']),
        ...Array.from(pendingIds).map(id => [id, 'pending'])
      ]));
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  const loadFounders = async () => {
    try {
      setLoading(true);
      
      // First, get all accepted connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select('founder_a, founder_b')
        .or(`founder_a.eq.${user.id},founder_b.eq.${user.id}`)
        .eq('status', 'accepted');

      if (connectionsError) throw connectionsError;

      // Get connected user IDs
      const connectedUserIds = new Set();
      connectionsData?.forEach(conn => {
        if (conn.founder_a === user.id) {
          connectedUserIds.add(conn.founder_b);
        } else {
          connectedUserIds.add(conn.founder_a);
        }
      });

      // Only show visible founders who are in the user's network
      let query = supabase
        .from('founders')
        .select(`
          id,
          full_name,
          company_name,
          role,
          bio,
          location,
          tags,
          industry,
          onboarding_complete,
          profile_visibility,
          avatar_url,
          created_at
        `)
        .neq('id', user.id) // Exclude current user
        .eq('onboarding_complete', true)
        .eq('profile_visibility', true); // Only show visible profiles

      // If user has connections, filter to show only connected users
      if (connectedUserIds.size > 0) {
        query = query.in('id', Array.from(connectedUserIds));
      } else {
        // If no connections, show empty array (privacy enforcement)
        setFounders([]);
        setLoading(false);
        return;
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setFounders(data || []);
    } catch (error) {
      console.error('Error loading founders:', error);
      Alert.alert('Error', 'Failed to load founders');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadFounders(), loadExistingConnections()]);
    setRefreshing(false);
  };

  const sendConnectionRequest = async (founderId) => {
    try {
      const connectionStatus = Array.from(existingConnections).find(item => item === founderId);
      
      if (connectionStatus) {
        Alert.alert(
          'Connection Exists', 
          connectionStatus === 'accepted' 
            ? 'You are already connected with this founder.'
            : 'You have already sent a connection request to this founder.'
        );
        return;
      }

      const { error } = await supabase
        .from('connections')
        .insert({
          founder_a: user.id,
          founder_b: founderId,
          status: 'pending',
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          Alert.alert('Connection Exists', 'You have already sent a connection request to this founder.');
          return;
        }
        throw error;
      }

      // Update local state to reflect the new connection request
      setExistingConnections(prev => new Set([...prev, founderId, 'pending']));
      
      Alert.alert('Request Sent!', 'Your connection request has been sent.');
    } catch (error) {
      console.error('Error sending connection request:', error);
      Alert.alert('Error', 'Failed to send connection request');
    }
  };

  const filteredFounders = founders.filter(founder => {
    const matchesSearch = searchQuery === '' || 
      founder.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      founder.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      founder.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      founder.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      founder.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      founder.tags?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filter === 'all' || 
      (filter === 'role' && founder.role) ||
      (filter === 'location' && founder.location);

    return matchesSearch && matchesFilter;
  });

  const renderFounder = ({ item: founder }) => {
    const connectionStatus = Array.from(existingConnections).find(item => item === founder.id);
    
    return (
      <View style={styles.founderCard}>
        <View style={styles.founderHeader}>
          <View style={styles.avatarContainer}>
            {founder.avatar_url ? (
              <Image source={{ uri: founder.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {founder.full_name?.charAt(0) || '?'}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.founderInfo}>
            <Text style={styles.founderName}>{founder.full_name}</Text>
            <Text style={styles.founderRole}>
              {founder.role}
              {founder.company_name && ` at ${founder.company_name}`}
            </Text>
            {founder.location && (
              <Text style={styles.founderLocation}>
                <Ionicons name="location-outline" size={12} color="#a1a1aa" />
                {' '}{founder.location}
              </Text>
            )}
            {founder.industry && (
              <Text style={styles.founderIndustry}>{founder.industry}</Text>
            )}
          </View>
        </View>

        {founder.bio && (
          <Text style={styles.founderBio} numberOfLines={3}>
            {founder.bio}
          </Text>
        )}

        {founder.tags && (
          <View style={styles.tagsContainer}>
            {founder.tags.split(',').slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag.trim()}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.founderActions}>
          <TouchableOpacity
            style={[
              styles.connectButton,
              connectionStatus === 'accepted' && styles.connectedButton,
              connectionStatus === 'pending' && styles.pendingButton,
            ]}
            onPress={() => !connectionStatus && sendConnectionRequest(founder.id)}
            disabled={!!connectionStatus}
          >
            <Ionicons
              name={
                connectionStatus === 'accepted' ? 'checkmark-circle' :
                connectionStatus === 'pending' ? 'time-outline' :
                'person-add-outline'
              }
              size={16}
              color={
                connectionStatus === 'accepted' ? '#22c55e' :
                connectionStatus === 'pending' ? '#f9cb40' :
                '#ffffff'
              }
            />
            <Text style={[
              styles.connectButtonText,
              connectionStatus === 'accepted' && styles.connectedButtonText,
              connectionStatus === 'pending' && styles.pendingButtonText,
            ]}>
              {connectionStatus === 'accepted' ? 'Connected' :
               connectionStatus === 'pending' ? 'Pending' :
               'Connect'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#71717a" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search founders..."
            placeholderTextColor="#71717a"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'role' && styles.filterButtonActive]}
          onPress={() => setFilter('role')}
        >
          <Text style={[styles.filterText, filter === 'role' && styles.filterTextActive]}>
            By Role
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'location' && styles.filterButtonActive]}
          onPress={() => setFilter('location')}
        >
          <Text style={[styles.filterText, filter === 'location' && styles.filterTextActive]}>
            By Location
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#a855f7" />
          <Text style={styles.loadingText}>Loading founders...</Text>
        </View>
      ) : filteredFounders.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color="#52525b" />
          <Text style={styles.emptyTitle}>
            {founders.length === 0 ? 'No Network Yet' : 'No Results'}
          </Text>
          <Text style={styles.emptyText}>
            {founders.length === 0 
              ? 'Connect with other founders to see who\'s in your network. Only connected users are visible for privacy.'
              : searchQuery 
                ? 'Try adjusting your search or filters'
                : 'No founders match your current filters'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredFounders}
          renderItem={renderFounder}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#a855f7"
            />
          }
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
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
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  filterButtonActive: {
    backgroundColor: '#a855f7',
    borderColor: '#a855f7',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a1a1aa',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#a1a1aa',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
    paddingVertical: 40,
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  founderCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  founderHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#27272a',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#a855f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  founderInfo: {
    flex: 1,
  },
  founderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  founderRole: {
    fontSize: 14,
    color: '#a1a1aa',
    marginBottom: 4,
  },
  founderLocation: {
    fontSize: 14,
    color: '#a1a1aa',
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  founderIndustry: {
    fontSize: 12,
    color: '#a855f7',
    fontWeight: '600',
    backgroundColor: '#27272a',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  founderBio: {
    fontSize: 14,
    color: '#d4d4d8',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  tag: {
    backgroundColor: '#27272a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#a1a1aa',
    fontWeight: '500',
  },
  founderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#a855f7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  connectedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  pendingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#f9cb40',
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  connectedButtonText: {
    color: '#22c55e',
  },
  pendingButtonText: {
    color: '#f9cb40',
  },
});

export default DiscoveryScreen;
