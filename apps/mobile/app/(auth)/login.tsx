import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { View, YStack, XStack } from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Input, Text, Heading, Card } from '@ahub/ui';
import { loginSchema, type LoginInput } from '@ahub/shared/validation';
import { useAuth } from '@/hooks/useAuth';
import { useBiometrics, getBiometricLabel } from '@/hooks/useBiometrics';

export default function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuth();
  const { isEnabled, biometricType, authenticate } = useBiometrics();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    clearError();
    const success = await login(data);
    if (success) {
      router.replace('/(tabs)');
    }
  };

  const handleBiometricLogin = async () => {
    const result = await authenticate('Entrar no A-hub');
    if (result.success) {
      // In a real app, you'd store encrypted credentials
      // and use them here for auto-login
      // For now, just show a message
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
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
              <Heading level={1} color="accent" marginBottom="$2">
                A-hub
              </Heading>
              <Text color="secondary">Entre na sua conta</Text>
            </YStack>

            {/* Login Card */}
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

                {/* Password */}
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Senha"
                      placeholder="Sua senha"
                      secureTextEntry
                      autoComplete="password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.password?.message}
                    />
                  )}
                />

                {/* Forgot password */}
                <XStack justifyContent="flex-end">
                  <Link href="/(auth)/forgot-password" asChild>
                    <Text color="accent" size="sm">
                      Esqueceu a senha?
                    </Text>
                  </Link>
                </XStack>

                {/* Login button */}
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={handleSubmit(onSubmit)}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Entrar
                </Button>

                {/* Biometric login */}
                {isEnabled && biometricType && (
                  <>
                    <XStack alignItems="center" gap="$2" marginVertical="$2">
                      <View flex={1} height={1} backgroundColor="$borderColor" />
                      <Text color="secondary" size="sm">
                        ou
                      </Text>
                      <View flex={1} height={1} backgroundColor="$borderColor" />
                    </XStack>

                    <Button
                      variant="outline"
                      size="lg"
                      fullWidth
                      onPress={handleBiometricLogin}
                    >
                      Entrar com {getBiometricLabel(biometricType)}
                    </Button>
                  </>
                )}
              </YStack>
            </Card>

            {/* Register link */}
            <XStack justifyContent="center" marginTop="$4" gap="$1">
              <Text color="secondary">Não tem uma conta?</Text>
              <Link href="/(auth)/register" asChild>
                <Text color="accent" weight="semibold">
                  Cadastre-se
                </Text>
              </Link>
            </XStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
