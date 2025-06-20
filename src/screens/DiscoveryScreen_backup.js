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
        .select('connected_user_id, user_id, status')
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`);

      if (error) throw error;

      const connectedIds = new Set();
      data?.forEach(conn => {
        if (conn.user_id === user.id) {
          connectedIds.add(conn.connected_user_id);
        } else {
          connectedIds.add(conn.user_id);
        }
      });

      setExistingConnections(connectedIds);
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  const loadFounders = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('founders')
        .select(`
          id,
          full_name,
          preferred_name,
          company_name,
          role,
          bio,
          location,
          tags,
          onboarding_complete,
          is_visible,
          avatar_url,
          created_at
        `)
        .neq('id', user.id) // Exclude current user
        .eq('onboarding_complete', true)
        .eq('is_visible', true) // Only show visible profiles
        .order('created_at', { ascending: false });

      const { data, error } = await query.limit(50);

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
      // Check if connection already exists
      if (existingConnections.has(founderId)) {
        Alert.alert('Info', 'You are already connected with this founder');
        return;
      }

      const { error } = await supabase
        .from('connections')
        .insert({
          user_id: user.id,
          connected_user_id: founderId,
          status: 'pending'
        });

      if (error) throw error;

      Alert.alert('Success', 'Connection request sent!');
      setExistingConnections(prev => new Set([...prev, founderId]));
    } catch (error) {
      console.error('Error sending connection request:', error);
      if (error.code === '23505') { // unique constraint error
        Alert.alert('Info', 'Connection request already sent');
      } else {
        Alert.alert('Error', 'Failed to send connection request');
      }
    }
  };

  const getConnectionStatus = (founderId) => {
    if (existingConnections.has(founderId)) {
      return 'Connected';
    }
    return 'Connect';
  };

  const filteredFounders = founders.filter(founder =>
    founder.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    founder.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (founder.role && founder.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const FounderCard = ({ founder }) => (
    <View style={styles.founderCard}>
      <View style={styles.founderHeader}>
        <View style={styles.avatar}>
          {founder.avatar_url ? (
            <Image source={{ uri: founder.avatar_url }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {founder.full_name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.founderInfo}>
          <Text style={styles.founderName}>
            {founder.preferred_name || founder.full_name}
          </Text>
          <Text style={styles.founderRole}>
            {founder.role}{founder.company_name ? ` at ${founder.company_name}` : ''}
          </Text>
          {founder.location && (
            <Text style={styles.founderLocation}>📍 {founder.location}</Text>
          )}
        </View>
      </View>

      {founder.bio && (
        <Text style={styles.founderBio} numberOfLines={3}>
          {founder.bio}
        </Text>
      )}

      {founder.tags && (
        <View style={styles.founderDetails}>
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
            existingConnections.has(founder.id) && styles.connectedButton
          ]}
          onPress={() => sendConnectionRequest(founder.id)}
          disabled={existingConnections.has(founder.id)}
        >
          <Text style={[
            styles.connectButtonText,
            existingConnections.has(founder.id) && styles.connectedButtonText
          ]}>
            {getConnectionStatus(founder.id)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const FilterButton = ({ title, value, active }) => (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.activeFilterButton]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterButtonText, active && styles.activeFilterButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover Founders</Text>
        <Text style={styles.subtitle}>Connect with like-minded entrepreneurs</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search founders, companies, or industries..."
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FilterButton title="All" value="all" active={filter === 'all'} />
        <FilterButton title="Same Role" value="role" active={filter === 'role'} />
        <FilterButton title="Same Location" value="location" active={filter === 'location'} />
      </View>

      {/* Founders List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Finding founders...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFounders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <FounderCard founder={item} />}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No founders found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your search or filters
              </Text>
            </View>
          }
        />
      )}
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#100c1c',
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#100c1c',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  activeFilterButton: {
    backgroundColor: '#7d58ff',
    borderColor: '#7d58ff',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#ffffff',
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
  listContainer: {
    padding: 20,
  },
  founderCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  founderHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7d58ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    color: '#888',
    marginBottom: 4,
  },
  founderLocation: {
    fontSize: 14,
    color: '#888',
  },
  founderBio: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 16,
  },
  founderDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#f9cb40',
    fontWeight: '500',
  },
  founderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  connectButton: {
    backgroundColor: '#7d58ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  connectedButton: {
    backgroundColor: '#2a2a2a',
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  connectedButtonText: {
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

export default DiscoveryScreen;
