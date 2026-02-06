'use client';

import { useParams } from 'next/navigation';

export default function DisplayPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-background p-8">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-primary">A-hub</h1>
        <p className="mb-8 text-2xl text-dark-foreground">Display Mode</p>

        <div className="rounded-2xl bg-dark-surface p-8 shadow-neu-dark">
          <p className="text-xl text-muted-foreground">
            Evento ID: <span className="font-mono text-primary">{eventId}</span>
          </p>
          <p className="mt-4 text-muted-foreground">
            Esta tela será usada para exibição em TVs/Kiosks durante eventos.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Implementação completa na Fase 3 (Eventos)
          </p>
        </div>
      </div>
    </div>
  );
}
