import { useState, useCallback, useEffect, useRef } from 'react';
import { Pressable } from 'react-native';
import { XStack, YStack, View } from 'tamagui';
import { Text } from '@ahub/ui';
import { Audio, AVPlaybackStatus } from 'expo-av';

// Module-level ref to ensure only one audio plays at a time
let currentlyPlayingSound: Audio.Sound | null = null;
let currentlyPlayingCleanup: (() => void) | null = null;

function formatDuration(seconds?: number): string {
  if (!seconds) return '0:00';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

interface AudioMessageProps {
  mediaUrl: string;
  duration?: number;
  isOwn: boolean;
}

export function AudioMessage({ mediaUrl, duration, isOwn }: AudioMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [position, setPosition] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  const cleanup = useCallback(() => {
    const sound = soundRef.current;
    if (sound) {
      if (currentlyPlayingSound === sound) {
        currentlyPlayingSound = null;
        currentlyPlayingCleanup = null;
      }
      sound.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    setIsPlaying(false);
    setProgress(0);
    setPosition(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const onPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;

      setIsPlaying(status.isPlaying);
      setPosition(Math.floor(status.positionMillis / 1000));

      if (status.durationMillis && status.durationMillis > 0) {
        setProgress((status.positionMillis / status.durationMillis) * 100);
      }

      // Reset when playback finishes
      if (status.didJustFinish) {
        setIsPlaying(false);
        setProgress(0);
        setPosition(0);
        if (currentlyPlayingSound === soundRef.current) {
          currentlyPlayingSound = null;
          currentlyPlayingCleanup = null;
        }
      }
    },
    []
  );

  const handleTogglePlay = useCallback(async () => {
    try {
      // If already loaded, toggle play/pause
      if (soundRef.current) {
        if (isPlaying) {
          await soundRef.current.pauseAsync();
        } else {
          // Stop any other playing audio first
          if (currentlyPlayingSound && currentlyPlayingSound !== soundRef.current) {
            await currentlyPlayingSound.pauseAsync();
            currentlyPlayingCleanup?.();
          }
          currentlyPlayingSound = soundRef.current;
          currentlyPlayingCleanup = () => {
            setIsPlaying(false);
          };
          await soundRef.current.playAsync();
        }
        return;
      }

      // Load and play
      setIsLoading(true);

      // Stop any other playing audio first
      if (currentlyPlayingSound) {
        await currentlyPlayingSound.pauseAsync();
        currentlyPlayingCleanup?.();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: mediaUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      currentlyPlayingSound = sound;
      currentlyPlayingCleanup = () => {
        setIsPlaying(false);
      };
      setIsLoading(false);
    } catch (err) {
      console.error('[Audio] Playback error:', err);
      setIsLoading(false);
      cleanup();
    }
  }, [mediaUrl, isPlaying, onPlaybackStatusUpdate, cleanup]);

  const displayDuration = isPlaying || progress > 0 ? position : duration;

  return (
    <XStack alignItems="center" gap="$2" minWidth={180}>
      {/* Play/Pause button */}
      <Pressable onPress={handleTogglePlay} disabled={isLoading}>
        <View
          width={32}
          height={32}
          borderRadius="$full"
          backgroundColor={isOwn ? 'rgba(255,255,255,0.2)' : '$primary'}
          alignItems="center"
          justifyContent="center"
        >
          <Text
            color="white"
            size="sm"
            weight="bold"
          >
            {isLoading ? '...' : isPlaying ? '⏸' : '▶'}
          </Text>
        </View>
      </Pressable>

      {/* Waveform / Progress */}
      <YStack flex={1} gap="$0.5">
        <View
          height={4}
          borderRadius="$full"
          backgroundColor={
            isOwn ? 'rgba(255,255,255,0.2)' : 'rgba(139, 92, 246, 0.2)'
          }
          overflow="hidden"
        >
          <View
            height="100%"
            width={`${progress}%`}
            backgroundColor={isOwn ? 'rgba(255,255,255,0.7)' : '$primary'}
            borderRadius="$full"
          />
        </View>
        <Text
          size="xs"
          color={isOwn ? 'rgba(255,255,255,0.6)' : 'secondary'}
          style={{ fontSize: 10 }}
        >
          {formatDuration(displayDuration)}
        </Text>
      </YStack>
    </XStack>
  );
}
