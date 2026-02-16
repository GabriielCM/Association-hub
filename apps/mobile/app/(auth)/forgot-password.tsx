import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { View, YStack, XStack } from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Input, Text, Heading, Card } from '@ahub/ui';
import { resetPasswordSchema, type ResetPasswordInput } from '@ahub/shared/validation';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPasswordScreen() {
  const { requestPasswordReset, isLoading, error, clearError } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    clearError();
    const success = await requestPasswordReset(data.email);
    if (success) {
      setEmailSent(true);
    }
  };

  if (emailSent) {
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
                Email enviado!
              </Heading>

              <Text color="secondary" align="center">
                Enviamos instruções de recuperação para{' '}
                <Text weight="semibold">{getValues('email')}</Text>
              </Text>

              <Text color="secondary" size="sm" align="center">
                Não recebeu? Verifique sua caixa de spam ou tente novamente.
              </Text>

              <Button
                variant="outline"
                size="lg"
                fullWidth
                onPress={() => setEmailSent(false)}
              >
                Tentar novamente
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
                Recuperar Senha
              </Heading>
              <Text color="secondary" align="center">
                Digite seu email e enviaremos instruções para redefinir sua senha
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

                {/* Email */}
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Email"
                      placeholder="seu@email.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.email?.message}
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
                  Enviar email
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
