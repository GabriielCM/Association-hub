import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { YStack, XStack } from 'tamagui';

import { Text, Icon } from '@ahub/ui';
import { colors } from '@ahub/ui/themes';
import X from 'phosphor-react-native/src/icons/X';
import { useCreatePoll } from '../hooks/useFeedMutations';

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 4;

interface PollCreatorProps {
  visible: boolean;
  onClose: () => void;
}

export function PollCreator({ visible, onClose }: PollCreatorProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [durationDays, setDurationDays] = useState(1);

  const createPoll = useCreatePoll();

  const reset = () => {
    setQuestion('');
    setOptions(['', '']);
    setDurationDays(1);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

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

  const isValid =
    question.trim().length > 0 &&
    options.filter((o) => o.trim().length > 0).length >= MIN_OPTIONS;

  const handleSubmit = () => {
    if (!isValid) return;

    createPoll.mutate(
      {
        question: question.trim(),
        options: options.filter((o) => o.trim()).map((o) => o.trim()),
        duration_days: durationDays,
      },
      { onSuccess: () => handleClose() },
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ justifyContent: 'flex-end' }}
        >
          <Pressable
            style={styles.sheet}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView keyboardShouldPersistTaps="handled">
              <YStack gap="$4" padding="$4">
                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Pressable onPress={handleClose}>
                    <Text color="secondary" size="sm">
                      Cancelar
                    </Text>
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
                        size="sm"
                      >
                        Publicar
                      </Text>
                    )}
                  </Pressable>
                </XStack>

                {/* Question */}
                <YStack gap="$1">
                  <Text weight="semibold" size="sm">
                    Pergunta
                  </Text>
                  <TextInput
                    value={question}
                    onChangeText={setQuestion}
                    placeholder="Faca uma pergunta..."
                    style={styles.input}
                    maxLength={200}
                  />
                </YStack>

                {/* Options */}
                <YStack gap="$2">
                  <Text weight="semibold" size="sm">
                    Opcoes
                  </Text>
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
                        <Pressable
                          onPress={() => handleRemoveOption(index)}
                        >
                          <Icon icon={X} size="lg" color="error" />
                        </Pressable>
                      )}
                    </XStack>
                  ))}

                  {options.length < MAX_OPTIONS && (
                    <Pressable
                      onPress={handleAddOption}
                      style={styles.addOptionBtn}
                    >
                      <Text color="accent" size="sm" weight="semibold">
                        + Adicionar opcao
                      </Text>
                    </Pressable>
                  )}
                </YStack>

                {/* Duration */}
                <YStack gap="$1">
                  <Text weight="semibold" size="sm">
                    Duracao
                  </Text>
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
              </YStack>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  addOptionBtn: {
    padding: 8,
    alignItems: 'center',
  },
  durationBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
  },
  durationBtnActive: {
    backgroundColor: colors.accentDark,
    borderColor: colors.accentDark,
  },
});
