import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { YStack } from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text, Input, Button } from '@ahub/ui';
import { updateProfileFullSchema } from '@ahub/shared/validation';
import { useCheckUsername } from '../hooks/useEditProfile';
import { useProfileTheme } from '../hooks/useProfileTheme';
import type { UpdateProfileFullInput } from '@ahub/shared/validation';

const USERNAME_COOLDOWN_DAYS = 30;

interface EditProfileFormProps {
  initialValues: {
    name?: string | undefined;
    username?: string | undefined;
    bio?: string | undefined;
    phone?: string | undefined;
    usernameChangedAt?: string | null | undefined;
    socialLinks?: { instagram?: string | undefined; facebook?: string | undefined; x?: string | undefined } | undefined;
  };
  onSubmit: (data: UpdateProfileFullInput) => void;
  onAvatarOnlySave?: () => void;
  isSubmitting?: boolean;
  avatarChanged?: boolean;
}

export function EditProfileForm({
  initialValues,
  onSubmit,
  onAvatarOnlySave,
  isSubmitting,
  avatarChanged,
}: EditProfileFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileFullInput>({
    resolver: zodResolver(updateProfileFullSchema),
    defaultValues: {
      ...initialValues,
      socialLinks: initialValues.socialLinks || {},
    },
  });

  // Username cooldown (30 days)
  const { usernameLocked, daysRemaining } = useMemo(() => {
    if (!initialValues.usernameChangedAt) return { usernameLocked: false, daysRemaining: 0 };
    const changedAt = new Date(initialValues.usernameChangedAt).getTime();
    const cooldownMs = USERNAME_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - changedAt;
    if (elapsed < cooldownMs) {
      return { usernameLocked: true, daysRemaining: Math.ceil((cooldownMs - elapsed) / (24 * 60 * 60 * 1000)) };
    }
    return { usernameLocked: false, daysRemaining: 0 };
  }, [initialValues.usernameChangedAt]);

  const watchedUsername = watch('username') || '';
  const [debouncedUsername, setDebouncedUsername] = useState(watchedUsername);

  // Debounce username check
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(watchedUsername);
    }, 500);
    return () => clearTimeout(timer);
  }, [watchedUsername]);

  const shouldCheck =
    !usernameLocked &&
    debouncedUsername.length >= 3 &&
    debouncedUsername !== initialValues.username;

  const { data: usernameCheck, isLoading: isCheckingUsername } =
    useCheckUsername(shouldCheck ? debouncedUsername : '');

  const usernameAvailable =
    !shouldCheck || usernameCheck?.isAvailable !== false;

  const pt = useProfileTheme();

  return (
    <YStack gap="$4">
      {/* Name */}
      <YStack gap="$1">
        <Text weight="medium" size="sm" style={{ color: pt.textPrimary }}>
          Nome
        </Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Seu nome"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
            />
          )}
        />
        {errors.name && (
          <Text color="error" size="xs">
            {errors.name.message}
          </Text>
        )}
      </YStack>

      {/* Username */}
      <YStack gap="$1">
        <Text weight="medium" size="sm" style={{ color: pt.textPrimary }}>
          Username
        </Text>
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <Input
                placeholder="seu_username"
                value={value}
                onChangeText={(text: string) =>
                  onChange(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                }
                onBlur={onBlur}
                autoCapitalize="none"
                autoCorrect={false}
                disabled={usernameLocked}
              />
              {isCheckingUsername && !usernameLocked && (
                <View style={styles.usernameStatus}>
                  <ActivityIndicator size="small" />
                </View>
              )}
            </View>
          )}
        />
        {usernameLocked && (
          <Text color="secondary" size="xs" style={{ color: pt.textSecondary }}>
            Você poderá alterar seu username em {daysRemaining} dia(s)
          </Text>
        )}
        {errors.username && (
          <Text color="error" size="xs">
            {errors.username.message}
          </Text>
        )}
        {shouldCheck && !isCheckingUsername && usernameCheck && (
          <Text
            color={usernameCheck.isAvailable ? 'success' : 'error'}
            size="xs"
          >
            {usernameCheck.isAvailable
              ? 'Username disponível'
              : 'Username já em uso'}
          </Text>
        )}
      </YStack>

      {/* Bio */}
      <YStack gap="$1">
        <Text weight="medium" size="sm" style={{ color: pt.textPrimary }}>
          Bio
        </Text>
        <Controller
          control={control}
          name="bio"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Uma breve descrição sobre você"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={3}
              maxLength={150}
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />
          )}
        />
        <Text color="secondary" size="xs" align="right" style={{ color: pt.textSecondary }}>
          {(watch('bio') || '').length}/150
        </Text>
        {errors.bio && (
          <Text color="error" size="xs">
            {errors.bio.message}
          </Text>
        )}
      </YStack>

      {/* Phone */}
      <YStack gap="$1">
        <Text weight="medium" size="sm" style={{ color: pt.textPrimary }}>
          Telefone
        </Text>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="(00) 00000-0000"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="phone-pad"
            />
          )}
        />
      </YStack>

      {/* Social Links */}
      <YStack gap="$3">
        <Text weight="medium" size="sm" style={{ color: pt.textPrimary }}>
          Redes Sociais
        </Text>
        <YStack gap="$2">
          <Controller
            control={control}
            name="socialLinks.instagram"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="@seu_instagram"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          />
          <Controller
            control={control}
            name="socialLinks.facebook"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="@seu_facebook"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          />
          <Controller
            control={control}
            name="socialLinks.x"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="@seu_x"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          />
        </YStack>
      </YStack>

      {/* Submit */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onPress={isDirty ? handleSubmit(onSubmit) : onAvatarOnlySave}
        loading={isSubmitting}
        disabled={(!isDirty && !avatarChanged) || !usernameAvailable}
        marginTop="$2"
      >
        Salvar alterações
      </Button>
    </YStack>
  );
}

const styles = StyleSheet.create({
  usernameStatus: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
});
