import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import OnboardingForm from './src/components/OnboardingForm';
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DiscoveryScreen from './src/screens/DiscoveryScreen';
import ConnectionsScreen from './src/screens/ConnectionsScreen';
import CoffeeChatScreen from './src/screens/CoffeeChatScreen';
import EventsScreen from './src/screens/EventsScreen';
import MastermindScreen from './src/screens/MastermindScreen';
import OnboardingTestScreen from './src/screens/OnboardingTestScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#7d58ff" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#a855f7', // Purple-500
      tabBarInactiveTintColor: '#71717a', // Zinc-500
      tabBarStyle: {
        backgroundColor: '#09090b', // Zinc-950 (black)
        borderTopWidth: 1,
        borderTopColor: '#27272a', // Zinc-800
        paddingTop: 8,
        paddingBottom: 8,
        height: 80,
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
      },
      tabBarIconStyle: {
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
    }}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons 
            name={focused ? "home" : "home-outline"} 
            size={24} 
            color={color}
            style={focused ? { shadowColor: color, shadowOpacity: 0.8, shadowRadius: 8 } : {}}
          />
        ),
      }}
    />
    <Tab.Screen 
      name="Discovery" 
      component={DiscoveryScreen}
      options={{
        tabBarLabel: 'Discover',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons 
            name={focused ? "search" : "search-outline"} 
            size={24} 
            color={color}
            style={focused ? { shadowColor: color, shadowOpacity: 0.8, shadowRadius: 8 } : {}}
          />
        ),
      }}
    />
    <Tab.Screen 
      name="CoffeeChat" 
      component={CoffeeChatScreen}
      options={{
        tabBarLabel: 'Coffee',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons 
            name={focused ? "cafe" : "cafe-outline"} 
            size={24} 
            color={color}
            style={focused ? { shadowColor: color, shadowOpacity: 0.8, shadowRadius: 8 } : {}}
          />
        ),
      }}
    />
    <Tab.Screen 
      name="Events" 
      component={EventsScreen}
      options={{
        tabBarLabel: 'Events',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons 
            name={focused ? "calendar" : "calendar-outline"} 
            size={24} 
            color={color}
            style={focused ? { shadowColor: color, shadowOpacity: 0.8, shadowRadius: 8 } : {}}
          />
        ),
      }}
    />
    <Tab.Screen 
      name="Masterminds" 
      component={MastermindScreen}
      options={{
        tabBarLabel: 'Mastermind',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons 
            name={focused ? "people" : "people-outline"} 
            size={24} 
            color={color}
            style={focused ? { shadowColor: color, shadowOpacity: 0.8, shadowRadius: 8 } : {}}
          />
        ),
      }}
    />
  </Tab.Navigator>
);

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen name="Profile" component={ProfileScreen} />  
    <Stack.Screen name="Connections" component={ConnectionsScreen} />
    <Stack.Screen name="OnboardingTest" component={OnboardingTestScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { user, loading, initialized, userData, refreshUserData } = useAuth();
  const navigationRef = useRef();

  // Add effect to handle onboarding completion redirect
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user && userData) {
        console.log('Checking onboarding status:', userData.onboarding_completed);
        
        if (userData.onboarding_completed) {
          console.log('User has completed onboarding, should be at dashboard');
          
          // Check if we're currently on the Onboarding screen and need to redirect
          if (navigationRef.current) {
            const currentRoute = navigationRef.current.getCurrentRoute()?.name;
            if (currentRoute === 'Onboarding') {
              console.log('Redirecting completed user from onboarding to dashboard');
              navigationRef.current.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            }
          }
        } else {
          console.log('User needs to complete onboarding');
        }
      }
    };

    if (initialized && !loading && user) {
      checkOnboardingStatus();
    }
  }, [user, userData, initialized, loading]);

  if (!initialized || loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    );
  }

  // Check if user needs onboarding
  const needsOnboarding = !userData || !userData.onboarding_completed;
  
  // Debug logging
  console.log('App Navigation Debug:', {
    hasUser: !!user,
    hasUserData: !!userData,
    onboardingCompleted: userData?.onboarding_completed,
    needsOnboarding
  });

  return (
    <NavigationContainer ref={navigationRef}>
      {needsOnboarding ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding">
            {props => (
              <OnboardingForm
                {...props}
                onComplete={async () => {
                  // Force refresh user data after onboarding completion
                  console.log('Onboarding complete callback - refreshing user data');
                  const refreshedData = await refreshUserData();
                  console.log('User data refreshed:', refreshedData);
                  
                  // If we still don't have userData or onboarding_completed flag,
                  // force a navigation reset anyway to avoid user getting stuck
                  if (!refreshedData?.onboarding_completed) {
                    console.log('Warning: User data not showing onboarding complete after refresh');
                    console.log('Will force navigation reset to MainTabs');
                    
                    // Force another refresh after a delay
                    setTimeout(() => {
                      refreshUserData();
                    }, 500);
                  }
                }}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      ) : (
        <AppStack />
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#09090b" />
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09090b', // Zinc-950 (black)
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#a1a1aa', // Zinc-400
    fontWeight: '600',
  },
});
