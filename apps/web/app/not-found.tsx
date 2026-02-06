import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <FileQuestion className="h-8 w-8 text-muted-foreground" />
        </div>

        <h2 className="mb-2 text-2xl font-bold text-foreground">
          Página não encontrada
        </h2>

        <p className="mb-6 text-muted-foreground">
          A página que você está procurando não existe ou foi movida.
        </p>

        <Link href="/">
          <Button variant="primary" size="lg">
            Voltar ao início
          </Button>
        </Link>
      </div>
    </div>
  );
}
