import { FlatList, Pressable } from 'react-native';
import { YStack } from 'tamagui';
import { useRouter } from 'expo-router';

import { Text, Card, Icon } from '@ahub/ui';
import type { PhosphorIcon } from '@ahub/ui';
import {
  CreditCard,
  Wallet,
  Confetti,
  Buildings,
  ClipboardText,
  Package,
  ShoppingCart,
  Star,
  Trophy,
  ChatCircle,
} from '@ahub/ui/src/icons';

interface QuickAccessItem {
  icon: PhosphorIcon;
  title: string;
  route: string;
  badge?: number;
}

const QUICK_ACCESS_ITEMS: QuickAccessItem[] = [
  { icon: CreditCard, title: 'Carteirinha', route: '/card' },
  { icon: Wallet, title: 'Carteira', route: '/wallet' },
  { icon: Confetti, title: 'Eventos', route: '/(tabs)/eventos' },
  { icon: Buildings, title: 'Espacos', route: '/spaces' },
  { icon: ClipboardText, title: 'Reservas', route: '/bookings' },
  { icon: Package, title: 'Pedidos', route: '/orders' },
  { icon: ShoppingCart, title: 'Loja', route: '/store' },
  { icon: Star, title: 'Assinaturas', route: '/subscriptions' },
  { icon: Trophy, title: 'Rankings', route: '/points/rankings' },
  { icon: ChatCircle, title: 'Suporte', route: '/support' },
];

function QuickAccessItemCard({
  item,
  onPress,
}: {
  item: QuickAccessItem;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={{ marginRight: 12 }}>
      <Card variant="elevated" size="sm">
        <YStack
          alignItems="center"
          justifyContent="center"
          width={72}
          height={72}
          gap="$1"
        >
          <Icon icon={item.icon} size="lg" color="primary" />
          <Text size="xs" color="secondary" numberOfLines={1}>
            {item.title}
          </Text>
        </YStack>
      </Card>
    </Pressable>
  );
}

export function QuickAccessCarousel() {
  const router = useRouter();

  return (
    <YStack gap="$2">
      <Text weight="semibold" size="lg">
        Acesso rapido
      </Text>
      <FlatList
        data={QUICK_ACCESS_ITEMS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.route}
        renderItem={({ item }) => (
          <QuickAccessItemCard
            item={item}
            onPress={() => router.push(item.route as any)}
          />
        )}
        contentContainerStyle={{ paddingRight: 16 }}
      />
    </YStack>
  );
}
