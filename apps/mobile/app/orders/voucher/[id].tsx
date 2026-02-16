import { StyleSheet, Pressable } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Heading, Card, Badge } from '@ahub/ui';
import QRCode from 'react-native-qrcode-svg';

const VOUCHER_STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'success' | 'secondary' | 'error' }
> = {
  available: { label: 'Disponivel', variant: 'success' },
  used: { label: 'Usado', variant: 'secondary' },
  expired: { label: 'Expirado', variant: 'error' },
};

export default function VoucherDetailScreen() {
  const { code, qrCode, productName, status, expiresAt, instructions, terms } =
    useLocalSearchParams<{
      id: string;
      code?: string;
      qrCode?: string;
      productName?: string;
      status?: string;
      expiresAt?: string;
      instructions?: string;
      terms?: string;
    }>();

  const statusConfig = VOUCHER_STATUS_CONFIG[status ?? 'available'] ?? {
    label: 'Disponivel',
    variant: 'success' as const,
  };

  const expiresDate = expiresAt
    ? new Date(expiresAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const qrValue = qrCode ?? code ?? '';

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      {/* Header */}
      <XStack paddingHorizontal="$4" paddingVertical="$3" alignItems="center" gap="$3">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text size="lg">←</Text>
        </Pressable>
        <Heading level={4}>Voucher</Heading>
      </XStack>

      <YStack flex={1} padding="$4" gap="$4" alignItems="center">
        {/* QR Code */}
        <Card variant="flat">
          <YStack gap="$4" alignItems="center" padding="$4">
            {qrValue ? (
              <QRCode value={qrValue} size={200} />
            ) : (
              <YStack
                width={200}
                height={200}
                alignItems="center"
                justifyContent="center"
                backgroundColor="#F3F4F6"
                borderRadius={8}
              >
                <Text size="2xl">🎟️</Text>
              </YStack>
            )}

            <Text weight="bold" size="lg" style={styles.code}>
              {code ?? '---'}
            </Text>

            <Badge variant={statusConfig.variant} size="sm">
              {statusConfig.label}
            </Badge>
          </YStack>
        </Card>

        {/* Product info */}
        {productName ? (
          <Card variant="flat">
            <YStack gap="$1">
              <Text size="xs" color="secondary">
                Produto
              </Text>
              <Text weight="semibold" size="sm">
                {productName}
              </Text>
            </YStack>
          </Card>
        ) : null}

        {/* Expiration */}
        {expiresDate && (
          <Card variant="flat">
            <XStack justifyContent="space-between" alignItems="center">
              <Text size="sm" color="secondary">
                Valido ate
              </Text>
              <Text size="sm" weight="medium">
                {expiresDate}
              </Text>
            </XStack>
          </Card>
        )}

        {/* Instructions */}
        {instructions ? (
          <Card variant="flat">
            <YStack gap="$1">
              <Text size="xs" color="secondary">
                Como usar
              </Text>
              <Text size="sm">{instructions}</Text>
            </YStack>
          </Card>
        ) : null}

        {/* Terms */}
        {terms ? (
          <Card variant="flat">
            <YStack gap="$1">
              <Text size="xs" color="secondary">
                Termos e condicoes
              </Text>
              <Text size="xs" color="secondary">
                {terms}
              </Text>
            </YStack>
          </Card>
        ) : null}
      </YStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  code: {
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
});
