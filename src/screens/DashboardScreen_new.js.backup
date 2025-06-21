import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export default function DashboardScreen({ navigation }) {
  const { user, userData } = useAuth();
  const [stats, setStats] = useState({
    connections: 0,
    pendingRequests: 0,
    upcomingEvents: 0,
    activeMasterminds: 0,
    coffeeChats: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      if (!user?.id) return;

      const [
        connectionsData,
        requestsData,
        eventsData,
        mastermindsData,
        coffeeChatsData,
      ] = await Promise.all([
        // Connections count
        supabase
          .from('connections')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'accepted'),
        
        // Pending connection requests
        supabase
          .from('connections')
          .select('id')
          .eq('connected_user_id', user.id)
          .eq('status', 'pending'),
        
        // Upcoming events (RSVPs)
        supabase
          .from('event_rsvps')
          .select('events!inner(*)')
          .eq('user_id', user.id)
          .gte('events.date', new Date().toISOString()),
        
        // Active masterminds
        supabase
          .from('mastermind_members')
          .select('masterminds!inner(*)')
          .eq('user_id', user.id)
          .gte('masterminds.time', new Date().toISOString()),
        
        // Coffee chats (pending/confirmed)
        supabase
          .from('coffee_chats')
          .select('id')
          .or(`requester_id.eq.${user.id},requested_id.eq.${user.id}`)
          .in('status', ['pending', 'confirmed']),
      ]);

      setStats({
        connections: connectionsData.data?.length || 0,
        pendingRequests: requestsData.data?.length || 0,
        upcomingEvents: eventsData.data?.length || 0,
        activeMasterminds: mastermindsData.data?.length || 0,
        coffeeChats: coffeeChatsData.data?.length || 0,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const QuickAction = ({ title, icon, color, onPress }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#ffffff" />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>
              {userData?.preferred_name || userData?.full_name || 'Founder'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={32} color="#7d58ff" />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Network</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Connections"
              value={stats.connections}
              icon="people-outline"
              color="#7d58ff"
              onPress={() => navigation.navigate('Connections')}
            />
            <StatCard
              title="Pending Requests"
              value={stats.pendingRequests}
              icon="person-add-outline"
              color="#f9cb40"
              onPress={() => navigation.navigate('Connections')}
            />
            <StatCard
              title="Coffee Chats"
              value={stats.coffeeChats}
              icon="cafe-outline"
              color="#7d58ff"
              onPress={() => navigation.navigate('CoffeeChat')}
            />
            <StatCard
              title="Events RSVPs"
              value={stats.upcomingEvents}
              icon="calendar-outline"
              color="#f9cb40"
              onPress={() => navigation.navigate('Events')}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.quickActionsScroll}
          >
            <QuickAction
              title="Discover Founders"
              icon="search-outline"
              color="#7d58ff"
              onPress={() => navigation.navigate('Discovery')}
            />
            <QuickAction
              title="Create Event"
              icon="calendar-outline"
              color="#f9cb40"
              onPress={() => navigation.navigate('Events')}
            />
            <QuickAction
              title="Host Mastermind"
              icon="people-outline"
              color="#7d58ff"
              onPress={() => navigation.navigate('Masterminds')}
            />
            <QuickAction
              title="Coffee Chat"
              icon="cafe-outline"
              color="#f9cb40"
              onPress={() => navigation.navigate('CoffeeChat')}
            />
          </ScrollView>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivity.length === 0 ? (
            <View style={styles.emptyActivity}>
              <Ionicons name="pulse-outline" size={48} color="#444" />
              <Text style={styles.emptyActivityText}>
                Your activity will appear here
              </Text>
              <Text style={styles.emptyActivitySubtext}>
                Start connecting and engaging with the community
              </Text>
            </View>
          ) : (
            recentActivity.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <Text style={styles.activityText}>{activity.text}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            ))
          )}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#100c1c',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  greeting: {
    fontSize: 16,
    color: '#888',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  profileButton: {
    padding: 8,
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statTitle: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  quickActionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  quickActionsScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  quickAction: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '500',
  },
  activityContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyActivityText: {
    fontSize: 16,
    color: '#888',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyActivitySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  activityText: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
    color: '#888',
  },
  bottomSpacing: {
    height: 32,
  },
});
