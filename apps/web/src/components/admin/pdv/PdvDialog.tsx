'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { useCreatePdv, useUpdatePdv } from '@/lib/hooks/useAdminPdv';
import type { PdvItem, PdvStatus } from '@/lib/api/pdv.api';

interface PdvDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdv?: PdvItem | null;
  onCreated?: (data: { apiKey: string; apiSecret: string }) => void;
}

export function PdvDialog({
  open,
  onOpenChange,
  pdv,
  onCreated,
}: PdvDialogProps) {
  const { toast } = useToast();
  const createPdv = useCreatePdv();
  const updatePdv = useUpdatePdv();
  const isEditing = !!pdv;

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<PdvStatus>('ACTIVE');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (pdv) {
      setName(pdv.name);
      setLocation(pdv.location);
      setStatus(pdv.status);
    } else {
      resetForm();
    }
  }, [pdv, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nome e obrigatorio';
    if (!location.trim()) newErrors.location = 'Localizacao e obrigatoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (isEditing && pdv) {
      updatePdv.mutate(
        {
          id: pdv.id,
          data: { name: name.trim(), location: location.trim(), status },
        },
        {
          onSuccess: () => {
            toast({ title: 'PDV atualizado!' });
            onOpenChange(false);
          },
          onError: (err) => {
            toast({ title: 'Erro', description: err.message, variant: 'error' });
          },
        }
      );
    } else {
      createPdv.mutate(
        { name: name.trim(), location: location.trim() },
        {
          onSuccess: (data) => {
            toast({ title: 'PDV criado!' });
            resetForm();
            onOpenChange(false);
            if (onCreated && data.apiKey && data.apiSecret) {
              onCreated({ apiKey: data.apiKey, apiSecret: data.apiSecret });
            }
          },
          onError: (err) => {
            toast({ title: 'Erro', description: err.message, variant: 'error' });
          },
        }
      );
    }
  };

  const resetForm = () => {
    setName('');
    setLocation('');
    setStatus('ACTIVE');
    setErrors({});
  };

  const isPending = createPdv.isPending || updatePdv.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar PDV' : 'Novo PDV'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados do ponto de venda.'
              : 'Preencha os dados para criar um novo PDV.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: PDV Bar Principal"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Localizacao
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Terreo - Entrada Principal"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.location && (
              <p className="mt-1 text-xs text-red-500">{errors.location}</p>
            )}
          </div>

          {isEditing && (
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PdvStatus)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
                <option value="MAINTENANCE">Manutencao</option>
              </select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar PDV'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
