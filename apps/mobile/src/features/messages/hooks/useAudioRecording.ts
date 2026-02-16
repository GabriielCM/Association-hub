import { useState } from 'react';
import { Alert } from 'react-native';

interface UseAudioRecordingReturn {
  isRecording: boolean;
  duration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<{ uri: string; durationSeconds: number } | null>;
  cancelRecording: () => Promise<void>;
}

export function useAudioRecording(): UseAudioRecordingReturn {
  const [isRecording] = useState(false);
  const [duration] = useState(0);

  const showUnavailable = () => {
    Alert.alert(
      'Indisponível',
      'Gravação de áudio requer um development build. Não está disponível no Expo Go.'
    );
  };

  const startRecording = async () => {
    showUnavailable();
  };

  const stopRecording = async (): Promise<{ uri: string; durationSeconds: number } | null> => {
    return null;
  };

  const cancelRecording = async () => {};

  return {
    isRecording,
    duration,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
