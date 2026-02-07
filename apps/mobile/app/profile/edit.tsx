import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { YStack } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Heading, Button } from '@ahub/ui';
import { useAuthContext } from '@/providers/AuthProvider';
import { AvatarPicker } from '@/features/profile/components/AvatarPicker';
import { EditProfileForm } from '@/features/profile/components/EditProfileForm';
import {
  useUpdateProfile,
  useUploadAvatar,
} from '@/features/profile/hooks/useEditProfile';
import type { UpdateProfileFullInput } from '@ahub/shared/validation';

export default function EditProfileScreen() {
  const { user } = useAuthContext();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const [avatarChanged, setAvatarChanged] = useState(false);

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

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <YStack padding="$4" gap="$6">
            {/* Header */}
            <YStack gap="$2">
              <Button
                variant="ghost"
                size="sm"
                onPress={() => router.back()}
                alignSelf="flex-start"
              >
                ← Voltar
              </Button>
              <Heading level={3}>Editar Perfil</Heading>
            </YStack>

            {/* Avatar */}
            <AvatarPicker
              currentAvatarUrl={user?.avatarUrl}
              name={user?.name}
              onImageSelected={handleImageSelected}
              isUploading={uploadAvatar.isPending}
            />
            <Text color="secondary" size="xs" align="center">
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
              }}
              onSubmit={handleSubmit}
              onAvatarOnlySave={() => router.back()}
              isSubmitting={updateProfile.isPending}
              avatarChanged={avatarChanged}
            />
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
