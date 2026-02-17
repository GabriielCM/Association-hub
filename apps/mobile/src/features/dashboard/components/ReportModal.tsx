import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { YStack, XStack } from 'tamagui';

import { Text } from '@ahub/ui';
import { colors } from '@ahub/ui/themes';
import { useReportPost } from '../hooks/useFeedMutations';
import type { ReportReason } from '@ahub/shared/types';

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'INAPPROPRIATE', label: 'Conteudo inapropriado' },
  { value: 'HARASSMENT', label: 'Assedio ou bullying' },
  { value: 'MISINFORMATION', label: 'Informacao falsa' },
  { value: 'OTHER', label: 'Outro' },
];

interface ReportModalProps {
  visible: boolean;
  postId: string | null;
  onClose: () => void;
}

export function ReportModal({ visible, postId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const reportPost = useReportPost();

  const reset = () => {
    setReason(null);
    setDescription('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!reason || !postId) return;

    reportPost.mutate(
      {
        postId,
        data: {
          reason,
          ...(description.trim() && { description: description.trim() }),
        },
      },
      { onSuccess: () => handleClose() },
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={styles.sheet}
          onPress={(e) => e.stopPropagation()}
        >
          <YStack gap="$4" padding="$4">
            <YStack gap="$1" alignItems="center">
              <Text weight="bold" size="lg">
                Denunciar Post
              </Text>
              <Text size="xs" color="secondary">
                Selecione o motivo da denuncia
              </Text>
            </YStack>

            {/* Reasons */}
            <YStack gap="$2">
              {REPORT_REASONS.map((item) => (
                <Pressable
                  key={item.value}
                  onPress={() => setReason(item.value)}
                  style={[
                    styles.reasonBtn,
                    reason === item.value && styles.reasonBtnActive,
                  ]}
                >
                  <Text
                    size="sm"
                    weight={reason === item.value ? 'semibold' : undefined}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </YStack>

            {/* Description */}
            {reason === 'OTHER' && (
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Descreva o problema..."
                multiline
                numberOfLines={3}
                style={styles.input}
                maxLength={500}
              />
            )}

            {/* Actions */}
            <XStack gap="$3">
              <Pressable
                onPress={handleClose}
                style={[styles.btn, styles.cancelBtn]}
                disabled={reportPost.isPending}
              >
                <Text size="sm">Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                style={[
                  styles.btn,
                  styles.submitBtn,
                  (!reason || reportPost.isPending) && { opacity: 0.5 },
                ]}
                disabled={!reason || reportPost.isPending}
              >
                {reportPost.isPending ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text
                    size="sm"
                    weight="semibold"
                    style={{ color: '#FFF' }}
                  >
                    Enviar
                  </Text>
                )}
              </Pressable>
            </XStack>
          </YStack>
        </Pressable>
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
  },
  reasonBtn: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
  },
  reasonBtnActive: {
    borderColor: colors.accentDark,
    backgroundColor: `${colors.accentDark}10`,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
  },
  submitBtn: {
    backgroundColor: colors.errorDark,
  },
});
