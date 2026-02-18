import { Pressable, StyleSheet, View } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Text } from '@ahub/ui';
import { formatPoints } from '@ahub/shared/utils';
import { TRANSACTION_ICONS } from '@ahub/ui/src/icons';
import type { PointTransaction } from '@ahub/shared/types';
import { useWalletTheme } from '../hooks/useWalletTheme';

interface GlassTransactionItemProps {
  transaction: PointTransaction;
  onPress?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  EVENT_CHECKIN: '#8B5CF6',
  STRAVA_RUN: '#FC4C02',
  STRAVA_RIDE: '#FC4C02',
  STRAVA_WALK: '#FC4C02',
  STRAVA_SWIM: '#FC4C02',
  STRAVA_HIKE: '#FC4C02',
  DAILY_POST: '#3B82F6',
  PURCHASE_POINTS: '#22D3EE',
  PURCHASE_PIX: '#22D3EE',
  CASHBACK: '#4ADE80',
  TRANSFER_IN: '#4ADE80',
  TRANSFER_OUT: '#F87171',
  ADMIN_CREDIT: '#4ADE80',
  ADMIN_DEBIT: '#F87171',
  REFUND: '#F59E0B',
  SUBSCRIPTION_BONUS: '#A78BFA',
  REFERRAL: '#EC4899',
  MANUAL_ADJUSTMENT: '#6B7280',
  DEFAULT: '#8B5CF6',
};

function formatRelativeDate(dateStr: string | Date): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins}min atras`;
  if (diffHours < 24) return `${diffHours}h atras`;
  if (diffDays < 7) return `${diffDays}d atras`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function GlassTransactionItem({ transaction, onPress }: GlassTransactionItemProps) {
  const source = (transaction as any).source ?? (transaction as any).type ?? 'DEFAULT';
  const IconComponent = TRANSACTION_ICONS[source as keyof typeof TRANSACTION_ICONS] ?? TRANSACTION_ICONS.DEFAULT;
  const iconColor = CATEGORY_COLORS[source] ?? CATEGORY_COLORS.DEFAULT;
  const isCredit = transaction.amount > 0;
  const label = (transaction as any).description ?? (transaction as any).label ?? source;
  const t = useWalletTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.7 },
      ]}
    >
      <XStack alignItems="center" gap={12}>
        {/* Category icon */}
        <View style={[styles.iconCircle, { backgroundColor: `${iconColor}15` }]}>
          <IconComponent size={20} color={iconColor} weight="fill" />
        </View>

        {/* Info */}
        <YStack flex={1}>
          <Text style={[styles.title, { color: t.textPrimary }]} numberOfLines={1}>
            {label}
          </Text>
          <Text style={[styles.date, { color: t.textTertiary }]}>
            {formatRelativeDate(transaction.createdAt)}
          </Text>
        </YStack>

        {/* Amount */}
        <Text style={[styles.amount, { color: isCredit ? '#4ADE80' : '#F87171' }]}>
          {isCredit ? '+' : ''}{formatPoints(Math.abs(transaction.amount))}
        </Text>
      </XStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  date: {
    fontSize: 11,
    marginTop: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
});
