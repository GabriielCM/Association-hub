import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useLocalSearchParams, router } from 'expo-router';
import { View, YStack, XStack } from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Input, Text, Heading, Card } from '@ahub/ui';
import { newPasswordSchema, type NewPasswordInput } from '@ahub/shared/validation';
import { useAuth } from '@/hooks/useAuth';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const [resetComplete, setResetComplete] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      token: token || '',
      password: '',
    },
  });

  const onSubmit = async (data: NewPasswordInput) => {
    clearError();
    const success = await resetPassword(data.token, data.password);
    if (success) {
      setResetComplete(true);
    }
  };

  // No token
  if (!token) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <YStack flex={1} padding="$4" justifyContent="center">
          <Card variant="elevated" padding="$4">
            <YStack gap="$4" alignItems="center">
              <View
                width={64}
                height={64}
                borderRadius="$full"
                backgroundColor="$errorBackground"
                alignItems="center"
                justifyContent="center"
              >
                <Text size="2xl">!</Text>
              </View>

              <Heading level={3} align="center">
                Link inválido
              </Heading>

              <Text color="secondary" align="center">
                O link de recuperação de senha é inválido ou expirou.
                Solicite um novo link.
              </Text>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onPress={() => router.replace('/(auth)/forgot-password')}
              >
                Solicitar novo link
              </Button>

              <Link href="/(auth)/login" asChild>
                <Button variant="ghost" size="md">
                  Voltar ao login
                </Button>
              </Link>
            </YStack>
          </Card>
        </YStack>
      </SafeAreaView>
    );
  }

  // Reset complete
  if (resetComplete) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <YStack flex={1} padding="$4" justifyContent="center">
          <Card variant="elevated" padding="$4">
            <YStack gap="$4" alignItems="center">
              <View
                width={64}
                height={64}
                borderRadius="$full"
                backgroundColor="$successBackground"
                alignItems="center"
                justifyContent="center"
              >
                <Text size="2xl">✓</Text>
              </View>

              <Heading level={3} align="center">
                Senha redefinida!
              </Heading>

              <Text color="secondary" align="center">
                Sua senha foi alterada com sucesso. Faça login com sua nova senha.
              </Text>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onPress={() => router.replace('/(auth)/login')}
              >
                Fazer login
              </Button>
            </YStack>
          </Card>
        </YStack>
      </SafeAreaView>
    );
  }

  // Reset form
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <YStack flex={1} padding="$4" justifyContent="center">
            {/* Header */}
            <YStack alignItems="center" marginBottom="$6">
              <Heading level={2} marginBottom="$2">
                Nova Senha
              </Heading>
              <Text color="secondary" align="center">
                Digite sua nova senha abaixo
              </Text>
            </YStack>

            {/* Form Card */}
            <Card variant="elevated" padding="$4">
              <YStack gap="$3">
                {/* Error message */}
                {error && (
                  <View
                    backgroundColor="$errorBackground"
                    padding="$2"
                    borderRadius="$md"
                  >
                    <Text color="error" size="sm" align="center">
                      {error}
                    </Text>
                  </View>
                )}

                {/* Password */}
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Nova senha"
                      placeholder="••••••••"
                      secureTextEntry
                      autoCapitalize="none"
                      autoComplete="new-password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.password?.message}
                      helperText="Mínimo 8 caracteres com maiúscula, minúscula e número"
                    />
                  )}
                />

                {/* Submit button */}
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={handleSubmit(onSubmit)}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Redefinir senha
                </Button>
              </YStack>
            </Card>

            {/* Back to login */}
            <XStack justifyContent="center" marginTop="$4">
              <Link href="/(auth)/login" asChild>
                <Text color="accent" weight="semibold">
                  ← Voltar ao login
                </Text>
              </Link>
            </XStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
