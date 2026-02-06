'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-error/20">
          <AlertCircle className="h-8 w-8 text-error-dark" />
        </div>

        <h2 className="mb-2 text-2xl font-bold text-foreground">
          Algo deu errado
        </h2>

        <p className="mb-6 text-muted-foreground">
          Ocorreu um erro inesperado. Tente novamente ou entre em contato com o
          suporte se o problema persistir.
        </p>

        <Button
          variant="primary"
          size="lg"
          onClick={reset}
          className="gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
