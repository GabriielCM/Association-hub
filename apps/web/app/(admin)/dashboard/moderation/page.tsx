'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  Ban,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
} from '@/components/ui';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
  useAdminReports,
  useResolveReport,
  useSuspendUser,
  useForceDeletePost,
} from '@/lib/hooks/useAdminDashboard';
import type { ModerationReport, ReportStatus } from '@ahub/shared/types';

const STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: 'Pendente',
  RESOLVED: 'Resolvido',
  DISMISSED: 'Descartado',
};

const STATUS_VARIANTS: Record<ReportStatus, 'warning' | 'primary' | 'secondary'> = {
  PENDING: 'warning',
  RESOLVED: 'primary',
  DISMISSED: 'secondary',
};

const REASON_LABELS: Record<string, string> = {
  SPAM: 'Spam',
  INAPPROPRIATE: 'Inapropriado',
  HARASSMENT: 'Assedio',
  MISINFORMATION: 'Desinformacao',
  OTHER: 'Outro',
};

export default function ModerationPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    'PENDING'
  );
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(
    null
  );
  const [suspendDuration, setSuspendDuration] = useState<number | undefined>(
    undefined
  );
  const [suspendReason, setSuspendReason] = useState('');

  const { data: reports, isLoading } = useAdminReports(statusFilter);
  const resolveReport = useResolveReport();
  const suspendUser = useSuspendUser();
  const forceDeletePost = useForceDeletePost();

  const handleResolve = (reportId: string) => {
    resolveReport.mutate({
      reportId,
      data: { status: 'RESOLVED' },
    });
    setSelectedReport(null);
  };

  const handleDismiss = (reportId: string) => {
    resolveReport.mutate({
      reportId,
      data: { status: 'DISMISSED' },
    });
    setSelectedReport(null);
  };

  const handleDeletePost = (postId: string) => {
    forceDeletePost.mutate(postId);
  };

  const handleSuspendUser = (userId: string) => {
    if (!suspendReason.trim()) return;
    suspendUser.mutate({
      userId,
      data: {
        reason: suspendReason,
        ...(suspendDuration && { duration_days: suspendDuration }),
      },
    });
    setSuspendReason('');
    setSuspendDuration(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Moderacao</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie denuncias e conteudos reportados
          </p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2">
        {(['PENDING', 'RESOLVED', 'DISMISSED', undefined] as const).map(
          (status) => (
            <Button
              key={status ?? 'all'}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status ? STATUS_LABELS[status] : 'Todos'}
            </Button>
          )
        )}
      </div>

      {/* Reports table */}
      {isLoading ? (
        <Card variant="elevated">
          <CardContent className="py-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : !reports || reports.length === 0 ? (
        <Card variant="elevated">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <CheckCircle className="h-12 w-12 text-success-dark" />
              <h3 className="font-semibold">Nenhuma denuncia</h3>
              <p className="text-sm text-muted-foreground">
                {statusFilter === 'PENDING'
                  ? 'Nao ha denuncias pendentes no momento'
                  : 'Nenhuma denuncia encontrada com este filtro'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id} variant="elevated">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          STATUS_VARIANTS[report.status] ?? 'secondary'
                        }
                      >
                        {STATUS_LABELS[report.status]}
                      </Badge>
                      <Badge variant="secondary">
                        {REASON_LABELS[report.reason] ?? report.reason}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {report.type === 'post' ? 'Post' : 'Comentario'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        Reportado por:{' '}
                        <span className="font-semibold">
                          {report.reporter.name}
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(report.created_at).toLocaleDateString(
                          'pt-BR'
                        )}
                      </span>
                    </div>

                    {report.description && (
                      <p className="text-sm text-muted-foreground">
                        &ldquo;{report.description}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {report.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolve(report.id)}
                        disabled={resolveReport.isPending}
                      >
                        <CheckCircle className="mr-1 h-4 w-4 text-success-dark" />
                        Resolver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDismiss(report.id)}
                        disabled={resolveReport.isPending}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Descartar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          handleDeletePost(report.target_id)
                        }
                        disabled={forceDeletePost.isPending}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Excluir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Ban className="mr-1 h-4 w-4 text-error-dark" />
                        Suspender
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Suspend User Dialog */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Suspender Usuario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Reportado por: {selectedReport.reporter.name}
                </p>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duracao</label>
                  <div className="flex gap-2">
                    {[
                      { days: 1, label: '24h' },
                      { days: 7, label: '7 dias' },
                      { days: 30, label: '30 dias' },
                      { days: undefined, label: 'Permanente' },
                    ].map(({ days, label }) => (
                      <Button
                        key={label}
                        variant={
                          suspendDuration === days ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setSuspendDuration(days)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Motivo</label>
                  <textarea
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    placeholder="Descreva o motivo da suspensao..."
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedReport(null);
                      setSuspendReason('');
                      setSuspendDuration(undefined);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      handleSuspendUser(selectedReport.reporter.id)
                    }
                    disabled={
                      !suspendReason.trim() || suspendUser.isPending
                    }
                  >
                    {suspendUser.isPending ? (
                      <Spinner size="sm" />
                    ) : (
                      'Suspender'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
