import { useState } from 'react';
import { Keyboard, TouchableWithoutFeedback, Pressable, StyleSheet, View, TextInput } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { Text } from '@ahub/ui';
import { formatPoints } from '@ahub/shared/utils';
import { useBalance } from '../hooks/usePoints';
import { useWalletTheme } from '@/features/wallet/hooks/useWalletTheme';
import * as Haptics from 'expo-haptics';

interface TransferFormProps {
  onSubmit: (amount: number, message: string) => void;
  onBack: () => void;
  recipientName: string;
}

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000];

export function TransferForm({ onSubmit, onBack, recipientName }: TransferFormProps) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { data: balance } = useBalance();
  const t = useWalletTheme();

  const numericAmount = parseInt(amount, 10) || 0;
  const currentBalance = balance?.balance ?? 0;
  const balanceAfter = currentBalance - numericAmount;
  const isValid = numericAmount > 0 && numericAmount <= currentBalance;

  const handleSubmit = () => {
    if (!isValid) {
      setError(
        numericAmount <= 0
          ? 'Digite um valor maior que zero'
          : 'Saldo insuficiente',
      );
      return;
    }
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSubmit(numericAmount, message);
  };

  const handleQuickAmount = (val: number) => {
    Haptics.selectionAsync();
    setAmount(String(val));
    setError('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <YStack gap={20} flex={1}>
        {/* Recipient */}
        <View style={[styles.recipientCard, { backgroundColor: t.inputBg, borderColor: t.inputBorder }]}>
          <XStack alignItems="center" justifyContent="space-between">
            <Text style={[styles.labelText, { color: t.textTertiary }]}>Destinatario</Text>
            <Text style={[styles.recipientName, { color: t.textPrimary }]}>{recipientName}</Text>
          </XStack>
        </View>

        {/* Amount Input */}
        <YStack alignItems="center" gap={8}>
          <Text style={[styles.labelText, { color: t.textTertiary }]}>Quantidade de pontos</Text>
          <XStack alignItems="baseline" gap={4}>
            <TextInput
              value={amount}
              onChangeText={(text) => {
                setAmount(text.replace(/\D/g, ''));
                setError('');
              }}
              placeholder="0"
              placeholderTextColor={t.inputPlaceholder}
              keyboardType="numeric"
              style={[styles.amountInput, { color: t.textPrimary }]}
              textAlign="center"
            />
            <Text style={[styles.amountSuffix, { color: t.textTertiary }]}>pts</Text>
          </XStack>
          {error ? (
            <Text style={[styles.errorText, { color: t.error }]}>{error}</Text>
          ) : (
            <Text style={[styles.balanceText, { color: t.textTertiary }]}>
              Saldo: {formatPoints(currentBalance)} pts
            </Text>
          )}
        </YStack>

        {/* Quick Amount Pills */}
        <XStack flexWrap="wrap" gap={8} justifyContent="center">
          {QUICK_AMOUNTS.map((val) => (
            <Pressable
              key={val}
              onPress={() => handleQuickAmount(val)}
              style={[
                styles.quickPill,
                { borderColor: t.inputBorder },
                numericAmount === val && { borderColor: t.accentBorder, backgroundColor: t.accentBg },
              ]}
            >
              <Text
                style={[
                  styles.quickPillText,
                  { color: t.textTertiary },
                  numericAmount === val && { color: t.accent },
                ]}
              >
                {val}
              </Text>
            </Pressable>
          ))}
        </XStack>

        {/* Balance Preview */}
        {numericAmount > 0 && (
          <View style={[styles.previewCard, { backgroundColor: t.inputBg, borderColor: t.inputBorder }]}>
            <XStack justifyContent="space-between" marginBottom={8}>
              <Text style={[styles.previewLabel, { color: t.textTertiary }]}>Transferindo</Text>
              <Text style={[styles.previewDebit, { color: t.spent }]}>-{formatPoints(numericAmount)} pts</Text>
            </XStack>
            <View style={[styles.previewDivider, { backgroundColor: t.separatorColor }]} />
            <XStack justifyContent="space-between" marginTop={8}>
              <Text style={[styles.previewLabel, { color: t.textTertiary }]}>Saldo apos</Text>
              <Text
                style={[
                  styles.previewAfter,
                  { color: t.textPrimary },
                  balanceAfter < 0 && { color: t.error },
                ]}
              >
                {formatPoints(balanceAfter)} pts
              </Text>
            </XStack>
          </View>
        )}

        {/* Message */}
        <YStack gap={6}>
          <Text style={[styles.labelText, { color: t.textTertiary }]}>Mensagem (opcional)</Text>
          <View style={[styles.messageContainer, { backgroundColor: t.inputBg, borderColor: t.inputBorder }]}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Ex: Parabens!"
              placeholderTextColor={t.inputPlaceholder}
              style={[styles.messageInput, { color: t.textPrimary }]}
              maxLength={100}
            />
          </View>
          <Text style={[styles.charCount, { color: t.textTertiary }]}>{message.length}/100</Text>
        </YStack>

        {/* Actions */}
        <YStack gap={10} marginTop="auto">
          <Pressable
            onPress={handleSubmit}
            disabled={!isValid}
            style={[
              styles.continueButton,
              { backgroundColor: t.primaryButton },
              !isValid && { opacity: 0.4 },
            ]}
          >
            <Text style={[styles.continueText, { color: t.primaryButtonText }]}>Continuar</Text>
          </Pressable>
          <Pressable onPress={onBack} style={[styles.backButton, { borderColor: t.outlineButtonBorder }]}>
            <Text style={[styles.backText, { color: t.outlineButtonText }]}>Voltar</Text>
          </Pressable>
        </YStack>
      </YStack>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  recipientCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '500',
  },
  recipientName: {
    fontSize: 15,
    fontWeight: '600',
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    minWidth: 60,
    padding: 0,
  },
  amountSuffix: {
    fontSize: 20,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
  },
  balanceText: {
    fontSize: 13,
  },
  quickPill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  quickPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  previewLabel: {
    fontSize: 13,
  },
  previewDebit: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewDivider: {
    height: 1,
  },
  previewAfter: {
    fontSize: 14,
    fontWeight: '700',
  },
  messageContainer: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageInput: {
    fontSize: 15,
    padding: 0,
  },
  charCount: {
    fontSize: 11,
    textAlign: 'right',
  },
  continueButton: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueText: {
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
