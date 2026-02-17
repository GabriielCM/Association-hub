import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import { XStack } from 'tamagui';
import { Text, Avatar, Icon } from '@ahub/ui';
import { PROFILE_ICONS } from '@ahub/ui/src/icons';
import { CardGlassView } from '@/features/card/components/CardGlassView';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CollapsedHeaderProps {
  name: string;
  avatarUrl?: string | undefined;
  animatedStyle: AnimatedStyle<ViewStyle>;
  isMe: boolean;
}

export function CollapsedHeader({
  name,
  avatarUrl,
  animatedStyle,
  isMe,
}: CollapsedHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingTop: insets.top },
        animatedStyle,
      ]}
    >
      <CardGlassView intensity={20} tint="light" borderRadius={0}>
        <XStack
          paddingHorizontal="$3"
          paddingVertical="$2"
          alignItems="center"
          gap="$3"
        >
          {!isMe && (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Icon icon={PROFILE_ICONS.back} size="md" color="inherit" />
            </Pressable>
          )}

          <Avatar src={avatarUrl} name={name} size="xs" />
          <Text weight="semibold" size="base" numberOfLines={1} style={{ flex: 1 }}>
            {name}
          </Text>

          {isMe && (
            <XStack gap="$1">
              <Pressable
                onPress={() => router.push('/messages')}
                style={styles.iconButton}
              >
                <Icon icon={PROFILE_ICONS.messages} size="sm" color="inherit" />
              </Pressable>
              <Pressable
                onPress={() => router.push('/profile/settings')}
                style={styles.iconButton}
              >
                <Icon icon={PROFILE_ICONS.settings} size="sm" color="inherit" />
              </Pressable>
            </XStack>
          )}
        </XStack>
      </CardGlassView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  backButton: {
    padding: 4,
  },
  iconButton: {
    padding: 6,
  },
});
