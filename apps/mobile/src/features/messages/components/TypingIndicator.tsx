import { useEffect } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { XStack } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { Microphone } from '@ahub/ui/src/icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  FadeInUp,
  FadeOutDown,
} from 'react-native-reanimated';
import { GlassView } from './GlassView';

interface TypingIndicatorProps {
  typingUsers: { id: string; name: string }[];
  recordingUsers?: { id: string; name: string }[];
}

function AnimatedDot({ delay }: { delay: number }) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 300 }),
          withTiming(0.8, { duration: 300 }),
        ),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.3, { duration: 300 }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, scale, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

function DotAnimation() {
  return (
    <XStack gap="$0.5" alignItems="center">
      <AnimatedDot delay={0} />
      <AnimatedDot delay={150} />
      <AnimatedDot delay={300} />
    </XStack>
  );
}

function MicPulse() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 600 }),
        withTiming(1, { duration: 600 }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={style}>
      <Icon icon={Microphone} size={12} color="$primary" />
    </Animated.View>
  );
}

export function TypingIndicator({ typingUsers, recordingUsers = [] }: TypingIndicatorProps) {
  const hasRecording = recordingUsers.length > 0;
  const hasTyping = typingUsers.length > 0;

  if (!hasRecording && !hasTyping) return null;

  return (
    <Animated.View entering={FadeInUp.duration(200)} exiting={FadeOutDown.duration(150)}>
      <XStack paddingHorizontal="$3" paddingVertical="$1">
        <GlassView variant="bubble-other" borderRadius={16}>
          <XStack alignItems="center" gap="$1.5" paddingHorizontal="$3" paddingVertical="$2">
            {hasRecording ? (
              <>
                <MicPulse />
                <Text color="primary" size="xs" style={{ fontStyle: 'italic' }}>
                  {formatRecordingLabel(recordingUsers)}
                </Text>
              </>
            ) : (
              <>
                <DotAnimation />
                <Text color="secondary" size="xs" style={{ fontStyle: 'italic' }}>
                  {formatTypingLabel(typingUsers)}
                </Text>
              </>
            )}
          </XStack>
        </GlassView>
      </XStack>
    </Animated.View>
  );
}

function formatTypingLabel(users: { id: string; name: string }[]): string {
  const names = users.map((u) => u.name.split(' ')[0]);
  if (names.length === 1) return `${names[0]} esta digitando`;
  if (names.length === 2) return `${names[0]} e ${names[1]} estao digitando`;
  return `${names[0]} e mais ${names.length - 1} estao digitando`;
}

function formatRecordingLabel(users: { id: string; name: string }[]): string {
  const names = users.map((u) => u.name.split(' ')[0]);
  if (names.length === 1) return `${names[0]} esta gravando audio`;
  if (names.length === 2) return `${names[0]} e ${names[1]} estao gravando audio`;
  return `${names[0]} e mais ${names.length - 1} gravando audio`;
}

const styles = StyleSheet.create({
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
  },
});
