import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera } from 'phosphor-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Text, ScreenHeader, Spinner } from '@ahub/ui';
import { useAuthContext } from '@/providers/AuthProvider';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useProfileTheme } from '@/features/profile/hooks/useProfileTheme';
import { AvatarPicker } from '@/features/profile/components/AvatarPicker';
import { EditProfileForm } from '@/features/profile/components/EditProfileForm';
import {
  useUpdateProfile,
  useUploadAvatar,
  useUploadCover,
} from '@/features/profile/hooks/useEditProfile';
import type { UpdateProfileFullInput } from '@ahub/shared/validation';

export default function EditProfileScreen() {
  const { user } = useAuthContext();
  const userId = user?.id || '';
  const { data: profile } = useProfile(userId);
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const uploadCover = useUploadCover();
  const [avatarChanged, setAvatarChanged] = useState(false);
  const pt = useProfileTheme();

  const handleSubmit = async (data: UpdateProfileFullInput) => {
    try {
      await updateProfile.mutateAsync(data);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      router.back();
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao atualizar perfil'
      );
    }
  };

  const handleImageSelected = async (image: {
    uri: string;
    name: string;
    type: string;
  }) => {
    try {
      await uploadAvatar.mutateAsync(image);
      setAvatarChanged(true);
      Alert.alert('Sucesso', 'Foto atualizada!');
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao enviar foto'
      );
    }
  };

  const handleCoverPress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para trocar a capa.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const name = asset.uri.split('/').pop() || 'cover.jpg';

    try {
      await uploadCover.mutateAsync({
        uri: asset.uri,
        name,
        type: 'image/jpeg',
      });
      Alert.alert('Sucesso', 'Capa atualizada!');
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao enviar capa'
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: pt.screenBg }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScreenHeader title="Editar Perfil" headingLevel={3} onBack={() => router.back()} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <YStack gap="$6">
            {/* Cover image picker */}
            <Pressable onPress={handleCoverPress} style={styles.coverContainer}>
              {profile?.coverImageUrl ? (
                <Image
                  source={{ uri: profile.coverImageUrl }}
                  style={styles.coverImage}
                  contentFit="cover"
                />
              ) : (
                <LinearGradient
                  colors={['#8B5CF6', '#06B6D4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.coverImage}
                />
              )}
              <View style={styles.coverEditOverlay}>
                {uploadCover.isPending ? (
                  <Spinner size="sm" />
                ) : (
                  <Camera size={20} color="#FFFFFF" weight="fill" />
                )}
                <Text size="xs" style={{ color: '#FFFFFF' }}>
                  Trocar capa
                </Text>
              </View>
            </Pressable>

            <YStack padding="$4" gap="$6">
              {/* Avatar */}
              <AvatarPicker
                currentAvatarUrl={user?.avatarUrl}
                name={user?.name}
                onImageSelected={handleImageSelected}
                isUploading={uploadAvatar.isPending}
              />
              <Text color="secondary" size="xs" align="center" style={{ color: pt.textSecondary }}>
                Toque na foto para alterar (JPG/PNG, máx 5MB)
              </Text>

              {/* Form */}
              <EditProfileForm
                initialValues={{
                  name: user?.name,
                  username: user?.username,
                  bio: user?.bio,
                  phone: user?.phone,
                  usernameChangedAt: user?.usernameChangedAt ? String(user.usernameChangedAt) : null,
                  socialLinks: profile?.socialLinks,
                }}
                onSubmit={handleSubmit}
                onAvatarOnlySave={() => router.back()}
                isSubmitting={updateProfile.isPending}
                avatarChanged={avatarChanged}
              />
            </YStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  coverContainer: {
    height: 140,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverEditOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
});
