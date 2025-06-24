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
    title: '',
    description: '',
    max_members: '',
    meeting_info: '',
  });
  const [connectedUserIds, setConnectedUserIds] = useState(new Set());

  useEffect(() => {
    fetchMasterminds();
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('founder_a_id, founder_b_id')
        .or(`founder_a_id.eq.${user.id},founder_b_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (error) throw error;

      const connectedIds = new Set();
      data?.forEach(conn => {
        if (conn.founder_a_id === user.id) {
          connectedIds.add(conn.founder_b_id);
        } else {
          connectedIds.add(conn.founder_a_id);
        }
      });
      connectedIds.add(user.id); // Include self
      setConnectedUserIds(connectedIds);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const fetchMasterminds = async () => {
    try {
      // TODO: Enable when masterminds table is created
      console.log('⏳ Masterminds feature coming soon...');
      setMasterminds([]);
      return;
      
      // Fetch all masterminds
      const { data: mastermindsData, error: mastermindsError } = await supabase
        .from('masterminds')
        .select('*')
        .order('created_at', { ascending: false });

      if (mastermindsError) throw mastermindsError;

      // Fetch mastermind members
      const { data: membersData, error: membersError } = await supabase
        .from('mastermind_members')
        .select(`
          mastermind_id,
          user_id,
          status,
          founder:founders(id, full_name, company_name)
        `);

      if (membersError) throw membersError;

      // Group members by mastermind
      const membersByMastermind = {};
      membersData?.forEach(member => {
        if (!membersByMastermind[member.mastermind_id]) {
          membersByMastermind[member.mastermind_id] = [];
        }
        membersByMastermind[member.mastermind_id].push(member);
      });

      // Process masterminds with member data
      const processedMasterminds = mastermindsData?.map(mastermind => {
        const mastermindMembers = membersByMastermind[mastermind.id] || [];
        const acceptedMembers = mastermindMembers.filter(m => m.status === 'accepted');
        const userMembership = mastermindMembers.find(m => m.user_id === user.id);
        
        // Filter visible members (only show names of connected users)
        const visibleMembers = acceptedMembers.filter(member => 
          connectedUserIds.has(member.user_id)
        );
        
        return {
          ...mastermind,
          members: mastermindMembers,
          accepted_members: acceptedMembers,
          visible_members: visibleMembers,
          member_count: acceptedMembers.length,
          user_membership: userMembership,
          is_host: mastermind.host_id === user.id,
          host_name: connectedUserIds.has(mastermind.host_id) ? mastermind.host?.full_name : 'Anonymous Host',
          can_see_host: connectedUserIds.has(mastermind.host_id)
        };
      }) || [];

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
    if (!newMastermind.title || !newMastermind.description) {
      Alert.alert('Missing Information', 'Please fill in title and description.');
      return;
    }

    try {
      const { error } = await supabase
        .from('masterminds')
        .insert({
          topic: newMastermind.title.trim(),
          description: newMastermind.description.trim(),
          max_members: newMastermind.max_members ? parseInt(newMastermind.max_members) : null,
          location: newMastermind.meeting_info.trim(),
          host_id: user.id,
          time: new Date().toISOString(), // Add required time field
        });

      if (error) throw error;

      setShowCreateModal(false);
      setNewMastermind({
        title: '',
        description: '',
        max_members: '',
        meeting_info: '',
      });
      fetchMasterminds();
      Alert.alert('Success!', 'Your mastermind has been created. Your network can now see and apply to join.');
    } catch (error) {
      console.error('Error creating mastermind:', error);
      Alert.alert('Error', 'Failed to create mastermind');
    }
  };

  const applyToJoin = async (mastermindId) => {
    try {
      const { error } = await supabase
        .from('mastermind_members')
        .insert({
          mastermind_id: mastermindId,
          user_id: user.id,
          status: 'pending',
        });

      if (error) throw error;

      fetchMasterminds();
      Alert.alert('Application Sent!', 'Your application has been sent to the host. You\'ll be notified when they respond.');
    } catch (error) {
      console.error('Error applying to mastermind:', error);
      Alert.alert('Error', 'Failed to send application');
    }
  };

  const updateMemberStatus = async (mastermindId, userId, status) => {
    try {
      const { error } = await supabase
        .from('mastermind_members')
        .update({ status })
        .eq('mastermind_id', mastermindId)
        .eq('user_id', userId);

      if (error) throw error;

      fetchMasterminds();
    } catch (error) {
      console.error('Error updating member status:', error);
      Alert.alert('Error', 'Failed to update member status');
    }
  };

  const leaveMastermind = async (mastermindId) => {
    Alert.alert(
      'Leave Mastermind',
      'Are you sure you want to leave this mastermind?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('mastermind_members')
                .delete()
                .eq('mastermind_id', mastermindId)
                .eq('user_id', user.id);

              if (error) throw error;

              fetchMasterminds();
              Alert.alert('Left', 'You have left the mastermind.');
            } catch (error) {
              console.error('Error leaving mastermind:', error);
              Alert.alert('Error', 'Failed to leave mastermind');
            }
          }
        }
      ]
    );
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
        <Text style={styles.title}>Mastermind Groups</Text>
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
        {masterminds.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#52525b" />
            <Text style={styles.emptyTitle}>No Mastermind Groups</Text>
            <Text style={styles.emptyText}>
              Create or join a mastermind group to connect with like-minded founders.
            </Text>
          </View>
        ) : (
          masterminds.map((mastermind) => (
            <View key={mastermind.id} style={styles.mastermindCard}>
              <View style={styles.mastermindHeader}>
                <View style={styles.mastermindTitleContainer}>
                  <Text style={styles.mastermindTitle}>{mastermind.title}</Text>
                  <Text style={styles.mastermindHost}>
                    Hosted by {mastermind.host_name}
                  </Text>
                </View>
                <View style={styles.badges}>
                  {mastermind.is_host && (
                    <View style={styles.hostBadge}>
                      <Text style={styles.hostBadgeText}>Host</Text>
                    </View>
                  )}
                  {mastermind.user_membership?.status === 'accepted' && (
                    <View style={styles.memberBadge}>
                      <Text style={styles.memberBadgeText}>Member</Text>
                    </View>
                  )}
                  {mastermind.user_membership?.status === 'pending' && (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingBadgeText}>Pending</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={styles.mastermindDescription}>
                {mastermind.description}
              </Text>

              <View style={styles.mastermindDetails}>
                <View style={styles.mastermindDetail}>
                  <Ionicons name="people-outline" size={16} color="#a1a1aa" />
                  <Text style={styles.mastermindDetailText}>
                    {mastermind.member_count} members
                    {mastermind.max_members && ` • Max ${mastermind.max_members}`}
                  </Text>
                </View>

                {mastermind.meeting_info && (
                  <View style={styles.mastermindDetail}>
                    <Ionicons name="calendar-outline" size={16} color="#a1a1aa" />
                    <Text style={styles.mastermindDetailText}>
                      {mastermind.meeting_info}
                    </Text>
                  </View>
                )}
              </View>

              {/* Visible Members */}
              {mastermind.visible_members.length > 0 && (
                <View style={styles.membersSection}>
                  <Text style={styles.membersTitle}>
                    Members you know ({mastermind.visible_members.length}):
                  </Text>
                  <View style={styles.membersList}>
                    {mastermind.visible_members.map((member, index) => (
                      <Text key={member.user_id} style={styles.memberName}>
                        {member.founder.full_name}
                        {index < mastermind.visible_members.length - 1 && ', '}
                      </Text>
                    ))}
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {mastermind.is_host ? (
                  // Host actions
                  <View style={styles.hostActions}>
                    <Text style={styles.hostActionsText}>
                      Manage applications in your host dashboard
                    </Text>
                    {mastermind.members.filter(m => m.status === 'pending').length > 0 && (
                      <Text style={styles.pendingApplications}>
                        {mastermind.members.filter(m => m.status === 'pending').length} pending applications
                      </Text>
                    )}
                  </View>
                ) : mastermind.user_membership ? (
                  // User is already a member or has applied
                  <View style={styles.memberActions}>
                    {mastermind.user_membership.status === 'accepted' ? (
                      <TouchableOpacity
                        style={styles.leaveButton}
                        onPress={() => leaveMastermind(mastermind.id)}
                      >
                        <Text style={styles.leaveButtonText}>Leave Group</Text>
                      </TouchableOpacity>
                    ) : mastermind.user_membership.status === 'pending' ? (
                      <View style={styles.pendingStatus}>
                        <Ionicons name="time-outline" size={16} color="#f9cb40" />
                        <Text style={styles.pendingStatusText}>Application Pending</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.applyButton}
                        onPress={() => applyToJoin(mastermind.id)}
                      >
                        <Text style={styles.applyButtonText}>Apply to Join</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  // User can apply
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => applyToJoin(mastermind.id)}
                    disabled={mastermind.max_members && mastermind.member_count >= mastermind.max_members}
                  >
                    <Text style={styles.applyButtonText}>
                      {mastermind.max_members && mastermind.member_count >= mastermind.max_members ? 'Full' : 'Apply to Join'}
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
            <Text style={styles.modalTitle}>Create Mastermind</Text>
            <TouchableOpacity
              onPress={() => setShowCreateModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Group Title *</Text>
              <TextInput
                style={styles.input}
                value={newMastermind.title}
                onChangeText={(text) => setNewMastermind({...newMastermind, title: text})}
                placeholder="e.g., SaaS Founders Circle"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newMastermind.description}
                onChangeText={(text) => setNewMastermind({...newMastermind, description: text})}
                placeholder="What's the purpose and focus of this mastermind?"
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Meeting Info</Text>
              <TextInput
                style={styles.input}
                value={newMastermind.meeting_info}
                onChangeText={(text) => setNewMastermind({...newMastermind, meeting_info: text})}
                placeholder="e.g., Monthly Zoom calls, Weekly coffee meetups"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Max Members (Optional)</Text>
              <TextInput
                style={styles.input}
                value={newMastermind.max_members}
                onChangeText={(text) => setNewMastermind({...newMastermind, max_members: text})}
                placeholder="Leave blank for unlimited"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.infoBox}>
                <Ionicons name="shield-outline" size={20} color="#a855f7" />
                <Text style={styles.infoText}>
                  Only your network connections can see this mastermind. Others will see you as "Anonymous Host" for privacy.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.createMastermindButton}
              onPress={createMastermind}
            >
              <Text style={styles.createMastermindButtonText}>Create Mastermind</Text>
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
  mastermindCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  mastermindHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mastermindTitleContainer: {
    flex: 1,
  },
  mastermindTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  mastermindHost: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  hostBadge: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hostBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  memberBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  memberBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  pendingBadge: {
    backgroundColor: '#f9cb40',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  mastermindDescription: {
    fontSize: 14,
    color: '#d4d4d8',
    lineHeight: 20,
    marginBottom: 16,
  },
  mastermindDetails: {
    marginBottom: 16,
  },
  mastermindDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mastermindDetailText: {
    fontSize: 14,
    color: '#d4d4d8',
    marginLeft: 8,
  },
  membersSection: {
    marginBottom: 16,
  },
  membersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  membersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  memberName: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  actionButtons: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  applyButton: {
    backgroundColor: '#a855f7',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  leaveButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  pendingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  pendingStatusText: {
    color: '#f9cb40',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  hostActions: {
    alignItems: 'center',
  },
  hostActionsText: {
    fontSize: 14,
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 4,
  },
  pendingApplications: {
    fontSize: 14,
    color: '#f9cb40',
    fontWeight: '600',
  },
  memberActions: {
    alignItems: 'center',
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
  createMastermindButton: {
    backgroundColor: '#a855f7',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  createMastermindButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
