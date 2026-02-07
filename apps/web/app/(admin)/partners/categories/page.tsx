'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui';
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
} from '@/lib/hooks/useAdminPartners';
import {
  CategoryFormDialog,
  type CategoryFormData,
  type CategoryFormItem,
} from '@/components/admin/partners/CategoryFormDialog';

export default function CategoriesManagementPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryFormItem | null>(null);

  const { data: categoriesData, isLoading } = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const categories = categoriesData?.categories ?? [];

  const handleCreate = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEdit = (category: CategoryFormItem) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateCategory.mutate(
        { categoryId: editingCategory.id, data: { name: data.name, icon: data.icon, color: data.color, order: data.order } },
        { onSuccess: () => { setShowForm(false); setEditingCategory(null); } }
      );
    } else {
      createCategory.mutate(data, {
        onSuccess: () => setShowForm(false),
      });
    }
  };

  const handleToggleActive = (category: CategoryFormItem) => {
    const action = category.isActive ? 'desativar' : 'reativar';
    if (window.confirm(`Deseja ${action} a categoria "${category.name}"?`)) {
      updateCategory.mutate({
        categoryId: category.id,
        data: { isActive: !category.isActive },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/partners">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Categorias de Parceiros</h1>
              <p className="text-muted-foreground">Gerencie as categorias para organizar parceiros</p>
            </div>
          </div>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <p className="text-muted-foreground">Nenhuma categoria cadastrada</p>
          <Button className="mt-4" onClick={handleCreate}>
            Criar primeira categoria
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoria</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cor</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ordem</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Parceiros</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className={`border-b border-border/50 ${!category.isActive ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{category.slug}</code>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-5 w-5 rounded"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-xs text-muted-foreground">{category.color}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{category.order}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {category.partnersCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {category.isActive ? (
                      <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-300">
                        Ativa
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-900/20 dark:text-gray-300">
                        Inativa
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit2 className="mr-1 h-3 w-3" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(category)}
                        className={category.isActive
                          ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                          : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }
                      >
                        {category.isActive ? 'Desativar' : 'Reativar'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Category Form Dialog */}
      <CategoryFormDialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingCategory(null);
        }}
        category={editingCategory}
        onSubmit={handleSubmit}
        isPending={createCategory.isPending || updateCategory.isPending}
      />
    </div>
  );
}
