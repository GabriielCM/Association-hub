import { useEffect } from 'react';
import { Modal, StyleSheet } from 'react-native';
import { YStack } from 'tamagui';
import { Text, Heading, Button, Icon } from '@ahub/ui';
import { Trophy, Confetti, Medal } from '@ahub/ui/src/icons';
import { useCheckinCelebration, useEventsStore } from '@/stores/events.store';

export function CelebrationOverlay() {
  const celebration = useCheckinCelebration();
  const hideCelebration = useEventsStore((s) => s.hideCheckinCelebration);

  useEffect(() => {
    if (celebration.visible) {
      const timer = setTimeout(hideCelebration, 5000);
      return () => clearTimeout(timer);
    }
  }, [celebration.visible, hideCelebration]);

  if (!celebration.visible) return null;

  return (
    <Modal
      visible={celebration.visible}
      transparent
      animationType="fade"
      onRequestClose={hideCelebration}
    >
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        style={styles.overlay}
      >
        <YStack
          backgroundColor="$surface"
          borderRadius="$lg"
          padding="$6"
          gap="$4"
          alignItems="center"
          width="85%"
          maxWidth={340}
        >
          <Icon
            icon={celebration.badgeAwarded ? Trophy : Confetti}
            size={64}
            color={celebration.badgeAwarded ? 'warning' : 'primary'}
            weight="duotone"
          />

          <Heading level={3}>Check-in realizado!</Heading>

          <Heading level={2} color="accent">
            +{celebration.pointsAwarded} pontos
          </Heading>

          <Text color="secondary" align="center">
            {celebration.progress.completed} de{' '}
            {celebration.progress.total} check-ins completos
          </Text>

          {celebration.badgeAwarded && (
            <YStack
              backgroundColor="$backgroundHover"
              borderRadius="$md"
              padding="$3"
              alignItems="center"
            >
              <Icon icon={Medal} size="lg" color="warning" weight="fill" />
              <Text weight="bold" size="sm">
                Badge conquistado!
              </Text>
            </YStack>
          )}

          <Button
            variant="primary"
            size="md"
            fullWidth
            onPress={hideCelebration}
          >
            Fechar
          </Button>
        </YStack>
      </YStack>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
});
