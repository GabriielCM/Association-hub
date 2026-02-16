'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import {
  useAdminPdvCategories,
  useCreatePdvCategory,
  useUpdatePdvCategory,
  useDeletePdvCategory,
} from '@/lib/hooks/useAdminPdv';

export function PdvCategoriesSection() {
  const { toast } = useToast();
  const { data: categories, isLoading } = useAdminPdvCategories();
  const createCategory = useCreatePdvCategory();
  const updateCategory = useUpdatePdvCategory();
  const deleteCategory = useDeletePdvCategory();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    createCategory.mutate(trimmed, {
      onSuccess: () => {
        toast({ title: 'Categoria criada!' });
        setNewName('');
      },
      onError: (err) => {
        toast({ title: 'Erro', description: err.message, variant: 'error' });
      },
    });
  };

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const trimmed = editingName.trim();
    if (!trimmed) return;

    updateCategory.mutate(
      { id: editingId, name: trimmed },
      {
        onSuccess: () => {
          toast({ title: 'Categoria atualizada!' });
          setEditingId(null);
          setEditingName('');
        },
        onError: (err) => {
          toast({ title: 'Erro', description: err.message, variant: 'error' });
        },
      },
    );
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Excluir categoria "${name}"?`)) return;

    deleteCategory.mutate(id, {
      onSuccess: () => {
        toast({ title: 'Categoria excluída!' });
      },
      onError: (err) => {
        toast({ title: 'Erro', description: err.message, variant: 'error' });
      },
    });
  };

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Categorias</h2>
      </div>

      {/* Create new category inline */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreate();
          }}
          placeholder="Nova categoria..."
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button
          size="sm"
          onClick={handleCreate}
          disabled={!newName.trim() || createCategory.isPending}
        >
          <Plus className="mr-1 h-4 w-4" />
          Adicionar
        </Button>
      </div>

      {/* Category list */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      ) : !categories || categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma categoria cadastrada.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center gap-1 rounded-lg border bg-muted/50 px-3 py-1.5"
            >
              {editingId === cat.id ? (
                <>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    className="w-28 rounded border border-border bg-background px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={updateCategory.isPending}
                    className="rounded p-0.5 text-green-600 hover:bg-green-100"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <span className="text-sm">{cat.name}</span>
                  <button
                    type="button"
                    onClick={() => handleStartEdit(cat.id, cat.name)}
                    className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    disabled={deleteCategory.isPending}
                    className="rounded p-0.5 text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
