import { NavigationProp } from '@react-navigation/native';

// Define navigation types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  Onboarding: undefined;
  DiscoveryScreen: undefined;
  ProfileScreen: undefined;
  CoffeeChatScreen: undefined;
  NotificationsScreen: undefined;
  SettingsScreen: undefined;
  MessageScreen: { chatId: string; receiverId: string; receiverName: string };
  // Add any other screens in your app
};

export type AppNavigationProp = NavigationProp<RootStackParamList>;
