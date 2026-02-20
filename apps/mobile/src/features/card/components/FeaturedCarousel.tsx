import { memo, useRef, useState } from 'react';
import {
  FlatList,
  View,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Text, SafeImage } from '@ahub/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { useCardTheme } from '../hooks/useCardTheme';
import type { PartnerListItem } from '@ahub/shared/types';

interface FeaturedCarouselProps {
  partners: PartnerListItem[];
  onPress: (partner: PartnerListItem) => void;
}

export const FeaturedCarousel = memo(function FeaturedCarousel({
  partners,
  onPress,
}: FeaturedCarouselProps) {
  const { width } = useWindowDimensions();
  const ct = useCardTheme();
  const cardWidth = width - 48;
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  if (partners.length === 0) return null;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View style={styles.wrapper}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: ct.textPrimary, marginBottom: 12 }}>
        Em Destaque
      </Text>
      <FlatList
        ref={flatListRef}
        data={partners}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + 12}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 0, gap: 12 }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => `featured-${item.id}`}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onPress(item)}
            style={({ pressed }) => [
              styles.card,
              { width: cardWidth },
              pressed && styles.pressed,
            ]}
          >
            {item.bannerUrl ? (
              <SafeImage
                source={{ uri: item.bannerUrl }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
            ) : (
              <LinearGradient
                colors={['#8B5CF6', '#4C1D95']}
                style={StyleSheet.absoluteFill}
              />
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.gradient}
            >
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>EM DESTAQUE</Text>
              </View>
              <Text style={styles.cardName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.cardBenefit} numberOfLines={1}>
                {item.benefit}
              </Text>
            </LinearGradient>
          </Pressable>
        )}
      />

      {/* Pagination dots */}
      {partners.length > 1 && (
        <View style={styles.dots}>
          {partners.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: ct.dotColor },
                i === activeIndex && { backgroundColor: ct.dotActiveColor, width: 18 },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  card: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 40,
  },
  featuredBadge: {
    backgroundColor: '#D97706',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  featuredBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  cardBenefit: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
