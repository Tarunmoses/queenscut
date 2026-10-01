import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { colors } from '../theme';
import { InventoryScreen } from '../screens/InventoryScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { ExpensesStack } from './ExpensesStack';
import { HomeStack } from './HomeStack';

// Matches the locked mockups exactly: 4 tabs, emoji-only icons, no labels —
// "Create Order" is reached via Home's "+ New Order" button, not a tab.
export type RootTabParamList = {
  HomeTab: undefined;
  InventoryTab: undefined;
  ExpensesTab: undefined;
  ReportsTab: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

function tabIcon(emoji: string) {
  return ({ focused }: { focused: boolean }) => (
    <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { height: 60, backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarIcon: tabIcon('🏠') }} />
      <Tab.Screen name="InventoryTab" component={InventoryScreen} options={{ tabBarIcon: tabIcon('📦') }} />
      <Tab.Screen name="ExpensesTab" component={ExpensesStack} options={{ tabBarIcon: tabIcon('💰') }} />
      <Tab.Screen name="ReportsTab" component={ReportsScreen} options={{ tabBarIcon: tabIcon('📊') }} />
    </Tab.Navigator>
  );
}
