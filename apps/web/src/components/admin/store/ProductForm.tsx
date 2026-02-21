'use client';

import { useState, useRef, useCallback } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAdminCategories, useProductImages, useUploadProductImage, useDeleteProductImage } from '@/lib/hooks/useAdminStore';
import type { CreateProductInput, ProductImage } from '@/lib/api/store.api';
import type { ProductType, PaymentOptions } from '@ahub/shared/types';

interface ProductFormProps {
  initialData?: Partial<CreateProductInput> & { isFeatured?: boolean };
  productId?: string;
  onSubmit: (data: CreateProductInput & { isFeatured?: boolean }, pendingFiles?: File[]) => void;
  isPending: boolean;
  submitLabel?: string;
}

const STEPS = ['Informacoes Basicas', 'Precos e Pagamento', 'Estoque e Configuracao'];

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function ProductForm({
  initialData,
  productId,
  onSubmit,
  isPending,
  submitLabel = 'Salvar',
}: ProductFormProps) {
  const { data: categories } = useAdminCategories();
  const { data: existingImages } = useProductImages(productId ?? null);
  const uploadImage = useUploadProductImage();
  const deleteImage = useDeleteProductImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);

  // Pending files for create mode (no productId yet)
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);

  // Step 1: Basic info
  const [name, setName] = useState(initialData?.name ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? '');
  const [type, setType] = useState<ProductType>(initialData?.type ?? 'PHYSICAL');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription ?? '');
  const [longDescription, setLongDescription] = useState(initialData?.longDescription ?? '');
  const [pickupLocation, setPickupLocation] = useState(initialData?.pickupLocation ?? '');

  // Step 2: Pricing
  const [pricePoints, setPricePoints] = useState(initialData?.pricePoints ?? 0);
  const [priceMoney, setPriceMoney] = useState(initialData?.priceMoney ?? 0);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOptions>(
    initialData?.paymentOptions ?? 'BOTH'
  );
  const [allowMixedPayment, setAllowMixedPayment] = useState(
    initialData?.allowMixedPayment ?? false
  );
  const [cashbackPercent, setCashbackPercent] = useState(initialData?.cashbackPercent ?? 0);
  const [limitPerUser, setLimitPerUser] = useState(initialData?.limitPerUser ?? 0);

  // Step 3: Stock & config
  const [stockType, setStockType] = useState(initialData?.stockType ?? 'unlimited');
  const [stockCount, setStockCount] = useState(initialData?.stockCount ?? 0);
  const [voucherValidityDays, setVoucherValidityDays] = useState(
    initialData?.voucherValidityDays ?? 30
  );
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNameChange = (value: string) => {
    setName(value);
    if (!initialData?.slug) {
      setSlug(toSlug(value));
    }
  };

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newFiles = Array.from(files).filter(
        (f) => /\.(jpe?g|png|webp)$/i.test(f.name) && f.size <= 10 * 1024 * 1024
      );
      if (newFiles.length === 0) return;

      if (productId) {
        // Edit mode: upload immediately
        newFiles.forEach((file) => {
          uploadImage.mutate({ productId, file });
        });
      } else {
        // Create mode: store for later
        setPendingFiles((prev) => [...prev, ...newFiles]);
        const previews = newFiles.map((f) => URL.createObjectURL(f));
        setPendingPreviews((prev) => [...prev, ...previews]);
      }
    },
    [productId, uploadImage]
  );

  const removePendingFile = (index: number) => {
    URL.revokeObjectURL(pendingPreviews[index]);
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    setPendingPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteImage = (imageId: string) => {
    if (productId) {
      deleteImage.mutate({ productId, imageId });
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!name.trim()) newErrors.name = 'Nome e obrigatorio';
      if (!slug.trim()) newErrors.slug = 'Slug e obrigatorio';
      if (!categoryId) newErrors.categoryId = 'Categoria e obrigatoria';
    }
    if (step === 1) {
      if (paymentOptions !== 'MONEY_ONLY' && pricePoints <= 0) {
        newErrors.pricePoints = 'Preco em pontos e obrigatorio';
      }
      if (paymentOptions !== 'POINTS_ONLY' && priceMoney <= 0) {
        newErrors.priceMoney = 'Preco em dinheiro e obrigatorio';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleSubmit = () => {
    if (!validateStep()) return;

    const data: CreateProductInput & { isFeatured?: boolean } = {
      name: name.trim(),
      slug: slug.trim(),
      categoryId,
      type,
      paymentOptions,
      allowMixedPayment,
      stockType,
      isFeatured,
      ...(shortDescription.trim() && { shortDescription: shortDescription.trim() }),
      ...(longDescription.trim() && { longDescription: longDescription.trim() }),
      ...(pickupLocation.trim() && { pickupLocation: pickupLocation.trim() }),
      ...(pricePoints > 0 && { pricePoints }),
      ...(priceMoney > 0 && { priceMoney }),
      ...(cashbackPercent > 0 && { cashbackPercent }),
      ...(limitPerUser > 0 && { limitPerUser }),
      ...(stockType === 'limited' && { stockCount }),
      ...(type === 'VOUCHER' && { voucherValidityDays }),
    };

    onSubmit(data, pendingFiles.length > 0 ? pendingFiles : undefined);
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1">
            <div
              className={`h-2 rounded-full ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
            <p
              className={`mt-1 text-xs ${
                i === step ? 'font-semibold text-primary' : 'text-muted-foreground'
              }`}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Step 1: Basic info */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Nome do produto"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Selecionar categoria</option>
              {(categories ?? []).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ProductType)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="PHYSICAL">Fisico</option>
              <option value="VOUCHER">Voucher</option>
              <option value="SERVICE">Servico</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Descricao curta</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              maxLength={200}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Descricao longa</label>
            <textarea
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Local de retirada</label>
            <input
              type="text"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="Ex: Secretaria - 2o andar"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium">Imagens do produto</label>

            {/* Existing images (edit mode) */}
            {existingImages && existingImages.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-3">
                {existingImages.map((img: ProductImage) => (
                  <div key={img.id} className="group relative h-24 w-24 overflow-hidden rounded-lg border">
                    <img
                      src={img.url}
                      alt={img.altText || 'Imagem do produto'}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute right-1 top-1 hidden rounded-full bg-red-500 p-0.5 text-white group-hover:block"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pending previews (create mode) */}
            {pendingPreviews.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-3">
                {pendingPreviews.map((preview, index) => (
                  <div key={index} className="group relative h-24 w-24 overflow-hidden rounded-lg border">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePendingFile(index)}
                      className="absolute right-1 top-1 hidden rounded-full bg-red-500 p-0.5 text-white group-hover:block"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadImage.isPending}
              className="flex items-center gap-2 rounded-md border-2 border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {uploadImage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              Adicionar imagens
            </button>
            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG ou WebP. Max 10MB por imagem.
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Pricing */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Opcoes de pagamento</label>
            <select
              value={paymentOptions}
              onChange={(e) => setPaymentOptions(e.target.value as PaymentOptions)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="BOTH">Pontos e Dinheiro</option>
              <option value="POINTS_ONLY">Apenas Pontos</option>
              <option value="MONEY_ONLY">Apenas Dinheiro</option>
            </select>
          </div>

          {paymentOptions !== 'MONEY_ONLY' && (
            <div>
              <label className="mb-1 block text-sm font-medium">Preco em pontos</label>
              <input
                type="number"
                value={pricePoints}
                onChange={(e) => setPricePoints(Number(e.target.value))}
                min={0}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.pricePoints && (
                <p className="mt-1 text-xs text-red-500">{errors.pricePoints}</p>
              )}
            </div>
          )}

          {paymentOptions !== 'POINTS_ONLY' && (
            <div>
              <label className="mb-1 block text-sm font-medium">
                Preco em centavos (R$)
              </label>
              <input
                type="number"
                value={priceMoney}
                onChange={(e) => setPriceMoney(Number(e.target.value))}
                min={0}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {priceMoney > 0 ? `R$ ${(priceMoney / 100).toFixed(2)}` : ''}
              </p>
              {errors.priceMoney && (
                <p className="mt-1 text-xs text-red-500">{errors.priceMoney}</p>
              )}
            </div>
          )}

          {paymentOptions === 'BOTH' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowMixed"
                checked={allowMixedPayment}
                onChange={(e) => setAllowMixedPayment(e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="allowMixed" className="text-sm">
                Permitir pagamento misto (pontos + dinheiro)
              </label>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">
              Cashback (%)
            </label>
            <input
              type="number"
              value={cashbackPercent}
              onChange={(e) => setCashbackPercent(Number(e.target.value))}
              min={0}
              max={100}
              className="w-32 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Limite por usuario (0 = sem limite)
            </label>
            <input
              type="number"
              value={limitPerUser}
              onChange={(e) => setLimitPerUser(Number(e.target.value))}
              min={0}
              className="w-32 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      )}

      {/* Step 3: Stock & config */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Tipo de estoque</label>
            <select
              value={stockType}
              onChange={(e) => setStockType(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="unlimited">Ilimitado</option>
              <option value="limited">Limitado</option>
            </select>
          </div>

          {stockType === 'limited' && (
            <div>
              <label className="mb-1 block text-sm font-medium">
                Quantidade em estoque
              </label>
              <input
                type="number"
                value={stockCount}
                onChange={(e) => setStockCount(Number(e.target.value))}
                min={0}
                className="w-32 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {type === 'VOUCHER' && (
            <div>
              <label className="mb-1 block text-sm font-medium">
                Validade do voucher (dias)
              </label>
              <input
                type="number"
                value={voucherValidityDays}
                onChange={(e) => setVoucherValidityDays(Number(e.target.value))}
                min={1}
                className="w-32 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="isFeatured" className="text-sm">
              Produto destaque
            </label>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(s - 1, 0))}
          disabled={step === 0}
        >
          Anterior
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={handleNext}>Proximo</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Salvando...' : submitLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
