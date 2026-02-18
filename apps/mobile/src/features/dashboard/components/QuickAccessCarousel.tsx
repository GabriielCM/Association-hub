import { FlatList, Pressable, Dimensions } from 'react-native';
import { YStack } from 'tamagui';
import { useRouter } from 'expo-router';

import { Text, Card, Icon } from '@ahub/ui';
import type { PhosphorIcon } from '@ahub/ui';
import { useDashboardTheme } from '../hooks/useDashboardTheme';
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

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = 32; // $4 each side
const ITEM_GAP = 12;
const ITEM_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - ITEM_GAP * 3) / 3.5;

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
  const dt = useDashboardTheme();

  return (
    <Pressable onPress={onPress} style={{ marginRight: ITEM_GAP }}>
      <Card
        variant="elevated"
        size="sm"
        {...(dt.cardBg ? { backgroundColor: dt.cardBg, borderWidth: 1, borderColor: dt.cardBorder, shadowOpacity: 0 } : {})}
      >
        <YStack
          alignItems="center"
          justifyContent="center"
          width={ITEM_WIDTH}
          height={ITEM_WIDTH}
          gap="$1"
        >
          <Icon icon={item.icon} size="lg" color={dt.iconColor ?? 'primary'} />
          <Text size="xs" numberOfLines={1} style={{ color: dt.textSecondary }}>
            {item.title}
          </Text>
        </YStack>
      </Card>
    </Pressable>
  );
}

export function QuickAccessCarousel() {
  const router = useRouter();
  const dt = useDashboardTheme();

  return (
    <YStack gap="$2">
      <Text weight="semibold" size="lg" style={{ color: dt.textPrimary }}>
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
