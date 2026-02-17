import { YStack, XStack } from 'tamagui';
import { Text, Card, Icon } from '@ahub/ui';
import { MapPin } from '@ahub/ui/src/icons';
import QRCode from 'react-native-qrcode-svg';
import type { OrderStatus } from '@ahub/shared/types';

interface PickupInfoProps {
  pickupCode?: string | undefined;
  pickupLocation?: string | undefined;
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
          <XStack alignItems="center" gap="$1">
            <Icon icon={MapPin} size="sm" color="secondary" />
            <Text size="sm" color="secondary">
              {pickupLocation}
            </Text>
          </XStack>
        ) : null}
      </YStack>
    </Card>
  );
}
