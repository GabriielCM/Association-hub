'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, AlertCircle } from 'lucide-react';

import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui';
import { newPasswordSchema, type NewPasswordInput } from '@ahub/shared/validation';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [resetComplete, setResetComplete] = useState(false);
  const { resetPassword, isLoading, error, clearError } = useAuth();

  const {
    register,
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

  // No token provided
  if (!token) {
    return (
      <>
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary">A-hub</h1>
        </div>

        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/20">
                <AlertCircle className="h-8 w-8 text-error-dark" />
              </div>

              <CardTitle>Link inválido</CardTitle>

              <p className="text-muted-foreground">
                O link de recuperação de senha é inválido ou expirou.
                Solicite um novo link.
              </p>

              <Link href="/forgot-password">
                <Button variant="primary" size="lg" className="w-full">
                  Solicitar novo link
                </Button>
              </Link>

              <Link
                href="/login"
                className="text-sm font-semibold text-primary hover:underline"
              >
                ← Voltar ao login
              </Link>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  // Password reset complete
  if (resetComplete) {
    return (
      <>
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary">A-hub</h1>
        </div>

        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
                <CheckCircle className="h-8 w-8 text-success-dark" />
              </div>

              <CardTitle>Senha redefinida!</CardTitle>

              <p className="text-muted-foreground">
                Sua senha foi alterada com sucesso. Faça login com sua nova
                senha.
              </p>

              <Link href="/login" className="w-full">
                <Button variant="primary" size="lg" className="w-full">
                  Fazer login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  // Password reset form
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary">A-hub</h1>
        <p className="mt-2 text-muted-foreground">Redefinir senha</p>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Nova senha</CardTitle>
          <CardDescription>
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-error/20 p-3 text-center text-sm text-error-dark">
                {error}
              </div>
            )}

            <input type="hidden" {...register('token')} />

            <Input
              label="Nova senha"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.password?.message}
              helperText="Mínimo 8 caracteres com maiúscula, minúscula e número"
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isLoading}
            >
              Redefinir senha
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-4 text-center">
        <Link
          href="/login"
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← Voltar ao login
        </Link>
      </p>
    </>
  );
}
