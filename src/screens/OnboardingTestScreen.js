import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { FounderService } from '../services/FounderService';
import { FormValidator } from '../utils/FormValidator';
import { useAuth } from '../context/AuthContext';

export default function OnboardingTestScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);

  const addTestResult = (testName, success, message, data = null) => {
    const result = {
      id: Date.now(),
      testName,
      success,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    setTestResults(prev => [...prev, result]);
    console.log(`🧪 ${testName}: ${success ? '✅' : '❌'} ${message}`);
  };

  const runDatabaseConnectionTest = async () => {
    setCurrentTest('Database Connection');
    try {
      const { data, error } = await supabase
        .from('founders')
        .select('count')
        .limit(1);

      if (error) throw error;

      addTestResult(
        'Database Connection',
        true,
        'Successfully connected to Supabase',
        { queryResult: data }
      );
    } catch (error) {
      addTestResult(
        'Database Connection',
        false,
        error.message,
        { error: error.code }
      );
    }
  };

  const runSchemaValidationTest = async () => {
    setCurrentTest('Schema Validation');
    try {
      // Test if required columns exist by attempting a select
      const { data, error } = await supabase
        .from('founders')
        .select('id, email, onboarding_completed, profile_progress, location_city, tags_or_interests')
        .limit(1);

      if (error) throw error;

      addTestResult(
        'Schema Validation',
        true,
        'All required onboarding columns exist',
        { columns: Object.keys(data[0] || {}) }
      );
    } catch (error) {
      addTestResult(
        'Schema Validation',
        false,
        `Schema issue: ${error.message}`,
        { error: error.code }
      );
    }
  };

  const runFormValidationTest = async () => {
    setCurrentTest('Form Validation');
    try {
      // Test valid form data
      const validFormData = {
        full_name: 'John Doe',
        linkedin_url: 'https://linkedin.com/in/johndoe',
        location_city: 'San Francisco',
        industry: 'Tech',
        company_name: 'Startup Inc',
        role: 'Founder',
        bio: 'Building the future of AI',
        tags_or_interests: ['AI', 'SaaS', 'B2B'],
        profile_visible: true,
      };

      const validation = FormValidator.validateOnboardingForm(validFormData);

      if (validation.isValid) {
        addTestResult(
          'Form Validation - Valid Data',
          true,
          'Form validation passed for valid data',
          { validation }
        );
      } else {
        addTestResult(
          'Form Validation - Valid Data',
          false,
          'Form validation failed for valid data',
          { validation }
        );
      }

      // Test invalid form data
      const invalidFormData = {
        full_name: '',
        linkedin_url: 'invalid-url',
        location_city: '',
        industry: '',
        company_name: '',
        role: '',
        bio: '',
        tags_or_interests: [],
        profile_visible: true,
      };

      const invalidValidation = FormValidator.validateOnboardingForm(invalidFormData);

      if (!invalidValidation.isValid) {
        addTestResult(
          'Form Validation - Invalid Data',
          true,
          'Form validation correctly rejected invalid data',
          { validation: invalidValidation }
        );
      } else {
        addTestResult(
          'Form Validation - Invalid Data',
          false,
          'Form validation incorrectly accepted invalid data',
          { validation: invalidValidation }
        );
      }
    } catch (error) {
      addTestResult(
        'Form Validation',
        false,
        `Validation test failed: ${error.message}`
      );
    }
  };

  const runDatabaseUpsertTest = async () => {
    setCurrentTest('Database Upsert');
    
    if (!user) {
      addTestResult(
        'Database Upsert',
        false,
        'No authenticated user for testing'
      );
      return;
    }

    try {
      const testData = {
        full_name: `Test User ${Date.now()}`,
        linkedin_url: 'https://linkedin.com/in/testuser',
        location_city: 'Test City',
        industry: 'Tech',
        company_name: 'Test Company',
        role: 'Founder',
        bio: 'Test bio for onboarding flow testing',
        tags_or_interests: ['Testing', 'Development', 'React Native'],
        profile_visible: true,
      };

      const result = await FounderService.upsertFounderOnboarding(
        user.id,
        user.email,
        testData
      );

      if (result.success) {
        addTestResult(
          'Database Upsert',
          true,
          'Successfully upserted founder data',
          { result }
        );
      } else {
        addTestResult(
          'Database Upsert',
          false,
          `Upsert failed: ${result.error}`,
          { result }
        );
      }
    } catch (error) {
      addTestResult(
        'Database Upsert',
        false,
        `Upsert test failed: ${error.message}`
      );
    }
  };

  const runHelperFunctionTest = async () => {
    setCurrentTest('Helper Functions');
    
    if (!user) {
      addTestResult(
        'Helper Functions',
        false,
        'No authenticated user for testing'
      );
      return;
    }

    try {
      // Test the is_onboarding_complete function
      const { data: isComplete, error } = await supabase
        .rpc('is_onboarding_complete', { user_id: user.id });

      if (error) throw error;

      addTestResult(
        'Helper Functions',
        true,
        `Helper function works. Onboarding complete: ${isComplete}`,
        { isComplete }
      );
    } catch (error) {
      addTestResult(
        'Helper Functions',
        false,
        `Helper function test failed: ${error.message}`,
        { error: error.code }
      );
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults([]);
    setCurrentTest('Initializing');

    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX

    await runDatabaseConnectionTest();
    await new Promise(resolve => setTimeout(resolve, 300));

    await runSchemaValidationTest();
    await new Promise(resolve => setTimeout(resolve, 300));

    await runFormValidationTest();
    await new Promise(resolve => setTimeout(resolve, 300));

    await runDatabaseUpsertTest();
    await new Promise(resolve => setTimeout(resolve, 300));

    await runHelperFunctionTest();
    await new Promise(resolve => setTimeout(resolve, 300));

    setCurrentTest(null);
    setLoading(false);

    // Calculate success rate
    const successCount = testResults.filter(r => r.success).length;
    const totalCount = testResults.length;
    const successRate = (successCount / totalCount) * 100;

    Alert.alert(
      '🧪 Test Results',
      `Completed ${totalCount} tests\n✅ ${successCount} passed\n❌ ${totalCount - successCount} failed\n📈 Success rate: ${successRate.toFixed(1)}%`,
      [{ text: 'OK' }]
    );
  };

  const clearResults = () => {
    setTestResults([]);
    setCurrentTest(null);
  };

  const renderTestResult = (result) => (
    <View key={result.id} style={[
      styles.resultItem,
      { backgroundColor: result.success ? '#064e3b' : '#7f1d1d' }
    ]}>
      <View style={styles.resultHeader}>
        <Ionicons
          name={result.success ? 'checkmark-circle' : 'close-circle'}
          size={20}
          color={result.success ? '#10b981' : '#ef4444'}
        />
        <Text style={styles.resultTitle}>{result.testName}</Text>
      </View>
      <Text style={styles.resultMessage}>{result.message}</Text>
      {result.data && (
        <Text style={styles.resultData}>
          {JSON.stringify(result.data, null, 2)}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Onboarding Flow Test Suite</Text>
      
      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.userText}>👤 Testing as: {user.email}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={runAllTests}
          disabled={loading}
        >
          <Ionicons name="play" size={20} color="white" />
          <Text style={styles.buttonText}>
            {loading ? 'Running Tests...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={clearResults}
          disabled={loading}
        >
          <Ionicons name="refresh" size={20} color="#a855f7" />
          <Text style={[styles.buttonText, { color: '#a855f7' }]}>
            Clear Results
          </Text>
        </TouchableOpacity>
      </View>

      {loading && currentTest && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#a855f7" />
          <Text style={styles.loadingText}>Running: {currentTest}</Text>
        </View>
      )}

      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {testResults.map(renderTestResult)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f4f4f5',
    textAlign: 'center',
    marginBottom: 20,
  },
  userInfo: {
    backgroundColor: '#18181b',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  userText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  primaryButton: {
    backgroundColor: '#a855f7',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#a855f7',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingText: {
    color: '#a1a1aa',
    marginLeft: 8,
    fontSize: 14,
  },
  resultsContainer: {
    flex: 1,
  },
  resultItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTitle: {
    color: '#f4f4f5',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  resultMessage: {
    color: '#d4d4d8',
    fontSize: 14,
    marginBottom: 8,
  },
  resultData: {
    color: '#a1a1aa',
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#000',
    padding: 8,
    borderRadius: 4,
  },
});
