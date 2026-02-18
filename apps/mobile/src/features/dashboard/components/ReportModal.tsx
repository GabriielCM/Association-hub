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
import { useReportPost } from '../hooks/useFeedMutations';
import { useDashboardTheme } from '../hooks/useDashboardTheme';
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
  const dt = useDashboardTheme();
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
      <Pressable style={[styles.overlay, { backgroundColor: dt.overlayBg }]} onPress={handleClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: dt.sheetBg }]}
          onPress={(e) => e.stopPropagation()}
        >
          <YStack gap="$4" padding="$4">
            <YStack gap="$1" alignItems="center">
              <Text weight="bold" size="lg" style={{ color: dt.textPrimary }}>
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
                    { borderColor: dt.borderColor },
                    reason === item.value && { borderColor: dt.accent, backgroundColor: dt.accentBg },
                  ]}
                >
                  <Text
                    size="sm"
                    weight={reason === item.value ? 'semibold' : undefined}
                    style={{ color: dt.textPrimary }}
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
                placeholderTextColor={dt.inputPlaceholder}
                multiline
                numberOfLines={3}
                style={[styles.input, { borderColor: dt.inputBorder, backgroundColor: dt.inputBg, color: dt.inputText }]}
                maxLength={500}
              />
            )}

            {/* Actions */}
            <XStack gap="$3">
              <Pressable
                onPress={handleClose}
                style={[styles.btn, { backgroundColor: dt.cancelBtnBg }]}
                disabled={reportPost.isPending}
              >
                <Text size="sm" style={{ color: dt.textPrimary }}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                style={[
                  styles.btn,
                  { backgroundColor: dt.errorBg },
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
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  reasonBtn: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
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
});
