'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { Button, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { CategoriesTable } from '@/components/admin/store/CategoriesTable';
import { CategoryDialog } from '@/components/admin/store/CategoryDialog';
import {
  useAdminCategories,
  useDeleteCategory,
} from '@/lib/hooks/useAdminStore';
import type { StoreCategory } from '@ahub/shared/types';

export default function CategoriesPage() {
  const { toast } = useToast();
  const { data: categories, isLoading } = useAdminCategories();
  const deleteCategory = useDeleteCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<StoreCategory | null>(null);

  const handleEdit = (category: StoreCategory) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Excluir categoria "${name}"?`)) return;
    deleteCategory.mutate(id, {
      onSuccess: () => toast({ title: 'Categoria excluida!' }),
      onError: (err) => {
        toast({ title: 'Erro', description: err.message, variant: 'error' });
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/store">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Categorias</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie as categorias da loja
            </p>
          </div>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="mr-1 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : !categories || categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12">
          <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-lg font-semibold">Nenhuma categoria</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Crie categorias para organizar seus produtos.
          </p>
          <Button onClick={handleCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Criar Categoria
          </Button>
        </div>
      ) : (
        <CategoriesTable
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
      />
    </div>
  );
}
