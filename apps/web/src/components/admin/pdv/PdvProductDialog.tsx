'use client';

import { useState, useEffect, useRef } from 'react';
import { ImageIcon, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { useAddPdvProduct, useUpdatePdvProduct, useUploadPdvProductImage, useAdminPdvCategories } from '@/lib/hooks/useAdminPdv';
import { resolveUploadUrl } from '@/config/constants';
import type { PdvProductItem } from '@/lib/api/pdv.api';

interface PdvProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdvId: string;
  product?: PdvProductItem | null;
}

export function PdvProductDialog({
  open,
  onOpenChange,
  pdvId,
  product,
}: PdvProductDialogProps) {
  const { toast } = useToast();
  const addProduct = useAddPdvProduct();
  const updateProduct = useUpdatePdvProduct();
  const uploadImage = useUploadPdvProductImage();
  const { data: categoryOptions } = useAdminPdvCategories();
  const isEditing = !!product;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pricePoints, setPricePoints] = useState(0);
  const [priceMoney, setPriceMoney] = useState(0);
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description ?? '');
      setPricePoints(product.pricePoints);
      setPriceMoney(product.priceMoney);
      setCategory(product.category ?? '');
      setStock(product.stock);
      setImagePreview(resolveUploadUrl(product.imageUrl));
      setImageFile(null);
    } else {
      resetForm();
    }
  }, [product, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nome e obrigatorio';
    if (pricePoints <= 0) newErrors.pricePoints = 'Preco em pontos e obrigatorio';
    if (priceMoney <= 0) newErrors.priceMoney = 'Preco em dinheiro e obrigatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const data = {
      name: name.trim(),
      pricePoints,
      priceMoney,
      stock,
      ...(description.trim() && { description: description.trim() }),
      ...(category.trim() && { category: category.trim() }),
    };

    const uploadImageAfterSave = (productId: string, successMsg: string) => {
      if (!imageFile) {
        toast({ title: successMsg });
        resetForm();
        onOpenChange(false);
        return;
      }
      uploadImage.mutate(
        { pdvId, productId, file: imageFile },
        {
          onSuccess: () => {
            toast({ title: successMsg });
            resetForm();
            onOpenChange(false);
          },
          onError: (err) => {
            toast({
              title: 'Produto salvo, mas erro ao enviar imagem',
              description: err.message,
              variant: 'error',
            });
            onOpenChange(false);
          },
        }
      );
    };

    if (isEditing && product) {
      updateProduct.mutate(
        { pdvId, productId: product.id, data },
        {
          onSuccess: () => {
            uploadImageAfterSave(product.id, 'Produto atualizado!');
          },
          onError: (err) => {
            toast({ title: 'Erro', description: err.message, variant: 'error' });
          },
        }
      );
    } else {
      addProduct.mutate(
        { pdvId, data },
        {
          onSuccess: (newProduct) => {
            uploadImageAfterSave(newProduct.id, 'Produto adicionado!');
          },
          onError: (err) => {
            toast({ title: 'Erro', description: err.message, variant: 'error' });
          },
        }
      );
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPricePoints(0);
    setPriceMoney(0);
    setCategory('');
    setStock(0);
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
  };

  const isPending = addProduct.isPending || updateProduct.isPending || uploadImage.isPending;

  const currentImageSrc = imageFile
    ? URL.createObjectURL(imageFile)
    : imagePreview;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Produto' : 'Adicionar Produto'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Imagem (opcional)
            </label>
            {currentImageSrc ? (
              <div className="group relative h-32 w-32 overflow-hidden rounded-lg border bg-muted">
                <img
                  src={currentImageSrc}
                  alt="Produto"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
              >
                <ImageIcon className="mb-1 h-6 w-6 text-muted-foreground" />
                <span className="text-center text-xs text-muted-foreground">
                  Clique para selecionar
                </span>
              </button>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setImageFile(file);
                e.target.value = '';
              }}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Chopp 300ml"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Descricao (opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Preco (pontos)
              </label>
              <input
                type="number"
                value={pricePoints}
                onChange={(e) => setPricePoints(Number(e.target.value))}
                min={1}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.pricePoints && (
                <p className="mt-1 text-xs text-red-500">{errors.pricePoints}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Preco (R$)
              </label>
              <input
                type="number"
                value={priceMoney}
                onChange={(e) => setPriceMoney(Number(e.target.value))}
                min={0.01}
                step="0.01"
                placeholder="Ex: 10.50"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.priceMoney && (
                <p className="mt-1 text-xs text-red-500">{errors.priceMoney}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Categoria (opcional)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Sem categoria</option>
                {categoryOptions?.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Estoque</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                min={0}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Salvando...' : isEditing ? 'Atualizar' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
