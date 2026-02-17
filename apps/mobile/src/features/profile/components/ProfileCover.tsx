import { Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import type { ViewStyle } from 'react-native';
import { Camera } from 'phosphor-react-native';
import { COVER_HEIGHT } from '../hooks/useProfileAnimations';

interface ProfileCoverProps {
  coverImageUrl?: string | undefined;
  isMe: boolean;
  onEditPress?: () => void;
  animatedStyle: AnimatedStyle<ViewStyle>;
}

export function ProfileCover({
  coverImageUrl,
  isMe,
  onEditPress,
  animatedStyle,
}: ProfileCoverProps) {
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {coverImageUrl ? (
        <Image
          source={{ uri: coverImageUrl }}
          style={styles.coverImage}
          contentFit="cover"
          transition={300}
        />
      ) : (
        <LinearGradient
          colors={['#8B5CF6', '#06B6D4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      )}

      {isMe && onEditPress && (
        <Pressable onPress={onEditPress} style={styles.editButton}>
          <Camera size={18} color="#FFFFFF" weight="fill" />
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: COVER_HEIGHT,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
  editButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
