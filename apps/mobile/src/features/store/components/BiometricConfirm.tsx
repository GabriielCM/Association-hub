import { useEffect, useState } from 'react';
import { Modal } from 'react-native';
import { YStack } from 'tamagui';
import { Text, Heading, Button } from '@ahub/ui';
import { formatPoints } from '@ahub/shared/utils';
import * as LocalAuthentication from 'expo-local-authentication';

interface BiometricConfirmProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  amount: number;
  description: string;
}

export function BiometricConfirm({
  visible,
  onConfirm,
  onCancel,
  amount,
  description,
}: BiometricConfirmProps) {
  const [biometricAvailable, setBiometricAvailable] = useState<boolean | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      checkBiometric();
    }
  }, [visible]);

  const checkBiometric = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(hasHardware && isEnrolled);

      if (hasHardware && isEnrolled) {
        authenticate();
      }
    } catch {
      setBiometricAvailable(false);
    }
  };

  const authenticate = async () => {
    setError(null);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirmar pagamento',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      if (result.success) {
        onConfirm();
      } else {
        setError('Autenticação cancelada');
      }
    } catch {
      setError('Erro na autenticação biométrica');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <YStack
        flex={1}
        justifyContent="flex-end"
        backgroundColor="rgba(0,0,0,0.4)"
      >
        <YStack
          backgroundColor="$background"
          borderTopLeftRadius={24}
          borderTopRightRadius={24}
          padding="$6"
          gap="$4"
          alignItems="center"
        >
          <Heading level={4}>Confirmar Pagamento</Heading>

          <Text size="sm" color="secondary" align="center">
            {description}
          </Text>

          <Text color="accent" weight="bold" size="xl">
            {formatPoints(amount)} pts
          </Text>

          {error && (
            <Text size="sm" color="error">
              {error}
            </Text>
          )}

          {biometricAvailable === false ? (
            // Fallback: manual confirmation
            <YStack gap="$2" width="100%">
              <Button onPress={onConfirm}>Confirmar pagamento</Button>
              <Button variant="outline" onPress={onCancel}>
                Cancelar
              </Button>
            </YStack>
          ) : (
            <YStack gap="$2" width="100%">
              <Button onPress={authenticate}>
                Confirmar com biometria
              </Button>
              <Button variant="outline" onPress={onCancel}>
                Cancelar
              </Button>
            </YStack>
          )}
        </YStack>
      </YStack>
    </Modal>
  );
}
