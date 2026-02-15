'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { useAdminCategories } from '@/lib/hooks/useAdminStore';
import type { CreateProductInput } from '@/lib/api/store.api';
import type { ProductType, PaymentOptions } from '@ahub/shared/types';

interface ProductFormProps {
  initialData?: Partial<CreateProductInput> & { isFeatured?: boolean };
  onSubmit: (data: CreateProductInput & { isFeatured?: boolean }) => void;
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
  onSubmit,
  isPending,
  submitLabel = 'Salvar',
}: ProductFormProps) {
  const { data: categories } = useAdminCategories();
  const [step, setStep] = useState(0);

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

    onSubmit(data);
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
