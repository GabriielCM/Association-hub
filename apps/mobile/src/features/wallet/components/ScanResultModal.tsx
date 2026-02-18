import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';
import { Text, Heading, Avatar } from '@ahub/ui';
import type { PhosphorIcon } from '@ahub/ui';
import { formatPoints } from '@ahub/shared/utils';
import type { QrScanResult } from '@ahub/shared/types';
import { CreditCard, MapPin, PaperPlaneTilt, Storefront, DeviceMobile, Warning } from '@ahub/ui/src/icons';
import { GlassPanel } from './GlassPanel';
import { useWalletTheme } from '../hooks/useWalletTheme';

interface ScanResultModalProps {
  result: QrScanResult | null;
  visible: boolean;
  onClose: () => void;
  onAction?: (result: QrScanResult) => void;
}

const TYPE_LABELS: Record<string, string> = {
  member_card: 'Carteirinha de Membro',
  event_checkin: 'Check-in de Evento',
  user_transfer: 'Transferencia',
  pdv_payment: 'Pagamento PDV',
};

const TYPE_ICONS: Record<string, PhosphorIcon> = {
  member_card: CreditCard,
  event_checkin: MapPin,
  user_transfer: PaperPlaneTilt,
  pdv_payment: Storefront,
};

export function ScanResultModal({
  result,
  visible,
  onClose,
  onAction,
}: ScanResultModalProps) {
  const insets = useSafeAreaInsets();
  const t = useWalletTheme();

  if (!result) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.backdrop}>
          <Pressable style={styles.backdropTouch} onPress={onClose} />
          <View style={[styles.sheet, { backgroundColor: t.sheetBg, borderColor: t.sheetBorder, paddingBottom: insets.bottom + 16 }]}>
            <YStack gap={20} padding={24} alignItems="center">
              <Warning size={48} color={t.error} weight="duotone" />
              <Heading level={4} style={{ color: t.textPrimary }}>Erro</Heading>
              <View style={[styles.errorBadge, { backgroundColor: t.errorBg, borderColor: t.errorBorder }]}>
                <Text style={[styles.errorBadgeText, { color: t.error }]}>Falha na leitura</Text>
              </View>
              <Text style={[styles.secondaryText, { color: t.textSecondary }]}>
                Nao foi possivel processar o QR Code. Tente novamente.
              </Text>
              <Pressable onPress={onClose} style={[styles.outlineButton, { borderColor: t.outlineButtonBorder, backgroundColor: t.inputBg }]}>
                <Text style={[styles.outlineButtonText, { color: t.textSecondary }]}>Fechar</Text>
              </Pressable>
            </YStack>
          </View>
        </View>
      </Modal>
    );
  }

  const TypeIcon = TYPE_ICONS[result.type] ?? DeviceMobile;
  const label = TYPE_LABELS[result.type] ?? result.type;

  const transferData = result.type === 'user_transfer' && result.valid
    ? (result.data as { recipient: { id: string; name: string; username?: string; avatarUrl?: string }; senderBalance: number } | undefined)
    : undefined;

  const memberCardData = result.type === 'member_card' && result.valid && result.data
    ? (result.data as { user: { id: string; name: string; username?: string; avatarUrl?: string }; card: { cardNumber: string } } | undefined)
    : undefined;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouch} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: t.sheetBg, borderColor: t.sheetBorder, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.handle, { backgroundColor: t.sheetHandle }]} />
          <YStack gap={20} padding={24} alignItems="center">
            {transferData ? (
              <>
                <Avatar
                  src={transferData.recipient.avatarUrl}
                  name={transferData.recipient.name}
                  size="xl"
                />
                <YStack alignItems="center" gap={2}>
                  <Heading level={3} style={{ color: t.textPrimary }}>
                    {transferData.recipient.name}
                  </Heading>
                  {transferData.recipient.username && (
                    <Text style={[styles.secondaryText, { color: t.textSecondary }]}>
                      @{transferData.recipient.username}
                    </Text>
                  )}
                </YStack>
                <GlassPanel padding={14} borderRadius={14} blurTint={t.glassBlurTint} intensity={t.glassBlurIntensity} borderColor={t.glassBorder}>
                  <YStack alignItems="center" gap={2}>
                    <Text style={[styles.secondaryText, { color: t.textSecondary }]}>Seu saldo</Text>
                    <Text style={[styles.balanceText, { color: t.textPrimary }]}>
                      {formatPoints(transferData.senderBalance)} pts
                    </Text>
                  </YStack>
                </GlassPanel>
              </>
            ) : memberCardData ? (
              <>
                <Avatar
                  src={memberCardData.user.avatarUrl}
                  name={memberCardData.user.name}
                  size="xl"
                />
                <YStack alignItems="center" gap={2}>
                  <Heading level={3} style={{ color: t.textPrimary }}>
                    {memberCardData.user.name}
                  </Heading>
                  {memberCardData.user.username && (
                    <Text style={[styles.secondaryText, { color: t.textSecondary }]}>
                      @{memberCardData.user.username}
                    </Text>
                  )}
                </YStack>
                <View style={styles.cardInfoRow}>
                  <CreditCard size={18} color={t.textSecondary} />
                  <Text style={[styles.secondaryText, { color: t.textSecondary }]}>
                    {memberCardData.card.cardNumber}
                  </Text>
                </View>
                <View style={[styles.successBadge, { backgroundColor: t.successBg, borderColor: t.successBorder }]}>
                  <Text style={[styles.successBadgeText, { color: t.success }]}>Carteirinha valida</Text>
                </View>
              </>
            ) : (
              <>
                <TypeIcon size={48} color={t.accent} weight="duotone" />
                <Heading level={4} style={{ color: t.textPrimary }}>{label}</Heading>
                {result.valid ? (
                  <View style={[styles.successBadge, { backgroundColor: t.successBg, borderColor: t.successBorder }]}>
                    <Text style={[styles.successBadgeText, { color: t.success }]}>Valido</Text>
                  </View>
                ) : (
                  <YStack gap={8} alignItems="center">
                    <View style={[styles.errorBadge, { backgroundColor: t.errorBg, borderColor: t.errorBorder }]}>
                      <Text style={[styles.errorBadgeText, { color: t.error }]}>Invalido</Text>
                    </View>
                    {result.error && (
                      <Text style={[styles.errorText, { color: t.error }]}>{result.error}</Text>
                    )}
                  </YStack>
                )}
              </>
            )}

            <YStack gap={10} width="100%" marginTop={8}>
              {result.valid && onAction && (
                <Pressable
                  onPress={() => onAction(result)}
                  style={[styles.primaryButton, { backgroundColor: t.primaryButton }]}
                >
                  <Text style={[styles.primaryButtonText, { color: t.primaryButtonText }]}>
                    {transferData || memberCardData ? 'Transferir pontos' : 'Continuar'}
                  </Text>
                </Pressable>
              )}
              <Pressable onPress={onClose} style={[styles.outlineButton, { borderColor: t.outlineButtonBorder, backgroundColor: t.inputBg }]}>
                <Text style={[styles.outlineButtonText, { color: t.textSecondary }]}>
                  {transferData ? 'Cancelar' : 'Fechar'}
                </Text>
              </Pressable>
            </YStack>
          </YStack>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    minHeight: 300,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
  },
  secondaryText: {
    fontSize: 14,
  },
  balanceText: {
    fontSize: 20,
    fontWeight: '700',
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  successBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  successBadgeText: {
    fontWeight: '600',
    fontSize: 14,
  },
  errorBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorBadgeText: {
    fontWeight: '600',
    fontSize: 14,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  outlineButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
