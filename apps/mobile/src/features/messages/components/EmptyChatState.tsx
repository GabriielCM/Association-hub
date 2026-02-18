import { useCallback } from 'react';
import { Pressable, useColorScheme } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { ChatCircle } from '@ahub/ui/src/icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GlassView } from './GlassView';

const ICE_BREAKERS = [
  'Ola! Tudo bem?',
  'E ai, como vai?',
  'Oi! Bora conversar?',
];

interface EmptyChatStateProps {
  onIceBreaker: (text: string) => void;
  participantName?: string;
}

export function EmptyChatState({ onIceBreaker, participantName }: EmptyChatStateProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleIceBreaker = useCallback(
    (text: string) => {
      onIceBreaker(text);
    },
    [onIceBreaker]
  );

  return (
    <Animated.View entering={FadeInUp.delay(200).duration(400)}>
      <YStack
        alignItems="center"
        justifyContent="center"
        padding="$6"
        gap="$4"
      >
        {/* Icon */}
        <YStack
          width={80}
          height={80}
          borderRadius="$full"
          backgroundColor={isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.10)'}
          alignItems="center"
          justifyContent="center"
        >
          <Icon icon={ChatCircle} size={40} color="$primary" weight="duotone" />
        </YStack>

        {/* Message */}
        <YStack alignItems="center" gap="$1">
          <Text weight="semibold" size="md" align="center">
            {participantName
              ? `Inicie uma conversa com ${participantName}!`
              : 'Envie a primeira mensagem!'}
          </Text>
          <Text color="secondary" size="sm" align="center">
            Quebre o gelo com uma das sugestoes abaixo
          </Text>
        </YStack>

        {/* Ice breaker chips */}
        <XStack flexWrap="wrap" justifyContent="center" gap="$2">
          {ICE_BREAKERS.map((text) => (
            <Pressable key={text} onPress={() => handleIceBreaker(text)}>
              <GlassView variant="chip" borderRadius={9999}>
                <XStack paddingHorizontal="$3" paddingVertical="$2">
                  <Text size="sm" color="primary" weight="medium">
                    {text}
                  </Text>
                </XStack>
              </GlassView>
            </Pressable>
          ))}
        </XStack>
      </YStack>
    </Animated.View>
  );
}
