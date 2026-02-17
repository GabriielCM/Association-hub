import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { XStack } from 'tamagui';
import { Text } from '@ahub/ui';
import Microphone from 'phosphor-react-native/src/icons/Microphone';

interface TypingIndicatorProps {
  typingUsers: { id: string; name: string }[];
  recordingUsers?: { id: string; name: string }[];
}

function DotAnimation() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );

    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 150);
    const a3 = animate(dot3, 300);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <XStack gap="$0.5" alignItems="center">
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              opacity: dot.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
              transform: [
                {
                  scale: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </XStack>
  );
}

function MicPulse() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  return (
    <Animated.View style={{ opacity: pulse }}>
      <Microphone size={12} color="#8B5CF6" />
    </Animated.View>
  );
}

export function TypingIndicator({ typingUsers, recordingUsers = [] }: TypingIndicatorProps) {
  const hasRecording = recordingUsers.length > 0;
  const hasTyping = typingUsers.length > 0;

  if (!hasRecording && !hasTyping) return null;

  return (
    <>
      {hasRecording && (
        <XStack
          alignItems="center"
          gap="$1"
          paddingHorizontal="$3"
          paddingVertical="$1"
        >
          <MicPulse />
          <Text color="primary" size="xs" style={{ fontStyle: 'italic' }}>
            {formatRecordingLabel(recordingUsers)}
          </Text>
        </XStack>
      )}
      {hasTyping && (
        <XStack
          alignItems="center"
          gap="$1"
          paddingHorizontal="$3"
          paddingVertical="$1"
        >
          <DotAnimation />
          <Text color="secondary" size="xs" style={{ fontStyle: 'italic' }}>
            {formatTypingLabel(typingUsers)}
          </Text>
        </XStack>
      )}
    </>
  );
}

function formatTypingLabel(users: { id: string; name: string }[]): string {
  const names = users.map((u) => u.name.split(' ')[0]);
  if (names.length === 1) return `${names[0]} está digitando`;
  if (names.length === 2) return `${names[0]} e ${names[1]} estão digitando`;
  return `${names[0]} e mais ${names.length - 1} estão digitando`;
}

function formatRecordingLabel(users: { id: string; name: string }[]): string {
  const names = users.map((u) => u.name.split(' ')[0]);
  if (names.length === 1) return `${names[0]} está gravando áudio`;
  if (names.length === 2) return `${names[0]} e ${names[1]} estão gravando áudio`;
  return `${names[0]} e mais ${names.length - 1} gravando áudio`;
}

const styles = StyleSheet.create({
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
  },
});
