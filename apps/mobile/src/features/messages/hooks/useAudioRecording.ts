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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
    };
  }, [clearTimer]);

  const startRecording = useCallback(async () => {
    try {
      // Request microphone permission
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissao necessaria',
          'Precisamos de acesso ao microfone para gravar mensagens de audio.',
        );
        return;
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = recording;

      // Start duration timer
      setDuration(0);
      intervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Erro', 'Nao foi possivel iniciar a gravacao de audio.');
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<{ uri: string; durationSeconds: number } | null> => {
    clearTimer();

    const recording = recordingRef.current;
    if (!recording) {
      setIsRecording(false);
      setDuration(0);
      return null;
    }

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recording.getURI();
      const status = await recording.getStatusAsync();
      const durationSeconds = Math.round((status.durationMillis ?? 0) / 1000);

      recordingRef.current = null;
      setIsRecording(false);
      const finalDuration = durationSeconds || duration;
      setDuration(0);

      if (!uri) return null;
      return { uri, durationSeconds: finalDuration };
    } catch (err) {
      console.error('Failed to stop recording:', err);
      recordingRef.current = null;
      setIsRecording(false);
      setDuration(0);
      return null;
    }
  }, [clearTimer, duration]);

  const cancelRecording = useCallback(async () => {
    clearTimer();

    const recording = recordingRef.current;
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      } catch {
        // Ignore errors on cancel
      }
      recordingRef.current = null;
    }

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
