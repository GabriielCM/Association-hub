import { memo, useCallback, useEffect } from 'react';
import { Pressable, View, StyleSheet, useColorScheme } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text, Avatar, Icon, SafeImage } from '@ahub/ui';
import { Tag, MapPin, Lock, BookmarkSimple } from '@ahub/ui/src/icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import type { PartnerListItem } from '@ahub/shared/types';

interface PartnerBigCardProps {
  partner: PartnerListItem;
  onPress: (partner: PartnerListItem) => void;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
  distance?: string;
}

export const PartnerBigCard = memo(function PartnerBigCard({
  partner,
  onPress,
  onBookmark,
  isBookmarked = false,
  distance,
}: PartnerBigCardProps) {
  const isLocked = !partner.isEligible;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Fade-in on mount
  const fadeOpacity = useSharedValue(0);
  const fadeTranslateY = useSharedValue(12);

  useEffect(() => {
    fadeOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
    fadeTranslateY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
  }, [fadeOpacity, fadeTranslateY]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeOpacity.value,
    transform: [{ translateY: fadeTranslateY.value }],
  }));

  // Bookmark bounce
  const bookmarkScale = useSharedValue(1);

  const handlePress = useCallback(() => onPress(partner), [onPress, partner]);
  const handleBookmark = useCallback(() => {
    bookmarkScale.value = withSequence(
      withSpring(1.4, { damping: 6, stiffness: 300 }),
      withSpring(1, { damping: 8, stiffness: 200 }),
    );
    onBookmark?.(partner.id);
  }, [onBookmark, partner.id, bookmarkScale]);

  const bookmarkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookmarkScale.value }],
  }));

  return (
    <Animated.View style={fadeStyle}>
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        isDark && styles.containerDark,
        pressed && styles.pressed,
      ]}
    >
      {/* Banner Image */}
      <View style={styles.bannerContainer}>
        {partner.bannerUrl ? (
          <SafeImage
            source={{ uri: partner.bannerUrl }}
            style={styles.banner}
            contentFit="cover"
          />
        ) : (
          <LinearGradient
            colors={['#8B5CF6', '#6D28D9']}
            style={styles.banner}
          />
        )}

        {/* Lock overlay for non-eligible */}
        {isLocked && (
          <View style={styles.lockOverlay}>
            <Icon icon={Lock} size="lg" color="#fff" weight="fill" />
          </View>
        )}

        {/* Logo overlay */}
        <View style={styles.logoOverlay}>
          <Avatar
            src={partner.logoUrl}
            name={partner.name}
            size="lg"
            style={styles.logo}
          />
        </View>

        {/* Badges */}
        <View style={styles.badgeRow}>
          {partner.isNew && partner.isEligible && (
            <View style={[styles.badge, styles.badgeNew]}>
              <Text style={styles.badgeText}>NOVO</Text>
            </View>
          )}
          {!partner.isEligible && (
            <View style={[styles.badge, styles.badgeExclusive]}>
              <Text style={styles.badgeText}>EXCLUSIVO</Text>
            </View>
          )}
          {partner.popularity != null && partner.popularity >= 10 && partner.isEligible && (
            <View style={[styles.badge, styles.badgePopular]}>
              <Text style={styles.badgeText}>POPULAR</Text>
            </View>
          )}
        </View>

        {/* Bookmark */}
        {onBookmark && (
          <Animated.View style={[styles.bookmarkBtn, bookmarkAnimStyle]}>
            <Pressable onPress={handleBookmark} hitSlop={12} style={styles.bookmarkInner}>
              <Icon
                icon={BookmarkSimple}
                size="sm"
                color={isBookmarked ? '#8B5CF6' : '#fff'}
                weight={isBookmarked ? 'fill' : 'regular'}
              />
            </Pressable>
          </Animated.View>
        )}
      </View>

      {/* Info section */}
      <YStack padding={14} gap={4} style={isLocked && styles.lockedContent}>
        <Text
          style={[styles.name, isDark && styles.nameDark]}
          numberOfLines={1}
        >
          {partner.name}
        </Text>

        <Text
          style={[styles.benefit, isDark && styles.benefitDark]}
          numberOfLines={2}
        >
          {partner.benefit}
        </Text>

        <XStack alignItems="center" gap={6} marginTop={2}>
          {partner.category.icon ? (
            <Text style={{ fontSize: 12 }}>{partner.category.icon}</Text>
          ) : (
            <Icon icon={Tag} size={12} color={isDark ? '#9CA3AF' : '#6B7280'} />
          )}
          <Text style={[styles.meta, isDark && styles.metaDark]}>
            {partner.category.name}
          </Text>
          {distance && (
            <>
              <Text style={[styles.meta, isDark && styles.metaDark]}> · </Text>
              <Icon icon={MapPin} size={12} color="#8B5CF6" />
              <Text style={styles.distance}>{distance}</Text>
            </>
          )}
          {!distance && partner.city && (
            <Text style={[styles.meta, isDark && styles.metaDark]}>
              · {partner.city}
            </Text>
          )}
        </XStack>
      </YStack>
    </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  containerDark: {
    backgroundColor: '#1F1F1F',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  bannerContainer: {
    position: 'relative',
    aspectRatio: 16 / 9,
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoOverlay: {
    position: 'absolute',
    bottom: -20,
    left: 14,
  },
  logo: {
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 12,
  },
  badgeRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeNew: {
    backgroundColor: '#8B5CF6',
  },
  badgeExclusive: {
    backgroundColor: '#D97706',
  },
  badgePopular: {
    backgroundColor: '#3B82F6',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  bookmarkBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bookmarkInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedContent: {
    opacity: 0.5,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 6,
  },
  nameDark: {
    color: '#F3F4F6',
  },
  benefit: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  benefitDark: {
    color: '#9CA3AF',
  },
  meta: {
    fontSize: 12,
    color: '#6B7280',
  },
  metaDark: {
    color: '#9CA3AF',
  },
  distance: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
});
