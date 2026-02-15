import { useState, useCallback } from 'react';
import { FlatList, StyleSheet, Dimensions, ViewToken, Image } from 'react-native';
import { XStack, View } from 'tamagui';
import { Text } from '@ahub/ui';
import type { ProductImage } from '@ahub/shared/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.75;

interface ProductGalleryProps {
  images: ProductImage[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (
        viewableItems.length > 0 &&
        viewableItems[0] != null &&
        viewableItems[0].index != null
      ) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  if (images.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Text size="2xl">📷</Text>
        <Text color="secondary" size="sm">
          Sem imagens
        </Text>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.url }}
            style={styles.image}
            resizeMode="cover"
            accessible
            accessibilityLabel={item.altText || 'Imagem do produto'}
          />
        )}
      />

      {/* Pagination dots */}
      {images.length > 1 && (
        <XStack justifyContent="center" gap="$1" marginTop="$2">
          {images.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </XStack>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    height: IMAGE_HEIGHT,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  image: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    backgroundColor: '#7C3AED',
    width: 20,
  },
});
