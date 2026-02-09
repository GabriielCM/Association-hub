'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit2,
  Pause,
  Play,
  XCircle,
  Download,
  Monitor,
  Users,
  CheckCircle,
  Coins,
  Award,
  UserPlus,
  Trash2,
} from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { EventStatusBadge } from '@/components/admin/events/EventStatusBadge';
import { CheckInsChart } from '@/components/admin/events/CheckInsChart';
import { ManualCheckinDialog } from '@/components/admin/events/ManualCheckinDialog';
import {
  useAdminEventDetail,
  useAdminEventAnalytics,
  useAdminEventParticipants,
  usePublishEvent,
  usePauseEvent,
  useCancelEvent,
  useDeleteEvent,
} from '@/lib/hooks/useAdminEvents';
import { getExportCsvUrl, getExportPdfUrl } from '@/lib/api/events.api';

export default function EventDetailPage({
  params,
}: {
  params: { eventId: string };
}) {
  const { eventId } = params;
  const router = useRouter();
  const { toast } = useToast();

  const { data: event, isLoading } = useAdminEventDetail(eventId);
  const { data: analytics } = useAdminEventAnalytics(eventId);
  const { data: participantsData } = useAdminEventParticipants(eventId);

  const [manualCheckinOpen, setManualCheckinOpen] = useState(false);

  const publishEvent = usePublishEvent();
  const pauseEvent = usePauseEvent();
  const cancelEvent = useCancelEvent();
  const deleteEvent = useDeleteEvent();

  if (isLoading || !event) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const participants = participantsData?.data ?? [];

  const handlePublish = () => {
    publishEvent.mutate(eventId, {
      onSuccess: () =>
        toast({ title: 'Evento publicado com sucesso!' }),
      onError: (err) =>
        toast({
          title: 'Erro ao publicar',
          description: err.message,
          variant: 'error',
        }),
    });
  };

  const handlePause = () => {
    pauseEvent.mutate(
      { eventId, isPaused: !event.isPaused },
      {
        onSuccess: () =>
          toast({
            title: event.isPaused
              ? 'Check-ins retomados'
              : 'Check-ins pausados',
          }),
      }
    );
  };

  const handleCancel = () => {
    const reason = window.prompt('Motivo do cancelamento:');
    if (!reason) return;
    cancelEvent.mutate(
      { eventId, reason },
      {
        onSuccess: () => toast({ title: 'Evento cancelado' }),
      }
    );
  };

  const handleDelete = () => {
    if (
      !window.confirm(
        `Excluir o rascunho "${event.title}"? Esta acao nao pode ser desfeita.`
      )
    )
      return;
    deleteEvent.mutate(eventId, {
      onSuccess: () => {
        toast({ title: 'Evento excluido' });
        router.push('/events');
      },
      onError: (err) =>
        toast({
          title: 'Erro ao excluir',
          description: err.message,
          variant: 'error',
        }),
    });
  };

  const isReadOnly = event.status === 'ENDED' || event.status === 'CANCELED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{event.title}</h1>
              <EventStatusBadge status={event.status} />
              {event.isPaused && (
                <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                  Pausado
                </span>
              )}
            </div>
            <p className="text-muted-foreground">
              {event.locationName} •{' '}
              {new Date(event.startDate).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {event.status === 'DRAFT' && (
            <>
              <Button onClick={handlePublish} disabled={publishEvent.isPending}>
                Publicar
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={deleteEvent.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </>
          )}
          {!isReadOnly && (
            <Link href={`/events/${eventId}/edit`}>
              <Button variant="outline">
                <Edit2 className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Confirmacoes
            </div>
            <p className="mt-1 text-2xl font-bold">
              {analytics.confirmations}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              Check-ins
            </div>
            <p className="mt-1 text-2xl font-bold">
              {analytics.checkIns}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Presenca
            </div>
            <p className="mt-1 text-2xl font-bold">
              {analytics.attendanceRate}%
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="h-4 w-4" />
              Pontos
            </div>
            <p className="mt-1 text-2xl font-bold">
              {analytics.pointsDistributed.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              Badges
            </div>
            <p className="mt-1 text-2xl font-bold">
              {analytics.badgesEarned}
            </p>
          </div>
        </div>
      )}

      {/* Check-ins Chart */}
      {analytics && analytics.checkinsByNumber.length > 0 && (
        <CheckInsChart
          checkinsByNumber={analytics.checkinsByNumber}
          checkinTimeline={analytics.checkinTimeline}
          color={event.color ?? undefined}
        />
      )}

      {/* Control Panel */}
      {(event.status === 'ONGOING' || event.status === 'SCHEDULED') && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 font-semibold">Painel de Controle</h3>
          <div className="flex flex-wrap gap-2">
            {event.status === 'ONGOING' && (
              <>
                <Button
                  variant="outline"
                  onClick={handlePause}
                  disabled={pauseEvent.isPending}
                >
                  {event.isPaused ? (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Retomar Check-ins
                    </>
                  ) : (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pausar Check-ins
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setManualCheckinOpen(true)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Check-in Manual
                </Button>
              </>
            )}
            {(event.status === 'ONGOING' || event.status === 'SCHEDULED') && (
              <a
                href={`/display/${eventId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  <Monitor className="mr-2 h-4 w-4" />
                  Abrir Display
                </Button>
              </a>
            )}
            <Button
              variant="danger"
              onClick={handleCancel}
              disabled={cancelEvent.isPending}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar Evento
            </Button>
          </div>
        </div>
      )}

      {/* Participants */}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold">
            Participantes ({participantsData?.meta?.totalCount ?? 0})
          </h3>
          <div className="flex gap-2">
            <a
              href={getExportCsvUrl(eventId)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <Download className="mr-1 h-3 w-3" />
                CSV
              </Button>
            </a>
            <a
              href={getExportPdfUrl(eventId)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <Download className="mr-1 h-3 w-3" />
                PDF
              </Button>
            </a>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left font-medium">Nome</th>
                <th className="px-4 py-2 text-center font-medium">
                  Plano
                </th>
                <th className="px-4 py-2 text-center font-medium">
                  Check-ins
                </th>
                <th className="px-4 py-2 text-center font-medium">
                  Pontos
                </th>
                <th className="px-4 py-2 text-center font-medium">
                  Badge
                </th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.userId} className="border-b">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        {(p.userName ?? p.userEmail ?? '?').charAt(0)}
                      </div>
                      {p.userName ?? p.userEmail ?? 'Usuario'}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    {p.subscriptionPlan ? (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {p.subscriptionPlan}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">–</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {p.checkIns.length}/{event.checkinsCount}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {p.totalPoints}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {p.hasBadge ? '🏆' : '–'}
                  </td>
                </tr>
              ))}
              {participants.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    Nenhum participante ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <h3 className="font-semibold">Detalhes</h3>
        <p className="text-sm text-muted-foreground">
          {event.description}
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p className="text-muted-foreground">Pontos totais:</p>
          <p>{event.pointsTotal}</p>
          <p className="text-muted-foreground">Check-ins:</p>
          <p>
            {event.checkinsCount} (intervalo: {event.checkinInterval} min)
          </p>
          <p className="text-muted-foreground">Capacidade:</p>
          <p>{event.capacity ?? 'Ilimitada'}</p>
        </div>
      </div>

      {/* Manual Checkin Dialog */}
      <ManualCheckinDialog
        eventId={eventId}
        checkinsCount={event.checkinsCount}
        open={manualCheckinOpen}
        onOpenChange={setManualCheckinOpen}
      />
    </div>
  );
}
