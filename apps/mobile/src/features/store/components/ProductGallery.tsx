import { useState, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Dimensions,
  ViewToken,
  Modal,
  Pressable,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { XStack, View } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { Camera, X } from '@ahub/ui/src/icons';
import { useStoreTheme } from '../hooks/useStoreTheme';
import type { ProductImage } from '@ahub/shared/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.75;

interface ProductGalleryProps {
  images: ProductImage[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const st = useStoreTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

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

  const onFullscreenViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (
        viewableItems.length > 0 &&
        viewableItems[0] != null &&
        viewableItems[0].index != null
      ) {
        setFullscreenIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setFullscreenVisible(true);
  };

  if (images.length === 0) {
    return (
      <View style={[styles.placeholder, { backgroundColor: st.placeholderBg }]}>
        <Icon icon={Camera} size="xl" color="muted" weight="duotone" />
        <Text size="sm" style={{ color: st.textSecondary }}>
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
        renderItem={({ item, index }) => (
          <Pressable onPress={() => openFullscreen(index)}>
            <Image
              source={item.url}
              style={styles.image}
              contentFit="cover"
              transition={200}
              accessible
              accessibilityLabel={item.altText || 'Imagem do produto'}
            />
          </Pressable>
        )}
      />

      {/* Pagination dots */}
      {images.length > 1 && (
        <XStack justifyContent="center" gap="$1" marginTop="$2">
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: st.dotColor },
                index === activeIndex && [styles.dotActive, { backgroundColor: st.dotActiveColor }],
              ]}
            />
          ))}
        </XStack>
      )}

      {/* Fullscreen modal — keeps black bg in both modes */}
      <Modal
        visible={fullscreenVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFullscreenVisible(false)}
      >
        <StatusBar hidden />
        <View style={styles.fullscreenContainer}>
          <Pressable
            onPress={() => setFullscreenVisible(false)}
            style={styles.closeButton}
            hitSlop={12}
          >
            <View style={[styles.closeCircle, { backgroundColor: st.floatingBtnBg }]}>
              <Icon icon={X} size={20} color={st.isDark ? '#FFFFFF' : '#1F2937'} />
            </View>
          </Pressable>

          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => `fs-${item.id}`}
            initialScrollIndex={fullscreenIndex}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onViewableItemsChanged={onFullscreenViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            renderItem={({ item }) => (
              <View style={styles.fullscreenImageContainer}>
                <Image
                  source={item.url}
                  style={styles.fullscreenImage}
                  contentFit="contain"
                  transition={200}
                />
              </View>
            )}
          />

          {images.length > 1 && (
            <View style={styles.fullscreenPagination}>
              <Text size="sm" style={{ color: '#fff' }}>
                {fullscreenIndex + 1} / {images.length}
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    height: IMAGE_HEIGHT,
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
  },
  dotActive: {
    width: 20,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 10,
  },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  fullscreenPagination: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
