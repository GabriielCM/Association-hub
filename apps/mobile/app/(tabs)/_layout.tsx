import { Tabs } from 'expo-router';
import { useTheme } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@ahub/ui';
import { TAB_ICONS } from '@ahub/ui/src/icons';
import { useThemeContext } from '@/providers/ThemeProvider';

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { theme: themeMode } = useThemeContext();
  const isDark = themeMode === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#22D3EE' : theme.primary.val,
        tabBarInactiveTintColor: isDark ? 'rgba(255,255,255,0.4)' : theme.colorSecondary.val,
        tabBarStyle: {
          backgroundColor: isDark ? '#0D0520' : theme.surface.val,
          borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : theme.borderColor.val,
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
          tabBarIcon: ({ color, focused }) => (
            <Icon icon={TAB_ICONS.home} color={color} size="lg" weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
      <Tabs.Screen
        name="carteirinha"
        options={{
          title: 'Carteirinha',
          tabBarIcon: ({ color, focused }) => (
            <Icon icon={TAB_ICONS.card} color={color} size="lg" weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
      <Tabs.Screen
        name="eventos"
        options={{
          title: 'Eventos',
          tabBarIcon: ({ color, focused }) => (
            <Icon icon={TAB_ICONS.calendar} color={color} size="lg" weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
      <Tabs.Screen
        name="loja"
        options={{
          title: 'Loja',
          tabBarIcon: ({ color, focused }) => (
            <Icon icon={TAB_ICONS.store} color={color} size="lg" weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <Icon icon={TAB_ICONS.user} color={color} size="lg" weight={focused ? 'fill' : 'regular'} />
          ),
        }}
      />
    </Tabs>
  );
}
