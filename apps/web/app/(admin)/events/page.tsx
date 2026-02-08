'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Calendar, Users, CheckCircle, Coins, Search } from 'lucide-react';
import { Button, Input, Spinner } from '@/components/ui';
import { useAdminEvents, useDeleteEvent } from '@/lib/hooks/useAdminEvents';
import { EventsTable } from '@/components/admin/events/EventsTable';
import type { EventStatus, EventCategory } from '@ahub/shared/types';

const STATUS_OPTIONS: { value: EventStatus | ''; label: string }[] = [
  { value: '', label: 'Todos os status' },
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'SCHEDULED', label: 'Agendado' },
  { value: 'ONGOING', label: 'Em andamento' },
  { value: 'ENDED', label: 'Encerrado' },
  { value: 'CANCELED', label: 'Cancelado' },
];

const CATEGORY_OPTIONS: { value: EventCategory | ''; label: string }[] = [
  { value: '', label: 'Todas as categorias' },
  { value: 'SOCIAL', label: 'Social' },
  { value: 'SPORTS', label: 'Esportes' },
  { value: 'CULTURAL', label: 'Cultural' },
  { value: 'EDUCATIONAL', label: 'Educacional' },
  { value: 'NETWORKING', label: 'Networking' },
  { value: 'GASTRO', label: 'Gastronomia' },
  { value: 'MUSIC', label: 'Musica' },
  { value: 'ART', label: 'Arte' },
  { value: 'GAMES', label: 'Jogos' },
  { value: 'INSTITUTIONAL', label: 'Institucional' },
];

export default function EventsManagementPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | ''>('');

  const { data, isLoading } = useAdminEvents({
    page,
    perPage: 20,
    ...(search ? { search } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(categoryFilter ? { category: categoryFilter } : {}),
  });

  const deleteEvent = useDeleteEvent();

  const events = data?.data ?? [];
  const stats = data?.stats;
  const meta = data?.meta;

  const handleSearch = () => setSearch(searchInput);

  const handleDelete = (eventId: string, title: string) => {
    if (
      window.confirm(
        `Excluir o evento "${title}"? Esta acao nao pode ser desfeita.`
      )
    ) {
      deleteEvent.mutate(eventId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Eventos</h1>
          <p className="text-muted-foreground">
            Gerencie eventos da associacao
          </p>
        </div>
        <Link href="/events/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Criar Evento
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Total de Eventos
            </div>
            <p className="mt-1 text-2xl font-bold">
              {stats.totalEvents}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Eventos Ativos
            </div>
            <p className="mt-1 text-2xl font-bold">
              {stats.activeEvents}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              Total Check-ins
            </div>
            <p className="mt-1 text-2xl font-bold">
              {stats.totalCheckIns}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="h-4 w-4" />
              Pontos Distribuidos
            </div>
            <p className="mt-1 text-2xl font-bold">
              {stats.totalPointsDistributed.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as EventStatus | '');
            setPage(1);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value as EventCategory | '');
            setPage(1);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Button variant="outline" onClick={handleSearch}>
          Buscar
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : events.length > 0 ? (
        <>
          <EventsTable events={events} onDelete={handleDelete} />

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {events.length} de {meta.totalCount} eventos
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Proximo
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-12">
          <Calendar className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium">Nenhum evento encontrado</p>
            <p className="text-sm text-muted-foreground">
              Crie um novo evento para comecar
            </p>
          </div>
          <Link href="/events/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Criar Evento
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
