import { useState } from 'react';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { YStack, XStack } from 'tamagui';

import { Text, Heading, Input, Button, Card } from '@ahub/ui';
import { formatPoints } from '@ahub/shared/utils';
import { useBalance } from '../hooks/usePoints';

interface TransferFormProps {
  onSubmit: (amount: number, message: string) => void;
  onBack: () => void;
  recipientName: string;
}

export function TransferForm({ onSubmit, onBack, recipientName }: TransferFormProps) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { data: balance } = useBalance();

  const numericAmount = parseInt(amount, 10) || 0;
  const currentBalance = balance?.balance ?? 0;
  const balanceAfter = currentBalance - numericAmount;
  const isValid = numericAmount > 0 && numericAmount <= currentBalance;

  const handleSubmit = () => {
    if (!isValid) {
      setError(
        numericAmount <= 0
          ? 'Digite um valor maior que zero'
          : 'Saldo insuficiente'
      );
      return;
    }
    setError('');
    onSubmit(numericAmount, message);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <YStack gap="$4" flex={1}>
      <Card variant="flat">
        <XStack alignItems="center" justifyContent="space-between">
          <Text color="secondary" size="sm">Destinatario</Text>
          <Text weight="semibold">{recipientName}</Text>
        </XStack>
      </Card>

      <YStack gap="$2">
        <Text weight="semibold">Quantidade de pontos</Text>
        <Input
          placeholder="0"
          keyboardType="numeric"
          value={amount}
          onChangeText={(text: string) => {
            setAmount(text.replace(/\D/g, ''));
            setError('');
          }}
          size="lg"
        />
        {error ? (
          <Text color="error" size="xs">{error}</Text>
        ) : (
          <Text color="secondary" size="xs">
            Saldo disponivel: {formatPoints(currentBalance)} pts
          </Text>
        )}
      </YStack>

      {numericAmount > 0 && (
        <Card variant="flat">
          <YStack gap="$1">
            <XStack justifyContent="space-between">
              <Text color="secondary" size="sm">Transferindo</Text>
              <Text color="error" size="sm" weight="semibold">
                -{formatPoints(numericAmount)} pts
              </Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text color="secondary" size="sm">Saldo apos</Text>
              <Text size="sm" weight="semibold">
                {formatPoints(balanceAfter)} pts
              </Text>
            </XStack>
          </YStack>
        </Card>
      )}

      <YStack gap="$2">
        <Text weight="semibold">Mensagem (opcional)</Text>
        <Input
          placeholder="Ex: Parabens!"
          value={message}
          onChangeText={setMessage}
          maxLength={100}
        />
        <Text color="secondary" size="xs" align="right">
          {message.length}/100
        </Text>
      </YStack>

      <YStack gap="$2" marginTop="auto">
        <Button
          onPress={handleSubmit}
          disabled={!isValid}
          opacity={isValid ? 1 : 0.5}
        >
          Continuar
        </Button>
        <Button variant="outline" onPress={onBack}>
          Voltar
        </Button>
      </YStack>
    </YStack>
    </TouchableWithoutFeedback>
  );
}
