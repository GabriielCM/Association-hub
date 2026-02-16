'use client';

import { useState, useRef } from 'react';
import { Edit2, Trash2, GripVertical } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import type { StoreCategory } from '@ahub/shared/types';

interface CategoriesTableProps {
  categories: StoreCategory[];
  onEdit: (category: StoreCategory) => void;
  onDelete: (id: string, name: string) => void;
  onReorder?: (categoryIds: string[]) => void;
}

export function CategoriesTable({
  categories,
  onEdit,
  onDelete,
  onReorder,
}: CategoriesTableProps) {
  const [items, setItems] = useState<StoreCategory[]>(categories);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Sync when categories prop changes
  if (categories !== items && JSON.stringify(categories.map(c => c.id)) !== JSON.stringify(items.map(c => c.id))) {
    setItems(categories);
  }

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const reordered = [...items];
    const [removed] = reordered.splice(dragItem.current, 1);
    if (!removed) return;
    reordered.splice(dragOverItem.current, 0, removed);

    setItems(reordered);
    dragItem.current = null;
    dragOverItem.current = null;

    if (onReorder) {
      onReorder(reordered.map((c) => c.id));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {onReorder && <th className="w-10 px-2 py-3" />}
            <th className="px-4 py-3 text-left font-medium">Nome</th>
            <th className="px-4 py-3 text-left font-medium">Slug</th>
            <th className="px-4 py-3 text-center font-medium">Produtos</th>
            <th className="px-4 py-3 text-center font-medium">Ordem</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {items.map((cat, index) => (
            <tr
              key={cat.id}
              className="border-b hover:bg-muted/30"
              draggable={!!onReorder}
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
            >
              {onReorder && (
                <td className="px-2 py-3">
                  <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                </td>
              )}
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
