import { Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
  type AnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import type { ViewStyle } from 'react-native';
import { Text } from '@ahub/ui';
import { CardGlassView } from '@/features/card/components/CardGlassView';
import * as Haptics from 'expo-haptics';
import { TAB_BAR_HEIGHT } from '../hooks/useProfileAnimations';
import { useProfileTheme } from '../hooks/useProfileTheme';

const TABS = [
  { key: 'posts', label: 'Posts' },
  { key: 'badges', label: 'Badges' },
  { key: 'rankings', label: 'Rankings' },
] as const;

interface StickyGlassTabBarProps {
  activeTab: number;
  onTabPress: (index: number) => void;
  activeTabIndex: SharedValue<number>;
  /** Whether this is the fixed/sticky version (absolute positioned) */
  fixed?: boolean;
  fixedStyle?: AnimatedStyle<ViewStyle>;
  onLayout?: (event: import('react-native').LayoutChangeEvent) => void;
  safeAreaTop?: number;
}

export function StickyGlassTabBar({
  activeTab,
  onTabPress,
  activeTabIndex,
  fixed = false,
  fixedStyle,
  onLayout,
  safeAreaTop = 0,
}: StickyGlassTabBarProps) {
  const { width: screenWidth } = useWindowDimensions();
  const tabWidth = screenWidth / TABS.length;
  const pt = useProfileTheme();

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          activeTabIndex.value,
          [0, 1, 2],
          [0, tabWidth, tabWidth * 2],
        ),
      },
    ],
    width: tabWidth,
  }));

  const handleTabPress = (index: number) => {
    Haptics.selectionAsync();
    onTabPress(index);
  };

  const content = (
    <View style={styles.tabBarInner}>
      {TABS.map((tab, index) => {
        const isActive = activeTab === index;
        return (
          <Pressable
            key={tab.key}
            onPress={() => handleTabPress(index)}
            style={styles.tab}
          >
            <Text
              weight={isActive ? 'semibold' : 'regular'}
              size="sm"
              style={{ color: isActive ? pt.textPrimary : pt.textSecondary }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
      <Animated.View style={[styles.indicator, { backgroundColor: pt.tabIndicator }, indicatorStyle]} />
    </View>
  );

  if (fixed) {
    return (
      <Animated.View
        style={[
          styles.fixedContainer,
          { paddingTop: safeAreaTop },
          fixedStyle,
        ]}
      >
        <CardGlassView intensity={20} tint={pt.glassTint} borderRadius={0}>
          {content}
        </CardGlassView>
      </Animated.View>
    );
  }

  return (
    <View onLayout={onLayout} style={[styles.inlineContainer, { borderBottomColor: pt.tabBorder }]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  fixedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 90,
  },
  inlineContainer: {
    borderBottomWidth: 1,
  },
  tabBarInner: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    position: 'relative',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
});
