import { useRef, useCallback } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import PagerView, { type PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import * as Haptics from 'expo-haptics';
import { PostsTab } from './PostsTab';
import { BadgesTab } from './BadgesTab';
import { RankingsTab } from './RankingsTab';

interface SwipeableProfileTabsProps {
  userId: string;
  isMe: boolean;
  activeTab: number;
  onPageSelected: (index: number) => void;
}

export function SwipeableProfileTabs({
  userId,
  isMe,
  activeTab,
  onPageSelected,
}: SwipeableProfileTabsProps) {
  const pagerRef = useRef<PagerView>(null);
  const { height: screenHeight } = useWindowDimensions();

  // Minimum height for tab content
  const contentHeight = screenHeight * 0.6;

  const handlePageSelected = useCallback(
    (e: PagerViewOnPageSelectedEvent) => {
      const position = e.nativeEvent.position;
      if (position !== activeTab) {
        Haptics.selectionAsync();
        onPageSelected(position);
      }
    },
    [activeTab, onPageSelected],
  );

  // Sync external tab press with PagerView
  if (pagerRef.current && activeTab !== undefined) {
    pagerRef.current.setPageWithoutAnimation(activeTab);
  }

  return (
    <PagerView
      ref={pagerRef}
      style={[styles.pager, { minHeight: contentHeight }]}
      initialPage={0}
      onPageSelected={handlePageSelected}
      overdrag
    >
      <PostsTab key="posts" userId={userId} />
      <BadgesTab key="badges" userId={userId} isMe={isMe} />
      <RankingsTab key="rankings" userId={userId} />
    </PagerView>
  );
}

const styles = StyleSheet.create({
  pager: {
    flex: 1,
  },
});
