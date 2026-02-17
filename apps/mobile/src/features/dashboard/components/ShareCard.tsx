import { forwardRef } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '@ahub/ui';

interface ShareCardProps {
  imageUrl?: string | null | undefined;
  description?: string | null | undefined;
  authorName: string;
}

const CARD_SIZE = 400;
const IMAGE_SIZE = CARD_SIZE - 48;

export const ShareCard = forwardRef<View, ShareCardProps>(
  function ShareCard({ imageUrl, description, authorName }, ref) {
    return (
      <View
        ref={ref}
        collapsable={false}
        style={styles.wrapper}
      >
        <LinearGradient
          colors={['#8B5CF6', '#06B6D4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          )}

          {description && (
            <Text
              size="sm"
              color="white"
              numberOfLines={2}
              style={styles.description}
            >
              {description}
            </Text>
          )}

          <View style={styles.footer}>
            <Text weight="bold" size="sm" color="white">
              A-hub
            </Text>
            <Text size="xs" color="white" style={{ opacity: 0.7 }}>
              por {authorName}
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    width: CARD_SIZE,
    height: CARD_SIZE + 80,
  },
  gradient: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
  },
  description: {
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
