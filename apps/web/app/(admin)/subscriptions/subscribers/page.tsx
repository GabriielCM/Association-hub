'use client';

import { useState } from 'react';
import { UserX, UserCheck, Search } from 'lucide-react';

import { Button } from '@/components/ui';
import {
  useSubscribers,
  useSuspendUser,
  useActivateUser,
} from '@/lib/hooks/useAdminSubscriptions';

export default function SubscribersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [suspendDialog, setSuspendDialog] = useState<{
    userId: string;
    name: string;
  } | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const { data, isLoading } = useSubscribers({
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  });
  const suspend = useSuspendUser();
  const activate = useActivateUser();

  const handleSuspend = () => {
    if (!suspendDialog || !suspendReason) return;
    suspend.mutate(
      { userId: suspendDialog.userId, reason: suspendReason },
      {
        onSuccess: () => {
          setSuspendDialog(null);
          setSuspendReason('');
        },
      }
    );
  };

  const handleActivate = (userId: string) => {
    if (window.confirm('Reativar a assinatura deste usuario?')) {
      activate.mutate(userId);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assinantes</h1>
        <p className="text-muted-foreground">Gerencie os assinantes dos planos</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="suspended">Suspensos</option>
          <option value="cancelled">Cancelados</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usuario</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plano</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Desde</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {data?.subscribers.map((entry) => (
                <tr key={entry.subscription.id} className="border-b border-border/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{entry.user.name}</p>
                      <p className="text-xs text-muted-foreground">{entry.user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">{entry.subscription.planName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={entry.subscription.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(entry.subscription.subscribedAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {entry.subscription.status === 'active' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSuspendDialog({
                            userId: entry.user.id,
                            name: entry.user.name,
                          })
                        }
                        className="text-red-600"
                      >
                        <UserX className="mr-1 h-3 w-3" />
                        Suspender
                      </Button>
                    ) : entry.subscription.status === 'suspended' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActivate(entry.user.id)}
                        className="text-green-600"
                      >
                        <UserCheck className="mr-1 h-3 w-3" />
                        Reativar
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {data?.subscribers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum assinante encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {data.pagination.total} resultados
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-2 text-sm">
                  {page} / {data.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Proximo
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suspend Dialog */}
      {suspendDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-surface p-6">
            <h3 className="text-lg font-semibold">Suspender assinatura</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Suspender a assinatura de {suspendDialog.name}? Os beneficios serao removidos imediatamente.
            </p>
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium">Motivo (obrigatorio)</label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Informe o motivo da suspensao..."
                className="w-full rounded border border-border bg-background p-2 text-sm"
                rows={3}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSuspendDialog(null);
                  setSuspendReason('');
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSuspend}
                disabled={!suspendReason || suspend.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {suspend.isPending ? 'Suspendendo...' : 'Suspender'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    active: { label: 'Ativo', className: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' },
    suspended: { label: 'Suspenso', className: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' },
    cancelled: { label: 'Cancelado', className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300' },
  };
  const c = config[status] ?? { label: status, className: 'bg-muted text-muted-foreground' };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${c.className}`}>
      {c.label}
    </span>
  );
}
