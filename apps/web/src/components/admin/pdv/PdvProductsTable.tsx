'use client';

import { Edit2, Trash2 } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { resolveUploadUrl } from '@/config/constants';
import type { PdvProductItem } from '@/lib/api/pdv.api';

interface PdvProductsTableProps {
  products: PdvProductItem[];
  onEdit: (product: PdvProductItem) => void;
  onRemove: (productId: string, name: string) => void;
}

export function PdvProductsTable({
  products,
  onEdit,
  onRemove,
}: PdvProductsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Nome</th>
            <th className="px-4 py-3 text-left font-medium">Categoria</th>
            <th className="px-4 py-3 text-right font-medium">Pontos</th>
            <th className="px-4 py-3 text-right font-medium">R$</th>
            <th className="px-4 py-3 text-center font-medium">Estoque</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b hover:bg-muted/30">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {product.imageUrl ? (
                    <img
                      src={resolveUploadUrl(product.imageUrl) ?? ''}
                      alt={product.name}
                      className="h-8 w-8 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-sm">
                      📦
                    </div>
                  )}
                  <span className="font-medium">{product.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {product.category ?? '-'}
              </td>
              <td className="px-4 py-3 text-right">{product.pricePoints} pts</td>
              <td className="px-4 py-3 text-right">
                {product.priceMoney.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
              <td className="px-4 py-3 text-center">{product.stock}</td>
              <td className="px-4 py-3">
                <Badge variant={product.isActive ? 'success' : 'ghost'}>
                  {product.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(product)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(product.id, product.name)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
