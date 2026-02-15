'use client';

import { useState } from 'react';
import { Plus, Building2, Wrench, AlertCircle } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { SpacesTable } from '@/components/admin/spaces/SpacesTable';
import { SpaceDialog } from '@/components/admin/spaces/SpaceDialog';
import { useAdminSpaces, useDeleteSpace } from '@/lib/hooks/useAdminSpaces';
import { usePendingBookings } from '@/lib/hooks/useAdminBookings';
import type { SpaceItem, SpaceStatus } from '@/lib/api/spaces.api';

export default function SpacesPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<SpaceStatus | ''>('');
  const { data: spaces, isLoading } = useAdminSpaces(
    statusFilter ? { status: statusFilter } : undefined,
  );
  const { data: pendingBookings } = usePendingBookings();
  const deleteSpace = useDeleteSpace();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<SpaceItem | null>(null);

  const handleCreate = () => {
    setEditingSpace(null);
    setDialogOpen(true);
  };

  const handleEdit = (space: SpaceItem) => {
    setEditingSpace(space);
    setDialogOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Excluir espaço "${name}"? Esta ação não pode ser desfeita.`)) return;
    deleteSpace.mutate(id, {
      onSuccess: () => toast({ title: 'Espaço excluído!' }),
      onError: (err) => {
        toast({ title: 'Erro', description: err.message, variant: 'error' });
      },
    });
  };

  const allSpaces = spaces ?? [];
  const activeCount = allSpaces.filter((s) => s.status === 'ACTIVE').length;
  const maintenanceCount = allSpaces.filter((s) => s.status === 'MAINTENANCE').length;
  const pendingCount = pendingBookings?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Espaços</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie espaços para reserva (churrasqueiras, salões, quadras)
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="mr-1 h-4 w-4" />
          Novo Espaço
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{allSpaces.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">Ativos</p>
              <p className="text-xl font-bold">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <Wrench className="h-6 w-6 text-yellow-600" />
            <div>
              <p className="text-xs text-muted-foreground">Manutenção</p>
              <p className="text-xl font-bold">{maintenanceCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            <div>
              <p className="text-xs text-muted-foreground">Reservas Pendentes</p>
              <p className="text-xl font-bold">{pendingCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as SpaceStatus | '')}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="MAINTENANCE">Manutenção</option>
          <option value="INACTIVE">Inativo</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : allSpaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12">
          <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-lg font-semibold">Nenhum espaço cadastrado</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Crie um espaço para que membros possam reservar.
          </p>
          <Button onClick={handleCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Criar Espaço
          </Button>
        </div>
      ) : (
        <SpacesTable
          spaces={allSpaces}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <SpaceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        space={editingSpace}
      />
    </div>
  );
}
