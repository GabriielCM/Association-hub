import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { XStack } from 'tamagui';
import { Text } from '@ahub/ui';

interface TypingIndicatorProps {
  typingUsers: { id: string; name: string }[];
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

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u.name.split(' ')[0]);
  let label: string;

  if (names.length === 1) {
    label = `${names[0]} está digitando`;
  } else if (names.length === 2) {
    label = `${names[0]} e ${names[1]} estão digitando`;
  } else {
    label = `${names[0]} e mais ${names.length - 1} estão digitando`;
  }

  return (
    <XStack
      alignItems="center"
      gap="$1"
      paddingHorizontal="$3"
      paddingVertical="$1"
    >
      <DotAnimation />
      <Text color="secondary" size="xs" style={{ fontStyle: 'italic' }}>
        {label}
      </Text>
    </XStack>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
  },
});
