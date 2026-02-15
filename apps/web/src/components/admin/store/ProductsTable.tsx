'use client';

import Link from 'next/link';
import { Edit2, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { ProductStatusBadge } from './ProductStatusBadge';
import { ProductTypeLabel } from './ProductTypeLabel';
import type { AdminProductItem } from '@/lib/api/store.api';

interface ProductsTableProps {
  products: AdminProductItem[];
  onDelete: (id: string, name: string) => void;
}

function formatPrice(points?: number, money?: number): string {
  const parts: string[] = [];
  if (points != null && points > 0) parts.push(`${points} pts`);
  if (money != null && money > 0) parts.push(`R$ ${(money / 100).toFixed(2)}`);
  return parts.length > 0 ? parts.join(' / ') : '-';
}

export function ProductsTable({ products, onDelete }: ProductsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Produto</th>
            <th className="px-4 py-3 text-left font-medium">Tipo</th>
            <th className="px-4 py-3 text-left font-medium">Categoria</th>
            <th className="px-4 py-3 text-left font-medium">Preco</th>
            <th className="px-4 py-3 text-center font-medium">Estoque</th>
            <th className="px-4 py-3 text-center font-medium">Vendas</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b hover:bg-muted/30">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-lg">
                      📦
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.slug}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <ProductTypeLabel type={product.type} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {product.category?.name ?? '-'}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatPrice(product.pricePoints, product.priceMoney)}
              </td>
              <td className="px-4 py-3 text-center">
                {product.stockType === 'unlimited'
                  ? '∞'
                  : product.stockCount ?? 0}
              </td>
              <td className="px-4 py-3 text-center">{product.soldCount}</td>
              <td className="px-4 py-3">
                <ProductStatusBadge
                  isActive={product.isActive}
                  stockType={product.stockType}
                  {...(product.stockCount != null && { stockCount: product.stockCount })}
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/store/${product.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/store/${product.id}/edit`}>
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(product.id, product.name)}
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
