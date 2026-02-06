import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary.val,
        tabBarInactiveTintColor: theme.colorSecondary.val,
        tabBarStyle: {
          backgroundColor: theme.surface.val,
          borderTopColor: theme.borderColor.val,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8 + insets.bottom,
          height: 64 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            // Placeholder - will use Phosphor icons
            <TabIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="carteirinha"
        options={{
          title: 'Carteirinha',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="card" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="eventos"
        options={{
          title: 'Eventos',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="loja"
        options={{
          title: 'Loja',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="store" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="user" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

// Simple placeholder icon component
// Will be replaced with Phosphor icons
function TabIcon({
  name,
  color,
  size,
}: {
  name: string;
  color: string;
  size: number;
}) {
  const iconMap: Record<string, string> = {
    home: '🏠',
    card: '💳',
    calendar: '📅',
    store: '🛍️',
    user: '👤',
  };

  return (
    <Text style={{ fontSize: size - 4, color }}>{iconMap[name] || '•'}</Text>
  );
}
