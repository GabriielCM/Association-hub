import { useCallback } from 'react';
import { ScrollView, Switch, Pressable, StyleSheet } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text, Card } from '@ahub/ui';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNotificationSettings,
  useUpdateSettings,
} from '../hooks/useNotificationSettings';
import { DNDSettings } from '../components/DNDSettings';
import type { NotificationCategory } from '@ahub/shared/types';

const CATEGORY_ICONS: Record<NotificationCategory, string> = {
  SOCIAL: '💬',
  EVENTS: '🎉',
  POINTS: '⭐',
  RESERVATIONS: '📅',
  SYSTEM: '🔔',
};

export function NotificationSettingsScreen() {
  const { data: settingsData } = useNotificationSettings();
  const updateSettings = useUpdateSettings();

  const handleTogglePush = useCallback(
    (category: NotificationCategory, currentValue: boolean, inAppEnabled: boolean) => {
      updateSettings.mutate({
        category,
        data: { pushEnabled: !currentValue, inAppEnabled },
      });
    },
    [updateSettings]
  );

  const handleToggleInApp = useCallback(
    (category: NotificationCategory, pushEnabled: boolean, currentValue: boolean) => {
      updateSettings.mutate({
        category,
        data: { pushEnabled, inAppEnabled: !currentValue },
      });
    },
    [updateSettings]
  );

  const categories = settingsData?.categories ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <YStack flex={1} backgroundColor="$background">
        {/* Header */}
        <XStack
          alignItems="center"
          gap="$2"
          paddingHorizontal="$3"
          paddingVertical="$2"
        >
          <Pressable onPress={() => router.back()}>
            <Text size="lg">←</Text>
          </Pressable>
          <Text weight="bold" size="xl">
            Configurações
          </Text>
        </XStack>

        <ScrollView contentContainerStyle={styles.content}>
          {/* DND Section */}
          <YStack gap="$2">
            <Text weight="semibold" size="sm" paddingHorizontal="$3">
              Silenciar
            </Text>
            <DNDSettings />
          </YStack>

          {/* Categories Section */}
          <YStack gap="$2" marginTop="$4">
            <Text weight="semibold" size="sm" paddingHorizontal="$3">
              Categorias
            </Text>

            {categories.map((cat) => (
              <Card key={cat.category} variant="flat">
                <YStack gap="$2" padding="$3">
                  <XStack alignItems="center" gap="$2">
                    <Text size="lg">
                      {CATEGORY_ICONS[cat.category]}
                    </Text>
                    <YStack flex={1}>
                      <Text weight="semibold" size="sm">
                        {cat.label}
                      </Text>
                      <Text color="secondary" size="xs">
                        {cat.description}
                      </Text>
                    </YStack>
                  </XStack>

                  {/* Push toggle */}
                  <XStack
                    alignItems="center"
                    justifyContent="space-between"
                    paddingLeft="$4"
                  >
                    <Text color="secondary" size="xs">
                      Push notifications
                    </Text>
                    <Switch
                      value={cat.pushEnabled}
                      onValueChange={() =>
                        handleTogglePush(cat.category, cat.pushEnabled, cat.inAppEnabled)
                      }
                      trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                      thumbColor="#FFFFFF"
                    />
                  </XStack>

                  {/* In-app toggle */}
                  <XStack
                    alignItems="center"
                    justifyContent="space-between"
                    paddingLeft="$4"
                  >
                    <Text color="secondary" size="xs">
                      No app
                    </Text>
                    <Switch
                      value={cat.inAppEnabled}
                      onValueChange={() =>
                        handleToggleInApp(cat.category, cat.pushEnabled, cat.inAppEnabled)
                      }
                      trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                      thumbColor="#FFFFFF"
                    />
                  </XStack>
                </YStack>
              </Card>
            ))}
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
});
