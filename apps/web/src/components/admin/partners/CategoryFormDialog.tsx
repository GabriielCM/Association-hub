'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
} from '@/components/ui';

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CategoryFormItem | null;
  onSubmit: (data: CategoryFormData) => void;
  isPending?: boolean;
}

export interface CategoryFormItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  icon: string;
  color: string;
  order: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  isPending,
}: CategoryFormDialogProps) {
  const isEdit = !!category;
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [icon, setIcon] = useState('gift');
  const [color, setColor] = useState('#6366F1');
  const [order, setOrder] = useState('0');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (category) {
        setName(category.name);
        setSlug(category.slug);
        setSlugManual(true);
        setIcon(category.icon);
        setColor(category.color);
        setOrder(category.order.toString());
      } else {
        setName('');
        setSlug('');
        setSlugManual(false);
        setIcon('gift');
        setColor('#6366F1');
        setOrder('0');
      }
      setErrors({});
    }
  }, [open, category]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugManual) {
      setSlug(slugify(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugManual(true);
    setSlug(value);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    if (!slug.trim() || !/^[a-z0-9-]+$/.test(slug)) newErrors.slug = 'Slug deve conter apenas letras minusculas, numeros e hifens';
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) newErrors.color = 'Cor deve estar no formato hex (#RRGGBB)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      slug: slug.trim(),
      icon: icon.trim() || 'gift',
      color,
      order: parseInt(order, 10) || 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Altere as informacoes da categoria de parceiros.'
                : 'Preencha as informacoes para criar uma nova categoria.'}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="cat-name">Nome</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Alimentacao, Saude..."
                {...(errors.name ? { error: errors.name } : {})}
              />
            </div>

            <div>
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="alimentacao"
                {...(errors.slug ? { error: errors.slug } : {})}
                disabled={isEdit}
              />
              {isEdit && (
                <p className="mt-1 text-xs text-muted-foreground">Slug nao pode ser alterado apos criacao</p>
              )}
            </div>

            <div>
              <Label htmlFor="cat-icon">Icone</Label>
              <Input
                id="cat-icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="gift"
              />
              <p className="mt-1 text-xs text-muted-foreground">Emoji ou nome do icone (ex: gift, heart, star)</p>
            </div>

            <div>
              <Label htmlFor="cat-color">Cor</Label>
              <div className="flex items-center gap-3">
                <input
                  id="cat-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border border-input"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#6366F1"
                  className="flex-1"
                  {...(errors.color ? { error: errors.color } : {})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cat-order">Ordem de exibicao</Label>
              <Input
                id="cat-order"
                type="number"
                min="0"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : isEdit ? 'Salvar Alteracoes' : 'Criar Categoria'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
