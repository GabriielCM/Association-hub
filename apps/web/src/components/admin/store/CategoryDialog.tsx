'use client';

import { useState, useEffect } from 'react';
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
import {
  useCreateCategory,
  useUpdateCategory,
} from '@/lib/hooks/useAdminStore';
import type { StoreCategory } from '@ahub/shared/types';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: StoreCategory | null;
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
}: CategoryDialogProps) {
  const { toast } = useToast();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isEditing = !!category;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description ?? '');
      setDisplayOrder(category.displayOrder);
      setIsActive(category.isActive);
    } else {
      resetForm();
    }
  }, [category, open]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEditing) {
      setSlug(toSlug(value));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nome e obrigatorio';
    if (!slug.trim()) newErrors.slug = 'Slug e obrigatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const data = {
      name: name.trim(),
      slug: slug.trim(),
      ...(description.trim() && { description: description.trim() }),
      displayOrder,
    };

    if (isEditing && category) {
      updateCategory.mutate(
        { id: category.id, data: { ...data, isActive } },
        {
          onSuccess: () => {
            toast({ title: 'Categoria atualizada!' });
            onOpenChange(false);
          },
          onError: (err) => {
            toast({
              title: 'Erro ao atualizar categoria',
              description: err.message,
              variant: 'error',
            });
          },
        }
      );
    } else {
      createCategory.mutate(data, {
        onSuccess: () => {
          toast({ title: 'Categoria criada!' });
          resetForm();
          onOpenChange(false);
        },
        onError: (err) => {
          toast({
            title: 'Erro ao criar categoria',
            description: err.message,
            variant: 'error',
          });
        },
      });
    }
  };

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setDisplayOrder(0);
    setIsActive(true);
    setErrors({});
  };

  const isPending = createCategory.isPending || updateCategory.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados da categoria.'
              : 'Preencha os dados para criar uma nova categoria.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="catName" className="mb-1 block text-sm font-medium">
              Nome
            </label>
            <input
              id="catName"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Roupas"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="catSlug" className="mb-1 block text-sm font-medium">
              Slug
            </label>
            <input
              id="catSlug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Ex: roupas"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.slug && (
              <p className="mt-1 text-xs text-red-500">{errors.slug}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="catDesc"
              className="mb-1 block text-sm font-medium"
            >
              Descricao (opcional)
            </label>
            <textarea
              id="catDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label
              htmlFor="catOrder"
              className="mb-1 block text-sm font-medium"
            >
              Ordem de exibicao
            </label>
            <input
              id="catOrder"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              min={0}
              className="w-32 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {isEditing && (
            <div className="flex items-center gap-2">
              <input
                id="catActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="catActive" className="text-sm">
                Categoria ativa
              </label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending
              ? 'Salvando...'
              : isEditing
                ? 'Atualizar'
                : 'Criar Categoria'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
