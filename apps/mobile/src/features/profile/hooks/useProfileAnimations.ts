import { useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, interpolate, Extrapolation, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const COVER_HEIGHT = 200;
export const AVATAR_SIZE = 120;
export const AVATAR_MINI_SIZE = 32;
export const COLLAPSE_START = 0;
export const COLLAPSE_END = 180;
export const PARALLAX_FACTOR = 0.5;
export const TAB_BAR_HEIGHT = 48;

export function useProfileAnimations() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const tabBarY = useSharedValue(0);
  const activeTabIndex = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Cover parallax: moves at half speed, scales up on pull-down, fades on scroll
  const coverAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: scrollY.value * PARALLAX_FACTOR },
      {
        scale: interpolate(
          scrollY.value,
          [-100, 0],
          [1.5, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
    opacity: interpolate(
      scrollY.value,
      [0, COLLAPSE_END],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  // Avatar: shrinks from 120px to 32px
  const avatarAnimatedStyle = useAnimatedStyle(() => {
    const size = interpolate(
      scrollY.value,
      [COLLAPSE_START, COLLAPSE_END],
      [AVATAR_SIZE, AVATAR_MINI_SIZE],
      Extrapolation.CLAMP,
    );
    return {
      width: size,
      height: size,
      borderRadius: size / 2,
    };
  });

  // Profile info: fades out as user scrolls
  const profileInfoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, COLLAPSE_END * 0.6],
      [1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [{
      scale: interpolate(
        scrollY.value,
        [0, COLLAPSE_END * 0.6],
        [1, 0.95],
        Extrapolation.CLAMP,
      ),
    }],
  }));

  // Collapsed header: fades in when fully collapsed
  const collapsedHeaderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [COLLAPSE_END - 40, COLLAPSE_END],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [{
      translateY: interpolate(
        scrollY.value,
        [COLLAPSE_END - 40, COLLAPSE_END],
        [-10, 0],
        Extrapolation.CLAMP,
      ),
    }],
    pointerEvents: scrollY.value >= COLLAPSE_END - 10 ? 'auto' as const : 'none' as const,
  }));

  // Sticky tab bar: appears when scrolled past tab bar position
  const stickyTabBarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: scrollY.value >= tabBarY.value - insets.top ? 1 : 0,
    pointerEvents: scrollY.value >= tabBarY.value - insets.top ? 'auto' as const : 'none' as const,
  }));

  // Tab indicator: slides between tabs
  const setActiveTab = (index: number) => {
    activeTabIndex.value = withTiming(index, { duration: 250 });
  };

  return {
    scrollY,
    tabBarY,
    activeTabIndex,
    scrollHandler,
    coverAnimatedStyle,
    avatarAnimatedStyle,
    profileInfoAnimatedStyle,
    collapsedHeaderAnimatedStyle,
    stickyTabBarAnimatedStyle,
    setActiveTab,
    insets,
  };
}
