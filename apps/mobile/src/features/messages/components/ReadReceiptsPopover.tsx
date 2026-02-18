import { Pressable, StyleSheet, useColorScheme, ActivityIndicator } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { Text, Avatar } from '@ahub/ui';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { GlassView } from './GlassView';
import { useReadReceipts } from '../hooks/useReadReceipts';
import { formatMessageTime } from '../utils/dateFormatters';

interface ReadReceiptsPopoverProps {
  messageId: string;
  onClose: () => void;
}

export function ReadReceiptsPopover({ messageId, onClose }: ReadReceiptsPopoverProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { data, isLoading } = useReadReceipts(messageId);

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={[
          styles.backdrop,
          { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)' },
        ]}
      />

      <Animated.View
        entering={ZoomIn.springify().damping(20).stiffness(200)}
        exiting={FadeOut.duration(120)}
        style={styles.popoverContainer}
      >
        <Pressable>
          <GlassView variant="menu" borderRadius={16}>
            <YStack padding="$3" gap="$3" minWidth={240} maxHeight={360}>
              {isLoading ? (
                <YStack alignItems="center" padding="$4">
                  <ActivityIndicator />
                </YStack>
              ) : (
                <>
                  {/* Read section */}
                  {data?.read && data.read.length > 0 && (
                    <YStack gap="$2">
                      <Text weight="semibold" size="xs" color="secondary">
                        LIDO POR
                      </Text>
                      {data.read.map((receipt) => (
                        <XStack key={receipt.userId} alignItems="center" gap="$2">
                          <Avatar
                            src={receipt.avatarUrl}
                            name={receipt.name}
                            size="xs"
                          />
                          <YStack flex={1}>
                            <Text size="sm" numberOfLines={1}>
                              {receipt.name}
                            </Text>
                            <Text size="xs" color="secondary">
                              {formatMessageTime(receipt.readAt)}
                            </Text>
                          </YStack>
                        </XStack>
                      ))}
                    </YStack>
                  )}

                  {/* Unread section */}
                  {data?.unread && data.unread.length > 0 && (
                    <YStack gap="$2">
                      <Text weight="semibold" size="xs" color="secondary">
                        NAO LIDO
                      </Text>
                      {data.unread.map((receipt) => (
                        <XStack key={receipt.userId} alignItems="center" gap="$2">
                          <Avatar
                            src={receipt.avatarUrl}
                            name={receipt.name}
                            size="xs"
                          />
                          <Text size="sm" numberOfLines={1} flex={1}>
                            {receipt.name}
                          </Text>
                        </XStack>
                      ))}
                    </YStack>
                  )}

                  {/* Empty state */}
                  {(!data?.read?.length && !data?.unread?.length) && (
                    <Text size="sm" color="secondary" align="center">
                      Nenhuma informacao disponivel
                    </Text>
                  )}
                </>
              )}
            </YStack>
          </GlassView>
        </Pressable>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  popoverContainer: {
    maxWidth: 320,
    width: '80%',
  },
});
