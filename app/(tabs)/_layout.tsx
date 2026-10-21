import { Tabs } from 'expo-router';

import { TabBarLabel, tabBarIcon, useColors } from '@/design-system';
import { tabs } from '@/navigation/tabs';

export default function TabsLayout() {
  const colors = useColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.key}
          name={tab.route}
          options={{
            tabBarLabel: ({ focused }) => <TabBarLabel labelKey={tab.labelKey} focused={focused} />,
            tabBarIcon,
          }}
        />
      ))}
    </Tabs>
  );
}
