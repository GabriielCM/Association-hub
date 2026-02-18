import { memo } from 'react';
import { Pressable, Image, StyleSheet, useColorScheme } from 'react-native';
import { XStack, YStack, View } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { Globe } from '@ahub/ui/src/icons';
import * as Linking from 'expo-linking';
import { useLinkPreview } from '../hooks/useLinkPreview';

interface LinkPreviewProps {
  text: string;
  isOwn: boolean;
}

export const LinkPreview = memo(function LinkPreview({ text, isOwn }: LinkPreviewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { data, isLoading } = useLinkPreview(text);

  if (isLoading || !data) return null;

  const borderColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const bgColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';

  return (
    <Pressable onPress={() => Linking.openURL(data.url)}>
      <XStack
        borderRadius={10}
        overflow="hidden"
        borderWidth={1}
        borderColor={borderColor}
        backgroundColor={bgColor}
        marginTop="$1"
      >
        {/* Thumbnail */}
        {data.image && (
          <Image
            source={{ uri: data.image }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}

        {/* Content */}
        <YStack flex={1} padding="$1.5" gap="$0.5" justifyContent="center">
          {data.title && (
            <Text
              size="xs"
              weight="semibold"
              numberOfLines={2}
              style={isOwn ? { color: '#FFFFFF' } : undefined}
            >
              {data.title}
            </Text>
          )}
          {data.description && (
            <Text
              size="xs"
              color={isOwn ? undefined : 'secondary'}
              numberOfLines={1}
              style={isOwn ? { color: 'rgba(255,255,255,0.7)' } : undefined}
            >
              {data.description}
            </Text>
          )}
          <XStack alignItems="center" gap="$1">
            <Icon icon={Globe} size={10} color={isOwn ? 'rgba(255,255,255,0.6)' : 'secondary'} />
            <Text
              size="xs"
              color={isOwn ? undefined : 'secondary'}
              style={isOwn ? { color: 'rgba(255,255,255,0.6)', fontSize: 10 } : { fontSize: 10 }}
            >
              {data.domain}
            </Text>
          </XStack>
        </YStack>
      </XStack>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  thumbnail: {
    width: 56,
    height: 56,
  },
});
