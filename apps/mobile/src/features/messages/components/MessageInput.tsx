import { useState, useCallback, useRef, useEffect } from 'react';
import {
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { XStack, YStack, View } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { Camera, Trash, Microphone, PaperPlaneRight, X } from '@ahub/ui/src/icons';
import * as ImagePicker from 'expo-image-picker';
import { useAudioRecording } from '../hooks/useAudioRecording';
import type { Message, MessageContentType } from '@ahub/shared/types';

interface MessageInputProps {
  onSend: (data: {
    content?: string;
    contentType: MessageContentType;
    mediaUrl?: string | undefined;
    mediaDuration?: number | undefined;
    replyTo?: string | undefined;
  }) => void;
  onTextChange?: (text: string) => void;
  onRecordingChange?: (isRecording: boolean) => void;
  replyTo?: Message | null;
  onCancelReply?: () => void;
  disabled?: boolean;
}

function formatRecordingDuration(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function MessageInput({
  onSend,
  onTextChange,
  onRecordingChange,
  replyTo,
  onCancelReply,
  disabled = false,
}: MessageInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const {
    isRecording,
    duration: recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecording();

  // Pulse animation for recording indicator
  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const handleTextChange = useCallback(
    (value: string) => {
      setText(value);
      onTextChange?.(value);
    },
    [onTextChange]
  );

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    onSend({
      content: trimmed,
      contentType: 'TEXT',
      replyTo: replyTo?.id,
    });

    setText('');
    onCancelReply?.();
  }, [text, onSend, replyTo, onCancelReply]);

  const handleImagePick = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para enviar imagens.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      onSend({
        content: '',
        contentType: 'IMAGE',
        mediaUrl: result.assets[0].uri,
        replyTo: replyTo?.id,
      });
      onCancelReply?.();
    }
  }, [onSend, replyTo, onCancelReply]);

  const handleStartRecording = useCallback(async () => {
    await startRecording();
    onRecordingChange?.(true);
  }, [startRecording, onRecordingChange]);

  const handleStopRecording = useCallback(async () => {
    onRecordingChange?.(false);
    const result = await stopRecording();
    if (result) {
      onSend({
        content: '',
        contentType: 'AUDIO',
        mediaUrl: result.uri,
        mediaDuration: result.durationSeconds,
        replyTo: replyTo?.id,
      });
      onCancelReply?.();
    }
  }, [stopRecording, onSend, replyTo, onCancelReply, onRecordingChange]);

  const handleCancelRecording = useCallback(async () => {
    onRecordingChange?.(false);
    await cancelRecording();
  }, [cancelRecording, onRecordingChange]);

  const hasText = text.trim().length > 0;

  return (
    <YStack
      borderTopWidth={1}
      borderTopColor="$borderColor"
      backgroundColor="$background"
    >
      {/* Reply preview */}
      {replyTo && !isRecording && (
        <XStack
          alignItems="center"
          paddingHorizontal="$3"
          paddingVertical="$1.5"
          backgroundColor="$backgroundHover"
          gap="$2"
        >
          <View
            width={3}
            height="100%"
            backgroundColor="$primary"
            borderRadius="$full"
          />
          <YStack flex={1}>
            <Text color="primary" size="xs" weight="semibold">
              {replyTo.sender.name}
            </Text>
            {replyTo.contentType === 'IMAGE' ? (
              <XStack alignItems="center" gap="$1">
                <Icon icon={Camera} size="sm" color="secondary" />
                <Text color="secondary" size="xs" numberOfLines={1}>Foto</Text>
              </XStack>
            ) : replyTo.contentType === 'AUDIO' ? (
              <XStack alignItems="center" gap="$1">
                <Icon icon={Microphone} size="sm" color="secondary" />
                <Text color="secondary" size="xs" numberOfLines={1}>Áudio</Text>
              </XStack>
            ) : (
              <Text color="secondary" size="xs" numberOfLines={1}>
                {replyTo.content}
              </Text>
            )}
          </YStack>
          <Pressable onPress={onCancelReply}>
            <Icon icon={X} size="sm" color="secondary" />
          </Pressable>
        </XStack>
      )}

      {/* Input row */}
      <XStack
        alignItems="flex-end"
        gap="$2"
        paddingHorizontal="$3"
        paddingVertical="$2"
      >
        {isRecording ? (
          /* Recording mode */
          <>
            {/* Cancel button */}
            <Pressable onPress={handleCancelRecording} style={styles.iconBtn}>
              <View
                width={36}
                height={36}
                borderRadius="$full"
                backgroundColor="$backgroundHover"
                alignItems="center"
                justifyContent="center"
              >
                <Icon icon={Trash} size="sm" color="secondary" />
              </View>
            </Pressable>

            {/* Recording indicator */}
            <XStack flex={1} alignItems="center" justifyContent="center" gap="$2" height={36}>
              <Animated.View style={[styles.recordingDot, { opacity: pulseAnim }]} />
              <Text size="sm" weight="semibold" color="error">
                {formatRecordingDuration(recordingDuration)}
              </Text>
            </XStack>

            {/* Stop & Send button */}
            <Pressable onPress={handleStopRecording} style={styles.sendBtn}>
              <View
                width={36}
                height={36}
                borderRadius="$full"
                backgroundColor="$primary"
                alignItems="center"
                justifyContent="center"
              >
                <Icon icon={PaperPlaneRight} size="sm" color="#FFFFFF" weight="fill" />
              </View>
            </Pressable>
          </>
        ) : (
          /* Normal mode */
          <>
            {/* Camera / Image */}
            <Pressable onPress={handleImagePick} style={styles.iconBtn}>
              <Icon icon={Camera} size="lg" color="secondary" />
            </Pressable>

            {/* Text Input */}
            <View
              flex={1}
              borderRadius="$xl"
              backgroundColor="$backgroundHover"
              paddingHorizontal="$3"
              paddingVertical={Platform.OS === 'ios' ? 8 : 4}
              maxHeight={120}
            >
              <TextInput
                ref={inputRef}
                value={text}
                onChangeText={handleTextChange}
                placeholder="Mensagem..."
                multiline
                style={styles.input}
                editable={!disabled}
              />
            </View>

            {/* Send / Mic button */}
            {hasText ? (
              <Pressable
                onPress={handleSend}
                style={styles.sendBtn}
                disabled={disabled}
              >
                <View
                  width={36}
                  height={36}
                  borderRadius="$full"
                  backgroundColor="$primary"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon icon={PaperPlaneRight} size="sm" color="#FFFFFF" weight="fill" />
                </View>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleStartRecording}
                style={styles.sendBtn}
                disabled={disabled}
              >
                <View
                  width={36}
                  height={36}
                  borderRadius="$full"
                  backgroundColor="$primary"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon icon={Microphone} size="sm" color="#FFFFFF" />
                </View>
              </Pressable>
            )}
          </>
        )}
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    fontSize: 14,
    maxHeight: 100,
    color: '#1F2937',
  },
  sendBtn: {},
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
});
