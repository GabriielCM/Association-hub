'use client';

import { useState } from 'react';
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
import { useUpdatePdvStock } from '@/lib/hooks/useAdminPdv';
import type { PdvProductItem } from '@/lib/api/pdv.api';

interface PdvStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdvId: string;
  products: PdvProductItem[];
}

export function PdvStockDialog({
  open,
  onOpenChange,
  pdvId,
  products,
}: PdvStockDialogProps) {
  const { toast } = useToast();
  const updateStock = useUpdatePdvStock();

  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!selectedProductId) {
      toast({ title: 'Selecione um produto', variant: 'error' });
      return;
    }
    if (quantity === 0) {
      toast({ title: 'Quantidade deve ser diferente de zero', variant: 'error' });
      return;
    }

    updateStock.mutate(
      {
        pdvId,
        data: {
          productId: selectedProductId,
          quantity,
          ...(reason.trim() && { reason: reason.trim() }),
        },
      },
      {
        onSuccess: () => {
          toast({ title: 'Estoque atualizado!' });
          resetForm();
          onOpenChange(false);
        },
        onError: (err) => {
          toast({ title: 'Erro', description: err.message, variant: 'error' });
        },
      }
    );
  };

  const resetForm = () => {
    setSelectedProductId('');
    setQuantity(0);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar Estoque</DialogTitle>
          <DialogDescription>
            Valores positivos = entrada, negativos = saida.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Produto</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Selecionar produto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (estoque: {p.stock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Quantidade (+ entrada, - saida)
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Motivo (opcional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Reposicao de estoque"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={updateStock.isPending}>
            {updateStock.isPending ? 'Atualizando...' : 'Atualizar Estoque'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
