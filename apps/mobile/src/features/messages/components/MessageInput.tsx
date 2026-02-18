import { useState, useCallback, useRef, useEffect } from 'react';
import {
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  Animated,
  useColorScheme,
} from 'react-native';
import { XStack, YStack, View } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { Camera, Trash, Microphone, PaperPlaneRight, X } from '@ahub/ui/src/icons';
import * as ImagePicker from 'expo-image-picker';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { GlassView } from './GlassView';
import { MorphSendButton } from './MorphSendButton';
import { AttachmentMenu } from './AttachmentMenu';
import { messageHaptics } from '../utils/haptics';
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [text, setText] = useState('');
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
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
      if (attachMenuOpen) setAttachMenuOpen(false);
    },
    [onTextChange, attachMenuOpen]
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
      Alert.alert('Permissao necessaria', 'Precisamos de acesso a galeria para enviar imagens.');
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

  const handleCameraLaunch = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissao necessaria', 'Precisamos de acesso a camera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
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
      messageHaptics.send();
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
    <GlassView variant="input" borderRadius={0}>
      {/* Reply preview */}
      {replyTo && !isRecording && (
        <XStack
          alignItems="center"
          paddingHorizontal="$3"
          paddingVertical="$1.5"
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
                <Text color="secondary" size="xs" numberOfLines={1}>Audio</Text>
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
        gap="$1.5"
        paddingHorizontal="$2"
        paddingVertical="$2"
      >
        {isRecording ? (
          /* Recording mode */
          <>
            <Pressable onPress={handleCancelRecording} style={styles.iconBtn}>
              <View
                width={36}
                height={36}
                borderRadius="$full"
                backgroundColor={isDark ? 'rgba(255,255,255,0.1)' : '$backgroundHover'}
                alignItems="center"
                justifyContent="center"
              >
                <Icon icon={Trash} size="sm" color="secondary" />
              </View>
            </Pressable>

            <XStack flex={1} alignItems="center" justifyContent="center" gap="$2" height={36}>
              <Animated.View style={[styles.recordingDot, { opacity: pulseAnim }]} />
              <Text size="sm" weight="semibold" color="error">
                {formatRecordingDuration(recordingDuration)}
              </Text>
            </XStack>

            <Pressable onPress={handleStopRecording}>
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
            {/* Attachment menu - collapses when typing */}
            {!hasText && (
              <AttachmentMenu
                visible={attachMenuOpen}
                onToggle={() => setAttachMenuOpen((v) => !v)}
                onGallery={handleImagePick}
                onCamera={handleCameraLaunch}
                onAudio={handleStartRecording}
                onDocument={() => {/* TODO: document picker */}}
              />
            )}

            {/* Text Input - glass pill */}
            <View
              flex={1}
              borderRadius="$full"
              backgroundColor={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}
              paddingHorizontal="$3"
              paddingVertical={Platform.OS === 'ios' ? 8 : 4}
              maxHeight={120}
            >
              <TextInput
                ref={inputRef}
                value={text}
                onChangeText={handleTextChange}
                placeholder="Mensagem..."
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                multiline
                style={[
                  styles.input,
                  { color: isDark ? '#F9FAFB' : '#1F2937' },
                ]}
                editable={!disabled}
              />
            </View>

            {/* Morph send/mic button */}
            <MorphSendButton
              hasText={hasText}
              onSend={handleSend}
              onMicPress={handleStartRecording}
              disabled={disabled}
            />
          </>
        )}
      </XStack>
    </GlassView>
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
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
});
