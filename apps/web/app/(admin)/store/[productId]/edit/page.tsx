'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { ProductForm } from '@/components/admin/store/ProductForm';
import { useAdminProduct, useUpdateProduct } from '@/lib/hooks/useAdminStore';

export default function EditProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { data: product, isLoading } = useAdminProduct(productId);
  const updateProduct = useUpdateProduct();

  if (isLoading || !product) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/store/${productId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Produto</h1>
          <p className="text-sm text-muted-foreground">{product.name}</p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-card p-6">
        <ProductForm
          productId={productId}
          initialData={{
            name: product.name,
            slug: product.slug,
            categoryId: product.categoryId,
            type: product.type,
            paymentOptions: product.paymentOptions,
            allowMixedPayment: product.allowMixedPayment,
            stockType: product.stockType,
            isFeatured: product.isFeatured,
            ...(product.shortDescription != null && { shortDescription: product.shortDescription }),
            ...(product.longDescription != null && { longDescription: product.longDescription }),
            ...(product.pickupLocation != null && { pickupLocation: product.pickupLocation }),
            ...(product.pricePoints != null && { pricePoints: product.pricePoints }),
            ...(product.priceMoney != null && { priceMoney: product.priceMoney }),
            ...(product.cashbackPercent != null && { cashbackPercent: product.cashbackPercent }),
            ...(product.limitPerUser != null && { limitPerUser: product.limitPerUser }),
            ...(product.stockCount != null && { stockCount: product.stockCount }),
            ...(product.voucherValidityDays != null && { voucherValidityDays: product.voucherValidityDays }),
          }}
          onSubmit={(data) => {
            updateProduct.mutate(
              { id: productId, data },
              {
                onSuccess: () => {
                  toast({ title: 'Produto atualizado!' });
                  router.push(`/store/${productId}`);
                },
                onError: (err) => {
                  toast({
                    title: 'Erro ao atualizar produto',
                    description: err.message,
                    variant: 'error',
                  });
                },
              }
            );
          }}
          isPending={updateProduct.isPending}
          submitLabel="Atualizar Produto"
        />
      </div>
    </div>
  );
}
