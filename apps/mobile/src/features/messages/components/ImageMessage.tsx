import { useState, useCallback, useEffect } from 'react';
import { Image, Pressable, Modal, Dimensions, StyleSheet } from 'react-native';
import { View } from 'tamagui';
import { Text } from '@ahub/ui';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageMessageProps {
  mediaUrl: string;
}

export function ImageMessage({ mediaUrl }: ImageMessageProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1);

  const handleOpen = useCallback(() => setFullscreen(true), []);
  const handleClose = useCallback(() => setFullscreen(false), []);

  // Get image dimensions to maintain aspect ratio
  useEffect(() => {
    Image.getSize(
      mediaUrl,
      (width, height) => {
        if (width > 0 && height > 0) {
          setAspectRatio(width / height);
        }
      },
      () => {} // Ignore errors, use default 1:1
    );
  }, [mediaUrl]);

  return (
    <>
      <Pressable onPress={handleOpen}>
        <View borderRadius="$md" overflow="hidden">
          <Image
            source={{ uri: mediaUrl }}
            style={[
              styles.thumbnail,
              { aspectRatio, height: undefined },
            ]}
            resizeMode="cover"
          />
        </View>
      </Pressable>

      <Modal
        visible={fullscreen}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable onPress={handleClose} style={styles.modalBackdrop}>
          <Image
            source={{ uri: mediaUrl }}
            style={styles.fullImage}
            resizeMode="contain"
          />
          <Pressable onPress={handleClose} style={styles.closeBtn}>
            <Text color="white" size="lg" weight="bold">
              ✕
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  thumbnail: {
    maxWidth: 250,
    width: 250,
    borderRadius: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  closeBtn: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
