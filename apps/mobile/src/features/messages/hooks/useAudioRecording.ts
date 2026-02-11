import { useState, useRef, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { Audio } from 'expo-av';

interface UseAudioRecordingReturn {
  isRecording: boolean;
  duration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<{ uri: string; durationSeconds: number } | null>;
  cancelRecording: () => Promise<void>;
}

export function useAudioRecording(): UseAudioRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [clearTimer]);

  const startRecording = useCallback(async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de acesso ao microfone para gravar áudio.'
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setDuration(0);

      // Update duration every 500ms
      timerRef.current = setInterval(async () => {
        if (recordingRef.current) {
          const status = await recordingRef.current.getStatusAsync();
          if (status.isRecording) {
            setDuration(Math.floor(status.durationMillis / 1000));
          }
        }
      }, 500);
    } catch (err) {
      console.error('[Audio] Failed to start recording:', err);
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<{ uri: string; durationSeconds: number } | null> => {
    clearTimer();

    const recording = recordingRef.current;
    if (!recording) return null;

    try {
      const status = await recording.getStatusAsync();
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recording.getURI();
      recordingRef.current = null;
      setIsRecording(false);
      setDuration(0);

      if (!uri) return null;

      const durationSeconds = Math.round(status.durationMillis / 1000);
      return { uri, durationSeconds: Math.max(durationSeconds, 1) };
    } catch (err) {
      console.error('[Audio] Failed to stop recording:', err);
      recordingRef.current = null;
      setIsRecording(false);
      setDuration(0);
      return null;
    }
  }, [clearTimer]);

  const cancelRecording = useCallback(async () => {
    clearTimer();

    const recording = recordingRef.current;
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch {
      // Ignore errors on cancel
    }

    recordingRef.current = null;
    setIsRecording(false);
    setDuration(0);
  }, [clearTimer]);

  return {
    isRecording,
    duration,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
