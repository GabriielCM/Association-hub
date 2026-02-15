'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { useAddPdvProduct, useUpdatePdvProduct } from '@/lib/hooks/useAdminPdv';
import type { PdvProductItem } from '@/lib/api/pdv.api';

interface PdvProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdvId: string;
  product?: PdvProductItem | null;
}

export function PdvProductDialog({
  open,
  onOpenChange,
  pdvId,
  product,
}: PdvProductDialogProps) {
  const { toast } = useToast();
  const addProduct = useAddPdvProduct();
  const updateProduct = useUpdatePdvProduct();
  const isEditing = !!product;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pricePoints, setPricePoints] = useState(0);
  const [priceMoney, setPriceMoney] = useState(0);
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description ?? '');
      setPricePoints(product.pricePoints);
      setPriceMoney(product.priceMoney);
      setCategory(product.category ?? '');
      setStock(product.stock);
    } else {
      resetForm();
    }
  }, [product, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nome e obrigatorio';
    if (pricePoints <= 0) newErrors.pricePoints = 'Preco em pontos e obrigatorio';
    if (priceMoney <= 0) newErrors.priceMoney = 'Preco em dinheiro e obrigatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const data = {
      name: name.trim(),
      pricePoints,
      priceMoney,
      stock,
      ...(description.trim() && { description: description.trim() }),
      ...(category.trim() && { category: category.trim() }),
    };

    if (isEditing && product) {
      updateProduct.mutate(
        { pdvId, productId: product.id, data },
        {
          onSuccess: () => {
            toast({ title: 'Produto atualizado!' });
            onOpenChange(false);
          },
          onError: (err) => {
            toast({ title: 'Erro', description: err.message, variant: 'error' });
          },
        }
      );
    } else {
      addProduct.mutate(
        { pdvId, data },
        {
          onSuccess: () => {
            toast({ title: 'Produto adicionado!' });
            resetForm();
            onOpenChange(false);
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
    setDescription('');
    setPricePoints(0);
    setPriceMoney(0);
    setCategory('');
    setStock(0);
    setErrors({});
  };

  const isPending = addProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Produto' : 'Adicionar Produto'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Chopp 300ml"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Descricao (opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Preco (pontos)
              </label>
              <input
                type="number"
                value={pricePoints}
                onChange={(e) => setPricePoints(Number(e.target.value))}
                min={1}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.pricePoints && (
                <p className="mt-1 text-xs text-red-500">{errors.pricePoints}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Preco (centavos R$)
              </label>
              <input
                type="number"
                value={priceMoney}
                onChange={(e) => setPriceMoney(Number(e.target.value))}
                min={1}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {priceMoney > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  R$ {(priceMoney / 100).toFixed(2)}
                </p>
              )}
              {errors.priceMoney && (
                <p className="mt-1 text-xs text-red-500">{errors.priceMoney}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Categoria (opcional)
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Bebidas"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Estoque</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                min={0}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Salvando...' : isEditing ? 'Atualizar' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
