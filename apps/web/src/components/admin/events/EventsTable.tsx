'use client';

import Link from 'next/link';
import { Edit2, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { EventStatusBadge } from './EventStatusBadge';
import type { AdminEventItem } from '@/lib/api/events.api';

interface EventsTableProps {
  events: AdminEventItem[];
  onDelete: (eventId: string, title: string) => void;
}

const categoryLabels: Record<string, string> = {
  SOCIAL: 'Social',
  SPORTS: 'Esportes',
  CULTURAL: 'Cultural',
  EDUCATIONAL: 'Educacional',
  NETWORKING: 'Networking',
  GASTRO: 'Gastronomia',
  MUSIC: 'Musica',
  ART: 'Arte',
  GAMES: 'Jogos',
  INSTITUTIONAL: 'Institucional',
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function EventsTable({ events, onDelete }: EventsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Evento</th>
            <th className="px-4 py-3 text-left font-medium">Categoria</th>
            <th className="px-4 py-3 text-left font-medium">Data</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-center font-medium">
              Confirmacoes
            </th>
            <th className="px-4 py-3 text-center font-medium">
              Check-ins
            </th>
            <th className="px-4 py-3 text-right font-medium">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-b hover:bg-muted/30">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded"
                    style={{
                      backgroundColor: event.color ?? '#e5e7eb',
                    }}
                  />
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.locationName}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {categoryLabels[event.category] ?? event.category}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(event.startDate)}
              </td>
              <td className="px-4 py-3">
                <EventStatusBadge status={event.status} />
              </td>
              <td className="px-4 py-3 text-center">
                {event.confirmationsCount}
              </td>
              <td className="px-4 py-3 text-center">
                {event.checkInsTotal}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/events/${event.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/events/${event.id}/edit`}>
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(event.id, event.title)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
