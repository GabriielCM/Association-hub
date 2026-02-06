'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle } from 'lucide-react';

import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { resetPasswordSchema, type ResetPasswordInput } from '@ahub/shared/validation';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const { requestPasswordReset, isLoading, error, clearError } = useAuth();

  const {
    register,
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
      <>
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary">A-hub</h1>
        </div>

        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-background">
                <CheckCircle className="h-8 w-8 text-success-dark" />
              </div>

              <CardTitle>Email enviado!</CardTitle>

              <p className="text-muted-foreground">
                Enviamos instruções de recuperação para{' '}
                <span className="font-semibold">{getValues('email')}</span>
              </p>

              <p className="text-sm text-muted-foreground">
                Não recebeu? Verifique sua caixa de spam ou tente novamente.
              </p>

              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => setEmailSent(false)}
              >
                Tentar novamente
              </Button>

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

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary">A-hub</h1>
        <p className="mt-2 text-muted-foreground">Recuperar senha</p>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Esqueceu sua senha?</CardTitle>
          <CardDescription>
            Digite seu email e enviaremos instruções para redefinir sua senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-error-background p-3 text-center text-sm text-error-dark">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isLoading}
            >
              Enviar email
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
