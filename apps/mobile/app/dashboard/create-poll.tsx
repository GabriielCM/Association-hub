import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { YStack, XStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Text, Icon } from '@ahub/ui';
import X from 'phosphor-react-native/src/icons/X';
import { colors } from '@ahub/ui/themes';
import { useCreatePoll } from '@/features/dashboard/hooks/useFeedMutations';

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 4;

export default function CreatePollScreen() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [durationDays, setDurationDays] = useState(1);

  const createPoll = useCreatePoll();

  const handleAddOption = () => {
    if (options.length < MAX_OPTIONS) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > MIN_OPTIONS) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const validOptions = options.filter((o) => o.trim().length > 0);
  const isValid =
    question.trim().length > 0 && validOptions.length >= MIN_OPTIONS;

  const handleSubmit = () => {
    if (!isValid) return;

    createPoll.mutate(
      {
        question: question.trim(),
        options: validOptions.map((o) => o.trim()),
        duration_days: durationDays,
      },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          padding="$4"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Pressable onPress={() => router.back()}>
            <Text color="secondary">Cancelar</Text>
          </Pressable>
          <Text weight="bold" size="lg">
            Nova Enquete
          </Text>
          <Pressable
            onPress={handleSubmit}
            disabled={!isValid || createPoll.isPending}
          >
            {createPoll.isPending ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text
                color={isValid ? 'accent' : 'secondary'}
                weight="semibold"
              >
                Publicar
              </Text>
            )}
          </Pressable>
        </XStack>

        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Question */}
          <YStack gap="$1">
            <Text weight="semibold">Pergunta</Text>
            <TextInput
              value={question}
              onChangeText={setQuestion}
              placeholder="Faca uma pergunta..."
              style={styles.input}
              maxLength={200}
              autoFocus
            />
          </YStack>

          {/* Options */}
          <YStack gap="$2">
            <Text weight="semibold">Opcoes</Text>
            {options.map((option, index) => (
              <XStack key={index} alignItems="center" gap="$2">
                <TextInput
                  value={option}
                  onChangeText={(v) => handleOptionChange(index, v)}
                  placeholder={`Opcao ${index + 1}`}
                  style={[styles.input, { flex: 1 }]}
                  maxLength={100}
                />
                {options.length > MIN_OPTIONS && (
                  <Pressable onPress={() => handleRemoveOption(index)}>
                    <Icon icon={X} size="lg" color="error" />
                  </Pressable>
                )}
              </XStack>
            ))}

            {options.length < MAX_OPTIONS && (
              <Pressable onPress={handleAddOption} style={styles.addOptionBtn}>
                <Text color="accent" weight="semibold" size="sm">
                  + Adicionar opcao
                </Text>
              </Pressable>
            )}
          </YStack>

          {/* Duration */}
          <YStack gap="$2">
            <Text weight="semibold">Duracao da enquete</Text>
            <XStack gap="$2">
              {[1, 3, 7].map((days) => (
                <Pressable
                  key={days}
                  onPress={() => setDurationDays(days)}
                  style={[
                    styles.durationBtn,
                    durationDays === days && styles.durationBtnActive,
                  ]}
                >
                  <Text
                    size="sm"
                    color={durationDays === days ? 'white' : undefined}
                  >
                    {days} {days === 1 ? 'dia' : 'dias'}
                  </Text>
                </Pressable>
              ))}
            </XStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
  },
  addOptionBtn: {
    padding: 10,
    alignItems: 'center',
  },
  durationBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
  },
  durationBtnActive: {
    backgroundColor: colors.accentDark,
    borderColor: colors.accentDark,
  },
});
