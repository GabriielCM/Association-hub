import { YStack } from 'tamagui';
import { Text, Card } from '@ahub/ui';
import QRCode from 'react-native-qrcode-svg';
import type { OrderStatus } from '@ahub/shared/types';

interface PickupInfoProps {
  pickupCode?: string;
  pickupLocation?: string;
  status: OrderStatus;
}

const READY_STATUSES: OrderStatus[] = ['READY', 'COMPLETED'];

export function PickupInfo({ pickupCode, pickupLocation, status }: PickupInfoProps) {
  const isReady = READY_STATUSES.includes(status);

  return (
    <Card variant="flat">
      <YStack gap="$3" alignItems="center">
        <Text weight="semibold" size="sm" alignSelf="flex-start">
          Retirada
        </Text>

        {isReady && pickupCode ? (
          <>
            <QRCode value={pickupCode} size={160} />
            <Text size="xs" color="secondary" align="center">
              Apresente este QR code para retirar seu pedido
            </Text>
          </>
        ) : (
          <Text size="sm" color="secondary" align="center">
            O QR de retirada estara disponivel quando seu pedido estiver pronto
          </Text>
        )}

        {pickupLocation ? (
          <Text size="sm" color="secondary" align="center">
            📍 {pickupLocation}
          </Text>
        ) : null}
      </YStack>
    </Card>
  );
}
