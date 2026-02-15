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
import { useUpdateProductStock } from '@/lib/hooks/useAdminStore';

interface StockUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  currentStock: number;
}

export function StockUpdateDialog({
  open,
  onOpenChange,
  productId,
  currentStock,
}: StockUpdateDialogProps) {
  const { toast } = useToast();
  const updateStock = useUpdateProductStock();
  const [stockCount, setStockCount] = useState(currentStock);

  const handleSubmit = () => {
    updateStock.mutate(
      { productId, stockCount },
      {
        onSuccess: () => {
          toast({ title: 'Estoque atualizado!' });
          onOpenChange(false);
        },
        onError: (err) => {
          toast({ title: 'Erro', description: err.message, variant: 'error' });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar Estoque</DialogTitle>
          <DialogDescription>
            Estoque atual: {currentStock} unidades
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Nova quantidade
            </label>
            <input
              type="number"
              value={stockCount}
              onChange={(e) => setStockCount(Number(e.target.value))}
              min={0}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={updateStock.isPending}>
            {updateStock.isPending ? 'Salvando...' : 'Atualizar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
