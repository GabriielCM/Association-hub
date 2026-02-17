import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
  PanResponder,
  View,
} from 'react-native';
import { YStack, XStack } from 'tamagui';

import { Text, Avatar } from '@ahub/ui';
import Trash from 'phosphor-react-native/src/icons/Trash';
import X from 'phosphor-react-native/src/icons/X';
import { resolveUploadUrl } from '@/config/constants';
import { useUserStories } from '../hooks/useDashboard';
import { useRecordStoryView, useDeleteStory } from '../hooks/useStoryMutations';
import type { StoryResponse, StoryUserListItem } from '@ahub/shared/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5s per story

interface StoryViewerProps {
  visible: boolean;
  userItem: StoryUserListItem | null;
  currentUserId?: string;
  onClose: () => void;
}

export function StoryViewer({
  visible,
  userItem,
  currentUserId,
  onClose,
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const { data: storiesData } = useUserStories(userItem?.user_id ?? '');
  const { mutate: recordView } = useRecordStoryView();
  const { mutate: deleteStoryMut } = useDeleteStory();

  const stories = storiesData?.stories ?? [];
  const currentStory = stories[currentIndex];

  const isOwnStory = currentUserId === userItem?.user_id;

  // Record story view
  useEffect(() => {
    if (currentStory?.id) {
      recordView(currentStory.id);
    }
  }, [currentStory?.id, recordView]);

  // Progress animation
  const startProgress = useCallback(() => {
    progressAnim.setValue(0);
    animRef.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });
    animRef.current.start(({ finished }) => {
      if (finished) {
        // Advance to next story
        if (currentIndex < stories.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          onClose();
        }
      }
    });
  }, [progressAnim, currentIndex, stories.length, onClose]);

  useEffect(() => {
    if (visible && stories.length > 0 && !isPaused) {
      startProgress();
    }
    return () => {
      animRef.current?.stop();
    };
  }, [visible, currentIndex, isPaused, stories.length, startProgress]);

  // Reset when opening
  useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
      setIsPaused(false);
    }
  }, [visible]);

  // Swipe down to close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 20;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          onClose();
        }
      },
    }),
  ).current;

  const handleTapLeft = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleTapRight = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handleLongPressIn = () => {
    setIsPaused(true);
    animRef.current?.stop();
  };

  const handleLongPressOut = () => {
    setIsPaused(false);
  };

  const handleDelete = () => {
    if (currentStory?.id) {
      deleteStoryMut(currentStory.id, {
        onSuccess: () => {
          if (stories.length <= 1) {
            onClose();
          } else if (currentIndex >= stories.length - 1) {
            setCurrentIndex((prev) => prev - 1);
          }
        },
      });
    }
  };

  if (!visible || !userItem || stories.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container} {...panResponder.panHandlers}>
        {/* Story content */}
        {currentStory && (
          <StoryContent story={currentStory} />
        )}

        {/* Progress bars */}
        <YStack style={styles.progressContainer}>
          <XStack gap={4}>
            {stories.map((_, index) => (
              <View key={index} style={styles.progressBarBg}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width:
                        index < currentIndex
                          ? '100%'
                          : index === currentIndex
                            ? progressAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%'],
                              })
                            : '0%',
                    },
                  ]}
                />
              </View>
            ))}
          </XStack>
        </YStack>

        {/* Header */}
        <XStack style={styles.header}>
          <XStack alignItems="center" gap="$2" flex={1}>
            <Avatar
              src={resolveUploadUrl(userItem.avatar_url) || undefined}
              name={userItem.username}
              size="sm"
            />
            <Text style={{ color: '#FFF' }} weight="semibold" size="sm">
              {userItem.username}
            </Text>
            {currentStory && (
              <Text style={{ color: 'rgba(255,255,255,0.7)' }} size="xs">
                {formatTimeAgo(currentStory.created_at)}
              </Text>
            )}
          </XStack>
          <XStack gap="$3" alignItems="center">
            {isOwnStory && (
              <Pressable onPress={handleDelete}>
                <Trash size={24} color="#FFF" />
              </Pressable>
            )}
            <Pressable onPress={onClose}>
              <X size={28} color="#FFF" weight="bold" />
            </Pressable>
          </XStack>
        </XStack>

        {/* Tap zones */}
        <XStack style={styles.tapZones}>
          <Pressable
            style={styles.tapLeft}
            onPress={handleTapLeft}
            onLongPress={handleLongPressIn}
            onPressOut={handleLongPressOut}
          />
          <Pressable
            style={styles.tapRight}
            onPress={handleTapRight}
            onLongPress={handleLongPressIn}
            onPressOut={handleLongPressOut}
          />
        </XStack>
      </View>
    </Modal>
  );
}

function StoryContent({ story }: { story: StoryResponse }) {
  if (story.type === 'TEXT') {
    return (
      <YStack
        style={[
          styles.storyContent,
          { backgroundColor: story.background_color || '#6366F1' },
        ]}
        alignItems="center"
        justifyContent="center"
        padding="$6"
      >
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 24,
            textAlign: 'center',
            lineHeight: 32,
          }}
          weight="semibold"
        >
          {story.text}
        </Text>
      </YStack>
    );
  }

  return (
    <Image
      source={{ uri: resolveUploadUrl(story.url)! }}
      style={styles.storyContent}
      resizeMode="cover"
    />
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  return `${diffH}h`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  storyContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  progressContainer: {
    position: 'absolute',
    top: 50,
    left: 12,
    right: 12,
    zIndex: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  header: {
    position: 'absolute',
    top: 62,
    left: 12,
    right: 12,
    zIndex: 10,
    alignItems: 'center',
  },
  tapZones: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  tapLeft: {
    flex: 1,
  },
  tapRight: {
    flex: 2,
  },
});
