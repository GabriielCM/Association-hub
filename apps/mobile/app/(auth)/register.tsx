import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { View, YStack, XStack } from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Input, Text, Heading, Card } from '@ahub/ui';
import { registerSchema, type RegisterInput } from '@ahub/shared/validation';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterScreen() {
  const { register, isLoading, error, clearError } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    clearError();
    const success = await register(data);
    if (success) {
      router.replace('/(tabs)');
    }
  };

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
              <Heading level={1} color="accent" marginBottom="$2">
                Criar Conta
              </Heading>
              <Text color="secondary">Junte-se ao A-hub</Text>
            </YStack>

            {/* Register Card */}
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

                {/* Name */}
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Nome completo"
                      placeholder="Seu nome"
                      autoComplete="name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.name?.message}
                    />
                  )}
                />

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

                {/* Phone (optional) */}
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Telefone (opcional)"
                      placeholder="(11) 99999-9999"
                      keyboardType="phone-pad"
                      autoComplete="tel"
                      value={value || ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.phone?.message}
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
                      placeholder="Mínimo 8 caracteres"
                      secureTextEntry
                      autoComplete="new-password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.password?.message}
                      helperText="Deve conter maiúscula, minúscula e número"
                    />
                  )}
                />

                {/* Register button */}
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={handleSubmit(onSubmit)}
                  loading={isLoading}
                  disabled={isLoading}
                  marginTop="$2"
                >
                  Criar conta
                </Button>
              </YStack>
            </Card>

            {/* Login link */}
            <XStack justifyContent="center" marginTop="$4" gap="$1">
              <Text color="secondary">Já tem uma conta?</Text>
              <Link href="/(auth)/login" asChild>
                <Text color="accent" weight="semibold">
                  Entrar
                </Text>
              </Link>
            </XStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
