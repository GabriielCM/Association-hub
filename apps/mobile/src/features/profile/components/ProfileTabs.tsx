import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Text } from '@ahub/ui';
import { PostsTab } from './PostsTab';
import { BadgesTab } from './BadgesTab';
import { RankingsTab } from './RankingsTab';

type TabKey = 'posts' | 'badges' | 'rankings';

interface Tab {
  key: TabKey;
  label: string;
}

const TABS: Tab[] = [
  { key: 'posts', label: 'Posts' },
  { key: 'badges', label: 'Badges' },
  { key: 'rankings', label: 'Rankings' },
];

interface ProfileTabsProps {
  userId: string;
  isMe: boolean;
}

export function ProfileTabs({ userId, isMe }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('posts');

  return (
    <YStack>
      {/* Tab Bar */}
      <XStack borderBottomWidth={1} borderBottomColor="$borderColor">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={styles.tab}
            >
              <Text
                weight={isActive ? 'semibold' : 'regular'}
                size="sm"
                color={isActive ? 'primary' : 'secondary'}
                style={styles.tabLabel}
              >
                {tab.label}
              </Text>
              {isActive && <YStack style={styles.activeIndicator} />}
            </Pressable>
          );
        })}
      </XStack>

      {/* Tab Content */}
      <YStack paddingHorizontal="$2" minHeight={200}>
        {activeTab === 'posts' && <PostsTab userId={userId} />}
        {activeTab === 'badges' && <BadgesTab userId={userId} isMe={isMe} />}
        {activeTab === 'rankings' && <RankingsTab userId={userId} />}
      </YStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabLabel: {
    textAlign: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#8B5CF6',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
});
