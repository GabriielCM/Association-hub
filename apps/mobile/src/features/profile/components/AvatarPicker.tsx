import { Pressable, View, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Avatar, Text } from '@ahub/ui';
import Camera from 'phosphor-react-native/src/icons/Camera';

interface AvatarPickerProps {
  currentAvatarUrl?: string | undefined;
  name?: string | undefined;
  onImageSelected: (image: { uri: string; name: string; type: string }) => void;
  isUploading?: boolean;
}

export function AvatarPicker({
  currentAvatarUrl,
  name,
  onImageSelected,
  isUploading,
}: AvatarPickerProps) {
  const handlePress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à sua galeria para alterar a foto de perfil.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const fileName = asset.uri.split('/').pop() || 'avatar.jpg';
      const fileType = asset.mimeType || 'image/jpeg';

      onImageSelected({
        uri: asset.uri,
        name: fileName,
        type: fileType,
      });
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isUploading}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <View style={styles.container}>
        <Avatar
          src={currentAvatarUrl}
          name={name}
          size="2xl"
        />
        <View style={styles.cameraOverlay}>
          {isUploading ? (
            <Text style={styles.cameraIcon}>...</Text>
          ) : (
            <Camera size={16} color="#FFFFFF" />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  cameraIcon: {
    fontSize: 16,
  },
  pressed: {
    opacity: 0.7,
  },
});
