'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
} from '@/lib/hooks/useAdminStore';
import type { ProductVariant } from '@ahub/shared/types';

interface VariantsManagerProps {
  productId: string;
  variants: ProductVariant[];
}

export function VariantsManager({ productId, variants }: VariantsManagerProps) {
  const { toast } = useToast();
  const createVariant = useCreateVariant();
  const updateVariant = useUpdateVariant();
  const deleteVariant = useDeleteVariant();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductVariant | null>(null);

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [attrKey, setAttrKey] = useState('');
  const [attrValue, setAttrValue] = useState('');
  const [pricePoints, setPricePoints] = useState(0);
  const [priceMoney, setPriceMoney] = useState(0);
  const [stockCount, setStockCount] = useState(0);

  const openCreate = () => {
    setEditing(null);
    setSku('');
    setName('');
    setAttrKey('');
    setAttrValue('');
    setPricePoints(0);
    setPriceMoney(0);
    setStockCount(0);
    setDialogOpen(true);
  };

  const openEdit = (v: ProductVariant) => {
    setEditing(v);
    setSku(v.sku);
    setName(v.name);
    const attrs = Object.entries(v.attributes);
    setAttrKey(attrs[0]?.[0] ?? '');
    setAttrValue(attrs[0]?.[1] ?? '');
    setPricePoints(v.pricePoints ?? 0);
    setPriceMoney(v.priceMoney ?? 0);
    setStockCount(v.stockCount);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim() || !sku.trim()) {
      toast({ title: 'Nome e SKU sao obrigatorios', variant: 'error' });
      return;
    }

    const attributes: Record<string, string> = {};
    if (attrKey.trim() && attrValue.trim()) {
      attributes[attrKey.trim()] = attrValue.trim();
    }

    const data = {
      sku: sku.trim(),
      name: name.trim(),
      attributes,
      stockCount,
      ...(pricePoints > 0 && { pricePoints }),
      ...(priceMoney > 0 && { priceMoney }),
    };

    if (editing) {
      updateVariant.mutate(
        { productId, variantId: editing.id, data },
        {
          onSuccess: () => {
            toast({ title: 'Variante atualizada!' });
            setDialogOpen(false);
          },
          onError: (err) => {
            toast({ title: 'Erro', description: err.message, variant: 'error' });
          },
        }
      );
    } else {
      createVariant.mutate(
        { productId, data },
        {
          onSuccess: () => {
            toast({ title: 'Variante criada!' });
            setDialogOpen(false);
          },
          onError: (err) => {
            toast({ title: 'Erro', description: err.message, variant: 'error' });
          },
        }
      );
    }
  };

  const handleDelete = (variantId: string, variantName: string) => {
    if (!window.confirm(`Excluir variante "${variantName}"?`)) return;
    deleteVariant.mutate(
      { productId, variantId },
      {
        onSuccess: () => toast({ title: 'Variante excluida!' }),
        onError: (err) => {
          toast({ title: 'Erro', description: err.message, variant: 'error' });
        },
      }
    );
  };

  const isPending = createVariant.isPending || updateVariant.isPending;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Variantes</h3>
        <Button size="sm" variant="outline" onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" />
          Adicionar
        </Button>
      </div>

      {variants.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma variante cadastrada.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left font-medium">SKU</th>
                <th className="px-3 py-2 text-left font-medium">Nome</th>
                <th className="px-3 py-2 text-center font-medium">Estoque</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-right font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id} className="border-b hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-xs">{v.sku}</td>
                  <td className="px-3 py-2">{v.name}</td>
                  <td className="px-3 py-2 text-center">{v.stockCount}</td>
                  <td className="px-3 py-2">
                    <Badge variant={v.isActive ? 'success' : 'ghost'}>
                      {v.isActive ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(v)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(v.id, v.name)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar Variante' : 'Nova Variante'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">SKU</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Atributo (chave)
                </label>
                <input
                  type="text"
                  value={attrKey}
                  onChange={(e) => setAttrKey(e.target.value)}
                  placeholder="Ex: Tamanho"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Atributo (valor)
                </label>
                <input
                  type="text"
                  value={attrValue}
                  onChange={(e) => setAttrValue(e.target.value)}
                  placeholder="Ex: M"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Pontos</label>
                <input
                  type="number"
                  value={pricePoints}
                  onChange={(e) => setPricePoints(Number(e.target.value))}
                  min={0}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">R$ (centavos)</label>
                <input
                  type="number"
                  value={priceMoney}
                  onChange={(e) => setPriceMoney(Number(e.target.value))}
                  min={0}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Estoque</label>
                <input
                  type="number"
                  value={stockCount}
                  onChange={(e) => setStockCount(Number(e.target.value))}
                  min={0}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Salvando...' : editing ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
