'use client';

import { Edit2, Trash2 } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import type { StoreCategory } from '@ahub/shared/types';

interface CategoriesTableProps {
  categories: StoreCategory[];
  onEdit: (category: StoreCategory) => void;
  onDelete: (id: string, name: string) => void;
}

export function CategoriesTable({
  categories,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Nome</th>
            <th className="px-4 py-3 text-left font-medium">Slug</th>
            <th className="px-4 py-3 text-center font-medium">Produtos</th>
            <th className="px-4 py-3 text-center font-medium">Ordem</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id} className="border-b hover:bg-muted/30">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="h-8 w-8 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-sm">
                      📁
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {cat.slug}
              </td>
              <td className="px-4 py-3 text-center">
                {cat.productsCount ?? 0}
              </td>
              <td className="px-4 py-3 text-center">{cat.displayOrder}</td>
              <td className="px-4 py-3">
                <Badge variant={cat.isActive ? 'success' : 'ghost'}>
                  {cat.isActive ? 'Ativa' : 'Inativa'}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(cat)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(cat.id, cat.name)}
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
