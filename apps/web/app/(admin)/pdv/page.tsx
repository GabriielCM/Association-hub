'use client';

import { useState } from 'react';
import { Plus, Monitor } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { PdvsTable } from '@/components/admin/pdv/PdvsTable';
import { PdvDialog } from '@/components/admin/pdv/PdvDialog';
import { CredentialsDialog } from '@/components/admin/pdv/CredentialsDialog';
import { useAdminPdvs, useDeletePdv } from '@/lib/hooks/useAdminPdv';
import type { PdvItem } from '@/lib/api/pdv.api';

export default function PdvPage() {
  const { toast } = useToast();
  const { data: pdvs, isLoading } = useAdminPdvs();
  const deletePdv = useDeletePdv();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPdv, setEditingPdv] = useState<PdvItem | null>(null);
  const [credentials, setCredentials] = useState<{
    apiKey: string;
    apiSecret: string;
  } | null>(null);
  const [credentialsOpen, setCredentialsOpen] = useState(false);

  const handleCreate = () => {
    setEditingPdv(null);
    setDialogOpen(true);
  };

  const handleEdit = (pdv: PdvItem) => {
    setEditingPdv(pdv);
    setDialogOpen(true);
  };

  const handleCreated = (creds: { apiKey: string; apiSecret: string }) => {
    setCredentials(creds);
    setCredentialsOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Desativar PDV "${name}"?`)) return;
    deletePdv.mutate(id, {
      onSuccess: () => toast({ title: 'PDV desativado!' }),
      onError: (err) => {
        toast({ title: 'Erro', description: err.message, variant: 'error' });
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pontos de Venda</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie terminais PDV, produtos e vendas
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="mr-1 h-4 w-4" />
          Novo PDV
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : !pdvs || pdvs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12">
          <Monitor className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-lg font-semibold">Nenhum PDV cadastrado</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Crie um ponto de venda para comecar.
          </p>
          <Button onClick={handleCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Criar PDV
          </Button>
        </div>
      ) : (
        <PdvsTable pdvs={pdvs} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <PdvDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        pdv={editingPdv}
        onCreated={handleCreated}
      />

      <CredentialsDialog
        open={credentialsOpen}
        onOpenChange={setCredentialsOpen}
        credentials={credentials}
      />
    </div>
  );
}
