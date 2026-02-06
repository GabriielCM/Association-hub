'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { registerSchema, type RegisterInput } from '@ahub/shared/validation';
import { useAuth } from '@/lib/hooks/useAuth';

export default function RegisterPage() {
  const { register: registerUser, isLoading, error, clearError } = useAuth();

  const {
    register,
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
    await registerUser(data);
  };

  return (
    <>
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary">A-hub</h1>
        <p className="mt-2 text-muted-foreground">Criar nova conta</p>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Cadastro</CardTitle>
          <CardDescription>
            Preencha os dados para criar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Error message */}
            {error && (
              <div className="rounded-md bg-error-background p-3 text-center text-sm text-error-dark">
                {error}
              </div>
            )}

            <Input
              label="Nome completo"
              type="text"
              placeholder="Seu nome"
              autoComplete="name"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Telefone (opcional)"
              type="tel"
              placeholder="(11) 99999-9999"
              autoComplete="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Senha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              error={errors.password?.message}
              helperText="Deve conter maiúscula, minúscula e número"
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isLoading}
            >
              Criar conta
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Já tem uma conta?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </>
  );
}
