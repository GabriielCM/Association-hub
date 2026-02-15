'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit2,
  Package,
  Tag,
  Percent,
  Box,
} from 'lucide-react';
import { Button, Badge, Spinner } from '@/components/ui';
import { ProductStatusBadge } from '@/components/admin/store/ProductStatusBadge';
import { ProductTypeLabel } from '@/components/admin/store/ProductTypeLabel';
import { VariantsManager } from '@/components/admin/store/VariantsManager';
import { PromotionDialog } from '@/components/admin/store/PromotionDialog';
import { StockUpdateDialog } from '@/components/admin/store/StockUpdateDialog';
import { useAdminProduct } from '@/lib/hooks/useAdminStore';

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const { data: product, isLoading } = useAdminProduct(productId);

  const [promoOpen, setPromoOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);

  if (isLoading || !product) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const formatPrice = (points?: number, money?: number): string => {
    const parts: string[] = [];
    if (points != null && points > 0) parts.push(`${points} pts`);
    if (money != null && money > 0) parts.push(`R$ ${(money / 100).toFixed(2)}`);
    return parts.length > 0 ? parts.join(' / ') : '-';
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <ProductStatusBadge
                isActive={product.isActive}
                stockType={product.stockType}
                {...(product.stockCount != null && { stockCount: product.stockCount })}
              />
            </div>
            <p className="text-sm text-muted-foreground">{product.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/store/${productId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit2 className="mr-1 h-4 w-4" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Tipo</p>
              <ProductTypeLabel type={product.type} />
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <Tag className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">Preco</p>
              <p className="font-semibold">
                {formatPrice(product.pricePoints, product.priceMoney)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <Box className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Estoque</p>
              <p className="font-semibold">
                {product.stockType === 'unlimited'
                  ? 'Ilimitado'
                  : `${product.stockCount ?? 0} un.`}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <Percent className="h-6 w-6 text-orange-500" />
            <div>
              <p className="text-xs text-muted-foreground">Cashback</p>
              <p className="font-semibold">{product.cashbackPercent ?? 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setPromoOpen(true)}>
          {product.isPromotional ? 'Editar Promocao' : 'Definir Promocao'}
        </Button>
        {product.stockType === 'limited' && (
          <Button variant="outline" size="sm" onClick={() => setStockOpen(true)}>
            Atualizar Estoque
          </Button>
        )}
      </div>

      {/* Promotion info */}
      {product.isPromotional && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950">
          <div className="flex items-center gap-2">
            <Badge variant="warning">Em Promocao</Badge>
            <span className="text-sm">
              {formatPrice(product.promotionalPricePoints, product.promotionalPriceMoney)}
            </span>
            {product.promotionalEndsAt && (
              <span className="text-xs text-muted-foreground">
                ate {new Date(product.promotionalEndsAt).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Description */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold">Descricao</h3>
          <p className="text-sm text-muted-foreground">
            {product.shortDescription || '-'}
          </p>
          {product.longDescription && (
            <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
              {product.longDescription}
            </p>
          )}
        </div>

        {/* Info */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold">Informacoes</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Categoria</span>
              <span>{product.category?.name ?? '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pagamento</span>
              <span>{product.paymentOptions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pagamento misto</span>
              <span>{product.allowMixedPayment ? 'Sim' : 'Nao'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Limite/usuario</span>
              <span>{product.limitPerUser ?? 'Sem limite'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vendas</span>
              <span>{product.soldCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avaliacoes</span>
              <span>
                {product.averageRating
                  ? `${product.averageRating.toFixed(1)} (${product.reviewCount})`
                  : 'Nenhuma'}
              </span>
            </div>
            {product.pickupLocation && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Retirada</span>
                <span>{product.pickupLocation}</span>
              </div>
            )}
            {product.isFeatured && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destaque</span>
                <Badge variant="primary">Sim</Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="rounded-lg border bg-card p-4">
        <VariantsManager productId={productId} variants={product.variants} />
      </div>

      {/* Images */}
      {product.images.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Imagens</h3>
          <div className="flex flex-wrap gap-3">
            {product.images.map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt={img.altText ?? product.name}
                className="h-24 w-24 rounded-lg object-cover border"
              />
            ))}
          </div>
        </div>
      )}

      {/* Specifications */}
      {product.specifications.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Especificacoes</h3>
          <div className="space-y-2 text-sm">
            {product.specifications.map((spec) => (
              <div key={spec.id} className="flex justify-between">
                <span className="text-muted-foreground">{spec.key}</span>
                <span>{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <PromotionDialog
        open={promoOpen}
        onOpenChange={setPromoOpen}
        productId={productId}
        currentPromotion={
          product.isPromotional
            ? {
                ...(product.promotionalPricePoints != null && { promotionalPricePoints: product.promotionalPricePoints }),
                ...(product.promotionalPriceMoney != null && { promotionalPriceMoney: product.promotionalPriceMoney }),
                ...(product.promotionalEndsAt != null && { promotionalEndsAt: product.promotionalEndsAt }),
              }
            : null
        }
      />

      {product.stockType === 'limited' && (
        <StockUpdateDialog
          open={stockOpen}
          onOpenChange={setStockOpen}
          productId={productId}
          currentStock={product.stockCount ?? 0}
        />
      )}
    </div>
  );
}
