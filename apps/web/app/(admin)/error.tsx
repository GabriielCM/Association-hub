'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button, Card, CardContent } from '@/components/ui';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="flex h-full items-center justify-center p-8">
      <Card variant="elevated" className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/20">
              <AlertCircle className="h-8 w-8 text-error-dark" />
            </div>

            <h2 className="text-xl font-bold">Erro no painel</h2>

            <p className="text-sm text-muted-foreground">
              Ocorreu um erro ao carregar esta página. Tente novamente.
            </p>

            <div className="flex gap-3">
              <Link href="/dashboard">
                <Button variant="outline" size="md" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="primary" size="md" onClick={reset} className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Tentar novamente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
