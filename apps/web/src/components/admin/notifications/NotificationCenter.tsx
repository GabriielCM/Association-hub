'use client';

import { useState } from 'react';
import { Bell, Users } from 'lucide-react';
import { Spinner } from '@/components/ui';
import { useAdminNotifications } from '@/lib/hooks/useAdminNotifications';

const categoryLabels: Record<string, string> = {
  SOCIAL: 'Social',
  EVENTS: 'Eventos',
  POINTS: 'Pontos',
  RESERVATIONS: 'Reservas',
  SYSTEM: 'Sistema',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NotificationCenter() {
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data, isLoading } = useAdminNotifications({
    page,
    perPage: 20,
    ...(categoryFilter ? { category: categoryFilter } : {}),
  });

  const notifications = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Historico de Notificacoes</h3>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none"
          >
            <option value="">Todas as categorias</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Spinner />
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <Bell className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p>Nenhuma notificacao encontrada</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Titulo</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Tipo</th>
                  <th className="px-4 py-3 text-center font-medium">
                    Destinatarios
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification) => (
                  <tr key={notification.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{notification.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                          {notification.body}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {categoryLabels[notification.category] ??
                          notification.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {notification.type.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-sm">
                        <Users className="h-3.5 w-3.5" />
                        {notification.recipientCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(notification.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Pagina {meta.currentPage} de {meta.totalPages} ({meta.total}{' '}
                total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(meta.totalPages, p + 1))
                  }
                  disabled={page >= meta.totalPages}
                  className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Proxima
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
