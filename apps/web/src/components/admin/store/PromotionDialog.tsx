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
import { useSetPromotion, useRemovePromotion } from '@/lib/hooks/useAdminStore';

interface PromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  currentPromotion?: {
    promotionalPricePoints?: number;
    promotionalPriceMoney?: number;
    promotionalEndsAt?: string;
  } | null;
}

export function PromotionDialog({
  open,
  onOpenChange,
  productId,
  currentPromotion,
}: PromotionDialogProps) {
  const { toast } = useToast();
  const setPromo = useSetPromotion();
  const removePromo = useRemovePromotion();

  const [promoPoints, setPromoPoints] = useState(
    currentPromotion?.promotionalPricePoints ?? 0
  );
  const [promoMoney, setPromoMoney] = useState(
    currentPromotion?.promotionalPriceMoney ?? 0
  );
  const [endsAt, setEndsAt] = useState(
    currentPromotion?.promotionalEndsAt
      ? currentPromotion.promotionalEndsAt.slice(0, 16)
      : ''
  );

  const handleSet = () => {
    if (!endsAt) {
      toast({ title: 'Data de termino e obrigatoria', variant: 'error' });
      return;
    }

    setPromo.mutate(
      {
        productId,
        data: {
          endsAt: new Date(endsAt).toISOString(),
          ...(promoPoints > 0 && { promotionalPricePoints: promoPoints }),
          ...(promoMoney > 0 && { promotionalPriceMoney: promoMoney }),
        },
      },
      {
        onSuccess: () => {
          toast({ title: 'Promocao definida!' });
          onOpenChange(false);
        },
        onError: (err) => {
          toast({ title: 'Erro', description: err.message, variant: 'error' });
        },
      }
    );
  };

  const handleRemove = () => {
    if (!window.confirm('Remover a promocao deste produto?')) return;
    removePromo.mutate(productId, {
      onSuccess: () => {
        toast({ title: 'Promocao removida!' });
        onOpenChange(false);
      },
      onError: (err) => {
        toast({ title: 'Erro', description: err.message, variant: 'error' });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promocao</DialogTitle>
          <DialogDescription>
            Defina precos promocionais e data de termino.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Preco promocional (pontos)
            </label>
            <input
              type="number"
              value={promoPoints}
              onChange={(e) => setPromoPoints(Number(e.target.value))}
              min={0}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Preco promocional (centavos R$)
            </label>
            <input
              type="number"
              value={promoMoney}
              onChange={(e) => setPromoMoney(Number(e.target.value))}
              min={0}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {promoMoney > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                R$ {(promoMoney / 100).toFixed(2)}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Termina em
            </label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <DialogFooter>
          {currentPromotion && (
            <Button
              variant="outline"
              onClick={handleRemove}
              disabled={removePromo.isPending}
              className="text-destructive"
            >
              Remover Promocao
            </Button>
          )}
          <Button onClick={handleSet} disabled={setPromo.isPending}>
            {setPromo.isPending ? 'Salvando...' : 'Definir Promocao'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
